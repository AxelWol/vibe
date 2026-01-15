import { useState } from 'react';
import {
  makeStyles,
  tokens,
  Button,
  Checkbox,
  Combobox,
  Option,
  Label,
  Divider,
  Badge,
  Dropdown,
} from '@fluentui/react-components';
import {
  Filter24Regular,
  Dismiss24Regular,
  ArrowSort24Regular,
} from '@fluentui/react-icons';
import { StarRating } from './StarRating';
import type { RecipeSearchParams } from '../types';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontWeight: tokens.fontWeightSemibold,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  sectionTitle: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
  },
  tagCheckbox: {
    minWidth: 'auto',
  },
  selectedFilters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
  },
  clearButton: {
    alignSelf: 'flex-start',
  },
  sortRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    alignItems: 'center',
  },
  sortDropdown: {
    minWidth: '150px',
  },
});

interface FilterPanelProps {
  availableTags: string[];
  availableIngredients: string[];
  selectedTags: string[];
  selectedIngredients: string[];
  minRating: number;
  sortBy: RecipeSearchParams['sortBy'];
  sortOrder: RecipeSearchParams['sortOrder'];
  onTagsChange: (tags: string[]) => void;
  onIngredientsChange: (ingredients: string[]) => void;
  onMinRatingChange: (rating: number) => void;
  onSortChange: (sortBy: RecipeSearchParams['sortBy'], sortOrder: RecipeSearchParams['sortOrder']) => void;
  onClearFilters: () => void;
}

export function FilterPanel({
  availableTags,
  availableIngredients,
  selectedTags,
  selectedIngredients,
  minRating,
  sortBy,
  sortOrder,
  onTagsChange,
  onIngredientsChange,
  onMinRatingChange,
  onSortChange,
  onClearFilters,
}: FilterPanelProps) {
  const styles = useStyles();
  const [ingredientSearch, setIngredientSearch] = useState('');

  const hasActiveFilters = selectedTags.length > 0 || selectedIngredients.length > 0 || minRating > 0;

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleIngredientSelect = (ingredient: string) => {
    if (!selectedIngredients.includes(ingredient)) {
      onIngredientsChange([...selectedIngredients, ingredient]);
    }
    setIngredientSearch('');
  };

  const handleIngredientRemove = (ingredient: string) => {
    onIngredientsChange(selectedIngredients.filter((i) => i !== ingredient));
  };

  const filteredIngredients = availableIngredients.filter(
    (ing) =>
      ing.toLowerCase().includes(ingredientSearch.toLowerCase()) &&
      !selectedIngredients.includes(ing)
  );

  const sortOptions = [
    { value: 'updatedAt-desc', label: 'Recently Updated' },
    { value: 'updatedAt-asc', label: 'Oldest Updated' },
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'title-asc', label: 'Name (A-Z)' },
    { value: 'title-desc', label: 'Name (Z-A)' },
    { value: 'rating-desc', label: 'Highest Rated' },
    { value: 'rating-asc', label: 'Lowest Rated' },
  ];

  const currentSortValue = `${sortBy || 'updatedAt'}-${sortOrder || 'desc'}`;

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as [
      RecipeSearchParams['sortBy'],
      RecipeSearchParams['sortOrder']
    ];
    onSortChange(newSortBy, newSortOrder);
  };

  return (
    <div className={styles.container} role="region" aria-label="Filter recipes">
      <div className={styles.header}>
        <span className={styles.title}>
          <Filter24Regular aria-hidden="true" />
          Filters
        </span>
        {hasActiveFilters && (
          <Button
            appearance="subtle"
            size="small"
            icon={<Dismiss24Regular />}
            onClick={onClearFilters}
            aria-label="Clear all filters"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Sort Options */}
      <div className={styles.section}>
        <Label className={styles.sectionTitle} id="sort-label">
          <ArrowSort24Regular aria-hidden="true" style={{ marginRight: '4px' }} />
          Sort By
        </Label>
        <Dropdown
          className={styles.sortDropdown}
          aria-labelledby="sort-label"
          value={sortOptions.find((o) => o.value === currentSortValue)?.label || 'Recently Updated'}
          selectedOptions={[currentSortValue]}
          onOptionSelect={(_, data) => {
            if (data.optionValue) {
              handleSortChange(data.optionValue);
            }
          }}
        >
          {sortOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Dropdown>
      </div>

      <Divider />

      {/* Rating Filter */}
      <div className={styles.section}>
        <Label className={styles.sectionTitle} id="rating-filter-label">
          Minimum Rating
        </Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StarRating
            rating={minRating}
            onChange={onMinRatingChange}
            size="medium"
            showEmpty
          />
          {minRating > 0 && (
            <Button
              appearance="subtle"
              size="small"
              onClick={() => onMinRatingChange(0)}
              aria-label="Clear rating filter"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <Divider />

      {/* Tag Filters */}
      {availableTags.length > 0 && (
        <div className={styles.section}>
          <Label className={styles.sectionTitle}>Tags</Label>
          <div className={styles.tagList} role="group" aria-label="Filter by tags">
            {availableTags.map((tag) => (
              <Checkbox
                key={tag}
                className={styles.tagCheckbox}
                checked={selectedTags.includes(tag)}
                onChange={() => handleTagToggle(tag)}
                label={tag}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ingredient Filters */}
      <div className={styles.section}>
        <Label className={styles.sectionTitle} id="ingredient-filter-label">
          Ingredients
        </Label>
        {selectedIngredients.length > 0 && (
          <div className={styles.selectedFilters} role="list" aria-label="Selected ingredients">
            {selectedIngredients.map((ingredient) => (
              <Badge
                key={ingredient}
                appearance="filled"
                color="brand"
                role="listitem"
                style={{ cursor: 'pointer' }}
                onClick={() => handleIngredientRemove(ingredient)}
                aria-label={`Remove ${ingredient} filter`}
              >
                {ingredient} ✕
              </Badge>
            ))}
          </div>
        )}
        {availableIngredients.length > 0 && (
          <Combobox
            aria-labelledby="ingredient-filter-label"
            placeholder="Search ingredients..."
            value={ingredientSearch}
            onChange={(e) => setIngredientSearch(e.target.value)}
            onOptionSelect={(_, data) => {
              if (data.optionText) {
                handleIngredientSelect(data.optionText);
              }
            }}
            freeform
          >
            {filteredIngredients.slice(0, 10).map((ingredient) => (
              <Option key={ingredient} value={ingredient}>
                {ingredient}
              </Option>
            ))}
            {filteredIngredients.length === 0 && ingredientSearch && (
              <Option value="" disabled>
                No matching ingredients
              </Option>
            )}
          </Combobox>
        )}
      </div>
    </div>
  );
}
