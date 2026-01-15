import {
  makeStyles,
  tokens,
  Card,
  CardHeader,
  CardPreview,
  Text,
  Badge,
  Body1,
  mergeClasses,
} from '@fluentui/react-components';
import { Clock24Regular, Food24Regular } from '@fluentui/react-icons';
import { StarRating } from './StarRating';
import type { Recipe } from '../types';

type ViewMode = 'grid' | 'list';

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
  cardList: {
    display: 'flex',
    flexDirection: 'row',
    ':hover': {
      transform: 'translateY(-1px)',
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
  previewList: {
    width: '120px',
    height: '100%',
    minHeight: '100px',
    flexShrink: 0,
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
  placeholderIconList: {
    fontSize: '32px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },
  header: {
    padding: tokens.spacingVerticalS,
  },
  headerList: {
    padding: tokens.spacingVerticalS,
    paddingBottom: 0,
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
  descriptionList: {
    WebkitLineClamp: 1,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  metaList: {
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
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
  tagsList: {
    padding: `0 ${tokens.spacingHorizontalM} ${tokens.spacingVerticalS}`,
  },
});

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
  viewMode?: ViewMode;
}

export function RecipeCard({ recipe, onClick, viewMode = 'grid' }: RecipeCardProps) {
  const styles = useStyles();
  const isListView = viewMode === 'list';

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(recipe);
    }
  };

  const previewContent = recipe.photos.length > 0 ? (
    <img
      src={recipe.photos[0]}
      alt={`Photo of ${recipe.title}`}
      className={styles.previewImage}
    />
  ) : (
    <Food24Regular 
      className={mergeClasses(styles.placeholderIcon, isListView && styles.placeholderIconList)} 
      aria-hidden="true" 
    />
  );

  const headerContent = (
    <CardHeader
      className={mergeClasses(styles.header, isListView && styles.headerList)}
      header={
        <Text className={styles.title} as="h3">
          {recipe.title}
        </Text>
      }
      description={
        recipe.description && (
          <Body1 className={mergeClasses(styles.description, isListView && styles.descriptionList)}>
            {recipe.description}
          </Body1>
        )
      }
    />
  );

  const metaContent = (
    <div className={mergeClasses(styles.meta, isListView && styles.metaList)}>
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
  );

  const tagsContent = recipe.tags.length > 0 && (
    <div className={mergeClasses(styles.tags, isListView && styles.tagsList)} aria-label="Tags">
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
  );

  const ratingContent = (
    <div style={{ marginLeft: '6px' }}>
      <StarRating rating={recipe.rating || 0} readonly size="small" showEmpty />
    </div>
  );

  if (isListView) {
    return (
      <Card
        className={mergeClasses(styles.card, styles.cardList)}
        onClick={() => onClick(recipe)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="article"
        aria-label={`Recipe: ${recipe.title}`}
        orientation="horizontal"
      >
        <CardPreview className={mergeClasses(styles.preview, styles.previewList)}>
          {previewContent}
        </CardPreview>
        <div className={styles.content}>
          {headerContent}
          {ratingContent}
          {metaContent}
          {tagsContent}
        </div>
      </Card>
    );
  }

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
        {previewContent}
      </CardPreview>
      {headerContent}
      {ratingContent}
      {metaContent}
      {tagsContent}
    </Card>
  );
}
