import { useCallback, useRef, useEffect } from "react";
import { debounce } from "lodash-es";

interface DebouncedUpdateOptions {
  delay?: number;
  maxWait?: number;
}

export const useDebouncedUpdate = <T>(
  updateFn: (value: T) => Promise<void> | void,
  options: DebouncedUpdateOptions = {}
) => {
  const { delay = 300, maxWait } = options;
  const latestValueRef = useRef<T>();
  
  const debouncedFn = useCallback(
    debounce(
      async (value: T) => {
        latestValueRef.current = value;
        await updateFn(value);
      },
      delay,
      { maxWait }
    ),
    [updateFn, delay, maxWait]
  );

  // Cancel pending calls on unmount
  useEffect(() => {
    return () => {
      debouncedFn.cancel();
    };
  }, [debouncedFn]);

  return {
    update: debouncedFn,
    cancel: debouncedFn.cancel,
    flush: debouncedFn.flush,
    hasLatestValue: () => latestValueRef.current !== undefined,
  };
};
