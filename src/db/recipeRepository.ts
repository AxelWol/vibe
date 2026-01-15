import { v4 as uuidv4 } from 'uuid';
import { getDatabase, saveToIndexedDB } from './database';
import type { Recipe, RecipeFormData, RecipeSearchParams } from '../types/recipe';

/**
 * Convert a database row to a Recipe object
 */
function rowToRecipe(row: Record<string, unknown>): Recipe {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    photos: JSON.parse((row.photos as string) || '[]'),
    servings: (row.servings as number) || 4,
    prepTime: row.prep_time as number | undefined,
    cookTime: row.cook_time as number | undefined,
    ingredients: JSON.parse((row.ingredients as string) || '[]'),
    steps: JSON.parse((row.steps as string) || '[]'),
    notes: row.notes as string | undefined,
    tags: JSON.parse((row.tags as string) || '[]'),
    rating: row.rating as number | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Create a new recipe
 */
export async function createRecipe(data: RecipeFormData): Promise<Recipe> {
  const db = getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();

  const recipe: Recipe = {
    id,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  db.run(
    `INSERT INTO recipes (id, title, description, photos, servings, prep_time, cook_time, ingredients, steps, notes, tags, rating, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      recipe.id,
      recipe.title,
      recipe.description || null,
      JSON.stringify(recipe.photos),
      recipe.servings,
      recipe.prepTime || null,
      recipe.cookTime || null,
      JSON.stringify(recipe.ingredients),
      JSON.stringify(recipe.steps),
      recipe.notes || null,
      JSON.stringify(recipe.tags),
      recipe.rating || null,
      recipe.createdAt,
      recipe.updatedAt,
    ]
  );

  await saveToIndexedDB();
  return recipe;
}

/**
 * Get a recipe by ID
 */
export function getRecipeById(id: string): Recipe | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM recipes WHERE id = ?');
  stmt.bind([id]);

  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return rowToRecipe(row);
  }

  stmt.free();
  return null;
}

/**
 * Get all recipes with optional search and filter
 */
export function getAllRecipes(params?: RecipeSearchParams): Recipe[] {
  const db = getDatabase();
  let sql = 'SELECT * FROM recipes';
  const conditions: string[] = [];
  const bindings: (string | number)[] = [];

  // Full-text search using LIKE (case-insensitive)
  if (params?.query) {
    const searchTerm = `%${params.query}%`;
    conditions.push(`(
      title LIKE ? COLLATE NOCASE OR
      description LIKE ? COLLATE NOCASE OR
      ingredients LIKE ? COLLATE NOCASE OR
      steps LIKE ? COLLATE NOCASE OR
      notes LIKE ? COLLATE NOCASE OR
      tags LIKE ? COLLATE NOCASE
    )`);
    // Add the search term for each field
    for (let i = 0; i < 6; i++) {
      bindings.push(searchTerm);
    }
  }

  // Filter by ingredients
  if (params?.ingredients?.length) {
    const ingredientConditions = params.ingredients.map(() => 'ingredients LIKE ? COLLATE NOCASE');
    conditions.push(`(${ingredientConditions.join(' AND ')})`);
    params.ingredients.forEach((ing) => bindings.push(`%"name":"${ing}%`));
  }

  // Filter by tags
  if (params?.tags?.length) {
    const tagConditions = params.tags.map(() => 'tags LIKE ? COLLATE NOCASE');
    conditions.push(`(${tagConditions.join(' OR ')})`);
    params.tags.forEach((tag) => bindings.push(`%"${tag}"%`));
  }

  // Filter by minimum rating
  if (params?.minRating && params.minRating >= 1 && params.minRating <= 5) {
    conditions.push('rating >= ?');
    bindings.push(params.minRating);
  }

  // Add conditions to query
  if (conditions.length) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  // Sorting
  const sortBy = params?.sortBy || 'updatedAt';
  const sortOrder = params?.sortOrder || 'desc';
  const columnMap: Record<string, string> = {
    title: 'title',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    rating: 'rating',
  };
  sql += ` ORDER BY ${columnMap[sortBy]} ${sortOrder.toUpperCase()}`;

  const result = db.exec(sql, bindings);

  if (!result.length) {
    return [];
  }

  const columns = result[0].columns;
  return result[0].values.map((row: (string | number | Uint8Array | null)[]) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col: string, i: number) => (obj[col] = row[i]));
    return rowToRecipe(obj);
  });
}

/**
 * Update an existing recipe
 */
export async function updateRecipe(id: string, data: Partial<RecipeFormData>): Promise<Recipe | null> {
  const existing = getRecipeById(id);
  if (!existing) {
    return null;
  }

  const db = getDatabase();
  const now = new Date().toISOString();

  const updated: Recipe = {
    ...existing,
    ...data,
    updatedAt: now,
  };

  db.run(
    `UPDATE recipes SET
      title = ?, description = ?, photos = ?, servings = ?,
      prep_time = ?, cook_time = ?, ingredients = ?, steps = ?,
      notes = ?, tags = ?, rating = ?, updated_at = ?
     WHERE id = ?`,
    [
      updated.title,
      updated.description || null,
      JSON.stringify(updated.photos),
      updated.servings,
      updated.prepTime || null,
      updated.cookTime || null,
      JSON.stringify(updated.ingredients),
      JSON.stringify(updated.steps),
      updated.notes || null,
      JSON.stringify(updated.tags),
      updated.rating || null,
      updated.updatedAt,
      id,
    ]
  );

  await saveToIndexedDB();
  return updated;
}

/**
 * Delete a recipe by ID
 */
export async function deleteRecipe(id: string): Promise<boolean> {
  const db = getDatabase();
  const existing = getRecipeById(id);

  if (!existing) {
    return false;
  }

  db.run('DELETE FROM recipes WHERE id = ?', [id]);
  await saveToIndexedDB();
  return true;
}

/**
 * Get all unique tags from recipes
 */
export function getAllTags(): string[] {
  const db = getDatabase();
  const result = db.exec('SELECT tags FROM recipes');

  if (!result.length) {
    return [];
  }

  const allTags = new Set<string>();
  result[0].values.forEach((row: (string | number | Uint8Array | null)[]) => {
    const tags = JSON.parse(row[0] as string) as string[];
    tags.forEach((tag) => allTags.add(tag));
  });

  return Array.from(allTags).sort();
}

/**
 * Get all unique ingredients from recipes
 */
export function getAllIngredients(): string[] {
  const db = getDatabase();
  const result = db.exec('SELECT ingredients FROM recipes');

  if (!result.length) {
    return [];
  }

  const allIngredients = new Set<string>();
  result[0].values.forEach((row: (string | number | Uint8Array | null)[]) => {
    const ingredients = JSON.parse(row[0] as string) as { name: string }[];
    ingredients.forEach((ing) => allIngredients.add(ing.name.toLowerCase()));
  });

  return Array.from(allIngredients).sort();
}
