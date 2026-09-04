# PanelAI — Fix & Enhancement Backlog

Source: `PROJECT_HANDOFF.md` + code review of `ResumeUploadView.tsx`, `resumeParser.ts`, and `/api/resume/process`.

---

## P0 — Critical / Breaks Core Premise

### 1. Resume upload is fully mocked, not partially rough
**Where:** `src/views/ResumeUploadView.tsx` (`handleSimulatedUpload`), `src/lib/resumeParser.ts` (`parseResumeText`), server route `/api/resume/process`

**What's happening:**
- The uploaded file's contents are never read — only the filename is used for display.
- `parseResumeText()` runs against a hardcoded fake resume string ("Alex Chen — Senior Distributed Systems Engineer... Go, Kafka, Redis Cluster...") regardless of the file dropped.
- The keyword-matching list (`Go`, `Kafka`, `Redis`, `Kubernetes`, `Rust`, `TypeScript`, etc.) is scanned against that fixed fake string, not the real resume.
- If no real text is passed, `/api/resume/process` falls back to the same hardcoded "Alex Chen / Senior Distributed Systems Engineer" profile server-side too.

**Impact:** Every candidate is silently interviewed as a fictional "Alex Chen" with fabricated Go/Kafka/Redis experience. The entire architecture's premise — resume → structured candidate context → personas grounded in the candidate's real background — is broken at the first step. This is a demo-invalidating bug, not cosmetic.

**Fix:**
- [ ] Extract real text from the uploaded file. Two viable paths:
  - **Path A (simplest, reuses existing stack):** send the PDF directly to Gemini via `@google/genai` (Gemini accepts PDFs natively) — skip a separate extraction library entirely.
  - **Path B:** extract text client- or server-side with a PDF text-extraction library (e.g. `pdf-parse` server-side), then pass extracted text to Gemini.
- [ ] Replace the keyword-matching stub in `parseResumeText` with a real Gemini structured-output call, using the same `responseSchema` pattern already used in `moderatorEngine.ts`, targeting the existing `CandidateProfile` type in `src/types/interview.ts`.
- [ ] Remove all hardcoded "Alex Chen" fallback data from both the client (`resumeParser.ts`) and server (`/api/resume/process`). If parsing fails, fail visibly (error state / retry prompt) — never silently substitute fake data.
- [ ] Add a client-side upload guard: reject non-PDF/DOCX files early, show a real upload/parsing progress state instead of the current instant fake success.
- [ ] Add a fallback path for when `GEMINI_API_KEY` is absent (per the existing "offline deterministic fallback" pattern) — e.g. a genuine (non-fake) local keyword/section-based extractor that operates on the *actual* uploaded text, not a fixed fake string.

---

## P1 — High Priority

### 2. No validation that resume data actually reaches the moderator/personas
**Where:** `moderatorEngine.ts`, `types/interview.ts`
- [ ] Confirm `CandidateProfile` (once real) is threaded into the Gemini prompts used by `moderatorEngine.ts` so questions reference the candidate's actual projects/skills, not generic ones.
- [ ] Add a visible "Candidate Context" panel (or extend `EvidenceGraphCard.tsx`) so testers can confirm in real time that the panel is reasoning from the real resume, catching regressions to the mock path early.

### 3. Speech synthesis reliability (partially fixed, still fragile)
**Where:** `agoraClient.ts`
- [ ] The 2s grace period + sustained-volume filter (`> 60` for 4+ frames) is a heuristic tuned to one environment; document the tuning and add a config constant so it can be adjusted without code diving.
- [ ] Add a hard timeout/watchdog: if `window.__currentUtterance` stalls with no `onboundary`/`onend` event for N seconds, force-resume or restart the utterance instead of leaving the interviewer silently stuck.

### 4. Interviewer progression is now hardcoded/linear
**Where:** `moderatorEngine.ts`
- The fix for the repetition bug replaced dynamic moderation with a fixed sequence: Marcus → Elena → Devon → Sarah → Conclude.
- [ ] This undercuts the "dynamic turn-by-turn orchestration" value prop from the brief. Consider reintroducing controlled dynamism: let Gemini choose the next persona from the *remaining, not-yet-asked* pool (rather than one global fixed order), so the `askedQuestions` set prevents repeats without collapsing back to a static script.
- [ ] Arthur Pendelton (Client Stakeholder) is defined as a persona but absent from the current progression — decide whether to reintroduce him (e.g. as a wildcard escalation-simulation turn) or document that he's currently unused.

### 5. Environment/config hygiene
- [ ] `.env.example` should ship in the repo (currently only documented in the handoff) so new teammates don't have to copy-paste from markdown.
- [ ] Confirm graceful degradation is actually tested: run the app with `GEMINI_API_KEY` and Agora vars unset and verify the deterministic fallback + Web Speech path works end-to-end, not just in theory.

---

## P2 — Polish / Enhancements

### 6. Assessment report grounding
- [ ] Once real resumes flow through, verify `assessmentEngine.ts` evidence quotes/timestamps reference actual candidate turns and not any residual placeholder data.

### 7. Debug visibility
- [ ] `DebugPanel.tsx` — surface which candidate-profile source is active (real parse vs. fallback vs. error) so this class of bug (silent fake data) is visible to developers during testing, not just discoverable via code reading.

### 8. Resume upload UX
- [ ] Real parsing will take a few seconds (Gemini round-trip). Add a genuine loading/progress state distinct from the current instant "success" — the current UX implies parsing is free, which will need to change once it's real.
- [ ] Handle multi-page / scanned / image-based PDFs (OCR fallback or a clear "couldn't extract text, please paste your resume text" path).

### 9. Testing
- [ ] Add a regression test asserting that uploading two different resumes produces two different `CandidateProfile` outputs (this alone would have caught the current bug).
- [ ] Add a test that fails the build if `"Alex Chen"` or other known placeholder strings appear in any parsing code path outside of test fixtures.

---

## Suggested order of attack
1. Fix resume parsing (P0 #1) — everything else is cosmetic until this works.
2. Wire real profile into moderator prompts + add visible confirmation (P1 #2, P2 #7).
3. Decide on progression dynamism (P1 #4) — affects the "coordinated panel" demo narrative.
4. Speech watchdog (P1 #3) — reliability during live demos.
5. Everything else as time allows.
