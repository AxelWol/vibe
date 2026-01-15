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
  Button,
  Toast,
  ToastTitle,
  ToastBody,
  Toaster,
  useToastController,
  useId,
} from '@fluentui/react-components';
import { Filter24Regular, Dismiss24Regular } from '@fluentui/react-icons';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { Header, RecipeList, RecipeDetail, RecipeForm, FilterPanel, ErrorBoundary } from './components';
import { useRecipes, useDebouncedValue } from './hooks';
import { downloadDatabaseFile, importDatabaseFile, downloadRecipesAsJson, importRecipesFromJson } from './db/database';
import type { Recipe, RecipeFormData, RecipeSearchParams } from './types';

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
  mainLayout: {
    display: 'flex',
    gap: tokens.spacingHorizontalL,
    padding: tokens.spacingVerticalL,
    '@media (max-width: 768px)': {
      flexDirection: 'column',
    },
  },
  sidebar: {
    width: '280px',
    flexShrink: 0,
    // Add top margin to align with recipe cards (matching the view toggle header height)
    marginTop: `calc(32px + ${tokens.spacingVerticalM})`,
    '@media (max-width: 768px)': {
      width: '100%',
      marginTop: 0,
    },
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  filterToggle: {
    display: 'none',
    marginBottom: tokens.spacingVerticalM,
    '@media (max-width: 768px)': {
      display: 'flex',
    },
  },
  filterBadge: {
    marginLeft: tokens.spacingHorizontalS,
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    borderRadius: '50%',
    minWidth: '20px',
    height: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: tokens.fontSizeBase200,
  },
  desktopSidebar: {
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  mobileSidebar: {
    display: 'none',
    '@media (max-width: 768px)': {
      display: 'block',
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
    getIngredients,
  } = useRecipes();

  const [view, setView] = useState<View>('list');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<RecipeSearchParams['sortBy']>('updatedAt');
  const [sortOrder, setSortOrder] = useState<RecipeSearchParams['sortOrder']>('desc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  // Calculate active filter count for badge
  const activeFilterCount = selectedTags.length + selectedIngredients.length + (minRating > 0 ? 1 : 0);

  // Fetch recipes when database is ready or filters change
  useEffect(() => {
    if (isReady) {
      const params: RecipeSearchParams = {
        query: debouncedSearch || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        ingredients: selectedIngredients.length > 0 ? selectedIngredients : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        sortBy,
        sortOrder,
      };
      fetchRecipes(params);
    }
  }, [isReady, debouncedSearch, selectedTags, selectedIngredients, minRating, sortBy, sortOrder, fetchRecipes]);

  // Filter handlers
  const handleTagsChange = useCallback((tags: string[]) => {
    setSelectedTags(tags);
  }, []);

  const handleIngredientsChange = useCallback((ingredients: string[]) => {
    setSelectedIngredients(ingredients);
  }, []);

  const handleMinRatingChange = useCallback((rating: number) => {
    setMinRating(rating);
  }, []);

  const handleSortChange = useCallback((newSortBy: RecipeSearchParams['sortBy'], newSortOrder: RecipeSearchParams['sortOrder']) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedTags([]);
    setSelectedIngredients([]);
    setMinRating(0);
    setSortBy('updatedAt');
    setSortOrder('desc');
  }, []);

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

  // Toast controller for notifications
  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);

  const handleExportDatabase = useCallback(() => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      downloadDatabaseFile(`recipes-backup-${timestamp}.sqlite`);
      dispatchToast(
        <Toast>
          <ToastTitle>Export Successful</ToastTitle>
          <ToastBody>Your recipes database has been downloaded.</ToastBody>
        </Toast>,
        { intent: 'success' }
      );
    } catch (err) {
      dispatchToast(
        <Toast>
          <ToastTitle>Export Failed</ToastTitle>
          <ToastBody>{err instanceof Error ? err.message : 'Unknown error'}</ToastBody>
        </Toast>,
        { intent: 'error' }
      );
    }
  }, [dispatchToast]);

  const handleImportDatabase = useCallback(
    async (file: File) => {
      try {
        const buffer = await file.arrayBuffer();
        const data = new Uint8Array(buffer);
        await importDatabaseFile(data);
        // Refresh the recipes list
        await fetchRecipes();
        dispatchToast(
          <Toast>
            <ToastTitle>Import Successful</ToastTitle>
            <ToastBody>Your recipes database has been restored from the backup.</ToastBody>
          </Toast>,
          { intent: 'success' }
        );
      } catch (err) {
        dispatchToast(
          <Toast>
            <ToastTitle>Import Failed</ToastTitle>
            <ToastBody>{err instanceof Error ? err.message : 'Invalid database file'}</ToastBody>
          </Toast>,
          { intent: 'error' }
        );
      }
    },
    [dispatchToast, fetchRecipes]
  );

  const handleExportJson = useCallback(() => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      downloadRecipesAsJson(`recipes-export-${timestamp}.json`);
      dispatchToast(
        <Toast>
          <ToastTitle>Export Successful</ToastTitle>
          <ToastBody>Your recipes have been exported as JSON.</ToastBody>
        </Toast>,
        { intent: 'success' }
      );
    } catch (err) {
      dispatchToast(
        <Toast>
          <ToastTitle>Export Failed</ToastTitle>
          <ToastBody>{err instanceof Error ? err.message : 'Unknown error'}</ToastBody>
        </Toast>,
        { intent: 'error' }
      );
    }
  }, [dispatchToast]);

  const handleImportJson = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const result = await importRecipesFromJson(text, 'skip');
        await fetchRecipes();
        
        let message = `Imported ${result.imported} recipe(s).`;
        if (result.skipped > 0) {
          message += ` Skipped ${result.skipped} duplicate(s).`;
        }
        if (result.errors.length > 0) {
          message += ` ${result.errors.length} error(s) occurred.`;
        }

        dispatchToast(
          <Toast>
            <ToastTitle>Import Complete</ToastTitle>
            <ToastBody>{message}</ToastBody>
          </Toast>,
          { intent: result.errors.length > 0 ? 'warning' : 'success' }
        );
      } catch (err) {
        dispatchToast(
          <Toast>
            <ToastTitle>Import Failed</ToastTitle>
            <ToastBody>{err instanceof Error ? err.message : 'Invalid JSON file'}</ToastBody>
          </Toast>,
          { intent: 'error' }
        );
      }
    },
    [dispatchToast, fetchRecipes]
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
      <Toaster toasterId={toasterId} />
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>

      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddRecipe={handleAddRecipe}
        onExportDatabase={handleExportDatabase}
        onImportDatabase={handleImportDatabase}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
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
          <>
            {/* Mobile filter toggle */}
            <div className={styles.filterToggle}>
              <Button
                icon={showMobileFilters ? <Dismiss24Regular /> : <Filter24Regular />}
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                {showMobileFilters ? 'Hide Filters' : 'Filters'}
                {activeFilterCount > 0 && (
                  <span className={styles.filterBadge}>{activeFilterCount}</span>
                )}
              </Button>
            </div>

            {/* Mobile filters (shown when toggled) */}
            {showMobileFilters && (
              <div className={styles.mobileSidebar}>
                <FilterPanel
                  availableTags={getTags()}
                  availableIngredients={getIngredients()}
                  selectedTags={selectedTags}
                  selectedIngredients={selectedIngredients}
                  minRating={minRating}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onTagsChange={handleTagsChange}
                  onIngredientsChange={handleIngredientsChange}
                  onMinRatingChange={handleMinRatingChange}
                  onSortChange={handleSortChange}
                  onClearFilters={handleClearFilters}
                />
              </div>
            )}

            <div className={styles.mainLayout}>
              {/* Desktop sidebar */}
              <aside className={`${styles.sidebar} ${styles.desktopSidebar}`}>
                <FilterPanel
                  availableTags={getTags()}
                  availableIngredients={getIngredients()}
                  selectedTags={selectedTags}
                  selectedIngredients={selectedIngredients}
                  minRating={minRating}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onTagsChange={handleTagsChange}
                  onIngredientsChange={handleIngredientsChange}
                  onMinRatingChange={handleMinRatingChange}
                  onSortChange={handleSortChange}
                  onClearFilters={handleClearFilters}
                />
              </aside>

              {/* Recipe list content */}
              <div className={styles.content}>
                <RecipeList
                  recipes={recipes}
                  isLoading={isLoading}
                  onRecipeClick={handleRecipeClick}
                  searchQuery={searchQuery}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>
            </div>
          </>
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
    <ErrorBoundary>
      <FluentProvider theme={isDark ? webDarkTheme : webLightTheme}>
        <DatabaseProvider>
          <AppContent />
        </DatabaseProvider>
      </FluentProvider>
    </ErrorBoundary>
  );
}

export default App;
