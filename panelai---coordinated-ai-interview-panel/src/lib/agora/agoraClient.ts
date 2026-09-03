import AgoraRTC, {
  IAgoraRTCClient,
  ILocalAudioTrack,
  IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";
import { InterviewerRole } from "../../types/interview";
import { INTERVIEWER_PERSONAS } from "../personas";

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

          if (interimTranscript && this.callbacks.onTranscriptPartial) {
            this.callbacks.onTranscriptPartial(interimTranscript);

            // If candidate starts speaking while agent is talking -> Trigger interruption!
            if (this.isAgentSpeaking) {
              this.handleCandidateInterruption();
            }
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
              if (vol.level > 15 && this.isAgentSpeaking) {
                this.handleCandidateInterruption();
              }
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

        // Interruption threshold check
        if (normalized > 25 && this.isAgentSpeaking) {
          this.handleCandidateInterruption();
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
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = persona.voice.rate || 1.0;
      utterance.pitch = persona.voice.pitch || 1.0;

      // Select matching voice
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        if (persona.voice.gender === "female") {
          const femaleVoice =
            voices.find((v) => v.name.includes("Samantha") || v.name.includes("Victoria") || v.name.includes("Google UK English Female") || v.name.includes("Zira")) ||
            voices.find((v) => v.name.toLowerCase().includes("female"));
          if (femaleVoice) utterance.voice = femaleVoice;
        } else {
          const maleVoice =
            voices.find((v) => v.name.includes("Alex") || v.name.includes("Daniel") || v.name.includes("Google US English") || v.name.includes("David")) ||
            voices.find((v) => v.name.toLowerCase().includes("male"));
          if (maleVoice) utterance.voice = maleVoice;
        }
      }

      this.isAgentSpeaking = true;
      this.callbacks.onAgentSpeaking?.(75);

      // Simulate subtle voice wave fluctuation
      const waveInterval = setInterval(() => {
        if (this.isAgentSpeaking) {
          const randomVol = Math.floor(40 + Math.random() * 55);
          this.callbacks.onAgentSpeaking?.(randomVol);
        }
      }, 150);

      utterance.onend = () => {
        clearInterval(waveInterval);
        this.isAgentSpeaking = false;
        this.callbacks.onAgentSpeaking?.(0);
        resolve();
      };

      utterance.onerror = () => {
        clearInterval(waveInterval);
        this.isAgentSpeaking = false;
        this.callbacks.onAgentSpeaking?.(0);
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
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      this.isAgentSpeaking = false;
      this.callbacks.onAgentSpeaking?.(0);
      this.callbacks.onInterruption?.();
    }
  }

  public stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.isAgentSpeaking = false;
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
