import { useState, useEffect, useCallback } from 'react';
import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
  makeStyles,
  tokens,
  Spinner,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
} from '@fluentui/react-components';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { Header, RecipeList, RecipeDetail, RecipeForm } from './components';
import { useRecipes, useDebouncedValue } from './hooks';
import type { Recipe, RecipeFormData } from './types';

const useStyles = makeStyles({
  app: {
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  errorContainer: {
    padding: tokens.spacingVerticalXL,
  },
  skipLink: {
    position: 'absolute',
    left: '-9999px',
    top: 'auto',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    ':focus': {
      position: 'fixed',
      top: tokens.spacingVerticalM,
      left: tokens.spacingHorizontalM,
      width: 'auto',
      height: 'auto',
      padding: tokens.spacingVerticalS,
      backgroundColor: tokens.colorBrandBackground,
      color: tokens.colorNeutralForegroundOnBrand,
      zIndex: 9999,
      borderRadius: tokens.borderRadiusMedium,
    },
  },
});

type View = 'list' | 'detail';

function AppContent() {
  const styles = useStyles();
  const { isLoading: dbLoading, isReady, error: dbError } = useDatabase();
  const {
    recipes,
    isLoading,
    error,
    fetchRecipes,
    addRecipe,
    editRecipe,
    removeRecipe,
    getTags,
  } = useRecipes();

  const [view, setView] = useState<View>('list');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  // Fetch recipes when database is ready or search changes
  useEffect(() => {
    if (isReady) {
      fetchRecipes(debouncedSearch ? { query: debouncedSearch } : undefined);
    }
  }, [isReady, debouncedSearch, fetchRecipes]);

  const handleRecipeClick = useCallback((recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setView('detail');
  }, []);

  const handleBack = useCallback(() => {
    setView('list');
    setSelectedRecipe(null);
  }, []);

  const handleAddRecipe = useCallback(() => {
    setEditingRecipe(undefined);
    setFormOpen(true);
  }, []);

  const handleEditRecipe = useCallback((recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormOpen(true);
  }, []);

  const handleDeleteRecipe = useCallback(
    async (recipe: Recipe) => {
      await removeRecipe(recipe.id);
      setView('list');
      setSelectedRecipe(null);
    },
    [removeRecipe]
  );

  const handleFormSubmit = useCallback(
    async (data: RecipeFormData) => {
      if (editingRecipe) {
        const updated = await editRecipe(editingRecipe.id, data);
        if (updated && selectedRecipe?.id === editingRecipe.id) {
          setSelectedRecipe(updated);
        }
      } else {
        await addRecipe(data);
      }
      setEditingRecipe(undefined);
    },
    [editingRecipe, editRecipe, addRecipe, selectedRecipe]
  );

  if (dbLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" label="Initializing database..." />
      </div>
    );
  }

  if (dbError) {
    return (
      <div className={styles.errorContainer}>
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>Database Error</MessageBarTitle>
            {dbError.message}
          </MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>

      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddRecipe={handleAddRecipe}
      />

      {error && (
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>Error</MessageBarTitle>
            {error.message}
          </MessageBarBody>
        </MessageBar>
      )}

      <div id="main-content">
        {view === 'list' && (
          <RecipeList
            recipes={recipes}
            isLoading={isLoading}
            onRecipeClick={handleRecipeClick}
            searchQuery={searchQuery}
          />
        )}

        {view === 'detail' && selectedRecipe && (
          <RecipeDetail
            recipe={selectedRecipe}
            onBack={handleBack}
            onEdit={handleEditRecipe}
            onDelete={handleDeleteRecipe}
          />
        )}
      </div>

      <RecipeForm
        recipe={editingRecipe}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        existingTags={getTags()}
      />
    </div>
  );
}

function App() {
  // Detect system color scheme preference
  const [isDark, setIsDark] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <FluentProvider theme={isDark ? webDarkTheme : webLightTheme}>
      <DatabaseProvider>
        <AppContent />
      </DatabaseProvider>
    </FluentProvider>
  );
}

export default App;
