# Phase 2 - BFF Implementation

## Overview
Phase 2 implements a Backend for Frontend (BFF) that serves the JSON layout configuration and account data, and accepts updates. The BFF is built with Express.js and provides a clean API for the frontend to consume.

## Architecture

### BFF Server
- **Framework**: Express.js with TypeScript
- **Port**: 3001
- **Storage**: In-memory storage (no database required)
- **Validation**: Comprehensive field validation for updates
- **CORS**: Enabled for frontend communication

### API Endpoints

#### 1. Health Check
```
GET /health
```
Returns server status and timestamp.

#### 2. Layout Configuration
```
GET /api/layouts/account
```
Returns the JSON layout configuration used to render the Account page.

#### 3. Account Data
```
GET /api/accounts/:id
```
Returns account data for the specified ID.

#### 4. Account Updates
```
PATCH /api/accounts/:id
```
Accepts updates for editable fields on the page.

**Request Body Example:**
```json
{
  "first-name": "John",
  "age": 35,
  "country": "USA"
}
```

## Running the Application

### Prerequisites
- Node.js version 18 or higher
- npm or yarn package manager

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the BFF Server
```bash
# Development mode (with auto-reload)
npm run server:dev

# Or build and run production
npm run server:build
npm run server:start
```

The BFF server will start on `http://localhost:3001`

### 3. Start the Frontend
```bash
# In a new terminal
npm run dev
```

The frontend will start on `http://localhost:5173`

## Testing the BFF

### Health Check
```bash
curl http://localhost:3001/health
```

### Get Layout Configuration
```bash
curl http://localhost:3001/api/layouts/account
```

### Get Account Data
```bash
curl http://localhost:3001/api/accounts/1
```

### Update Account
```bash
curl -X PATCH http://localhost:3001/api/accounts/1 \
  -H "Content-Type: application/json" \
  -d '{"first-name": "John", "age": 35}'
```

### Test Validation
```bash
# Try to update a non-editable field
curl -X PATCH http://localhost:3001/api/accounts/1 \
  -H "Content-Type: application/json" \
  -d '{"id": "2"}'
```

## Editable Fields

The following fields can be updated via the PATCH endpoint:

### Personal Information
- `first-name` (string, max 50 chars)
- `last-name` (string, max 50 chars)
- `age` (number, 0-150)
- `country` (select: Spain, USA, UK, Germany, France)
- `language` (select: Spanish, English, French, German)

### Contact Information
- `email` (string, email format)
- `phone1-country-code` (string, format: +XXX)
- `phone1-area-code` (string, 1-5 digits)
- `primary-phone` (string, 6-15 digits)
- `mobile-phone` (string, 6-15 digits)

### Account Status
- `lead-status` (select: New, Qualified, Proposal, Negotiation, Closed)
- `account-status` (select: Real, Demo, Test)

## Validation Rules

### String Fields
- Maximum length validation
- Pattern validation (email, phone formats)
- Allowed values validation for select fields

### Number Fields
- Range validation (min/max values)
- Type validation

### Security Features
- Field-level access control (only editable fields can be updated)
- Input sanitization and validation
- Comprehensive error messages

## Project Structure

```
server/
├── index.ts                 # Main server entry point
├── tsconfig.json           # Server TypeScript config
├── routes/
│   ├── accounts.ts         # Account endpoints
│   └── layouts.ts          # Layout endpoints
├── services/
│   ├── accountService.ts   # Account business logic
│   └── layoutService.ts    # Layout business logic
└── validation/
    └── accountValidation.ts # Update validation logic

shared/
├── constants/
│   └── api.ts              # Shared API constants
└── types/
    └── layout.ts           # Shared type definitions

src/
├── services/
│   └── api.ts              # Frontend API client
└── ...                     # Frontend components
```

## Frontend Integration

The frontend now fetches data from the BFF instead of using mock data:

1. **Layout Data**: Fetched from `/api/layouts/account`
2. **Account Data**: Fetched from `/api/accounts/:id`
3. **Updates**: Sent to `/api/accounts/:id` via PATCH

### API Service
The `ApiService` class provides a clean interface for all BFF communication:
- `getLayout()` - Fetch layout configuration
- `getAccount(id)` - Fetch account data
- `updateAccount(id, updates)` - Update account fields
- `healthCheck()` - Check server status

## Error Handling

### Server Errors
- 400: Validation errors with detailed messages
- 404: Resource not found
- 500: Internal server errors

### Frontend Errors
- Loading states with spinners
- Error messages with retry options
- Graceful fallbacks for API failures

## Troubleshooting

### Common Issues

1. **CORS Issues**
   - Ensure the BFF server is running on port 3001
   - Check that CORS is properly configured

2. **TypeScript Compilation Errors**
   - Run `npm run server:build` to check for errors
   - Ensure all dependencies are installed

3. **Frontend Can't Connect to BFF**
   - Verify BFF server is running (`curl http://localhost:3001/health`)
   - Check browser console for CORS errors
   - Ensure API_BASE_URL in `src/services/api.ts` matches server port
