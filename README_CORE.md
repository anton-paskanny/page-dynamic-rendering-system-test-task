Business context
  •	You get a minimal React+TS starter with a static Account page.  
	•	We need an Account page whose layout can be changed later by an admin via a visual constructor.
	•	To enable this, the page must be driven by a JSON layout config, not hardcoded JSX.
	•	A small BFF will serve that JSON and the account data, and accept updates.


Your mission
	•	Design a JSON that describes the page structure and field placement.
	•	Render the page dynamically from that JSON.
	•	Build a tiny BFF with the required endpoints.
	•	You choose the stack, project structure, libraries, and AI tools, you are free to use any tools to accomplish that task. Explain your strategy.


What you deliver
	•	Working app that runs locally.
	•	Short Strategy.md - what you asked AI to do, how you structured prompts, key design decisions.
  

Guardrails
	•	No hardcoded field order in JSX - layout drives render.
	•	Strong TypeScript - avoid type any etc.
  •	Tooling, structure, and libraries are your choice. Keep it pragmatic.

⸻

Phase 1 – Base

Goal - prove the page can be driven by JSON.

Build
	•	Define a layout JSON that supports at least: blocks, fields inside blocks, field types.
	•	Field types can be basic: string, number, boolean, select.
	•	Render the Account page using only the JSON + a field registry of your choice.

Outcome
	•	Changing the JSON changes the UI without code edits.
	•	Multiple blocks and many fields are supported.

⸻

Phase 2 – BFF

Goal - serve config and data to the frontend. No database required.

Endpoints
	•	GET /api/accounts/:id - returns account data used by the page.
	•	GET /api/layouts/account - returns the layout JSON used to render the page.
	•	PATCH /api/accounts/:id - accepts updates for editable fields on the page.

Notes
	•	Store data in memory or JSON files. External mock services are fine.
	•	Validation choice is yours. Keep it simple but safe.

⸻

Phase 3 – Advanced - Edit mode

Goal - allow inline editing of fields and persist changes.

UX
	•	Clicking a field toggles it into edit mode.
	•	A small save checkmark and cancel cross appear near the field.
	•	Save sends the change to the BFF and updates the view. Cancel reverts the edit.

Backend
	•	PATCH /api/accounts/:id - accepts updates to editable fields.

Notes
	•	Optimistic update with rollback on error is preferred.
	•	Choose validation and error handling you consider appropriate.

Acceptance
	•	At least 1 to 2 fields are editable with Save and Cancel.
	•	Successful Save updates backend state and the UI.


Phase 4 - Super advanced - Constructor

Goal - add a basic page constructor to modify the layout JSON.

Build
	•	Create a separate Constructor page that edits the layout JSON.
	•	Support drag and drop to reorder fields within a block and move fields across blocks.
	•	Support drag and drop to reorder sections or blocks.
	•	Allow adding new fields and custom fields, renaming blocks, and toggling visibility.
	•	Persist layout changes via the BFF.

Backend
	•	PUT or PATCH /api/layouts/account - updates the layout JSON.

Acceptance
	•	Constructor changes are saved and reflected on the Account page after reload.
	•	Reordering and adding fields works without changing JSX.

⸻

What we evaluate
	•	JSON design - clear, extensible, future-proof for a constructor.
	•	Decoupling - layout drives render, no hardcoded order in JSX.
	•	BFF simplicity - small, predictable, easy to run, sane validation.
	•	Edit flow - if implemented, safe and understandable.
	•	Type safety and readability.
	•	AI usage - your strategy, how you prompt, and how you verify outputs.

Submission
	•	Repo link or ZIP. Include exact Node version and commands to run.
