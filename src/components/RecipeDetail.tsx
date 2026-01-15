import {
  makeStyles,
  tokens,
  Button,
  Title2,
  Title3,
  Text,
  Badge,
  Divider,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
} from '@fluentui/react-components';
import {
  Edit24Regular,
  Delete24Regular,
  Clock24Regular,
  Food24Regular,
  ArrowLeft24Regular,
  Print24Regular,
} from '@fluentui/react-icons';
import { useState } from 'react';
import type { Recipe } from '../types';

const useStyles = makeStyles({
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: tokens.spacingVerticalXL,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.spacingVerticalL,
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
  },
  backButton: {
    marginBottom: tokens.spacingVerticalM,
  },
  title: {
    flex: 1,
    minWidth: '200px',
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexShrink: 0,
  },
  photoGallery: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    overflowX: 'auto',
    padding: tokens.spacingVerticalM,
    marginBottom: tokens.spacingVerticalL,
  },
  photo: {
    width: '200px',
    height: '150px',
    objectFit: 'cover',
    borderRadius: tokens.borderRadiusMedium,
    flexShrink: 0,
  },
  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalL,
    color: tokens.colorNeutralForeground2,
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
    marginBottom: tokens.spacingVerticalL,
  },
  section: {
    marginBottom: tokens.spacingVerticalXL,
  },
  sectionTitle: {
    marginBottom: tokens.spacingVerticalM,
  },
  description: {
    color: tokens.colorNeutralForeground2,
    lineHeight: tokens.lineHeightBase400,
  },
  ingredientList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  ingredient: {
    padding: `${tokens.spacingVerticalS} 0`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    justifyContent: 'space-between',
  },
  stepList: {
    padding: 0,
    margin: 0,
    counterReset: 'step',
    listStyle: 'none',
  },
  step: {
    padding: tokens.spacingVerticalM,
    paddingLeft: tokens.spacingHorizontalXXL,
    position: 'relative',
    borderLeft: `2px solid ${tokens.colorBrandStroke1}`,
    marginLeft: tokens.spacingHorizontalM,
    '::before': {
      content: 'counter(step)',
      counterIncrement: 'step',
      position: 'absolute',
      left: '-16px',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      backgroundColor: tokens.colorBrandBackground,
      color: tokens.colorNeutralForegroundOnBrand,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: tokens.fontWeightSemibold,
      fontSize: tokens.fontSizeBase200,
    },
  },
  notes: {
    backgroundColor: tokens.colorNeutralBackground3,
    padding: tokens.spacingVerticalM,
    borderRadius: tokens.borderRadiusMedium,
    borderLeft: `4px solid ${tokens.colorBrandStroke1}`,
  },
});

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
}

export function RecipeDetail({ recipe, onBack, onEdit, onDelete }: RecipeDetailProps) {
  const styles = useStyles();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = () => {
    onDelete(recipe);
    setDeleteDialogOpen(false);
  };

  return (
    <article className={styles.container} aria-label={`Recipe: ${recipe.title}`}>
      <Button
        className={styles.backButton}
        appearance="subtle"
        icon={<ArrowLeft24Regular />}
        onClick={onBack}
        aria-label="Back to recipe list"
      >
        Back
      </Button>

      <div className={styles.header}>
        <Title2 as="h1" className={styles.title}>
          {recipe.title}
        </Title2>
        <div className={styles.actions}>
          <Button
            appearance="subtle"
            icon={<Print24Regular />}
            onClick={handlePrint}
            aria-label="Print recipe"
          >
            Print
          </Button>
          <Button
            appearance="subtle"
            icon={<Edit24Regular />}
            onClick={() => onEdit(recipe)}
            aria-label="Edit recipe"
          >
            Edit
          </Button>
          <Dialog open={deleteDialogOpen} onOpenChange={(_, data) => setDeleteDialogOpen(data.open)}>
            <DialogTrigger disableButtonEnhancement>
              <Button
                appearance="subtle"
                icon={<Delete24Regular />}
                aria-label="Delete recipe"
              >
                Delete
              </Button>
            </DialogTrigger>
            <DialogSurface>
              <DialogBody>
                <DialogTitle>Delete Recipe</DialogTitle>
                <DialogContent>
                  Are you sure you want to delete "{recipe.title}"? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                  <DialogTrigger disableButtonEnhancement>
                    <Button appearance="secondary">Cancel</Button>
                  </DialogTrigger>
                  <Button appearance="primary" onClick={handleDelete}>
                    Delete
                  </Button>
                </DialogActions>
              </DialogBody>
            </DialogSurface>
          </Dialog>
        </div>
      </div>

      {recipe.photos.length > 0 && (
        <div className={styles.photoGallery} role="region" aria-label="Recipe photos">
          {recipe.photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`${recipe.title} photo ${index + 1}`}
              className={styles.photo}
            />
          ))}
        </div>
      )}

      <div className={styles.meta}>
        {recipe.prepTime && (
          <span className={styles.metaItem}>
            <Clock24Regular aria-hidden="true" />
            <span>Prep: {recipe.prepTime} min</span>
          </span>
        )}
        {recipe.cookTime && (
          <span className={styles.metaItem}>
            <Clock24Regular aria-hidden="true" />
            <span>Cook: {recipe.cookTime} min</span>
          </span>
        )}
        {totalTime > 0 && (
          <span className={styles.metaItem}>
            <Clock24Regular aria-hidden="true" />
            <span>Total: {totalTime} min</span>
          </span>
        )}
        <span className={styles.metaItem}>
          <Food24Regular aria-hidden="true" />
          <span>{recipe.servings} servings</span>
        </span>
      </div>

      {recipe.tags.length > 0 && (
        <div className={styles.tags} role="list" aria-label="Tags">
          {recipe.tags.map((tag) => (
            <Badge key={tag} appearance="outline" role="listitem">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {recipe.description && (
        <section className={styles.section} aria-labelledby="description-heading">
          <Title3 id="description-heading" className={styles.sectionTitle}>
            Description
          </Title3>
          <Text className={styles.description}>{recipe.description}</Text>
        </section>
      )}

      <Divider />

      <section className={styles.section} aria-labelledby="ingredients-heading">
        <Title3 id="ingredients-heading" className={styles.sectionTitle}>
          Ingredients
        </Title3>
        <ul className={styles.ingredientList}>
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className={styles.ingredient}>
              <span>{ingredient.name}</span>
              <span>
                {ingredient.quantity && ingredient.quantity}
                {ingredient.unit && ` ${ingredient.unit}`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Divider />

      <section className={styles.section} aria-labelledby="steps-heading">
        <Title3 id="steps-heading" className={styles.sectionTitle}>
          Instructions
        </Title3>
        <ol className={styles.stepList}>
          {recipe.steps.map((step, index) => (
            <li key={index} className={styles.step}>
              {step}
            </li>
          ))}
        </ol>
      </section>

      {recipe.notes && (
        <>
          <Divider />
          <section className={styles.section} aria-labelledby="notes-heading">
            <Title3 id="notes-heading" className={styles.sectionTitle}>
              Notes
            </Title3>
            <div className={styles.notes}>
              <Text>{recipe.notes}</Text>
            </div>
          </section>
        </>
      )}
    </article>
  );
}
