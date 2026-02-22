import React from 'react';
import styles from './RadioGroup.module.css';

// ─── Simple RadioGroup (item type, purity) ──

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  sectionTitle?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name, options, value, onChange, sectionTitle,
}) => (
  <div className={styles.section}>
    {sectionTitle && <span className={styles.sectionTitle}>{sectionTitle}</span>}
    <div className={styles.group}>
      {options.map((opt) => (
        <label className={styles.label} key={opt.value}>
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            aria-label={opt.label}
          />
          <span className={styles.btn}>
            <span className={styles.calcVal}>{opt.label}</span>
          </span>
        </label>
      ))}
    </div>
  </div>
);

// ─── PriceRadioGroup (tariff per gram) ──────

interface PriceOption {
  value: number;
  calcDisplay: string;
  baseDisplay: string;
  disabled?: boolean;
}

interface PriceRadioGroupProps {
  name: string;
  options: PriceOption[];
  value: number;
  onChange: (value: number) => void;
}

export const PriceRadioGroup: React.FC<PriceRadioGroupProps> = ({
  name, options, value, onChange,
}) => (
  <div className={styles.group}>
    {options.map((opt) => (
      <label className={styles.label} key={opt.value}>
        <input
          type="radio"
          name={name}
          value={opt.value}
          checked={value === opt.value}
          onChange={() => onChange(opt.value)}
          disabled={opt.disabled}
          aria-label={`${opt.calcDisplay}`}
        />
        <span className={styles.btnDouble}>
          <span className={styles.calcVal}>{opt.calcDisplay}</span>
          <span className={styles.baseVal}>{opt.baseDisplay}</span>
        </span>
      </label>
    ))}
  </div>
);
