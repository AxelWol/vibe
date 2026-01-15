import {
  makeStyles,
  tokens,
  Button,
  SearchBox,
  Title1,
} from '@fluentui/react-components';
import { Add24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXXL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  title: {
    margin: 0,
    whiteSpace: 'nowrap',
  },
  searchSection: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    flexGrow: 1,
    justifyContent: 'center',
    maxWidth: '500px',
    minWidth: '200px',
  },
  searchBox: {
    width: '100%',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
});

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddRecipe: () => void;
}

export function Header({ searchQuery, onSearchChange, onAddRecipe }: HeaderProps) {
  const styles = useStyles();

  return (
    <header className={styles.header} role="banner">
      <div className={styles.titleSection}>
        <Title1 as="h1" className={styles.title}>
          🍳 My Recipies
        </Title1>
      </div>

      <div className={styles.searchSection}>
        <SearchBox
          className={styles.searchBox}
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(_, data) => onSearchChange(data.value)}
          aria-label="Search recipes"
        />
      </div>

      <div className={styles.actions}>
        <Button
          appearance="primary"
          icon={<Add24Regular />}
          onClick={onAddRecipe}
          aria-label="Add new recipe"
        >
          Add Recipe
        </Button>
      </div>
    </header>
  );
}
