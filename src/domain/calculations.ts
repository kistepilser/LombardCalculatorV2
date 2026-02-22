// ──────────────────────────────────────────────
// Pure Calculation Functions
// NO UI dependencies — only math and types.
// Every formula matches main.js exactly.
// ──────────────────────────────────────────────
import type {
  Stone, Deduction, StoneMassResult,
  PricingResult, InterestResult, LimitCheckResult,
} from './types';
import {
  STONE_COEFFS, DIAMOND_FACTOR, REFERENCE_PURITY,
  BASE_SELLING_PRICE, INSURANCE_RATE, LOAN_LIMIT,
  HOLLOW_DEDUCTION_RATE, HEAVY_ITEM_THRESHOLD, HEAVY_ITEM_DEDUCTION_RATE,
  CONTAMINATION_GRAMS, LOCK_GRAMS, CT_TO_GRAM,
  INTEREST_TIERS, CHECK_PRICE_INSURED, CHECK_PRICE_UNINSURED,
} from './constants';

// ─── Parsing ────────────────────────────────

/**
 * Smart number parser: handles both comma and dot as decimal separator.
 * Returns 0 for empty/invalid input.
 * Source: main.js line 10
 */
export function parseVal(val: string): number {
  return parseFloat(val.toString().replace(',', '.')) || 0;
}

// ─── Stone Calculations ─────────────────────

/**
 * Calculate mass and carat weight for a single stone.
 * Special modes for enamel, pearl, amber.
 * Source: main.js lines 143–155
 */
export function calcStoneMassAndCt(stone: Stone): StoneMassResult {
  const L = parseVal(stone.L);
  const W = parseVal(stone.W) || L;
  const rawH = parseVal(stone.H);
  const H = rawH || (W * 0.6);
  const Q = parseInt(stone.Q) || 1;

  if (L <= 0) return { gram: 0, ct: 0 };

  let gram = 0;
  let ct = 0;

  if (stone.type === 'enamel') {
    // Enamel: area-based, no carat
    gram = (L * W / 100) * 0.1 * Q;
  } else if (stone.type === 'pearl') {
    // Pearl: cubic diameter formula
    ct = Math.pow(L, 3) * 0.01295 * Q;
    gram = ct * CT_TO_GRAM;
  } else if (stone.type === 'amber') {
    // Amber: volume × density
    ct = L * W * H * 0.0065 * Q;
    gram = ct * CT_TO_GRAM;
  } else {
    // Standard gemstones (fianite, diamond)
    const coeff = STONE_COEFFS[stone.shape] || STONE_COEFFS.krug;
    ct = L * W * H * coeff;
    if (stone.type === 'diamond') {
      ct *= DIAMOND_FACTOR;
    }
    ct *= Q;
    gram = ct * CT_TO_GRAM;
  }

  return { gram, ct };
}

// ─── Deductions ─────────────────────────────

/**
 * Build deduction lines for the receipt cart.
 * Source: main.js lines 114–193
 */
export function calcDeductions(
  totalW: number,
  itemDeduct: number,
  stones: Stone[],
  isHollow: boolean,
): { deductions: Deduction[]; stonesGramsTotal: number } {
  const deductions: Deduction[] = [];
  let stonesGramsTotal = 0;

  if (totalW <= 0) {
    return { deductions, stonesGramsTotal };
  }

  // Contamination deduction (always)
  if (itemDeduct === 0.1) {
    deductions.push({ label: 'Загрязнение х1', grams: CONTAMINATION_GRAMS });
  } else if (itemDeduct === 0.15) {
    deductions.push({ label: 'Загрязнение х1', grams: CONTAMINATION_GRAMS });
    deductions.push({ label: 'Замок х1', grams: LOCK_GRAMS });
  }

  // Stone deductions
  for (const stone of stones) {
    const { gram, ct } = calcStoneMassAndCt(stone);
    if (gram > 0) {
      const L = parseVal(stone.L);
      const Q = parseInt(stone.Q) || 1;
      if (L > 0) {
        const displayName = getStoneDisplayName(stone);
        deductions.push({ label: `${displayName} x${Q}`, grams: gram });
        stonesGramsTotal += gram;
      }
    }
  }

  // Hollow deduction (5% of total weight)
  if (isHollow) {
    const hd = totalW * HOLLOW_DEDUCTION_RATE;
    deductions.push({ label: 'Пустотелость (5%)', grams: hd });
    stonesGramsTotal += hd;
  }

  // Heavy item deduction (>20g → 0.5%)
  if (totalW > HEAVY_ITEM_THRESHOLD) {
    const hv = totalW * HEAVY_ITEM_DEDUCTION_RATE;
    deductions.push({ label: 'Свыше 20г (0.5%)', grams: hv });
    stonesGramsTotal += hv;
  }

  return { deductions, stonesGramsTotal };
}

/**
 * Calculate net gold weight after all deductions.
 * Source: main.js line 195
 */
export function calcNetWeight(
  totalW: number,
  itemDeduct: number,
  stonesGramsTotal: number,
): number {
  return Math.max(0, totalW - itemDeduct - stonesGramsTotal);
}

// ─── Pricing ────────────────────────────────

/**
 * Calculate actual price per gram adjusted for purity.
 * Formula: Math.round(basePrice × (purity / 585))
 * Source: main.js line 234
 */
export function calcActualPrice(basePrice: number, purity: number): number {
  return Math.round(basePrice * (purity / REFERENCE_PURITY));
}

/**
 * Full pricing calculation: amount, insurance, loan total, margin.
 * Source: main.js lines 234–258
 */
export function calcPricing(
  netW: number,
  selectedBase: number,
  purity: number,
  isInsured: boolean,
  isBuyout: boolean,
): PricingResult {
  const actualPrice = calcActualPrice(selectedBase, purity);
  const amountHand = Math.round(netW * actualPrice);

  let insurance: number | null = null;
  let loanTotal: number;
  let margin: number | null = null;

  if (isInsured) {
    // Insurance computed for both modes
    insurance = Math.round(amountHand * INSURANCE_RATE);
    if (!isBuyout) {
      // Залог: insurance added to loan total
      loanTotal = amountHand + insurance;
    } else {
      // Скупка: insurance shown separately, not added to payout
      loanTotal = amountHand;
    }
  } else {
    loanTotal = amountHand;
  }

  if (isBuyout) {
    // Margin = (retail price - buy price) × net weight
    const retailPrice = calcActualPrice(BASE_SELLING_PRICE, purity);
    margin = Math.round((retailPrice - actualPrice) * netW);
  }

  return {
    basePrice: selectedBase,
    actualPrice,
    amountHand,
    insurance,
    loanTotal,
    margin,
  };
}

// ─── Interest ───────────────────────────────

/**
 * Calculate interest for pawn loan.
 * Piecewise rate:
 *   Day 1:     0%
 *   Days 2–6:  0.402% per day (5 days max)
 *   Days 7–23: 0.128% per day (17 days max)
 *   Days 24+:  0.578% per day
 * Source: main.js lines 265–290
 */
export function calcInterest(
  loanTotal: number,
  targetDate: Date,
  today: Date,
): InterestResult {
  const diffTime = targetDate.getTime() - today.getTime();
  let days = Math.floor(diffTime / (1000 * 3600 * 24)) + 1;
  if (days < 1) days = 1;

  let rate = 0;
  for (const tier of INTEREST_TIERS) {
    if (days >= tier.startDay) {
      const daysInTier = tier.endDay === Infinity
        ? days - tier.startDay + 1
        : Math.min(days - tier.startDay + 1, tier.endDay - tier.startDay + 1);
      rate += daysInTier * tier.ratePerDay;
    }
  }

  const sum = Math.round(loanTotal * (rate / 100));
  return {
    days,
    rate,
    sum,
    totalReturn: loanTotal + sum,
  };
}

// ─── Limit Check ────────────────────────────

/**
 * Check if the 7000 tariff should be blocked.
 * Rule:
 *   Without insurance: amountHand (at 7000) > 150,000 → blocked
 *   With insurance: amountHand + insurance > 150,000 → blocked
 * Where insurance = amountHand × INSURANCE_RATE
 */
export function calcCheckLimit(
  netW: number,
  purity: number,
  isInsured: boolean,
): LimitCheckResult {
  const actualPrice7k = calcActualPrice(7000, purity);
  const amountHand = Math.round(netW * actualPrice7k);
  const insurance = isInsured ? Math.round(amountHand * INSURANCE_RATE) : 0;
  const checkTotal = amountHand + insurance;
  return {
    blocked: checkTotal > LOAN_LIMIT,
    checkTotal,
  };
}

// ─── Formatting ─────────────────────────────

/** Format number as Russian currency: "1 234 ₽" */
export function formatMoney(n: number): string {
  return n.toLocaleString('ru-RU') + ' ₽';
}

/** Format number as grams with 3 decimal places: "1.234 г" */
export function formatGrams(n: number): string {
  return n.toFixed(3) + ' г';
}

// ─── Helpers ────────────────────────────────

/** Stone type → Russian name map */
export const STONE_TYPE_NAMES: Record<string, string> = {
  fianite: 'Фианит',
  diamond: 'Бриллиант',
  amber: 'Янтарь',
  pearl: 'Жемчуг',
  enamel: 'Эмаль',
};

/** Stone shape → Russian name map */
export const STONE_SHAPE_NAMES: Record<string, string> = {
  krug: 'Круг',
  oval: 'Овал',
  baget: 'Багет',
  kvadrat: 'Квадрат',
  markiz: 'Маркиз',
  grusha: 'Груша',
  oktagon: 'Октагон',
  serdtse: 'Сердце',
  treugolnik: 'Треугольник',
  trillion: 'Триллион',
  shar: 'Шар',
};

/** Build display name for a stone (e.g. "Фианит Круг" or just "Эмаль") */
export function getStoneDisplayName(stone: Stone): string {
  const typeName = STONE_TYPE_NAMES[stone.type] || stone.type;
  if (stone.type === 'enamel' || stone.type === 'pearl' || stone.type === 'amber') {
    return typeName;
  }
  const shapeName = STONE_SHAPE_NAMES[stone.shape] || stone.shape;
  return `${typeName} ${shapeName}`;
}

/** Generate today's date at midnight */
export function getToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Format date as YYYY-MM-DD for input[type=date] */
export function formatDateForInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Get default target date (today + 31 days) */
export function getDefaultTargetDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 31);
  d.setHours(0, 0, 0, 0);
  return d;
}
