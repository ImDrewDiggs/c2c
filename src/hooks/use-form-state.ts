
import { useState, useCallback } from 'react';

interface FormState<T = any> {
  isLoading: boolean;
  error: string | null;
  data: T | null;
}

interface UseFormStateOptions {
  clearErrorOnSubmit?: boolean;
}

export function useFormState<T = any>(
  initialState: Partial<FormState<T>> = {},
  options: UseFormStateOptions = {}
) {
  const [state, setState] = useState<FormState<T>>({
    isLoading: false,
    error: null,
    data: null,
    ...initialState
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, data: null });
  }, []);

  const handleSubmit = useCallback(async <R>(
    submitFn: () => Promise<R>,
    onSuccess?: (result: R) => void,
    onError?: (error: Error) => void
  ) => {
    if (options.clearErrorOnSubmit) {
      setState(prev => ({ ...prev, error: null }));
    }
    
    setLoading(true);
    
    try {
      const result = await submitFn();
      setLoading(false);
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
      throw error;
    }
  }, [setLoading, setError, options.clearErrorOnSubmit]);

  return {
    ...state,
    setLoading,
    setError,
    setData,
    reset,
    handleSubmit
  };
}
