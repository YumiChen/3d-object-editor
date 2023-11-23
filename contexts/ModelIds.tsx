"use client";

import React, { ProviderProps, ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';

const ModelIds = createContext<{
    modelIds: Record<string, string>;
    addModelId: (key: string, newId: string) => void;
    removeModelId: (key: string) => void;
}>({
    modelIds: {}, 
    addModelId: () => {}, 
    removeModelId: () => {}
});

const ModelIdsProvider = ({ children }: { children: ReactNode }) => {
  const [modelIds, setModelIds] = useState<Record<string, string>>({});

  const addModelId = useCallback((key: string, newId: string) => {
    setModelIds({...modelIds, [key]: newId});
  }, [modelIds]);
  const removeModelId = useCallback((key: string) => {
    const newModelIds = {...modelIds};
    delete newModelIds[key];
    setModelIds(newModelIds);
  }, [modelIds]);

  const contextValue = useMemo(() => {
    return { modelIds, addModelId, removeModelId };
  }, [modelIds, addModelId, removeModelId]);
  
  return (
    <ModelIds.Provider value={contextValue}>
      {children}
    </ModelIds.Provider>
  );
};

const useModelIdsContext = () => {
  return useContext(ModelIds);
};

export {
    ModelIdsProvider,
    useModelIdsContext,
};