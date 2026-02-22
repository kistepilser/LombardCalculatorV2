// ──────────────────────────────────────────────
// Domain Types for Lombard Expert Calculator
// ──────────────────────────────────────────────

/** Operation mode: pawn loan vs outright purchase */
export type Operation = 'ZALOG' | 'SKUPKA';

/** Gold purity (проба) */
export type Purity = 375 | 500 | 583 | 585 | 750;

/** Jewelry item types with their weight deduction values */
export interface ItemTypeConfig {
  id: string;
  label: string;
  /** Base deduction in grams (0.1 for ring/earrings/pendant, 0.15 for bracelet/chain) */
  deduct: number;
}

/** Stone material type */
export type StoneType = 'fianite' | 'diamond' | 'amber' | 'pearl' | 'enamel';

/** Gemstone cut shape */
export type StoneShape =
  | 'krug' | 'oval' | 'baget' | 'kvadrat' | 'markiz'
  | 'grusha' | 'oktagon' | 'serdtse' | 'treugolnik' | 'trillion' | 'shar';

/** A single stone/insert entry */
export interface Stone {
  id: string;
  type: StoneType;
  shape: StoneShape;
  L: string; // raw string input for decimal comma support
  W: string;
  H: string;
  Q: string;
  autoH: boolean; // whether H should be auto-calculated
}

/** A single deduction line in the cart */
export interface Deduction {
  label: string;
  grams: number;
}

/** Result of stone mass calculation */
export interface StoneMassResult {
  gram: number;
  ct: number;
}

/** Full pricing calculation result */
export interface PricingResult {
  basePrice: number;
  actualPrice: number;
  amountHand: number;
  insurance: number | null;
  loanTotal: number;
  margin: number | null;
}

/** Interest calculation result */
export interface InterestResult {
  days: number;
  rate: number;
  sum: number;
  totalReturn: number;
}

/** Check limit result for tariff blocking */
export interface LimitCheckResult {
  blocked: boolean;
  checkTotal: number;
}
