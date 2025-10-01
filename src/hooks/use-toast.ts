// Hooks de toast desativados: no-op em todo o app
import * as React from "react";

type Noop = (...args: any[]) => void;

const noop: Noop = () => {};

function useToast() {
  return React.useMemo(
    () => ({
      toasts: [],
      toast: noop,
      dismiss: noop,
    }),
    []
  );
}

function toast() {
  // intencionalmente sem operação
}

export { useToast, toast };
