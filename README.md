# 🍳 Recipe App

A personal recipe management web application built with React, TypeScript, and Fluent UI. Store, organize, search, and manage your cooking recipes with an intuitive, accessible interface.

## Features

- ✅ **Create & Edit Recipes** - Full recipe management with ingredients, steps, photos, and notes
- ✅ **Photo Support** - Attach up to 5 photos per recipe (stored locally)
- ✅ **Full-Text Search** - Search across all recipe content instantly
- ✅ **Offline-First** - All data stored locally in your browser using SQLite
- ✅ **Accessible** - WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- ✅ **Dark Mode** - Automatically follows your system preference
- ✅ **No Account Required** - Your recipes stay on your device

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Microsoft Fluent UI v9** - Accessible UI components
- **Vite** - Build tool
- **sql.js** - SQLite in the browser via WebAssembly
- **Vitest** - Testing framework

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vibe

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |

## Project Structure

```
src/
├── components/     # React components
│   ├── Header.tsx
│   ├── RecipeCard.tsx
│   ├── RecipeList.tsx
│   ├── RecipeDetail.tsx
│   └── RecipeForm.tsx
├── context/        # React context providers
│   └── DatabaseContext.tsx
├── db/             # Database utilities
│   ├── database.ts
│   ├── recipeRepository.ts
│   └── schema.ts
├── hooks/          # Custom React hooks
│   ├── useRecipes.ts
│   └── useDebouncedSearch.ts
├── types/          # TypeScript type definitions
│   └── recipe.ts
├── App.tsx         # Main application component
└── main.tsx        # Entry point
```

## Documentation

- [Product Requirements (PRD)](docs/prd.md)
- [Implementation Plan](docs/plan.md)

## License

EUPL-1.2
