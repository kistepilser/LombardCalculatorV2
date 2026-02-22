import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDownIcon } from '@/shared/icons';
import styles from './CustomSelect.module.css';

interface SelectOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps<T extends string> {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  hidden?: boolean;
  ariaLabel?: string;
}

export function CustomSelect<T extends string>({
  options, value, onChange, className = '', hidden = false, ariaLabel,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = useCallback((val: T) => {
    onChange(val);
    setIsOpen(false);
    setHighlightIndex(-1);
  }, [onChange]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setHighlightIndex(options.findIndex((o) => o.value === value));
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < options.length) {
          handleSelect(options[highlightIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  }, [isOpen, highlightIndex, options, value, handleSelect]);

  if (hidden) return null;

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper} ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="listbox"
      aria-label={ariaLabel}
      aria-expanded={isOpen}
    >
      <div
        className={styles.trigger}
        onClick={() => { setIsOpen(!isOpen); setHighlightIndex(-1); }}
      >
        <div className={styles.trigContent}>
          {selectedOption?.icon}
          {selectedOption?.label}
        </div>
        <ChevronDownIcon className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`} size={14} />
      </div>
      <div className={`${styles.options} ${isOpen ? styles.optionsOpen : ''}`}>
        {options.map((opt, i) => (
          <div
            key={opt.value}
            className={`${styles.option} ${i === highlightIndex ? styles.optionHighlighted : ''}`}
            onClick={() => handleSelect(opt.value)}
            role="option"
            aria-selected={opt.value === value}
          >
            {opt.icon}
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  );
}
