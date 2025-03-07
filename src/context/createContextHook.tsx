'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export function createContextHook<T>(displayName: string) {
  const Context = createContext<
    { state: T | null; setState: (value: T | null) => void } | undefined
  >(undefined);

  Context.displayName = displayName;

  function Provider({
    children,
    initialValue = null,
  }: {
    children: ReactNode;
    initialValue?: T | null;
  }) {
    const [state, setState] = useState<T | null>(initialValue);

    const value = React.useMemo(() => ({ state, setState }), [state]);

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useContextHook() {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error(`use${displayName} must be used within a ${displayName}Provider`);
    }
    return context;
  }

  return { Provider, useContextHook };
}
