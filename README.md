# Ollama Chat UI

Minimal black and white chat interface for Ollama with web search support via SearXNG.

## Features

- Streaming chat with any Ollama model
- Dark / light theme (persisted in localStorage)
- Regenerate last response
- Edit and resend any user message
- Export conversation as Markdown
- Image paste and attach (multimodal models)
- Web search via SearXNG with source display
- Configurable temperature, top_p, context size, system prompt
- Responsive design (desktop, tablet, phone)

## Quick Start

### Standalone

Open `index.html` in a browser or serve it locally:

```
python3 -m http.server 8080
```

Open `http://localhost:8080`. Default Ollama URL is `http://localhost:11434`.

### Docker Compose

Runs Ollama, SearXNG, and Caddy (static files + reverse proxy) together:

```
docker compose up -d
```

Open `http://localhost:8080`. In Config, clear the Ollama URL and Search URL fields (empty = same origin, everything is proxied through Caddy).

#### HTTPS (access from other devices on your network)

Generate a self-signed certificate for your server's LAN IP:

```
./certs/generate.sh 192.168.x.x
```

This creates `certs/cert.pem` and `certs/key.pem` (gitignored). Caddy serves HTTPS on port 8443.

Update the port mapping in `docker-compose.yml` if 8443 is already in use:

```yaml
ports:
  - "8080:8080"
  - "8444:8443"   # external:internal
```

Restart Caddy:

```
docker compose up -d caddy
```

Access from any device on your network at `https://192.168.x.x:8443`. Accept the self-signed certificate warning on first visit.

#### GPU

The compose file assumes NVIDIA GPUs. Remove or adjust the `deploy.resources` block in `docker-compose.yml` for CPU-only or AMD setups.

#### Persistent models

Edit the `ollama` volume in `docker-compose.yml` to point to your host path:

```yaml
volumes:
  - /path/to/ollama:/root/.ollama
```

## Web Search

1. Set the Search URL in Config (e.g. `http://localhost:8888` for standalone, or empty for docker-compose)
2. Click the "Search" toggle in the input area to enable it
3. Send a message -- the app queries SearXNG, shows sources on the user message, and injects results as context for the model

SearXNG must have JSON format enabled in its `settings.yml` (pre-configured in `searxng/settings.yml`):

```yaml
search:
  formats:
    - html
    - json
```

## File Structure

```
index.html            HTML shell
style.css             All styles (dark/light theme)
js/
  state.js            App namespace, config, shared state
  markdown.js         Marked/hljs setup, renderMarkdown
  config.js           Config panel, model loading, connection
  messages.js         Message rendering, scroll, context usage
  chat.js             Streaming, buildMessages, sendMessage
  actions.js          Regenerate, edit, export, search, image paste
  input.js            Input handling, keyboard shortcuts, init
vendors/              highlight.js, marked.js (vendored)
searxng/
  settings.yml        SearXNG config (JSON format enabled)
certs/
  generate.sh         Self-signed cert generator
  cert.pem            Generated cert (gitignored)
  key.pem             Generated key (gitignored)
Caddyfile             Reverse proxy + TLS config
docker-compose.yml    Full stack deployment
```

## Keyboard Shortcuts

- `Enter` -- send message
- `Shift+Enter` -- newline
- `Escape` -- stop generation or clear input
- `/` -- focus input

## License

Apache 2.0
