// ──────────────────────────────────────────────
// Zustand Store — Calculator State
// ──────────────────────────────────────────────
import { create } from 'zustand';
import type { Operation, Purity, Stone, StoneShape } from '@/domain/types';
import { getDefaultTargetDate, formatDateForInput } from '@/domain/calculations';

export interface CalculatorState {
  // ─── Input State ──────────────────────────
  operation: Operation;
  isHollow: boolean;
  isInsured: boolean;
  itemDeduct: number;         // 0.1 or 0.15
  itemTypeId: string;         // e.g. 'ring'
  totalWeight: string;        // raw string for comma support
  purity: Purity;
  selectedPriceZalog: number;
  selectedPriceSkupka: number;
  targetDate: string;         // YYYY-MM-DD
  stones: Stone[];

  // ─── Actions ──────────────────────────────
  setOperation: (op: Operation) => void;
  toggleOperation: () => void;
  setHollow: (v: boolean) => void;
  setInsured: (v: boolean) => void;
  setItemType: (id: string, deduct: number) => void;
  setTotalWeight: (w: string) => void;
  setPurity: (p: Purity) => void;
  setSelectedPriceZalog: (p: number) => void;
  setSelectedPriceSkupka: (p: number) => void;
  setTargetDate: (d: string) => void;
  addStone: () => void;
  updateStone: (id: string, updates: Partial<Stone>) => void;
  removeStone: (id: string) => void;
}

let stoneCounter = 0;

function createStone(): Stone {
  stoneCounter++;
  return {
    id: `stone-${stoneCounter}-${Date.now()}`,
    type: 'fianite',
    shape: 'krug' as StoneShape,
    L: '',
    W: '',
    H: '',
    Q: '1',
    autoH: true,
  };
}

export const useCalculatorStore = create<CalculatorState>((set) => ({
  operation: 'ZALOG',
  isHollow: false,
  isInsured: true,
  itemDeduct: 0.1,
  itemTypeId: 'ring',
  totalWeight: '',
  purity: 585,
  selectedPriceZalog: 5000,
  selectedPriceSkupka: 3500,
  targetDate: formatDateForInput(getDefaultTargetDate()),
  stones: [],

  setOperation: (op) => set({ operation: op }),
  toggleOperation: () => set((s) => ({
    operation: s.operation === 'ZALOG' ? 'SKUPKA' : 'ZALOG',
  })),
  setHollow: (v) => set({ isHollow: v }),
  setInsured: (v) => set({ isInsured: v }),
  setItemType: (id, deduct) => set({ itemTypeId: id, itemDeduct: deduct }),
  setTotalWeight: (w) => set({ totalWeight: w }),
  setPurity: (p) => set({ purity: p }),
  setSelectedPriceZalog: (p) => set({ selectedPriceZalog: p }),
  setSelectedPriceSkupka: (p) => set({ selectedPriceSkupka: p }),
  setTargetDate: (d) => set({ targetDate: d }),

  addStone: () => set((s) => ({
    stones: [...s.stones, createStone()],
  })),

  updateStone: (id, updates) => set((s) => ({
    stones: s.stones.map((stone) =>
      stone.id === id ? { ...stone, ...updates } : stone
    ),
  })),

  removeStone: (id) => set((s) => ({
    stones: s.stones.filter((stone) => stone.id !== id),
  })),
}));
