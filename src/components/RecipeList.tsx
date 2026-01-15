import { makeStyles, tokens, Spinner, Text, Title2 } from '@fluentui/react-components';
import { Food48Regular } from '@fluentui/react-icons';
import { RecipeCard } from './RecipeCard';
import type { Recipe } from '../types';

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalL,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: tokens.spacingHorizontalL,
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
}

export function RecipeList({ recipes, isLoading, onRecipeClick, searchQuery }: RecipeListProps) {
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
      <div className={styles.grid} role="list">
        {recipes.map((recipe) => (
          <div key={recipe.id} role="listitem">
            <RecipeCard recipe={recipe} onClick={onRecipeClick} />
          </div>
        ))}
      </div>
    </main>
  );
}
