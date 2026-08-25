import { Component, type ErrorInfo, type ReactNode } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import EmptyState from "@/components/ui/EmptyState";
import Typography from "@/components/ui/Typography";
import { captureSentryException } from "@/lib/sentry";
import { t } from "@/services/i18n";
import { ms, vs } from "@/utils/Scale";

export interface PosErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRecover?: () => void;
}

interface PosErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class PosErrorBoundary extends Component<PosErrorBoundaryProps, PosErrorBoundaryState> {
  constructor(props: PosErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): PosErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Automatically report to Sentry with component stack context
    captureSentryException(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: "PosErrorBoundary",
    });

    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
    this.props.onRecover?.();
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback && error) {
      return fallback(error, this.handleReset);
    }

    return (
      <View style={$.container} testID="pos-error-boundary-fallback">
        <EmptyState
          title={t("pos_error_title")}
          subtitle={t("pos_error_description")}
          actionLabel={t("pos_error_recover_button")}
          onAction={this.handleReset}
        />
        {error?.message ? (
          <View style={$.errorBox}>
            <Typography variant="caption" align="center">
              Diagnostic: {error.message}
            </Typography>
          </View>
        ) : null}
      </View>
    );
  }
}

const $ = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    padding: ms(24),
  },
  errorBox: {
    paddingHorizontal: ms(16),
    paddingVertical: vs(8),
    marginTop: vs(-16),
    marginBottom: vs(16),
    maxWidth: ms(360),
  },
}));

export default PosErrorBoundary;
