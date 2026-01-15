import { useRef } from 'react';
import {
  makeStyles,
  tokens,
  Button,
  SearchBox,
  Title1,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuDivider,
  Tooltip,
  MenuGroup,
  MenuGroupHeader,
} from '@fluentui/react-components';
import {
  Add24Regular,
  MoreVertical24Regular,
  ArrowDownload24Regular,
  ArrowUpload24Regular,
  Database24Regular,
  DocumentText24Regular,
} from '@fluentui/react-icons';

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
  hiddenInput: {
    display: 'none',
  },
});

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddRecipe: () => void;
  onExportDatabase: () => void;
  onImportDatabase: (file: File) => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  onAddRecipe,
  onExportDatabase,
  onImportDatabase,
  onExportJson,
  onImportJson,
}: HeaderProps) {
  const styles = useStyles();
  const dbFileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  const handleDbImportClick = () => {
    dbFileInputRef.current?.click();
  };

  const handleJsonImportClick = () => {
    jsonFileInputRef.current?.click();
  };

  const handleDbFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportDatabase(file);
      event.target.value = '';
    }
  };

  const handleJsonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportJson(file);
      event.target.value = '';
    }
  };

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

        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Tooltip content="More options" relationship="label">
              <Button
                appearance="subtle"
                icon={<MoreVertical24Regular />}
                aria-label="More options"
              />
            </Tooltip>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuGroup>
                <MenuGroupHeader>JSON (Recipes Only)</MenuGroupHeader>
                <MenuItem
                  icon={<ArrowDownload24Regular />}
                  onClick={onExportJson}
                >
                  <DocumentText24Regular style={{ marginRight: '8px' }} />
                  Export as JSON
                </MenuItem>
                <MenuItem
                  icon={<ArrowUpload24Regular />}
                  onClick={handleJsonImportClick}
                >
                  <DocumentText24Regular style={{ marginRight: '8px' }} />
                  Import from JSON
                </MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuGroup>
                <MenuGroupHeader>SQLite (Full Backup)</MenuGroupHeader>
                <MenuItem
                  icon={<ArrowDownload24Regular />}
                  onClick={onExportDatabase}
                >
                  <Database24Regular style={{ marginRight: '8px' }} />
                  Export Database
                </MenuItem>
                <MenuItem
                  icon={<ArrowUpload24Regular />}
                  onClick={handleDbImportClick}
                >
                  <Database24Regular style={{ marginRight: '8px' }} />
                  Import Database
                </MenuItem>
              </MenuGroup>
            </MenuList>
          </MenuPopover>
        </Menu>

        <input
          ref={dbFileInputRef}
          type="file"
          accept=".sqlite,.db,.sqlite3"
          className={styles.hiddenInput}
          onChange={handleDbFileChange}
          aria-hidden="true"
        />
        <input
          ref={jsonFileInputRef}
          type="file"
          accept=".json"
          className={styles.hiddenInput}
          onChange={handleJsonFileChange}
          aria-hidden="true"
        />
      </div>
    </header>
  );
}
