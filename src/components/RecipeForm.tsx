import { useState, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Button,
  Input,
  Textarea,
  Label,
  Field,
  SpinButton,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  TagPicker,
  TagPickerControl,
  TagPickerInput,
  TagPickerList,
  TagPickerOption,
  Tag,
  TagPickerGroup,
} from '@fluentui/react-components';
import { Add24Regular, Delete24Regular, ArrowUp24Regular, ArrowDown24Regular } from '@fluentui/react-icons';
import type { Recipe, RecipeFormData, Ingredient, ValidationError } from '../types';

const useStyles = makeStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    maxHeight: '70vh',
    overflowY: 'auto',
    padding: tokens.spacingHorizontalS,
  },
  row: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
  },
  field: {
    flex: 1,
    minWidth: '150px',
  },
  fullWidth: {
    width: '100%',
  },
  listSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItem: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    alignItems: 'flex-start',
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  ingredientInputs: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flex: 1,
    flexWrap: 'wrap',
  },
  ingredientName: {
    flex: 2,
    minWidth: '120px',
  },
  ingredientQuantity: {
    width: '80px',
  },
  ingredientUnit: {
    width: '100px',
  },
  stepInput: {
    flex: 1,
  },
  stepActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  removeButton: {
    minWidth: 'auto',
  },
  photoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  photoPreview: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
  },
  photoThumbnail: {
    width: '100px',
    height: '75px',
    objectFit: 'cover',
    borderRadius: tokens.borderRadiusMedium,
    position: 'relative',
  },
  photoWrapper: {
    position: 'relative',
  },
  photoRemove: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    minWidth: '24px',
    width: '24px',
    height: '24px',
    padding: 0,
  },
});

interface RecipeFormProps {
  recipe?: Recipe;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RecipeFormData) => void;
  existingTags?: string[];
}

const COMMON_TAGS = ['breakfast', 'lunch', 'dinner', 'dessert', 'vegetarian', 'vegan', 'quick', 'healthy'];

export function RecipeForm({ recipe, open, onOpenChange, onSubmit, existingTags = [] }: RecipeFormProps) {
  const styles = useStyles();

  const [title, setTitle] = useState(recipe?.title || '');
  const [description, setDescription] = useState(recipe?.description || '');
  const [servings, setServings] = useState(recipe?.servings || 4);
  const [prepTime, setPrepTime] = useState<number | undefined>(recipe?.prepTime);
  const [cookTime, setCookTime] = useState<number | undefined>(recipe?.cookTime);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients || [{ name: '', quantity: undefined, unit: '' }]
  );
  const [steps, setSteps] = useState<string[]>(recipe?.steps || ['']);
  const [notes, setNotes] = useState(recipe?.notes || '');
  const [tags, setTags] = useState<string[]>(recipe?.tags || []);
  const [photos, setPhotos] = useState<string[]>(recipe?.photos || []);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const allTagOptions = Array.from(new Set([...COMMON_TAGS, ...existingTags])).sort();

  const validate = useCallback((): boolean => {
    const newErrors: ValidationError[] = [];

    if (!title.trim()) {
      newErrors.push({ field: 'title', message: 'Title is required' });
    } else if (title.length > 200) {
      newErrors.push({ field: 'title', message: 'Title must be 200 characters or less' });
    }

    if (description && description.length > 500) {
      newErrors.push({ field: 'description', message: 'Description must be 500 characters or less' });
    }

    const validIngredients = ingredients.filter((i) => i.name.trim());
    if (validIngredients.length === 0) {
      newErrors.push({ field: 'ingredients', message: 'At least one ingredient is required' });
    }

    const validSteps = steps.filter((s) => s.trim());
    if (validSteps.length === 0) {
      newErrors.push({ field: 'steps', message: 'At least one step is required' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  }, [title, description, ingredients, steps]);

  const handleSubmit = () => {
    if (!validate()) return;

    const data: RecipeFormData = {
      title: title.trim(),
      description: description.trim() || undefined,
      servings,
      prepTime,
      cookTime,
      ingredients: ingredients.filter((i) => i.name.trim()),
      steps: steps.filter((s) => s.trim()),
      notes: notes.trim() || undefined,
      tags,
      photos,
    };

    onSubmit(data);
    onOpenChange(false);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: undefined, unit: '' }]);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number | undefined) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const updated = [...steps];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setSteps(updated);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (photos.length >= 5) return;
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be 2MB or less');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Only JPEG, PNG, and WebP images are supported');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPhotos((prev) => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const getError = (field: string) => errors.find((e) => e.field === field)?.message;

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface style={{ maxWidth: '700px', width: '90vw' }}>
        <DialogBody>
          <DialogTitle>{recipe ? 'Edit Recipe' : 'Add New Recipe'}</DialogTitle>
          <DialogContent>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <Field
                label="Title"
                required
                validationMessage={getError('title')}
                validationState={getError('title') ? 'error' : undefined}
              >
                <Input
                  value={title}
                  onChange={(_, data) => setTitle(data.value)}
                  placeholder="Recipe title"
                  aria-describedby="title-error"
                  maxLength={200}
                />
              </Field>

              <Field label="Description">
                <Textarea
                  value={description}
                  onChange={(_, data) => setDescription(data.value)}
                  placeholder="Brief description of the dish"
                  maxLength={500}
                  rows={2}
                />
              </Field>

              <div className={styles.row}>
                <Field label="Servings" className={styles.field}>
                  <SpinButton
                    value={servings}
                    onChange={(_, data) => setServings(data.value || 4)}
                    min={1}
                    max={100}
                  />
                </Field>
                <Field label="Prep Time (min)" className={styles.field}>
                  <SpinButton
                    value={prepTime ?? 0}
                    onChange={(_, data) => setPrepTime(data.value || undefined)}
                    min={0}
                    max={1440}
                  />
                </Field>
                <Field label="Cook Time (min)" className={styles.field}>
                  <SpinButton
                    value={cookTime ?? 0}
                    onChange={(_, data) => setCookTime(data.value || undefined)}
                    min={0}
                    max={1440}
                  />
                </Field>
              </div>

              <div className={styles.photoSection}>
                <Label>Photos (max 5)</Label>
                {photos.length > 0 && (
                  <div className={styles.photoPreview}>
                    {photos.map((photo, index) => (
                      <div key={index} className={styles.photoWrapper}>
                        <img src={photo} alt={`Recipe photo ${index + 1}`} className={styles.photoThumbnail} />
                        <Button
                          className={styles.photoRemove}
                          appearance="primary"
                          size="small"
                          icon={<Delete24Regular />}
                          onClick={() => removePhoto(index)}
                          aria-label={`Remove photo ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {photos.length < 5 && (
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    multiple
                    aria-label="Upload photos"
                  />
                )}
              </div>

              <div className={styles.listSection}>
                <div className={styles.listHeader}>
                  <Label required>Ingredients</Label>
                  <Button appearance="subtle" icon={<Add24Regular />} onClick={addIngredient}>
                    Add Ingredient
                  </Button>
                </div>
                {getError('ingredients') && (
                  <span style={{ color: tokens.colorPaletteRedForeground1 }}>{getError('ingredients')}</span>
                )}
                {ingredients.map((ingredient, index) => (
                  <div key={index} className={styles.listItem}>
                    <div className={styles.ingredientInputs}>
                      <Input
                        className={styles.ingredientName}
                        value={ingredient.name}
                        onChange={(_, data) => updateIngredient(index, 'name', data.value)}
                        placeholder="Ingredient name"
                        aria-label={`Ingredient ${index + 1} name`}
                      />
                      <Input
                        className={styles.ingredientQuantity}
                        type="number"
                        value={ingredient.quantity?.toString() || ''}
                        onChange={(_, data) =>
                          updateIngredient(index, 'quantity', data.value ? parseFloat(data.value) : undefined)
                        }
                        placeholder="Qty"
                        aria-label={`Ingredient ${index + 1} quantity`}
                      />
                      <Input
                        className={styles.ingredientUnit}
                        value={ingredient.unit || ''}
                        onChange={(_, data) => updateIngredient(index, 'unit', data.value)}
                        placeholder="Unit"
                        aria-label={`Ingredient ${index + 1} unit`}
                      />
                    </div>
                    <Button
                      className={styles.removeButton}
                      appearance="subtle"
                      icon={<Delete24Regular />}
                      onClick={() => removeIngredient(index)}
                      aria-label={`Remove ingredient ${index + 1}`}
                      disabled={ingredients.length === 1}
                    />
                  </div>
                ))}
              </div>

              <div className={styles.listSection}>
                <div className={styles.listHeader}>
                  <Label required>Steps</Label>
                  <Button appearance="subtle" icon={<Add24Regular />} onClick={addStep}>
                    Add Step
                  </Button>
                </div>
                {getError('steps') && (
                  <span style={{ color: tokens.colorPaletteRedForeground1 }}>{getError('steps')}</span>
                )}
                {steps.map((step, index) => (
                  <div key={index} className={styles.listItem}>
                    <span style={{ fontWeight: 'bold', minWidth: '24px' }}>{index + 1}.</span>
                    <Textarea
                      className={styles.stepInput}
                      value={step}
                      onChange={(_, data) => updateStep(index, data.value)}
                      placeholder={`Step ${index + 1}`}
                      aria-label={`Step ${index + 1}`}
                      rows={2}
                    />
                    <div className={styles.stepActions}>
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<ArrowUp24Regular />}
                        onClick={() => moveStep(index, 'up')}
                        disabled={index === 0}
                        aria-label={`Move step ${index + 1} up`}
                      />
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<ArrowDown24Regular />}
                        onClick={() => moveStep(index, 'down')}
                        disabled={index === steps.length - 1}
                        aria-label={`Move step ${index + 1} down`}
                      />
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<Delete24Regular />}
                        onClick={() => removeStep(index)}
                        disabled={steps.length === 1}
                        aria-label={`Remove step ${index + 1}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Field label="Tags">
                <TagPicker
                  onOptionSelect={(_, data) => {
                    if (data.selectedOptions) {
                      setTags(data.selectedOptions);
                    }
                  }}
                  selectedOptions={tags}
                >
                  <TagPickerControl aria-label="Select tags">
                    <TagPickerGroup>
                      {tags.map((tag) => (
                        <Tag key={tag} value={tag}>
                          {tag}
                        </Tag>
                      ))}
                    </TagPickerGroup>
                    <TagPickerInput placeholder="Add tags" aria-label="Add tags" />
                  </TagPickerControl>
                  <TagPickerList>
                    {allTagOptions
                      .filter((tag) => !tags.includes(tag))
                      .map((tag) => (
                        <TagPickerOption key={tag} value={tag}>
                          {tag}
                        </TagPickerOption>
                      ))}
                  </TagPickerList>
                </TagPicker>
              </Field>

              <Field label="Notes">
                <Textarea
                  value={notes}
                  onChange={(_, data) => setNotes(data.value)}
                  placeholder="Additional tips, variations, or notes"
                  rows={3}
                />
              </Field>
            </form>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Cancel</Button>
            </DialogTrigger>
            <Button appearance="primary" onClick={handleSubmit}>
              {recipe ? 'Save Changes' : 'Add Recipe'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
