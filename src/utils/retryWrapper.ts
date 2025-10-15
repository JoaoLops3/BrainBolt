interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number, error: unknown) => void;
}

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    delay = 1000,
    exponentialBackoff = true,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }

      onRetry?.(attempt + 1, error);

      const retryDelay = exponentialBackoff
        ? delay * Math.pow(2, attempt)
        : delay;

      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw lastError;
};

export const createRetryWrapper = (defaultOptions: RetryOptions = {}) => {
  return <T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    return withRetry(operation, { ...defaultOptions, ...options });
  };
};
