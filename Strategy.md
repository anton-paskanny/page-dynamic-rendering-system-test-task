# Strategy Document - Phase 1, 2 & 3 Implementation

## Overview
This document outlines the strategy and implementation approach for Phase 1 (Base), Phase 2 (BFF), and Phase 3 (Edit Mode) of the Account page dynamic rendering system.

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

## Future Extensibility

### 1. Phase 4 - Constructor (Proposed, Not Implemented)

This phase has not been built. The design below is a concrete proposal so the remaining scope/effort is clear to a reviewer.

**Backend**
- Wire up the already-existing but unused `updateLayout()` in `server/services/layoutService.ts` behind a new `PUT /api/layouts/account` route in `server/routes/layouts.ts`.
- Add a structural validator for the incoming layout (blocks array shape, required field properties, unique block/field ids) mirroring the pattern already used in `server/validation/accountValidation.ts`.

**Frontend**
- A new `Constructor` page. The app currently has no router (a single `<App>`); the smallest addition is either a `react-router` route or a simple view-toggle in `App.tsx`.
- The Constructor loads the layout via the existing `LayoutService`, and lets an admin: reorder fields within a block, move fields across blocks, reorder blocks, add new/custom fields, rename blocks, and toggle field/block visibility.
- Changes save via the new `PUT /api/layouts/account` endpoint; the Account page picks them up on reload since it already fetches the layout fresh from the BFF.

**Drag and drop**
- Recommend `@dnd-kit/core` + `@dnd-kit/sortable` over `react-beautiful-dnd` (unmaintained) or raw HTML5 drag-and-drop (weaker accessibility/keyboard support). `dnd-kit` is actively maintained and works well with React 19.

### 2. Advanced Features
- **Bulk Updates**: Multiple field updates in single request
- **Real-time Sync**: WebSocket integration for live updates
- **Field Dependencies**: Conditional field editing based on other fields
- **Audit Trail**: Track all field changes with timestamps

## Testing Strategy
- **Manual Testing**: Layout changes, API endpoints, edit functionality
- **API Testing**: curl commands for all endpoints
- **Validation Testing**: Field updates and error cases
- **Integration Testing**: Frontend-backend communication
- **User Experience Testing**: Edit mode workflow and feedback

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

## Architecture Benefits
- **Separation of Concerns**: Clear boundaries between frontend, backend, and data
- **API-First Design**: Clean REST endpoints for future integrations
- **Validation Layer**: Ensures data integrity and security across all layers
- **Type Safety**: Consistent typing across frontend and backend
- **Extensible Design**: Ready for Phase 4 and advanced features
- **User Experience**: Professional editing interface with immediate feedback
- **Performance**: Optimistic updates with efficient error handling
