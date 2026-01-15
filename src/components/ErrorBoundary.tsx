import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import {
  makeStyles,
  tokens,
  Button,
  Title1,
  Text,
  Card,
  CardHeader,
} from '@fluentui/react-components';
import { ErrorCircle48Regular, ArrowClockwise24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: tokens.spacingVerticalXXL,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  card: {
    maxWidth: '500px',
    textAlign: 'center',
  },
  icon: {
    fontSize: '64px',
    color: tokens.colorPaletteRedForeground1,
    marginBottom: tokens.spacingVerticalL,
  },
  title: {
    marginBottom: tokens.spacingVerticalM,
  },
  message: {
    color: tokens.colorNeutralForeground2,
    marginBottom: tokens.spacingVerticalL,
  },
  details: {
    textAlign: 'left',
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    marginTop: tokens.spacingVerticalM,
    maxHeight: '200px',
    overflow: 'auto',
    fontFamily: 'monospace',
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    justifyContent: 'center',
    marginTop: tokens.spacingVerticalL,
  },
});

// Using a functional component for the styled error display
function ErrorDisplay({ 
  error, 
  onReset 
}: { 
  error: Error; 
  onReset: () => void;
}) {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader
          image={<ErrorCircle48Regular className={styles.icon} />}
          header={
            <Title1 className={styles.title}>Something went wrong</Title1>
          }
          description={
            <Text className={styles.message}>
              An unexpected error occurred. You can try refreshing the page or resetting the application.
            </Text>
          }
        />
        
        <div className={styles.details}>
          {error.message}
          {error.stack && (
            <>
              {'\n\n'}
              {error.stack}
            </>
          )}
        </div>

        <div className={styles.actions}>
          <Button
            appearance="primary"
            icon={<ArrowClockwise24Regular />}
            onClick={onReset}
          >
            Try Again
          </Button>
          <Button
            appearance="secondary"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      </Card>
    </div>
  );
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorDisplay 
          error={this.state.error} 
          onReset={this.handleReset} 
        />
      );
    }

    return this.props.children;
  }
}
