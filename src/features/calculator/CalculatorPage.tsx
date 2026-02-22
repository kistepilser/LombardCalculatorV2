import React, { useMemo, useState } from 'react';
import { useCalculatorStore } from '@/store';
import type { Purity } from '@/domain/types';
import {
  parseVal, calcDeductions, calcNetWeight, calcPricing,
  calcInterest, calcCheckLimit, calcActualPrice,
  formatMoney, formatGrams, getToday, formatDateForInput,
} from '@/domain/calculations';
import { ITEM_TYPES, PURITIES, ZALOG_PRICES, SKUPKA_PRICES, REFERENCE_PURITY } from '@/domain/constants';
import { GlassCard, Switch, RadioGroup, PriceRadioGroup } from '@/shared/ui';
import { ChevronDownIcon } from '@/shared/icons';
import { StonesSection } from '@/features/stones';
import styles from './Calculator.module.css';

// ─── Video Background ───────────────────────

const VideoBackground: React.FC = () => {
  const [videoError, setVideoError] = useState(false);
  return (
    <div className="videoBgContainer">
      {!videoError ? (
        <video
          autoPlay loop muted playsInline
          className="bgVideo"
          onError={() => setVideoError(true)}
        >
          <source
            src="https://cdn.pixabay.com/video/2021/08/11/84687-587463773_large.mp4"
            type="video/mp4"
          />
        </video>
      ) : null}
      <div className="videoOverlay" />
    </div>
  );
};

// ─── Main Calculator Page ───────────────────

export const CalculatorPage: React.FC = () => {
  const store = useCalculatorStore();
  const today = useMemo(() => getToday(), []);
  const [interestOpen, setInterestOpen] = useState(false);

  const isBuyout = store.operation === 'SKUPKA';
  const isInsured = store.isInsured;

  // Parse total weight
  const totalW = useMemo(() => parseVal(store.totalWeight), [store.totalWeight]);

  // Deductions
  const { deductions, stonesGramsTotal } = useMemo(
    () => calcDeductions(totalW, store.itemDeduct, store.stones, store.isHollow),
    [totalW, store.itemDeduct, store.stones, store.isHollow]
  );

  // Net weight
  const netW = useMemo(
    () => calcNetWeight(totalW, store.itemDeduct, stonesGramsTotal),
    [totalW, store.itemDeduct, stonesGramsTotal]
  );

  // Limit check for zalog
  const limitCheck = useMemo(
    () => calcCheckLimit(netW, store.purity, isInsured),
    [netW, store.purity, isInsured]
  );

  // Effective selected price (handle limit block)
  const effectiveSelectedBase = useMemo(() => {
    if (isBuyout) return store.selectedPriceSkupka;
    if (limitCheck.blocked && store.selectedPriceZalog === 7000) {
      // Auto-switch to 6000 if 7000 is blocked
      return 6000;
    }
    return store.selectedPriceZalog;
  }, [isBuyout, store.selectedPriceZalog, store.selectedPriceSkupka, limitCheck.blocked]);

  // Auto-switch zalog price if 7000 becomes blocked
  React.useEffect(() => {
    if (!isBuyout && limitCheck.blocked && store.selectedPriceZalog === 7000) {
      store.setSelectedPriceZalog(6000);
    }
  }, [isBuyout, limitCheck.blocked, store.selectedPriceZalog]); // eslint-disable-line

  // Pricing
  const pricing = useMemo(
    () => calcPricing(netW, effectiveSelectedBase, store.purity, isInsured, isBuyout),
    [netW, effectiveSelectedBase, store.purity, isInsured, isBuyout]
  );

  // Interest (only for zalog)
  const interest = useMemo(() => {
    if (isBuyout || pricing.loanTotal === 0) return null;
    const tDate = new Date(store.targetDate);
    tDate.setHours(0, 0, 0, 0);
    return calcInterest(pricing.loanTotal, tDate, today);
  }, [isBuyout, pricing.loanTotal, store.targetDate, today]);

  // Price options with purity recalculation
  const zalogPriceOptions = useMemo(() =>
    ZALOG_PRICES.map((base) => ({
      value: base,
      calcDisplay: formatMoney(calcActualPrice(base, store.purity)),
      baseDisplay: `(${formatMoney(base)})`,
      disabled: base === 7000 && !isBuyout && limitCheck.blocked,
    })), [store.purity, isBuyout, limitCheck.blocked]
  );

  const skupkaPriceOptions = useMemo(() =>
    SKUPKA_PRICES.map((base) => ({
      value: base as number,
      calcDisplay: formatMoney(calcActualPrice(base, store.purity)),
      baseDisplay: `(${formatMoney(base)})`,
    })), [store.purity]
  );

  // Operation status text
  const opStatus = isBuyout ? 'Скупка' : 'Залог';
  const insStatus = isInsured ? 'Включена (База)' : 'Отключена (Снижен)';

  // Item type options
  const itemTypeOptions = useMemo(() =>
    ITEM_TYPES.map((it) => ({ value: `${it.id}:${it.deduct}`, label: it.label })),
    []
  );
  const currentItemTypeValue = `${store.itemTypeId}:${store.itemDeduct}`;

  return (
    <>
      <VideoBackground />
      <div className="appContainer">
        {/* ─── LEFT PANEL: Parameters ──────────── */}
        <GlassCard title="Параметры изделия">
          {/* Switches */}
          <div className={styles.switchesGrid}>
            <Switch
              label="Операция"
              status={opStatus}
              checked={isBuyout}
              onChange={() => store.toggleOperation()}
              accentSlider
              id="isBuyout"
            />
            <Switch
              label="Пустотелое"
              status="Вычет -5%"
              checked={store.isHollow}
              onChange={store.setHollow}
              id="isHollow"
            />
            <Switch
              label="Страховка"
              status={insStatus}
              checked={isInsured}
              onChange={store.setInsured}
              id="isInsured"
            />
          </div>

          {/* Item Type and Weight */}
          <RadioGroup
            name="itemType"
            sectionTitle="Тип и вес"
            options={itemTypeOptions}
            value={currentItemTypeValue}
            onChange={(v) => {
              const [id, deduct] = v.split(':');
              store.setItemType(id, parseFloat(deduct));
            }}
          />
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <label htmlFor="totalWeight">Общий вес (г)</label>
              <input
                type="text"
                inputMode="decimal"
                id="totalWeight"
                className={styles.liquidInput}
                placeholder="0.000"
                value={store.totalWeight}
                onChange={(e) => store.setTotalWeight(e.target.value)}
              />
            </div>
            <div className={styles.inputWrapper}>
              <label>Чистый вес золота (г)</label>
              <input
                type="text"
                className={styles.liquidInput}
                value={formatGrams(netW)}
                disabled
              />
            </div>
          </div>

          {/* Stones */}
          <StonesSection />

          {/* Purity */}
          <RadioGroup
            name="purity"
            sectionTitle="Проба золота"
            options={PURITIES.map((p) => ({ value: String(p), label: String(p) }))}
            value={String(store.purity)}
            onChange={(v) => store.setPurity(parseInt(v) as Purity)}
          />

          {/* Price Tariffs */}
          <div className={styles.sectionNoMargin}>
            <span className={styles.inputWrapper}>
              <label style={{
                fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: 0.5, color: 'var(--text-secondary)', marginBottom: 15, display: 'block'
              }}>
                Тариф за грамм ({isBuyout ? 'Скупка' : 'Залог'})
              </label>
            </span>

            {!isBuyout && (
              <PriceRadioGroup
                name="price_zalog"
                options={zalogPriceOptions}
                value={store.selectedPriceZalog}
                onChange={store.setSelectedPriceZalog}
              />
            )}

            {isBuyout && (
              <PriceRadioGroup
                name="price_skupka"
                options={skupkaPriceOptions}
                value={store.selectedPriceSkupka}
                onChange={store.setSelectedPriceSkupka}
              />
            )}

            {!isBuyout && limitCheck.blocked && (
              <div className={styles.limitWarning}>
                ⚠ Тариф заблокирован: лимит 150 000 ₽ превышен.
              </div>
            )}
          </div>
        </GlassCard>

        {/* ─── RIGHT PANEL: Receipt ───────────── */}
        <div className={styles.sidebar}>
          <GlassCard className={styles.receiptCard}>
            <h2>Расчетный лист</h2>

            {/* Cart / Deductions */}
            {totalW > 0 && (
              <div className={styles.cartContainer}>
                <div className={styles.cartHeader}>Детализация вычетов</div>
                {deductions.map((d, i) => (
                  <div key={i} className={styles.cartItem}>
                    <span className={styles.itemName}>{d.label}</span>
                    <span className={styles.dots} />
                    <span className={styles.itemVal}>-{d.grams.toFixed(3)} г</span>
                  </div>
                ))}
                <div className={styles.cartTotal}>
                  <span>Чистый вес:</span>
                  <span>{formatGrams(netW)}</span>
                </div>
              </div>
            )}

            {/* Base and Actual Price */}
            <div className={styles.resLine}>
              <span>Базовый тариф (585):</span>
              <span>{formatMoney(effectiveSelectedBase)}</span>
            </div>
            <div className={styles.resLine}>
              <span>Тариф пересчета ({store.purity}):</span>
              <span>{formatMoney(pricing.actualPrice)}</span>
            </div>

            {/* Insurance Block — shown in both Залог and Скупка */}
            {isInsured && (
              <div className={styles.insuranceBlock}>
                <div className={styles.resLine}>
                  <span className={styles.handAmount}>На руки клиенту:</span>
                  <span className={styles.handValue}>{formatMoney(pricing.amountHand)}</span>
                </div>
                <div className={styles.resLine} style={{ marginTop: 10 }}>
                  <span>Страховка (23.76%):</span>
                  <span>{formatMoney(pricing.insurance ?? 0)}</span>
                </div>
              </div>
            )}

            {/* Total */}
            <div className={styles.resLineTotal}>
              <span className={styles.totalLabel}>
                {isBuyout ? 'К выдаче (Скупка):' : (isInsured ? 'Сумма займа:' : 'К выдаче на руки:')}
              </span>
              <span className={styles.bigPrice}>{formatMoney(pricing.loanTotal)}</span>
            </div>

            {/* Margin Block (Скупка only) */}
            {isBuyout && (
              <div className={styles.marginBlock}>
                <div className={styles.resLine} style={{ marginBottom: 0 }}>
                  <span className={styles.marginLabel}>Прогнозируемая маржа:</span>
                  <span className={styles.marginValue}>{formatMoney(pricing.margin ?? 0)}</span>
                </div>
                <div className={styles.marginNote}>
                  От розничной цены продажи 6 500 ₽ (585 проба)
                </div>
              </div>
            )}

            {/* Interest Block (Залог only) */}
            {!isBuyout && (
              <div className={styles.interestBlock}>
                <div
                  className={styles.interestHeader}
                  onClick={() => setInterestOpen(!interestOpen)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={interestOpen}
                  aria-label="Прогноз процентов"
                >
                  <span>Прогноз процентов (Залог)</span>
                  <ChevronDownIcon
                    className={`${styles.interestArrow} ${interestOpen ? styles.interestArrowOpen : ''}`}
                  />
                </div>
                {interestOpen && (
                  <div className={styles.interestContent}>
                    <div className={styles.inputWrapper} style={{ marginBottom: 12, marginTop: 5 }}>
                      <label htmlFor="targetDate">Дата планируемого выкупа</label>
                      <input
                        type="date"
                        id="targetDate"
                        className={`${styles.liquidInput} ${styles.dateInput}`}
                        min={formatDateForInput(today)}
                        value={store.targetDate}
                        onChange={(e) => store.setTargetDate(e.target.value)}
                      />
                    </div>
                    <div className={styles.resLine}>
                      <span>Дней в залоге:</span>
                      <span>{interest?.days ?? 0}</span>
                    </div>
                    <div className={styles.resLine}>
                      <span>Процентная ставка:</span>
                      <span>{(interest?.rate ?? 0).toFixed(3)}%</span>
                    </div>
                    <div className={styles.resLine}>
                      <span>Начислено процентов:</span>
                      <span style={{ color: 'var(--danger)' }}>
                        {formatMoney(interest?.sum ?? 0)}
                      </span>
                    </div>
                    <div className={styles.interestDivider}>
                      <span className={styles.interestReturnLabel}>Итого к возврату:</span>
                      <span className={styles.interestReturnValue}>
                        {formatMoney(interest?.totalReturn ?? 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </GlassCard>
        </div>
      </div>
    </>
  );
};
