// ──────────────────────────────────────────────
// Domain Constants — Source of truth for all
// coefficients, rates, limits, and tiers.
// ──────────────────────────────────────────────
import type { ItemTypeConfig, Purity, StoneShape } from './types';

/**
 * Stone density coefficients per shape.
 * Used in formula: ct = L × W × H × coeff
 * Source: main.js line 42
 */
export const STONE_COEFFS: Record<StoneShape, number> = {
  krug:       0.0135,
  baget:      0.02175,
  grusha:     0.013125,
  kvadrat:    0.01725,
  markiz:     0.012,
  oval:       0.015,
  oktagon:    0.018375,
  serdtse:    0.01575,
  treugolnik: 0.0135,
  trillion:   0.01275,
  shar:       0.019425,
};

/**
 * Diamond correction factor.
 * Diamonds use krug coeff × (0.0037 / 0.0081) instead of raw coeff.
 * Source: main.js line 153
 */
export const DIAMOND_FACTOR = 0.0037 / 0.0081;

/** Retail selling price per gram at 585 purity (for margin calculation) */
export const BASE_SELLING_PRICE = 6500;

/** Reference purity used in all price recalculations */
export const REFERENCE_PURITY = 585;

/** Insurance rate: 23.76% of the hand amount */
export const INSURANCE_RATE = 0.2376;

/** Maximum loan amount for tariff 7000 in Залог mode */
export const LOAN_LIMIT = 150_000;

/** Hollow item weight deduction percentage */
export const HOLLOW_DEDUCTION_RATE = 0.05;

/** Heavy item (>20g) additional deduction percentage */
export const HEAVY_ITEM_THRESHOLD = 20;
export const HEAVY_ITEM_DEDUCTION_RATE = 0.005;

/** Contamination deduction (always applied) */
export const CONTAMINATION_GRAMS = 0.1;
/** Lock deduction (applied for bracelet/chain with deduct=0.15) */
export const LOCK_GRAMS = 0.05;

/**
 * Interest rate tiers (piecewise).
 * Days 2–6:  0.402% per day
 * Days 7–23: 0.128% per day
 * Days 24+:  0.578% per day
 * Source: main.js lines 282–284
 */
export const INTEREST_TIERS = [
  { startDay: 2,  endDay: 6,        ratePerDay: 0.402 },
  { startDay: 7,  endDay: 23,       ratePerDay: 0.128 },
  { startDay: 24, endDay: Infinity,  ratePerDay: 0.578 },
] as const;

/** Available gold purities */
export const PURITIES: Purity[] = [375, 500, 583, 585, 750];

/** Item types with deduction values */
export const ITEM_TYPES: ItemTypeConfig[] = [
  { id: 'ring',     label: 'Кольцо',  deduct: 0.1  },
  { id: 'earrings', label: 'Серьги',  deduct: 0.1  },
  { id: 'pendant',  label: 'Подвес',  deduct: 0.1  },
  { id: 'bracelet', label: 'Браслет', deduct: 0.15 },
  { id: 'chain',    label: 'Цепь',    deduct: 0.15 },
];

/** Base price tiers for Залог (pawn) */
export const ZALOG_PRICES = [5000, 6000, 7000] as const;

/** Base price tiers for Скупка (buyout) */
export const SKUPKA_PRICES = [2500, 3000, 3500, 4000] as const;

/** Check price used for limit calculation (insured vs uninsured) */
export const CHECK_PRICE_INSURED = 7000;
export const CHECK_PRICE_UNINSURED = 6300;

/** Carat-to-gram conversion factor */
export const CT_TO_GRAM = 0.2;
