# Page Dynamic Rendering System — Test Task

An Account page whose layout is driven entirely by a JSON config, served by a small BFF, with inline field editing. Built so the layout can later be changed by an admin via a visual constructor without touching JSX.

See [Strategy.md](./Strategy.md) for the AI-assisted design/implementation approach, [README_CORE.md](./README_CORE.md) for the original task brief, and [README_BFF.md](./README_BFF.md) for BFF endpoint details.

## Status

| Phase | Description | Status |
|---|---|---|
| 1 — Base | Render Account page from a JSON layout (blocks, fields, field types) | ✅ Implemented |
| 2 — BFF | Serve layout + account data, accept updates | ✅ Implemented |
| 3 — Edit mode | Inline click-to-edit fields with Save/Cancel, persisted via PATCH | ✅ Implemented |
| 4 — Constructor | Separate page to drag-and-drop edit the layout JSON itself | ❌ Not implemented |

There is no Constructor UI and no `PUT`/`PATCH /api/layouts/account` endpoint yet — the layout JSON can currently only be read (`GET /api/layouts/account`), not edited from the app.

## Tech Stack

- **Frontend**: React 19 + TypeScript, Vite
- **Backend (BFF)**: Express 5 + TypeScript, run via `tsx`
- **Storage**: In-memory (no database)
- **Notifications**: `react-hot-toast` for save/error feedback

## Project Structure

```
src/           # Frontend (Vite + React)
  components/  # AccountPage, Block, EditableField
  services/    # API client (Layout/Account/Health services)
  types/       # Frontend layout/account types
server/        # BFF (Express)
  routes/      # accounts, layouts
  services/    # in-memory account/layout data + logic
  validation/  # field-level update validation
shared/        # Types/constants shared between frontend and server
```

## Prerequisites

- Node.js 20.19+ or 22.12+ (required by Vite 7 - see `engines` in `package.json`)
- npm

## Running Locally

Install dependencies once:

```bash
npm install
```

Then run the BFF and frontend in two terminals:

```bash
# Terminal 1 — BFF server (http://localhost:3001)
npm run server:dev

# Terminal 2 — Frontend (http://localhost:5173)
npm run dev
```

Open `http://localhost:5173`. Editable fields (marked with a pencil icon) can be clicked to edit inline; save with the ✓ button or `Enter`, cancel with the ✕ button or `Escape`.

## API Endpoints

- `GET /api/layouts/account` — layout JSON for the Account page
- `GET /api/accounts/:id` — account data
- `PATCH /api/accounts/:id` — update editable account fields
- `GET /api/health` — server health check

See [README_BFF.md](./README_BFF.md) for request/response examples and validation rules, or run `./test-bff.sh` (server must already be running) to exercise all endpoints.

## Other Scripts

```bash
npm run build         # Typecheck + build frontend
npm run lint           # Lint
npm run server:build   # Compile BFF to server/dist
npm run server:start   # Run compiled BFF
```
