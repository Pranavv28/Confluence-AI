import AgoraRTC, {
  IAgoraRTCClient,
  ILocalAudioTrack,
  IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";
import { InterviewerRole } from "../../types/interview";
import { INTERVIEWER_PERSONAS } from "../personas";

/**
 * Audio Engine Tuning Constants
 */
export const AUDIO_CONFIG = {
  // Grace period before mic volume or recognition can trigger candidate interruption (avoids speaker echo)
  speechGracePeriodMs: 2000,
  // Sustained volume threshold on normalized 0-100 scale for interrupting agent
  volumeInterruptionThreshold: 60,
  // Number of consecutive 100ms frames above threshold required for voice interruption
  volumeInterruptionStreak: 4,
  // Hard stall watchdog timeout: if browser speech stalls without events, auto-resolve
  stallWatchdogTimeoutMs: 14000,
};

export interface AgoraClientCallbacks {
  onCandidateSpeaking?: (volume: number) => void;
  onAgentSpeaking?: (volume: number) => void;
  onTranscriptPartial?: (text: string) => void;
  onTranscriptFinal?: (text: string) => void;
  onInterruption?: () => void;
  onError?: (error: string) => void;
  onConnectionStateChange?: (state: string) => void;
}

export class AgoraInterviewClient {
  private client: IAgoraRTCClient | null = null;
  private localAudioTrack: ILocalAudioTrack | null = null;
  private remoteAudioTrack: IRemoteAudioTrack | null = null;
  private recognition: any = null;
  private isListening = false;
  private isAgentSpeaking = false;
  private agentSpeakingStartTime = 0;
  private highVolumeStreak = 0;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private speechKeepAliveTimer: any = null;
  private speechWatchdogTimer: any = null;
  private isMuted = false;
  private callbacks: AgoraClientCallbacks = {};
  private activePersonaRole: InterviewerRole = "technical";
  private channelName = "";
  private candidateUid = 0;
  private isAgoraConnected = false;
  private audioContext: AudioContext | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private volumeCheckInterval: any = null;

  constructor(callbacks: AgoraClientCallbacks) {
    this.callbacks = callbacks;
    this.initSpeechRecognition();
  }

  public setCallbacks(callbacks: AgoraClientCallbacks) {
    this.callbacks = callbacks;
  }

  public setActivePersona(role: InterviewerRole) {
    this.activePersonaRole = role;
  }

  private initSpeechRecognition() {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          // If agent is speaking, ignore transcripts during the first 2 seconds to avoid speaker echo
          const now = Date.now();
          if (this.isAgentSpeaking) {
            if (now - this.agentSpeakingStartTime > 2000 && interimTranscript.trim().length > 15) {
              this.handleCandidateInterruption();
            }
            return;
          }

          if (interimTranscript && this.callbacks.onTranscriptPartial) {
            this.callbacks.onTranscriptPartial(interimTranscript);
          }

          if (finalTranscript && this.callbacks.onTranscriptFinal) {
            this.callbacks.onTranscriptFinal(finalTranscript.trim());
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error !== "no-speech") {
            console.warn("Speech recognition notice:", event.error);
          }
        };

        recognition.onend = () => {
          if (this.isListening && !this.isMuted) {
            try {
              recognition.start();
            } catch {
              // already active
            }
          }
        };

        this.recognition = recognition;
      } catch (err) {
        console.warn("Could not instantiate SpeechRecognition:", err);
      }
    }
  }

  /**
   * Connects to Agora RTC channel and starts microphone track
   */
  public async connect(params: {
    appId: string;
    channelName: string;
    token: string;
    uid: number;
  }): Promise<{ success: boolean; isRealAgora: boolean }> {
    const { appId, channelName, token, uid } = params;
    this.channelName = channelName;
    this.candidateUid = uid;

    try {
      // 1. Initialize microphone audio track
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        AEC: true, // Acoustic Echo Cancellation
        ANS: true, // Automatic Noise Suppression
        AGC: true, // Automatic Gain Control
      });

      // 2. Setup audio analyser to track candidate speech volume locally
      try {
        const mediaStream = new MediaStream([this.localAudioTrack.getMediaStreamTrack()]);
        this.setupAudioAnalyser(mediaStream);
      } catch (e) {
        console.warn("Audio analyser setup warning:", e);
      }

      // 3. Connect to Agora RTC if valid credentials exist
      if (appId && appId !== "demo_agora_app_id" && !token.startsWith("demo_token")) {
        this.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

        this.client.on("user-published", async (user, mediaType) => {
          await this.client!.subscribe(user, mediaType);
          if (mediaType === "audio") {
            this.remoteAudioTrack = user.audioTrack || null;
            this.remoteAudioTrack?.play();
          }
        });

        this.client.on("user-unpublished", (user) => {
          if (user.uid === this.remoteAudioTrack?.getUserId()) {
            this.remoteAudioTrack = null;
          }
        });

        this.client.on("connection-state-change", (curState) => {
          this.callbacks.onConnectionStateChange?.(curState);
        });

        // Enable real-time volume indicator from Agora RTC
        this.client.enableAudioVolumeIndicator();
        this.client.on("volume-indicator", (volumes) => {
          volumes.forEach((vol) => {
            if (vol.uid === uid) {
              this.callbacks.onCandidateSpeaking?.(vol.level);
            } else {
              this.callbacks.onAgentSpeaking?.(vol.level);
            }
          });
        });

        await this.client.join(appId, channelName, token, uid);
        await this.client.publish(this.localAudioTrack);
        this.isAgoraConnected = true;
      } else {
        this.isAgoraConnected = false;
      }

      // 4. Start speech recognition for live candidate transcript
      this.startListening();

      return { success: true, isRealAgora: this.isAgoraConnected };
    } catch (err: any) {
      console.error("Agora RTC initialization error:", err);
      // Fallback: If microphone access is granted, allow interview to proceed smoothly
      this.startListening();
      return { success: true, isRealAgora: false };
    }
  }

  private setupAudioAnalyser(stream: MediaStream) {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.micAnalyser = this.audioContext.createAnalyser();
      this.micAnalyser.fftSize = 256;
      source.connect(this.micAnalyser);

      const bufferLength = this.micAnalyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      this.volumeCheckInterval = setInterval(() => {
        if (!this.micAnalyser || this.isMuted) {
          this.callbacks.onCandidateSpeaking?.(0);
          this.highVolumeStreak = 0;
          return;
        }

        this.micAnalyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));

        this.callbacks.onCandidateSpeaking?.(normalized);

        // Robust Interruption check:
        // Must be sustained high volume (candidate actively speaking loudly) after grace period
        if (this.isAgentSpeaking) {
          const elapsed = Date.now() - this.agentSpeakingStartTime;
          if (elapsed > AUDIO_CONFIG.speechGracePeriodMs && normalized > AUDIO_CONFIG.volumeInterruptionThreshold) {
            this.highVolumeStreak += 1;
            if (this.highVolumeStreak >= AUDIO_CONFIG.volumeInterruptionStreak) {
              this.handleCandidateInterruption();
              this.highVolumeStreak = 0;
            }
          } else {
            this.highVolumeStreak = Math.max(0, this.highVolumeStreak - 1);
          }
        } else {
          this.highVolumeStreak = 0;
        }
      }, 100);
    } catch (e) {
      console.warn("Could not setup audio analyser:", e);
    }
  }

  public startListening() {
    this.isListening = true;
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch {
        // already started
      }
    }
  }

  public stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.localAudioTrack) {
      this.localAudioTrack.setEnabled(!this.isMuted);
    }
    if (this.isMuted) {
      this.stopListening();
    } else {
      this.startListening();
    }
    return this.isMuted;
  }

  /**
   * Speaks a question using the active interviewer's persona voice
   */
  public speakInterviewerQuestion(text: string, role: InterviewerRole = this.activePersonaRole): Promise<void> {
    return new Promise((resolve) => {
      this.activePersonaRole = role;
      const persona = INTERVIEWER_PERSONAS[role];

      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setTimeout(resolve, 2000);
        return;
      }

      // Stop any ongoing speech
      this.stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = persona.voice.rate || 1.0;
      utterance.pitch = persona.voice.pitch || 1.0;

      // Retain utterance reference to prevent Chromium garbage collection from abruptly cutting off voice
      this.currentUtterance = utterance;
      (window as any).__currentUtterance = utterance;

      // Select matching voice
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        if (persona.voice.gender === "female") {
          const femaleVoice =
            voices.find((v) => v.name.includes("Samantha") || v.name.includes("Victoria") || v.name.includes("Google UK English Female") || v.name.includes("Zira") || v.name.includes("Jenny")) ||
            voices.find((v) => v.name.toLowerCase().includes("female"));
          if (femaleVoice) utterance.voice = femaleVoice;
        } else {
          const maleVoice =
            voices.find((v) => v.name.includes("Alex") || v.name.includes("Daniel") || v.name.includes("Google US English") || v.name.includes("David") || v.name.includes("Guy")) ||
            voices.find((v) => v.name.toLowerCase().includes("male"));
          if (maleVoice) utterance.voice = maleVoice;
        }
      }

      this.isAgentSpeaking = true;
      this.agentSpeakingStartTime = Date.now();
      this.callbacks.onAgentSpeaking?.(75);

      // Chromium keep-alive interval
      if (this.speechKeepAliveTimer) clearInterval(this.speechKeepAliveTimer);
      this.speechKeepAliveTimer = setInterval(() => {
        if (this.isAgentSpeaking && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);

      // Simulate subtle voice wave fluctuation
      const waveInterval = setInterval(() => {
        if (this.isAgentSpeaking) {
          const randomVol = Math.floor(40 + Math.random() * 55);
          this.callbacks.onAgentSpeaking?.(randomVol);
        }
      }, 150);

      let resolved = false;
      const cleanup = () => {
        if (resolved) return;
        resolved = true;
        clearInterval(waveInterval);
        if (this.speechKeepAliveTimer) {
          clearInterval(this.speechKeepAliveTimer);
          this.speechKeepAliveTimer = null;
        }
        if (this.speechWatchdogTimer) {
          clearTimeout(this.speechWatchdogTimer);
          this.speechWatchdogTimer = null;
        }
        this.isAgentSpeaking = false;
        this.currentUtterance = null;
        (window as any).__currentUtterance = null;
        this.callbacks.onAgentSpeaking?.(0);
      };

      // Watchdog timer: If browser SpeechSynthesis hangs, gracefully release
      this.speechWatchdogTimer = setTimeout(() => {
        if (this.isAgentSpeaking) {
          console.warn("[AgoraClient] SpeechSynthesis watchdog timer fired. Releasing voice lock.");
          cleanup();
          resolve();
        }
      }, Math.max(AUDIO_CONFIG.stallWatchdogTimeoutMs, text.length * 90));

      utterance.onend = () => {
        cleanup();
        resolve();
      };

      utterance.onerror = (e) => {
        // 'canceled' or 'interrupted' is expected when user interrupts
        cleanup();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Handles Candidate Interruption: Immediately cancels AI voice output
   */
  public handleCandidateInterruption() {
    if (this.isAgentSpeaking) {
      this.stopSpeaking();
      this.callbacks.onInterruption?.();
    }
  }

  public stopSpeaking() {
    if (this.speechWatchdogTimer) {
      clearTimeout(this.speechWatchdogTimer);
      this.speechWatchdogTimer = null;
    }
    if (this.speechKeepAliveTimer) {
      clearInterval(this.speechKeepAliveTimer);
      this.speechKeepAliveTimer = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.isAgentSpeaking = false;
    this.currentUtterance = null;
    (window as any).__currentUtterance = null;
    this.callbacks.onAgentSpeaking?.(0);
  }

  /**
   * Cleans up tracks, speech synthesis, and RTC client
   */
  public async disconnect() {
    this.stopListening();
    this.stopSpeaking();

    if (this.volumeCheckInterval) {
      clearInterval(this.volumeCheckInterval);
      this.volumeCheckInterval = null;
    }

    if (this.localAudioTrack) {
      this.localAudioTrack.stop();
      this.localAudioTrack.close();
      this.localAudioTrack = null;
    }

    if (this.client) {
      await this.client.leave();
      this.client = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        await this.audioContext.close();
      } catch {
        // ignore
      }
    }
  }
}
