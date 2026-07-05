# Page Dynamic Rendering System — Test Task

An Account page whose layout is driven entirely by a JSON config, served by a small BFF, with inline field editing. Built so the layout can later be changed by an admin via a visual constructor without touching JSX.

See [Strategy.md](./Strategy.md) for the AI-assisted design/implementation approach, [README_CORE.md](./README_CORE.md) for the original task brief, and [README_BFF.md](./README_BFF.md) for BFF endpoint details.

## Status

| Phase | Description | Status |
|---|---|---|
| 1 — Base | Render Account page from a JSON layout (blocks, fields, field types) | ✅ Implemented |
| 2 — BFF | Serve layout + account data, accept updates | ✅ Implemented |
| 3 — Edit mode | Inline click-to-edit fields with Save/Cancel, persisted via PATCH | ✅ Implemented |
| 4 — Constructor | Separate page to drag-and-drop edit the layout JSON itself | ✅ Implemented |

The Constructor page (`/constructor`) lets an admin reorder fields within a block, move fields across blocks, reorder blocks, rename blocks, toggle field/block visibility, and add custom fields — all persisted via `PUT /api/layouts/account`. The Account page picks up saved changes on reload.

## Tech Stack

- **Frontend**: React 19 + TypeScript, Vite, React Router
- **Backend (BFF)**: Express 5 + TypeScript, run via `tsx`
- **Storage**: In-memory (no database)
- **Notifications**: `react-hot-toast` for save/error feedback
- **Drag and drop**: `@dnd-kit` (Constructor page)
- **Testing**: Vitest, Testing Library (React), Supertest (BFF routes)

## Project Structure

```
src/           # Frontend (Vite + React)
  components/  # AccountPage, Block, EditableField, AppNav
  pages/       # AccountPageRoute, constructor/ (Constructor page + drag-and-drop)
  services/    # API client (Layout/Account/Health services)
  types/       # Frontend layout/account types
server/        # BFF (Express)
  routes/      # accounts, layouts
  services/    # in-memory account/layout data + logic
  validation/  # field-level update + layout structure validation
shared/        # Types/constants shared between frontend and server
```

## Prerequisites

- Node.js 20.19+ or 22.12+ (required by Vite 7 - see `engines` in `package.json`). `.nvmrc` pins the exact version used for development (`nvm use`).
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

Open `http://localhost:5173/constructor` (or click "Constructor" in the nav) for the layout editor: drag fields/blocks to reorder, drag a field into another block to move it, rename a block, click the eye icon to hide/show a field or block, and use "+ Add field" to add a custom field. Click "Save Layout" to persist, or "Discard Changes" to revert.

## API Endpoints

- `GET /api/layouts/account` — layout JSON for the Account page
- `PUT /api/layouts/account` — update the layout JSON (Constructor page)
- `GET /api/accounts/:id` — account data
- `PATCH /api/accounts/:id` — update editable account fields
- `GET /api/health` — server health check

See [README_BFF.md](./README_BFF.md) for request/response examples and validation rules, or run `./test-bff.sh` (server must already be running) to exercise all endpoints.

## Testing

```bash
npm test        # Typecheck tests, then run the automated suite (server validation, BFF routes, key component behavior)
npm run test:watch  # Same suite in watch mode
```

Covers: `server/validation/*` (field/layout validation rules), `server/routes/*` (BFF endpoints via Supertest), and two frontend guardrails - that `AccountPage` renders purely in layout-JSON order (Phase 1's "no hardcoded field order" rule) and that `EditableField`'s click/save/cancel flow behaves correctly (Phase 3). Drag-and-drop in the Constructor and thin API-client wrappers are left to manual testing (see `test-bff.sh`) as lower-value to automate for this task's scope.

## Other Scripts

```bash
npm run build         # Typecheck + build frontend
npm run lint           # Lint
npm run server:build   # Compile BFF to server/dist
npm run server:start   # Run compiled BFF
```
