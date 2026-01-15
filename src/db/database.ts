import initSqlJs, { Database } from 'sql.js';
import { ALL_SCHEMAS } from './schema';

const DB_NAME = 'recipe-app-db';
const DB_VERSION = 2; // Increment when schema changes

let db: Database | null = null;

/**
 * Initialize the SQLite database using sql.js
 * Loads existing data from IndexedDB if available
 */
export async function initDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

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
export function exportDatabase(): string {
  const database = getDatabase();
  const result = database.exec('SELECT * FROM recipes');

  if (!result.length) {
    return JSON.stringify([]);
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

  return JSON.stringify(recipes, null, 2);
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
