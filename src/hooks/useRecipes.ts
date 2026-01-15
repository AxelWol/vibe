import { useState, useCallback } from 'react';
import {
  createRecipe,
  getRecipeById,
  getAllRecipes,
  updateRecipe,
  deleteRecipe,
  getAllTags,
  getAllIngredients,
} from '../db/recipeRepository';
import type { Recipe, RecipeFormData, RecipeSearchParams } from '../types/recipe';

/**
 * Hook for managing recipes with CRUD operations
 */
export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch all recipes with optional search/filter
   */
  const fetchRecipes = useCallback(async (params?: RecipeSearchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = getAllRecipes(params);
      setRecipes(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch recipes');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get a single recipe by ID
   */
  const getRecipe = useCallback((id: string) => {
    return getRecipeById(id);
  }, []);

  /**
   * Create a new recipe
   */
  const addRecipe = useCallback(async (data: RecipeFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const recipe = await createRecipe(data);
      setRecipes((prev) => [recipe, ...prev]);
      return recipe;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create recipe');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update an existing recipe
   */
  const editRecipe = useCallback(async (id: string, data: Partial<RecipeFormData>) => {
    setIsLoading(true);
    setError(null);
    try {
      const recipe = await updateRecipe(id, data);
      if (recipe) {
        setRecipes((prev) => prev.map((r) => (r.id === id ? recipe : r)));
      }
      return recipe;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update recipe');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete a recipe
   */
  const removeRecipe = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await deleteRecipe(id);
      if (success) {
        setRecipes((prev) => prev.filter((r) => r.id !== id));
      }
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete recipe');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get all unique tags
   */
  const getTags = useCallback(() => {
    return getAllTags();
  }, []);

  /**
   * Get all unique ingredients
   */
  const getIngredients = useCallback(() => {
    return getAllIngredients();
  }, []);

  return {
    recipes,
    isLoading,
    error,
    fetchRecipes,
    getRecipe,
    addRecipe,
    editRecipe,
    removeRecipe,
    getTags,
    getIngredients,
  };
}
