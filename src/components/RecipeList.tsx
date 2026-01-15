import { makeStyles, tokens, Spinner, Text, Title2, ToggleButton, Tooltip } from '@fluentui/react-components';
import { Food48Regular, Grid24Regular, List24Regular } from '@fluentui/react-icons';
import { RecipeCard } from './RecipeCard';
import type { Recipe } from '../types';

type ViewMode = 'grid' | 'list';

const useStyles = makeStyles({
  container: {
    // No extra padding - parent mainLayout provides consistent spacing
  },
  header: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: tokens.spacingVerticalM,
    gap: tokens.spacingHorizontalS,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXXL,
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: tokens.spacingVerticalL,
  },
  emptyTitle: {
    marginBottom: tokens.spacingVerticalS,
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXXL,
  },
});

interface RecipeListProps {
  recipes: Recipe[];
  isLoading: boolean;
  onRecipeClick: (recipe: Recipe) => void;
  searchQuery?: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function RecipeList({ recipes, isLoading, onRecipeClick, searchQuery, viewMode, onViewModeChange }: RecipeListProps) {
  const styles = useStyles();

  if (isLoading) {
    return (
      <div className={styles.loadingState} role="status" aria-label="Loading recipes">
        <Spinner size="large" label="Loading recipes..." />
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className={styles.emptyState} role="status">
        <Food48Regular className={styles.emptyIcon} aria-hidden="true" />
        <Title2 className={styles.emptyTitle}>
          {searchQuery ? 'No recipes found' : 'No recipes yet'}
        </Title2>
        <Text>
          {searchQuery
            ? `No recipes match "${searchQuery}". Try a different search.`
            : 'Click "Add Recipe" to create your first recipe!'}
        </Text>
      </div>
    );
  }

  return (
    <main className={styles.container} role="main" aria-label="Recipe list">
      <div className={styles.header}>
        <Tooltip content="Grid view" relationship="label">
          <ToggleButton
            icon={<Grid24Regular />}
            checked={viewMode === 'grid'}
            onClick={() => onViewModeChange('grid')}
            aria-label="Grid view"
            appearance={viewMode === 'grid' ? 'primary' : 'subtle'}
          />
        </Tooltip>
        <Tooltip content="List view" relationship="label">
          <ToggleButton
            icon={<List24Regular />}
            checked={viewMode === 'list'}
            onClick={() => onViewModeChange('list')}
            aria-label="List view"
            appearance={viewMode === 'list' ? 'primary' : 'subtle'}
          />
        </Tooltip>
      </div>
      <div className={viewMode === 'grid' ? styles.grid : styles.list} role="list">
        {recipes.map((recipe) => (
          <div key={recipe.id} role="listitem">
            <RecipeCard recipe={recipe} onClick={onRecipeClick} viewMode={viewMode} />
          </div>
        ))}
      </div>
    </main>
  );
}
