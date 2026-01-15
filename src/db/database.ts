import initSqlJs, { Database } from 'sql.js';
import { ALL_SCHEMAS } from './schema';

const DB_NAME = 'recipe-app-db';

let db: Database | null = null;

/**
 * Run database migrations to add new columns
 * This handles schema updates for existing databases
 */
async function runMigrations(database: Database): Promise<void> {
  // Check if rating column exists
  const tableInfo = database.exec("PRAGMA table_info(recipes)");
  if (tableInfo.length > 0) {
    const columns = tableInfo[0].values.map((row) => row[1] as string);
    
    // Migration 1: Add rating column if it doesn't exist
    if (!columns.includes('rating')) {
      console.log('Running migration: Adding rating column');
      database.run('ALTER TABLE recipes ADD COLUMN rating INTEGER');
      await saveToIndexedDB();
    }
  }
}

/**
 * Load sample recipes on first app load
 */
async function loadSampleRecipes(): Promise<void> {
  try {
    // Fetch sample recipes from public folder
    // Use import.meta.env.BASE_URL for correct path in production
    const baseUrl = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${baseUrl}sample-recipes.json`);
    if (!response.ok) {
      console.warn('Sample recipes not found, starting with empty database');
      return;
    }
    const jsonString = await response.text();
    const result = await importRecipesFromJsonInternal(jsonString);
    console.log(`Loaded ${result.imported} sample recipes`);
  } catch (error) {
    console.warn('Failed to load sample recipes:', error);
  }
}

/**
 * Internal import function that doesn't save to IndexedDB (called during init)
 */
async function importRecipesFromJsonInternal(jsonString: string): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const result = { imported: 0, skipped: 0, errors: [] as string[] };
  
  let data: { version?: number; recipes?: ImportedRecipe[] } | ImportedRecipe[];
  try {
    data = JSON.parse(jsonString);
  } catch {
    console.error('Invalid JSON format in sample recipes');
    return result;
  }

  const recipes: ImportedRecipe[] = Array.isArray(data) ? data : (data.recipes || []);
  
  if (!Array.isArray(recipes)) {
    return result;
  }

  const database = getDatabase();
  const { v4: uuidv4 } = await import('uuid');

  for (const recipe of recipes) {
    try {
      if (!recipe.title || !Array.isArray(recipe.ingredients) || !Array.isArray(recipe.steps)) {
        continue;
      }

      const id = recipe.id || uuidv4();
      const now = new Date().toISOString();
      const prepTime = recipe.prep_time ?? recipe.prepTime ?? null;
      const cookTime = recipe.cook_time ?? recipe.cookTime ?? null;
      const createdAt = recipe.created_at ?? recipe.createdAt ?? now;
      const updatedAt = recipe.updated_at ?? recipe.updatedAt ?? now;

      database.run(
        `INSERT INTO recipes (id, title, description, photos, servings, prep_time, cook_time, ingredients, steps, notes, tags, rating, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          recipe.title,
          recipe.description || null,
          JSON.stringify(recipe.photos || []),
          recipe.servings || 4,
          prepTime,
          cookTime,
          JSON.stringify(recipe.ingredients),
          JSON.stringify(recipe.steps),
          recipe.notes || null,
          JSON.stringify(recipe.tags || []),
          recipe.rating || null,
          createdAt,
          updatedAt,
        ]
      );
      result.imported++;
    } catch (err) {
      result.errors.push(`Failed to import "${recipe.title}": ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  await saveToIndexedDB();
  return result;
}

/**
 * Request persistent storage from the browser
 * This prevents the browser from automatically clearing the IndexedDB data
 */
async function requestPersistentStorage(): Promise<boolean> {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persisted();
    if (isPersisted) {
      console.log('Storage is already persistent');
      return true;
    }
    
    const result = await navigator.storage.persist();
    if (result) {
      console.log('Storage is now persistent');
    } else {
      console.warn('Storage persistence request was denied - data may be cleared by browser');
    }
    return result;
  }
  console.warn('Persistent storage API not available');
  return false;
}

/**
 * Initialize the SQLite database using sql.js
 * Loads existing data from IndexedDB if available
 */
export async function initDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  // Request persistent storage to prevent data loss
  await requestPersistentStorage();

  const SQL = await initSqlJs({
    // Load sql.js wasm from CDN
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  // Try to load existing database from IndexedDB
  const savedData = await loadFromIndexedDB();

  if (savedData) {
    try {
      db = new SQL.Database(savedData);
      // Verify schema is compatible by running a test query
      db.exec('SELECT id FROM recipes LIMIT 1');
      // Run migrations for any new columns
      await runMigrations(db);
    } catch {
      // Schema incompatible or corrupted, reset database
      console.warn('Database schema incompatible, creating fresh database');
      db = new SQL.Database();
      for (const schema of ALL_SCHEMAS) {
        db.run(schema);
      }
      await saveToIndexedDB();
    }
  } else {
    db = new SQL.Database();
    // Initialize schema for new database
    for (const schema of ALL_SCHEMAS) {
      db.run(schema);
    }
    await saveToIndexedDB();
    
    // Load sample recipes on first run
    await loadSampleRecipes();
  }

  return db;
}

/**
 * Clear the database and reset with fresh schema
 */
export async function resetDatabase(): Promise<void> {
  await clearIndexedDB();
  db = null;
  await initDatabase();
}

/**
 * Clear IndexedDB storage
 */
async function clearIndexedDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get the current database instance
 * Throws if database is not initialized
 */
export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Save the current database state to IndexedDB
 */
export async function saveToIndexedDB(): Promise<void> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const data = db.export();
  const buffer = new Uint8Array(data);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = () => {
      const idb = request.result;
      if (!idb.objectStoreNames.contains('database')) {
        idb.createObjectStore('database');
      }
    };

    request.onsuccess = () => {
      const idb = request.result;
      const transaction = idb.transaction('database', 'readwrite');
      const store = transaction.objectStore('database');
      const putRequest = store.put(buffer, 'data');

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
  });
}

/**
 * Load database from IndexedDB
 */
async function loadFromIndexedDB(): Promise<Uint8Array | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = () => {
      const idb = request.result;
      if (!idb.objectStoreNames.contains('database')) {
        idb.createObjectStore('database');
      }
    };

    request.onsuccess = () => {
      const idb = request.result;
      const transaction = idb.transaction('database', 'readonly');
      const store = transaction.objectStore('database');
      const getRequest = store.get('data');

      getRequest.onsuccess = () => {
        resolve(getRequest.result || null);
      };
      getRequest.onerror = () => reject(getRequest.error);
    };
  });
}

/**
 * Export all recipes as JSON
 */
export function exportRecipesAsJson(): string {
  const database = getDatabase();
  const result = database.exec('SELECT * FROM recipes');

  if (!result.length) {
    return JSON.stringify({ version: 1, recipes: [] }, null, 2);
  }

  const columns = result[0].columns;
  const recipes = result[0].values.map((row: (string | number | Uint8Array | null)[]) => {
    const recipe: Record<string, unknown> = {};
    columns.forEach((col: string, index: number) => {
      const value = row[index];
      // Parse JSON fields
      if (['photos', 'ingredients', 'steps', 'tags'].includes(col)) {
        recipe[col] = JSON.parse(value as string);
      } else {
        recipe[col] = value;
      }
    });
    return recipe;
  });

  return JSON.stringify({ version: 1, recipes }, null, 2);
}

/**
 * Download recipes as a JSON file
 */
export function downloadRecipesAsJson(filename: string = 'recipes-export.json'): void {
  const json = exportRecipesAsJson();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface ImportedRecipe {
  id?: string;
  title: string;
  description?: string;
  photos?: string[];
  servings?: number;
  prep_time?: number;
  cook_time?: number;
  prepTime?: number;
  cookTime?: number;
  ingredients: Array<{ name: string; quantity?: number; unit?: string }>;
  steps: string[];
  notes?: string;
  tags?: string[];
  rating?: number;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

/**
 * Import recipes from JSON data
 * @param jsonString - The JSON string containing recipes
 * @param mode - 'skip' to skip duplicates, 'overwrite' to replace duplicates
 */
export async function importRecipesFromJson(
  jsonString: string,
  mode: 'skip' | 'overwrite' = 'skip'
): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, skipped: 0, errors: [] };
  
  let data: { version?: number; recipes?: ImportedRecipe[] } | ImportedRecipe[];
  try {
    data = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON format');
  }

  // Handle both formats: { recipes: [...] } and just [...]
  const recipes: ImportedRecipe[] = Array.isArray(data) ? data : (data.recipes || []);
  
  if (!Array.isArray(recipes)) {
    throw new Error('Invalid format: expected an array of recipes');
  }

  const db = getDatabase();
  const { v4: uuidv4 } = await import('uuid');

  for (const recipe of recipes) {
    try {
      // Validate required fields
      if (!recipe.title || typeof recipe.title !== 'string') {
        result.errors.push(`Recipe missing title`);
        continue;
      }
      if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
        result.errors.push(`Recipe "${recipe.title}" missing ingredients`);
        continue;
      }
      if (!Array.isArray(recipe.steps) || recipe.steps.length === 0) {
        result.errors.push(`Recipe "${recipe.title}" missing steps`);
        continue;
      }

      // Check for existing recipe with same ID
      const existingId = recipe.id;
      if (existingId) {
        const stmt = db.prepare('SELECT id FROM recipes WHERE id = ?');
        stmt.bind([existingId]);
        const exists = stmt.step();
        stmt.free();

        if (exists) {
          if (mode === 'skip') {
            result.skipped++;
            continue;
          }
          // Overwrite mode - delete existing
          db.run('DELETE FROM recipes WHERE id = ?', [existingId]);
        }
      }

      // Generate new ID if not provided or if we're not keeping the original
      const id = existingId || uuidv4();
      const now = new Date().toISOString();

      // Normalize field names (handle both snake_case and camelCase)
      const prepTime = recipe.prep_time ?? recipe.prepTime ?? null;
      const cookTime = recipe.cook_time ?? recipe.cookTime ?? null;
      const createdAt = recipe.created_at ?? recipe.createdAt ?? now;
      const updatedAt = recipe.updated_at ?? recipe.updatedAt ?? now;

      db.run(
        `INSERT INTO recipes (id, title, description, photos, servings, prep_time, cook_time, ingredients, steps, notes, tags, rating, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          recipe.title,
          recipe.description || null,
          JSON.stringify(recipe.photos || []),
          recipe.servings || 4,
          prepTime,
          cookTime,
          JSON.stringify(recipe.ingredients),
          JSON.stringify(recipe.steps),
          recipe.notes || null,
          JSON.stringify(recipe.tags || []),
          recipe.rating || null,
          createdAt,
          updatedAt,
        ]
      );

      result.imported++;
    } catch (err) {
      result.errors.push(`Failed to import "${recipe.title}": ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  await saveToIndexedDB();
  return result;
}

/**
 * Export the entire SQLite database as a binary file
 * Returns the database as a Uint8Array that can be saved to disk
 */
export function exportDatabaseFile(): Uint8Array {
  const database = getDatabase();
  return database.export();
}

/**
 * Import a SQLite database file and replace the current database
 * @param data - The SQLite database file as Uint8Array
 */
export async function importDatabaseFile(data: Uint8Array): Promise<void> {
  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  // Try to open the database to verify it's valid
  const newDb = new SQL.Database(data);
  
  // Verify it has the expected schema
  try {
    newDb.exec('SELECT id, title, description, ingredients, steps, tags, photos FROM recipes LIMIT 1');
  } catch {
    newDb.close();
    throw new Error('Invalid database file: missing required schema');
  }

  // Close existing database and replace with imported one
  if (db) {
    db.close();
  }
  db = newDb;
  
  // Save to IndexedDB
  await saveToIndexedDB();
}

/**
 * Download the database as a .sqlite file
 */
export function downloadDatabaseFile(filename: string = 'recipes-backup.sqlite'): void {
  const data = exportDatabaseFile();
  const blob = new Blob([new Uint8Array(data)], { type: 'application/x-sqlite3' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Clear and close the database (useful for testing)
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
