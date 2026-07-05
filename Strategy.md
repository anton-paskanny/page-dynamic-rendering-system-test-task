# Strategy Document - Phase 1, 2, 3 & 4 Implementation

## Overview
This document outlines the strategy and implementation approach for Phase 1 (Base), Phase 2 (BFF), Phase 3 (Edit Mode), and Phase 4 (Constructor) of the Account page dynamic rendering system.

## Phase 1 - Base (Completed)

### Requirements Analysis
- **Goal**: Prove the page can be driven by JSON instead of hardcoded JSX
- **Constraint**: No hardcoded field order in JSX - layout must drive render
- **Requirement**: Support multiple blocks and many fields with different types
- **Outcome**: Changing JSON should change UI without code edits

### Design Strategy

#### 1. JSON Layout Structure
The layout JSON is designed with a hierarchical structure:
- **Layout**: Top-level container with blocks array
- **Block**: Represents a card section with title, color, and fields
- **Field**: Individual data points with type, label, value, and metadata

#### 2. Field Type System
Implemented a registry of field types:
- **string**: Basic text fields (default)
- **number**: Numeric values
- **boolean**: Yes/No values with special styling
- **select**: Dropdown options (extensible for future edit mode)

#### 3. Component Architecture
- **FieldRenderer**: Renders individual fields based on type
- **Block**: Renders blocks with their fields
- **AccountPage**: Main container that orchestrates the layout
- **App**: Entry point that provides layout data

### Key Design Decisions

#### 1. Type Safety
- Strong TypeScript interfaces for all layout components
- No `any` types - strict typing throughout
- Extensible interfaces for future enhancements

#### 2. Separation of Concerns
- Layout configuration separate from rendering logic
- Field rendering logic isolated in FieldRenderer
- Block rendering logic isolated in Block component

#### 3. Extensibility
- Field types can be easily extended
- Block structure supports future drag-and-drop
- Layout changes require no code modifications

## Phase 2 - BFF (Completed)

### Requirements Analysis
- **Goal**: Serve config and data to the frontend via a small BFF
- **Constraint**: No database required - use in-memory or JSON files
- **Requirement**: Three main endpoints for layout, account data, and updates
- **Outcome**: Frontend fetches data from BFF instead of mock data

### Design Strategy

#### 1. BFF Architecture
- **Framework**: Express.js with TypeScript for type safety
- **Storage**: In-memory storage with Map data structures
- **Validation**: Comprehensive field-level validation
- **CORS**: Enabled for frontend communication

#### 2. API Design
- **GET /api/layouts/account**: Returns layout JSON
- **GET /api/accounts/:id**: Returns account data
- **PATCH /api/accounts/:id**: Accepts field updates
- **GET /health**: Server health check

#### 3. Data Management
- **Layout Service**: Manages layout configurations
- **Account Service**: Handles CRUD operations for accounts
- **Validation Service**: Ensures data integrity and security

### Key Design Decisions

#### 1. Pragmatic Technology Choices
- **Express.js**: Lightweight, well-established, easy to understand
- **TypeScript**: Maintains type safety across frontend and backend
- **In-memory Storage**: Simple, fast, no external dependencies
- **CORS**: Enables local development without complex proxy setup

#### 2. Validation Strategy
- **Field-level Access Control**: Only editable fields can be updated
- **Type Validation**: Ensures data types match field definitions
- **Pattern Validation**: Regex patterns for email, phone formats
- **Range Validation**: Min/max values for numeric fields
- **Allowed Values**: Predefined options for select fields

#### 3. Error Handling
- **HTTP Status Codes**: Proper REST API status codes
- **Detailed Error Messages**: Validation errors with specific field details
- **Graceful Degradation**: Frontend handles API failures gracefully

## Phase 3 - Edit Mode (Completed)

### Requirements Analysis
- **Goal**: Allow inline editing of fields and persist changes
- **Constraint**: Implement optimistic updates with rollback on error
- **Requirement**: At least 1-2 fields editable with Save and Cancel
- **Outcome**: Successful Save updates backend state and UI

### Design Strategy

#### 1. Edit Mode Architecture
- **EditableField Component**: Handles inline editing for all field types
- **State Management**: Local edit state with optimistic updates
- **User Experience**: Click to edit, visual feedback, keyboard shortcuts

#### 2. Field Type Support
- **Text Fields**: Standard input with validation
- **Number Fields**: Numeric input with range validation
- **Select Fields**: Dropdown with predefined options
- **Boolean Fields**: Read-only by design (not editable) - enforced server-side by validation, not just omitted from the edit UI

#### 3. User Interaction
- **Click to Edit**: Visual indicators show editable fields
- **Save/Cancel**: Green checkmark (✓) and red X (✕) buttons
- **Keyboard Shortcuts**: Enter to save, Escape to cancel

### Key Design Decisions

#### 1. Optimistic Updates
- **Immediate UI Response**: Changes appear instantly
- **Background API Calls**: Non-blocking user experience
- **Automatic Rollback**: UI reverts on API failure
- **Error Display**: Clear feedback for failed updates

#### 2. Field Editability
- **Layout-Driven**: Editable flag controlled by JSON configuration
- **Type-Specific Inputs**: Appropriate input controls for each field type
- **Validation Integration**: Frontend and backend validation alignment

#### 3. User Experience
- **Visual Feedback**: Hover effects, edit indicators, focus states
- **Responsive Design**: Mobile-friendly edit controls
- **Accessibility**: Keyboard navigation, screen reader support

## Implementation Details

### 1. Mock Data Structure
- **Layout Data**: Complete page structure configuration with editable flags
- **Account Data**: Field values for rendering and editing
- **Separation**: Layout drives structure and editability, data provides values

### 2. Dynamic Rendering
- **Components map over layout arrays**: Field order determined by JSON
- **No hardcoded positioning**: Layout drives render completely
- **Type-safe rendering**: Field types determine component behavior and editability

### 3. API Integration
- **Frontend API Service**: Clean interface for BFF communication
- **Parallel Data Fetching**: Layout and account data fetched simultaneously
- **Error States**: Loading spinners and error messages with retry options
- **Field Updates**: PATCH endpoint for individual field modifications

### 4. Edit Mode Implementation
- **EditableField Component**: Unified editing interface for all field types
- **State Management**: Local edit state with optimistic updates
- **Error Handling**: Field-level error display with rollback capability
- **Keyboard Support**: Full keyboard navigation and shortcuts

## Phase 4 - Constructor (Completed)

### Requirements Analysis
- **Goal**: Add a basic page constructor to modify the layout JSON itself.
- **Constraint**: Structural changes only (reorder, move, rename, add, hide) - no free-form JSX/code edits.
- **Requirement**: Drag-and-drop reordering of fields within/across blocks and of blocks themselves, plus adding custom fields and renaming/hiding blocks and fields.
- **Outcome**: Constructor changes are saved via the BFF and reflected on the Account page after reload.

### Design Strategy

#### 1. Routing
- Added `react-router-dom` with real routes (`/` for the Account page, `/constructor` for the Constructor) rather than an in-app view-toggle, since the task explicitly calls for a "separate page" - this also makes both views bookmarkable/deep-linkable.
- The pre-existing `App.tsx` fetch/edit logic moved into `src/pages/AccountPageRoute.tsx` unchanged; `App.tsx` is now just the router shell plus a shared `AppNav`.

#### 2. Backend
- Wired the already-existing but previously unused `updateLayout()` in `server/services/layoutService.ts` behind a new `PUT /api/layouts/account` route in `server/routes/layouts.ts`.
- Added `server/validation/layoutValidation.ts`, a structural validator mirroring the pattern in `server/validation/accountValidation.ts`: checks block/field shape, valid `FieldType`/`BlockColor` enum values, `select` fields having non-empty `options` with the value included, and rejects duplicate block/field ids (ids double as PATCH field names and React keys, so they must stay unique).
- Because `accountValidation.ts` reads the layout live via `getLayout('account')`, any custom field added through the Constructor is automatically PATCH-editable on the Account page with no further backend change.
- One pragmatic adjustment: the existing boolean-typed fields (`ftd-exists`, `documents-supplied`) store human-readable `"Yes"`/`"No"` strings rather than real booleans (a pre-existing quirk from Phase 1-3, harmless since boolean fields are read-only). The validator accepts both a real boolean and a string for `boolean`-typed fields rather than "fixing" data that's out of this phase's scope.

#### 3. Frontend - Constructor page (`src/pages/constructor/`)
- `ConstructorPageRoute.tsx` fetches the layout, holds a working copy (`layout`) separate from the last-persisted copy (`savedLayout`), and exposes explicit **Save Layout** / **Discard Changes** actions (Save disabled when the two are equal) - consistent with Phase 3's explicit Save/Cancel pattern rather than autosave.
- `ConstructorBlock.tsx` / `ConstructorField.tsx` render sortable rows with a drag handle, an eye-icon visibility toggle, and (for blocks) an editable title input.
- `AddFieldForm.tsx` lets an admin add a field (label, type, options for `select`, editable/required flags) to a specific block; `idUtils.ts` slugifies the label into an id and de-duplicates it against every existing field id in the layout.
- `hidden?: boolean` was added to both `Field` and `Block` in `shared/types/layout.ts`. `AccountPage.tsx`/`Block.tsx` filter out hidden blocks/fields when rendering the live page; the Constructor still shows them (dimmed) so they can be un-hidden.

#### 4. Drag and drop
- Chose `@dnd-kit/core` + `@dnd-kit/sortable` over `react-beautiful-dnd` (unmaintained) or raw HTML5 drag-and-drop (weaker accessibility/keyboard support); `dnd-kit` works well with React 19.
- A single `DndContext` in `ConstructorPageRoute.tsx` handles both drag kinds, disambiguated via `active.data.current.type`: blocks form one top-level `SortableContext`; each block's fields are their own nested `SortableContext` plus a `useDroppable` container so a field can be dropped into a different (or empty) block. This is dnd-kit's standard "multiple containers" pattern - `onDragOver` moves the field between blocks for a live preview, `onDragEnd` settles the final order.

### Key Design Decisions
- **Explicit Save/Discard over autosave**: matches the Phase 3 mental model (nothing is persisted until the user confirms) and avoids surprising an admin mid-edit with partial network failures.
- **Structural-only Constructor**: field *values* are still edited only on the Account page via the existing PATCH flow; the Constructor edits layout structure (order, grouping, labels, visibility, new field definitions), keeping the two concerns cleanly separated.
- **Live layout validation reused across both endpoints**: `PATCH /api/accounts/:id`'s editability/options checks derive from the same in-memory layout the Constructor writes to, so the two never drift out of sync.

## Advanced Features (Not Implemented)
- **Bulk Updates**: Multiple field updates in single request
- **Real-time Sync**: WebSocket integration for live updates
- **Field Dependencies**: Conditional field editing based on other fields
- **Audit Trail**: Track all field changes with timestamps

## Testing Strategy
- **Automated (Vitest)**: `npm test` runs 48 tests -
  - `server/validation/*.test.ts` - field-level and layout-structural validation rules, including the boolean-read-only and duplicate-id edge cases, against both the real in-memory layout and small fixtures.
  - `server/routes/*.test.ts` - the BFF endpoints end-to-end via Supertest against the real Express app (no mocking of Express), restoring in-memory state after mutating tests so files stay order-independent.
  - `src/components/AccountPage.test.tsx` - a guardrail proving rendering order (and hidden-block/field filtering) comes entirely from the layout JSON, not JSX.
  - `src/components/EditableField.test.tsx` - the click-to-edit / Save / Cancel interaction contract from Phase 3.
  - Deliberately not covered: Constructor drag-and-drop (dnd-kit's pointer-sensor interactions are expensive to simulate for the value they'd add) and the thin API-client wrapper classes - left to manual/`test-bff.sh` testing.
- **Manual Testing**: Layout changes, Constructor drag-and-drop, edit functionality
- **API Testing**: curl commands for all endpoints (`test-bff.sh`)

## Success Criteria

### Phase 1 ✅
✅ Page renders from JSON configuration
✅ Field order determined by layout, not code
✅ Multiple blocks and field types supported
✅ Changing JSON changes UI without code edits
✅ Strong TypeScript throughout
✅ No hardcoded field positioning

### Phase 2 ✅
✅ BFF serves layout and account data
✅ Three required endpoints implemented
✅ Comprehensive validation for updates
✅ Frontend fetches data from BFF
✅ Error handling and loading states
✅ Type-safe API communication

### Phase 3 ✅
✅ At least 1-2 fields are editable with Save and Cancel
✅ Successful Save updates backend state and UI
✅ Optimistic updates with rollback on error
✅ Comprehensive validation and error handling
✅ Keyboard shortcuts for better UX
✅ Visual feedback and clear indicators
✅ Responsive design for all screen sizes

### Phase 4 ✅
✅ Separate Constructor page edits the layout JSON
✅ Drag and drop reorders fields within a block and moves fields across blocks
✅ Drag and drop reorders blocks
✅ Adding new/custom fields, renaming blocks, and toggling visibility all work
✅ Layout changes persist via `PUT /api/layouts/account`
✅ Constructor changes are reflected on the Account page after reload
✅ Reordering and adding fields works without changing JSX

## Architecture Benefits
- **Separation of Concerns**: Clear boundaries between frontend, backend, and data
- **API-First Design**: Clean REST endpoints for future integrations
- **Validation Layer**: Ensures data integrity and security across all layers
- **Type Safety**: Consistent typing across frontend and backend
- **Extensible Design**: Layout structure and account data can now both be edited end-to-end without touching JSX
- **User Experience**: Professional editing interface with immediate feedback
- **Performance**: Optimistic updates with efficient error handling
