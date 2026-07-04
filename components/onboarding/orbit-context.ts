import { createContext, useContext } from 'react';

export type OrbitMode = 'orbit' | 'fade';

export interface OrbitContextValue {
  /** Full stage width — one page step in the horizontal track. */
  width: number;
  /** Current active face index. */
  index: number;
  mode: OrbitMode;
}

export const OrbitContext = createContext<OrbitContextValue | null>(null);

export function useOrbit(): OrbitContextValue {
  const ctx = useContext(OrbitContext);
  if (!ctx) throw new Error('OrbitFace must be rendered inside an OrbitStage');
  return ctx;
}
