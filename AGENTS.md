# AGENTS.md

## Project overview

Docker Compose stack: **n8n** (workflow automation) + **FlareSolverr** (Cloudflare bypass proxy) + **React frontend**. The frontend submits a prospect form (secteur/ville) to an n8n webhook, which orchestrates scraping via FlareSolverr. Code and UI are in French.

## Architecture

- `frontend-app/` — React 19 + Vite 8 app (JSX, no TypeScript). The only real application code.
- `examples/pagejaunes/` — n8n workflow JSON exports (importable into n8n UI).
- `react-app/` — Empty/abandoned (only contains `node_modules/`). Ignore.
- `.ropeproject/` — Empty Python refactoring project dir. Ignore.

## Running the stack

```bash
docker compose up
```

Services and ports:
| Service | Container port | Host port | URL |
|---|---|---|---|
| n8n | 5678 | 5678 | http://localhost:5678 |
| FlareSolverr | 8191 | 8989 (localhost only) | http://localhost:8989 |
| Frontend (Vite) | 5173 | 5173 | http://localhost:5173 |

## Frontend development

From `frontend-app/`:
- `npm run dev` — Vite dev server
- `npm run build` — Production build
- `npm run lint` — ESLint (flat config, react-hooks + react-refresh plugins)
- `npm run preview` — Preview production build

No test suite exists. No typecheck step (plain JSX, no TypeScript).

## Key gotchas

- **`VITE_N8N_WEBHOOK_URL`** is read in the browser, so it must use the host-mapped address (`http://localhost:5678/webhook/prospect-form`), not the Docker service name. This is set in `docker-compose.yml` for the container env, but Vite inlines env vars at build time from the host.
- **Vite inside Docker** requires `--host 0.0.0.0` to be reachable from the host (already configured in `Dockerfile.dev`).
- **FlareSolverr port** is mapped to 8989 on the host, not its internal 8191.
- **Windows users**: Check volume paths in `docker-compose.yml` — they use Unix paths.
- The n8n container runs with `N8N_RUNNERS_ENABLED: "true"` and timezone `Indian/Antananarivo`.
- **n8n workflows must be activated** — Creating/importing a workflow is not enough. Toggle it **Active** in the n8n UI (top-right switch) or the `prospect-form` webhook returns 404 ("Failed to fetch" in the browser). Example workflows are in `examples/pagejaunes/`.
