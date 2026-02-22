// ──────────────────────────────────────────────
// Unit Tests for Domain Calculations
// Tests cover every formula from main.js
// ──────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import {
  parseVal,
  calcStoneMassAndCt,
  calcDeductions,
  calcNetWeight,
  calcActualPrice,
  calcPricing,
  calcInterest,
  calcCheckLimit,
  formatMoney,
  formatGrams,
} from '../calculations';
import type { Stone } from '../types';
import { STONE_COEFFS, DIAMOND_FACTOR } from '../constants';

// ─── parseVal ───────────────────────────────

describe('parseVal', () => {
  it('parses dot decimal', () => {
    expect(parseVal('5.67')).toBe(5.67);
  });

  it('parses comma decimal', () => {
    expect(parseVal('1,234')).toBe(1.234);
  });

  it('returns 0 for empty string', () => {
    expect(parseVal('')).toBe(0);
  });

  it('returns 0 for garbage', () => {
    expect(parseVal('abc')).toBe(0);
  });

  it('handles integer', () => {
    expect(parseVal('10')).toBe(10);
  });
});

// ─── Stone Mass Calculations ────────────────

describe('calcStoneMassAndCt', () => {
  const makeStone = (overrides: Partial<Stone>): Stone => ({
    id: 'test',
    type: 'fianite',
    shape: 'krug',
    L: '', W: '', H: '', Q: '1',
    autoH: true,
    ...overrides,
  });

  it('returns 0 for empty L', () => {
    const result = calcStoneMassAndCt(makeStone({}));
    expect(result.gram).toBe(0);
    expect(result.ct).toBe(0);
  });

  it('calculates fianite krug correctly', () => {
    const stone = makeStone({ L: '3', W: '3', H: '1.8', Q: '1' });
    const coeff = STONE_COEFFS.krug; // 0.0135
    const ct = 3 * 3 * 1.8 * coeff * 1;
    const gram = ct * 0.2;
    const result = calcStoneMassAndCt(stone);
    expect(result.ct).toBeCloseTo(ct, 6);
    expect(result.gram).toBeCloseTo(gram, 6);
  });

  it('calculates diamond krug with DIAMOND_FACTOR', () => {
    const stone = makeStone({ type: 'diamond', shape: 'krug', L: '3', W: '3', H: '1.8', Q: '1' });
    const coeff = STONE_COEFFS.krug;
    const ct = 3 * 3 * 1.8 * coeff * DIAMOND_FACTOR * 1;
    const gram = ct * 0.2;
    const result = calcStoneMassAndCt(stone);
    expect(result.ct).toBeCloseTo(ct, 6);
    expect(result.gram).toBeCloseTo(gram, 6);
  });

  it('calculates enamel (area-based, no ct)', () => {
    const stone = makeStone({ type: 'enamel', L: '10', W: '5', Q: '2' });
    // gram = (10*5/100) * 0.1 * 2 = 0.5*0.1*2 = 0.1
    const result = calcStoneMassAndCt(stone);
    expect(result.gram).toBeCloseTo(0.1, 6);
    expect(result.ct).toBe(0);
  });

  it('calculates pearl (cubic)', () => {
    const stone = makeStone({ type: 'pearl', L: '8', Q: '1' });
    const ct = Math.pow(8, 3) * 0.01295 * 1;
    const gram = ct * 0.2;
    const result = calcStoneMassAndCt(stone);
    expect(result.ct).toBeCloseTo(ct, 6);
    expect(result.gram).toBeCloseTo(gram, 6);
  });

  it('calculates amber (volume)', () => {
    const stone = makeStone({ type: 'amber', L: '5', W: '3', H: '2', Q: '1' });
    const ct = 5 * 3 * 2 * 0.0065 * 1;
    const gram = ct * 0.2;
    const result = calcStoneMassAndCt(stone);
    expect(result.ct).toBeCloseTo(ct, 6);
    expect(result.gram).toBeCloseTo(gram, 6);
  });

  it('uses W*0.6 for auto-H when H is empty', () => {
    const stone = makeStone({ L: '4', W: '4', H: '', Q: '1' });
    // H defaults to W*0.6 = 2.4
    const coeff = STONE_COEFFS.krug;
    const ct = 4 * 4 * 2.4 * coeff;
    const result = calcStoneMassAndCt(stone);
    expect(result.ct).toBeCloseTo(ct, 6);
  });

  it('multiplies by Q', () => {
    const stone1 = makeStone({ L: '3', W: '3', H: '1.8', Q: '1' });
    const stone3 = makeStone({ L: '3', W: '3', H: '1.8', Q: '3' });
    const r1 = calcStoneMassAndCt(stone1);
    const r3 = calcStoneMassAndCt(stone3);
    expect(r3.ct).toBeCloseTo(r1.ct * 3, 6);
    expect(r3.gram).toBeCloseTo(r1.gram * 3, 6);
  });
});

// ─── Deductions ─────────────────────────────

describe('calcDeductions', () => {
  it('returns empty for zero weight', () => {
    const { deductions, stonesGramsTotal } = calcDeductions(0, 0.1, [], false);
    expect(deductions).toEqual([]);
    expect(stonesGramsTotal).toBe(0);
  });

  it('adds contamination for deduct=0.1', () => {
    const { deductions } = calcDeductions(5, 0.1, [], false);
    expect(deductions).toHaveLength(1);
    expect(deductions[0].label).toBe('Загрязнение х1');
    expect(deductions[0].grams).toBe(0.1);
  });

  it('adds contamination + lock for deduct=0.15', () => {
    const { deductions } = calcDeductions(5, 0.15, [], false);
    expect(deductions).toHaveLength(2);
    expect(deductions[0].grams).toBe(0.1);
    expect(deductions[1].label).toBe('Замок х1');
    expect(deductions[1].grams).toBe(0.05);
  });

  it('adds hollow deduction (5%)', () => {
    const { deductions, stonesGramsTotal } = calcDeductions(10, 0.1, [], true);
    const hollowDed = deductions.find(d => d.label.includes('Пустотелость'));
    expect(hollowDed).toBeDefined();
    expect(hollowDed!.grams).toBeCloseTo(0.5, 6);
    expect(stonesGramsTotal).toBeCloseTo(0.5, 6);
  });

  it('adds heavy item deduction for >20g', () => {
    const { deductions, stonesGramsTotal } = calcDeductions(25, 0.1, [], false);
    const heavyDed = deductions.find(d => d.label.includes('Свыше 20г'));
    expect(heavyDed).toBeDefined();
    expect(heavyDed!.grams).toBeCloseTo(0.125, 6);
    expect(stonesGramsTotal).toBeCloseTo(0.125, 6);
  });

  it('does not add heavy deduction for <=20g', () => {
    const { deductions } = calcDeductions(20, 0.1, [], false);
    const heavyDed = deductions.find(d => d.label.includes('Свыше 20г'));
    expect(heavyDed).toBeUndefined();
  });
});

// ─── Net Weight ─────────────────────────────

describe('calcNetWeight', () => {
  it('calculates net weight correctly', () => {
    expect(calcNetWeight(10, 0.1, 0.5)).toBeCloseTo(9.4, 6);
  });

  it('never returns negative', () => {
    expect(calcNetWeight(0.05, 0.1, 0)).toBe(0);
  });
});

// ─── Pricing ────────────────────────────────

describe('calcActualPrice', () => {
  it('returns base price for purity 585', () => {
    expect(calcActualPrice(5000, 585)).toBe(5000);
  });

  it('recalculates for purity 750', () => {
    expect(calcActualPrice(5000, 750)).toBe(Math.round(5000 * (750 / 585)));
  });

  it('recalculates for purity 375', () => {
    expect(calcActualPrice(5000, 375)).toBe(Math.round(5000 * (375 / 585)));
  });
});

describe('calcPricing', () => {
  it('calculates insurance at 23.76%', () => {
    const result = calcPricing(10, 5000, 585, true, false);
    const amountHand = Math.round(10 * 5000);
    const ins = Math.round(amountHand * 0.2376);
    expect(result.amountHand).toBe(amountHand);
    expect(result.insurance).toBe(ins);
    expect(result.loanTotal).toBe(amountHand + ins);
    expect(result.margin).toBeNull();
  });

  it('no insurance when not insured', () => {
    const result = calcPricing(10, 5000, 585, false, false);
    expect(result.insurance).toBeNull();
    expect(result.loanTotal).toBe(Math.round(10 * 5000));
  });

  it('calculates margin for buyout, insurance computed separately', () => {
    const result = calcPricing(10, 3500, 585, true, true);
    // margin = (6500-3500)*10 = 30000
    expect(result.margin).toBe(30000);
    // insurance IS computed (23.76% of amountHand), but NOT added to loanTotal in buyout
    expect(result.insurance).toBe(Math.round(10 * 3500 * 0.2376));
    expect(result.loanTotal).toBe(Math.round(10 * 3500)); // no insurance added for buyout
  });
});

// ─── Limit Check ────────────────────────────

describe('calcCheckLimit', () => {
  it('blocks when total > 150000', () => {
    // netW=25, purity=585, insured → checkPrice=7000
    // checkTotal = 25 * 7000 = 175000 > 150000
    const result = calcCheckLimit(25, 585, true);
    expect(result.blocked).toBe(true);
    expect(result.checkTotal).toBe(175000);
  });

  it('allows when total <= 150000', () => {
    const result = calcCheckLimit(20, 585, true);
    expect(result.blocked).toBe(false);
    expect(result.checkTotal).toBe(140000);
  });

  it('uses 6300 check price when uninsured', () => {
    // netW=25, purity=585, uninsured → checkPrice=6300
    // checkTotal = 25 * 6300 = 157500 > 150000
    const result = calcCheckLimit(25, 585, false);
    expect(result.blocked).toBe(true);
    expect(result.checkTotal).toBe(157500);
  });
});

// ─── Interest ───────────────────────────────

describe('calcInterest', () => {
  const today = new Date(2025, 0, 1); // Jan 1, 2025

  it('day 1: rate = 0', () => {
    const target = new Date(2025, 0, 1); // same day
    const result = calcInterest(100000, target, today);
    expect(result.days).toBe(1);
    expect(result.rate).toBe(0);
    expect(result.sum).toBe(0);
  });

  it('days = 6: rate = 5 * 0.402 = 2.010', () => {
    const target = new Date(2025, 0, 6); // 5 days later
    const result = calcInterest(100000, target, today);
    expect(result.days).toBe(6);
    expect(result.rate).toBeCloseTo(2.010, 6);
    expect(result.sum).toBe(Math.round(100000 * (2.010 / 100)));
  });

  it('days = 23: rate = 5*0.402 + 17*0.128 = 4.186', () => {
    const target = new Date(2025, 0, 23); // 22 days later → days=23
    const result = calcInterest(100000, target, today);
    expect(result.days).toBe(23);
    expect(result.rate).toBeCloseTo(4.186, 6);
  });

  it('days = 30: rate = 5*0.402 + 17*0.128 + 7*0.578 = 8.232', () => {
    const target = new Date(2025, 0, 30);
    const result = calcInterest(100000, target, today);
    expect(result.days).toBe(30);
    expect(result.rate).toBeCloseTo(8.232, 6);
    expect(result.sum).toBe(Math.round(100000 * (8.232 / 100)));
    expect(result.totalReturn).toBe(100000 + Math.round(100000 * (8.232 / 100)));
  });

  it('minimum 1 day for past dates', () => {
    const target = new Date(2024, 11, 25); // before today
    const result = calcInterest(100000, target, today);
    expect(result.days).toBe(1);
  });
});

// ─── Formatting ─────────────────────────────

describe('formatMoney', () => {
  it('formats with ₽ suffix', () => {
    const result = formatMoney(1234);
    expect(result).toContain('₽');
    // The exact format depends on locale, but should contain the number
    expect(result).toContain('234');
  });
});

describe('formatGrams', () => {
  it('formats with 3 decimal places and г suffix', () => {
    expect(formatGrams(1.2345)).toBe('1.234 г'); // toFixed uses banker's rounding
    expect(formatGrams(1.2346)).toBe('1.235 г');
    expect(formatGrams(0)).toBe('0.000 г');
  });
});
