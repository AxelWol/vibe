import { makeStyles, tokens } from '@fluentui/react-components';
import { Star24Filled, Star24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
  },
  star: {
    cursor: 'pointer',
    color: tokens.colorPaletteYellowForeground1,
    transition: 'transform 0.1s ease',
    ':hover': {
      transform: 'scale(1.1)',
    },
  },
  starReadonly: {
    cursor: 'default',
    color: tokens.colorPaletteYellowForeground1,
    ':hover': {
      transform: 'none',
    },
  },
  starEmpty: {
    color: tokens.colorNeutralForeground4,
  },
  small: {
    fontSize: '16px',
  },
  medium: {
    fontSize: '20px',
  },
  large: {
    fontSize: '24px',
  },
});

interface StarRatingProps {
  rating?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'small' | 'medium' | 'large';
  showEmpty?: boolean;
}

export function StarRating({
  rating = 0,
  onChange,
  readonly = false,
  size = 'medium',
  showEmpty = true,
}: StarRatingProps) {
  const styles = useStyles();

  const handleClick = (star: number) => {
    if (!readonly && onChange) {
      // If clicking the same star, clear the rating
      onChange(rating === star ? 0 : star);
    }
  };

  const handleKeyDown = (star: number, e: React.KeyboardEvent) => {
    if (!readonly && onChange && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onChange(rating === star ? 0 : star);
    }
  };

  // Don't render anything if no rating and showEmpty is false
  if (!showEmpty && !rating) {
    return null;
  }

  const sizeClass = styles[size];

  return (
    <div
      className={styles.container}
      role={readonly ? 'img' : 'group'}
      aria-label={rating ? `Rating: ${rating} out of 5 stars` : 'No rating'}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= rating;
        const StarIcon = isFilled ? Star24Filled : Star24Regular;

        return (
          <span
            key={star}
            className={`${readonly ? styles.starReadonly : styles.star} ${!isFilled ? styles.starEmpty : ''} ${sizeClass}`}
            onClick={() => handleClick(star)}
            onKeyDown={(e) => handleKeyDown(star, e)}
            tabIndex={readonly ? -1 : 0}
            role={readonly ? undefined : 'button'}
            aria-label={readonly ? undefined : `${star} star${star > 1 ? 's' : ''}`}
            aria-pressed={readonly ? undefined : isFilled}
          >
            <StarIcon />
          </span>
        );
      })}
    </div>
  );
}
