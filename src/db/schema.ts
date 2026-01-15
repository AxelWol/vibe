/**
 * SQLite database schema for the Recipe App
 */

export const CREATE_RECIPES_TABLE = `
  CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    photos TEXT DEFAULT '[]',
    servings INTEGER DEFAULT 4,
    prep_time INTEGER,
    cook_time INTEGER,
    ingredients TEXT NOT NULL DEFAULT '[]',
    steps TEXT NOT NULL DEFAULT '[]',
    notes TEXT,
    tags TEXT DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

// Create index for faster text searches
export const CREATE_SEARCH_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes(title);
`;

export const ALL_SCHEMAS = [CREATE_RECIPES_TABLE, CREATE_SEARCH_INDEX];
