'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Type générique pour créer un hook de contexte
export function createContextHook<T>(displayName: string) {
  // Créer un contexte avec un type générique
  const Context = createContext<
    { state: T | null; setState: (value: T | null) => void } | undefined
  >(undefined);

  // Définir le nom d'affichage pour le débogage
  Context.displayName = displayName;

  // Créer un provider pour le contexte
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

  // Créer un hook pour utiliser le contexte
  function useContextHook() {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error(`use${displayName} must be used within a ${displayName}Provider`);
    }
    return context;
  }

  return { Provider, useContextHook };
}
