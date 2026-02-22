# Changelog

## v0.6.0 — 2026-02-22

### Added
- TTS audio player inline in the chat footer (Play/Pause, Download, Dismiss)
- TTS Exaggeration and CFG Weight sliders in config UI (persisted in localStorage)
- Client-side text splitting for TTS (`ttsSplitText`): splits at sentence boundaries, falls back to word boundaries — no mid-word cuts
- Client-side WAV concatenation (`ttsConcatWav`, `wavDataOffset`): merges chunk blobs by walking RIFF sub-chunks instead of hardcoding a 44-byte offset — compatible with non-standard WAV headers
- `PYTHON_EXEC` env var on the Chatterbox server: defaults to `python3` in Docker; override with `uv run python` for local dev
- Config panel now scrollable (`max-height: 55vh`) for smaller screens

### Changed
- TTS split/concat moved entirely to the browser; the server no longer handles chunking
- `App.unloadModel` accepts a `silent` flag to suppress status messages when called from `App.speak`
- `saveConfig` only reloads and re-renders history when the storage key actually changes (prevents killing in-progress streams on unrelated config saves)
- Char counter clears after a message is sent

### Fixed
- Unloading the model before TTS synthesis no longer clobbers the "Synthesizing…" status message

---

## v0.5.0 — 2026-02-19

### Added
- Refresh button on the TTS voice dropdown

### Fixed
- TTS voices not loading when `chatterboxUrl` is empty (same-origin)
- Chatterbox voices 404 — all requests now route through `/tts/` Caddy prefix

---

## v0.4.0 — 2026-02-18

### Added
- Chatterbox TTS integration (voice synthesis, voice selection, auto-unload, split mode)
- Conversation branching (regenerate creates a new branch, navigate with ← →)
- Prompt library (save, load, and manage reusable system prompts)
- Character counter on the input textarea

### Fixed
- Auto-scroll on long responses
- Context size and unload model HTTP call

---

## v0.3.0 — 2026-02-17

### Added
- HTTPS / TLS support via Caddy with self-signed certificates
- `certs/generate.sh` for generating LAN certificates

### Fixed
- SearXNG CORS issue for cross-origin access

---

## v0.2.0 — 2026-02-16

### Added
- Regenerate last response
- Edit and resend any user message
- Export conversation as Markdown
- Image paste and file attach (multimodal models)
- Web search via SearXNG with source display
- Dark / light theme (persisted in localStorage)
- Docker Compose stack (Ollama + SearXNG + Caddy)

---

## v0.1.0 — 2026-02-15

### Added
- Initial release: streaming chat UI for Ollama
