import React, { useState, useCallback, useEffect } from 'react';
import { useCalculatorStore } from '@/store';
import { StoneRow } from './StoneRow';
import styles from './StoneRow.module.css';

export const StonesSection: React.FC = () => {
  const stones = useCalculatorStore((s) => s.stones);
  const addStone = useCalculatorStore((s) => s.addStone);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // When a new stone is added, expand it and collapse others
  useEffect(() => {
    if (stones.length > 0) {
      const lastStone = stones[stones.length - 1];
      setExpandedId(lastStone.id);
    }
  }, [stones.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = useCallback(() => {
    addStone();
  }, [addStone]);

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  // Click outside stones → collapse all
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${styles.row}`) && !target.closest(`.${styles.btnAdd}`)) {
        setExpandedId(null);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <div className={styles.section}>
      <span className={styles.sectionTitle}>Вставки (Камни, Эмаль)</span>
      <div>
        {stones.map((stone) => (
          <StoneRow
            key={stone.id}
            stone={stone}
            collapsed={expandedId !== stone.id}
            onToggle={() => handleToggle(stone.id)}
          />
        ))}
      </div>
      <button className={styles.btnAdd} onClick={handleAdd} aria-label="Добавить вставку">
        + Добавить вставку
      </button>
    </div>
  );
};
