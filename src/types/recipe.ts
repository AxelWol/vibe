/**
 * Ingredient object structure for a recipe
 */
export interface Ingredient {
  /** Ingredient name */
  name: string;
  /** Amount (e.g., 2) */
  quantity?: number;
  /** Unit of measure (e.g., "cups", "grams") */
  unit?: string;
}

/**
 * Recipe data model
 */
export interface Recipe {
  /** Unique identifier (UUID) */
  id: string;
  /** Recipe name (max 200 chars) */
  title: string;
  /** Brief summary of the dish (max 500 chars) */
  description?: string;
  /** Up to 5 photos per recipe (Base64 encoded) */
  photos: string[];
  /** Number of servings (default: 4) */
  servings: number;
  /** Preparation time in minutes */
  prepTime?: number;
  /** Cooking time in minutes */
  cookTime?: number;
  /** List of ingredients */
  ingredients: Ingredient[];
  /** Ordered preparation steps */
  steps: string[];
  /** Additional tips or variations */
  notes?: string;
  /** Categories (e.g., "vegetarian", "dessert") */
  tags: string[];
  /** Auto-generated timestamp */
  createdAt: string;
  /** Auto-updated timestamp */
  updatedAt: string;
}

/**
 * Form data for creating/editing a recipe (without auto-generated fields)
 */
export interface RecipeFormData {
  title: string;
  description?: string;
  photos: string[];
  servings: number;
  prepTime?: number;
  cookTime?: number;
  ingredients: Ingredient[];
  steps: string[];
  notes?: string;
  tags: string[];
}

/**
 * Search and filter parameters
 */
export interface RecipeSearchParams {
  query?: string;
  ingredients?: string[];
  tags?: string[];
  sortBy?: 'title' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Validation error for form fields
 */
export interface ValidationError {
  field: string;
  message: string;
}
