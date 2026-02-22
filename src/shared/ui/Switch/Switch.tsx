import React from 'react';
import styles from './Switch.module.css';

interface SwitchProps {
  label: string;
  status: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  accentSlider?: boolean;
  disabled?: boolean;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  label, status, checked, onChange, accentSlider = false, disabled = false, id,
}) => (
  <div className={`${styles.switchItem} ${disabled ? styles.disabled : ''}`}>
    <div className={styles.switchRow}>
      <div className={styles.info}>
        <div>{label}</div>
        <span>{status}</span>
      </div>
      <label className={styles.switch}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          id={id}
          aria-label={label}
        />
        <span className={`${styles.slider} ${accentSlider ? styles.sliderAccent : ''}`} />
      </label>
    </div>
  </div>
);
