import {
  makeStyles,
  tokens,
  Card,
  CardHeader,
  CardPreview,
  Text,
  Badge,
  Body1,
} from '@fluentui/react-components';
import { Clock24Regular, Food24Regular } from '@fluentui/react-icons';
import type { Recipe } from '../types';

const useStyles = makeStyles({
  card: {
    cursor: 'pointer',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    ':hover': {
      boxShadow: tokens.shadow16,
      transform: 'translateY(-2px)',
    },
    ':focus-visible': {
      outline: `2px solid ${tokens.colorBrandStroke1}`,
      outlineOffset: '2px',
    },
  },
  preview: {
    height: '160px',
    backgroundColor: tokens.colorNeutralBackground3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  placeholderIcon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground4,
  },
  header: {
    padding: tokens.spacingVerticalS,
  },
  title: {
    fontWeight: tokens.fontWeightSemibold,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  description: {
    color: tokens.colorNeutralForeground2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    marginTop: tokens.spacingVerticalXS,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
    padding: `0 ${tokens.spacingHorizontalM} ${tokens.spacingVerticalS}`,
  },
});

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const styles = useStyles();

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(recipe);
    }
  };

  return (
    <Card
      className={styles.card}
      onClick={() => onClick(recipe)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`Recipe: ${recipe.title}`}
    >
      <CardPreview className={styles.preview}>
        {recipe.photos.length > 0 ? (
          <img
            src={recipe.photos[0]}
            alt={`Photo of ${recipe.title}`}
            className={styles.previewImage}
          />
        ) : (
          <Food24Regular className={styles.placeholderIcon} aria-hidden="true" />
        )}
      </CardPreview>

      <CardHeader
        className={styles.header}
        header={
          <Text className={styles.title} as="h3">
            {recipe.title}
          </Text>
        }
        description={
          recipe.description && (
            <Body1 className={styles.description}>{recipe.description}</Body1>
          )
        }
      />

      <div className={styles.meta}>
        {totalTime > 0 && (
          <span className={styles.metaItem}>
            <Clock24Regular aria-hidden="true" />
            <span>{totalTime} min</span>
          </span>
        )}
        <span className={styles.metaItem}>
          <Food24Regular aria-hidden="true" />
          <span>{recipe.servings} servings</span>
        </span>
      </div>

      {recipe.tags.length > 0 && (
        <div className={styles.tags} aria-label="Tags">
          {recipe.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} appearance="outline" size="small">
              {tag}
            </Badge>
          ))}
          {recipe.tags.length > 3 && (
            <Badge appearance="outline" size="small">
              +{recipe.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
}
