# Product Requirements Document (PRD)

## 1. Vision

A personal recipe management web application that enables users to create, organize, search, and manage their cooking recipes with an intuitive, accessible interface.

## 2. Problem Statement

Home cooks need a simple, offline-capable way to store and retrieve their recipes without the complexity of account management or cloud dependencies. Existing solutions often require login, are cluttered with ads, or lack proper accessibility support.

## 3. Target Users

- Home cooks who want to digitize and organize their recipes
- Users who value privacy (no account required)
- Users who need accessible interfaces (screen readers, keyboard navigation)

## 4. Use Cases

### 4.1 Recipe Management
| ID | Use Case | Priority |
|----|----------|----------|
| UC-01 | Create a new recipe with all required fields | Must Have |
| UC-02 | Edit an existing recipe | Must Have |
| UC-03 | Delete a recipe (with confirmation) | Must Have |
| UC-04 | View recipe details in a readable format | Must Have |
| UC-05 | Upload/attach photos to a recipe | Should Have |
| UC-06 | Duplicate an existing recipe | Nice to Have |

### 4.2 Search & Discovery
| ID | Use Case | Priority |
|----|----------|----------|
| UC-07 | Full-text search across all recipe content | Must Have |
| UC-08 | Filter recipes by specific ingredients | Must Have |
| UC-09 | Browse all recipes in a list/grid view | Must Have |
| UC-10 | Sort recipes by name, date created, or date modified | Should Have |

### 4.3 Data Management
| ID | Use Case | Priority |
|----|----------|----------|
| UC-11 | Export recipes (JSON format) | Should Have |
| UC-12 | Import recipes (JSON format) | Should Have |
| UC-13 | Print a recipe in a clean format | Nice to Have |

## 5. Recipe Data Model

Each recipe consists of the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier (auto-generated) |
| `title` | String (max 200 chars) | Yes | Recipe name |
| `description` | Text (max 500 chars) | No | Brief summary of the dish |
| `photos` | Array of image paths | No | Up to 5 photos per recipe |
| `servings` | Number | No | Number of servings (default: 4) |
| `prepTime` | Number (minutes) | No | Preparation time |
| `cookTime` | Number (minutes) | No | Cooking time |
| `ingredients` | Array of objects | Yes | List of ingredients (see below) |
| `steps` | Array of strings | Yes | Ordered preparation steps |
| `notes` | Text | No | Additional tips or variations |
| `tags` | Array of strings | No | Categories (e.g., "vegetarian", "dessert") |
| `createdAt` | DateTime | Yes | Auto-generated timestamp |
| `updatedAt` | DateTime | Yes | Auto-updated timestamp |

### 5.1 Ingredient Object Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Ingredient name |
| `quantity` | Number | No | Amount (e.g., 2) |
| `unit` | String | No | Unit of measure (e.g., "cups", "grams") |

## 6. Non-Functional Requirements

### 6.1 Accessibility (WCAG 2.1 AA Compliance)
- All interactive elements must be keyboard accessible
- Minimum color contrast ratio of 4.5:1 for normal text
- All images must have descriptive alt text
- Form inputs must have associated labels
- Focus indicators must be visible
- Screen reader compatibility required

### 6.2 Performance
- Initial page load: < 2 seconds
- Search results: < 500ms response time
- Smooth scrolling and transitions (60fps)

### 6.3 Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### 6.4 Responsiveness
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

## 7. Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Frontend Framework | React 18+ | UI components and state management |
| UI Library | Microsoft Fluent UI v9 | Consistent, accessible components |
| Build Tool | Vite | Fast development and bundling |
| Language | TypeScript (strict mode) | Type safety and developer experience |
| Database | SQLite (via better-sqlite3 or sql.js) | Local data persistence |
| Code Formatting | Prettier | Consistent code style |
| Linting | ESLint | Code quality and error prevention |
| Testing | Vitest + React Testing Library | Unit and integration tests |

### 7.1 Architecture Decision: SQLite Implementation

**Option A: sql.js (Browser-based)**
- Runs entirely in the browser using WebAssembly
- Data stored in IndexedDB or localStorage
- No backend required
- **Recommended for this project** (simpler deployment, true offline support)

**Option B: better-sqlite3 (Node.js backend)**
- Requires a separate backend server
- More complex deployment
- Better for multi-device sync (future consideration)

**Decision:** Use **sql.js** for browser-based SQLite to maintain a simple, serverless architecture.

## 8. UI/UX Guidelines

### 8.1 Layout Structure
- **Header**: App title, search bar, "Add Recipe" button
- **Main Content**: Recipe list/grid with filter sidebar
- **Recipe View**: Full recipe display with edit/delete actions
- **Recipe Form**: Modal or dedicated page for create/edit

### 8.2 Design Principles
- Clean, minimal interface with focus on content
- Consistent spacing using 8px grid system
- Fluent UI design tokens for colors and typography
- Dark mode support (follows system preference)

## 9. Out of Scope (v1.0)

The following features are explicitly excluded from the initial release:
- User authentication/accounts
- Cloud sync or multi-device support
- Recipe sharing via links
- Meal planning calendar
- Shopping list generation
- Nutritional information calculation
- Recipe scaling calculator
- Social features (comments, ratings)

## 10. Success Metrics

| Metric | Target |
|--------|--------|
| Lighthouse Accessibility Score | ≥ 95 |
| Lighthouse Performance Score | ≥ 90 |
| All WCAG 2.1 AA criteria | Pass |
| Test coverage | ≥ 80% |

## 11. Open Questions (Resolved)

| # | Question | Resolution |
|---|----------|------------|
| 1 | Should photos be stored in SQLite or filesystem? | Store as Base64 in SQLite for portability (max 5 photos, each ≤ 2MB) |
| 2 | WCAG AA or AAA compliance? | Target WCAG 2.1 AA (AAA where feasible without significant effort) |
| 3 | How to handle data persistence across sessions? | sql.js with IndexedDB persistence |
| 4 | What image formats to support? | JPEG, PNG, WebP (with client-side validation) |

## 12. Milestones

| Phase | Deliverables | 
|-------|--------------|
| Phase 1 | Project setup, database schema, basic CRUD operations |
| Phase 2 | Recipe list view, search functionality, ingredient filtering |
| Phase 3 | Photo upload, accessibility audit, responsive design polish |
| Phase 4 | Import/export, testing, documentation, final polish |
