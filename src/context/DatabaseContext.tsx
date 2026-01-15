import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { initDatabase } from '../db/database';

interface DatabaseContextType {
  isLoading: boolean;
  isReady: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isLoading: true,
  isReady: false,
  error: null,
});

interface DatabaseProviderProps {
  children: ReactNode;
}

/**
 * Provider component that initializes the database
 */
export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
        setIsReady(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize database'));
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  return (
    <DatabaseContext.Provider value={{ isLoading, isReady, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

/**
 * Hook to access database context
 */
export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
