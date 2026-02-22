import React, { useMemo, useCallback } from 'react';
import type { Stone, StoneType, StoneShape } from '@/domain/types';
import { calcStoneMassAndCt, getStoneDisplayName, STONE_TYPE_NAMES, STONE_SHAPE_NAMES } from '@/domain/calculations';
import { STONE_TYPE_ICONS, STONE_SHAPE_ICONS, getStoneIcon } from '@/shared/icons';
import { CustomSelect } from '@/shared/ui';
import { useCalculatorStore } from '@/store';
import styles from './StoneRow.module.css';

interface StoneRowProps {
  stone: Stone;
  collapsed: boolean;
  onToggle: () => void;
}

const ALL_SHAPES: StoneShape[] = ['krug','oval','baget','kvadrat','markiz','grusha','oktagon','serdtse','treugolnik','trillion','shar'];
const DIAMOND_SHAPES: StoneShape[] = ['krug'];
const STONE_TYPES: StoneType[] = ['fianite','diamond','amber','pearl','enamel'];

export const StoneRow: React.FC<StoneRowProps> = React.memo(({ stone, collapsed, onToggle }) => {
  const updateStone = useCalculatorStore((s) => s.updateStone);
  const removeStone = useCalculatorStore((s) => s.removeStone);

  // Determine which shapes are available
  const availableShapes = stone.type === 'diamond' ? DIAMOND_SHAPES : ALL_SHAPES;
  const hideShape = stone.type === 'enamel' || stone.type === 'pearl' || stone.type === 'amber';
  const shape = stone.shape;

  // Visibility of W and H inputs
  const hideW = shape === 'krug' || shape === 'shar' || shape === 'kvadrat' || stone.type === 'pearl';
  const hideH = shape === 'krug' || shape === 'shar' || stone.type === 'pearl';
  const disableH = stone.type === 'enamel';

  // Placeholder logic
  let placeholderL = (shape === 'krug' || shape === 'shar' || stone.type === 'pearl') ? 'Ø' : 'Д1';
  if (stone.type === 'enamel') placeholderL = 'Дл';
  const placeholderW = stone.type === 'enamel' ? 'Шир' : 'Д2';
  const placeholderH = stone.type === 'enamel' ? 'см²' : 'Выс';

  // Calculate mass for summary display
  const massResult = useMemo(() => calcStoneMassAndCt(stone), [stone]);
  const displayName = useMemo(() => getStoneDisplayName(stone), [stone]);
  const Q = parseInt(stone.Q) || 1;
  const L_parsed = parseFloat(stone.L.replace(',', '.')) || 0;

  const Icon = getStoneIcon(stone.type, stone.shape);

  // Type options for select
  const typeOptions = useMemo(() =>
    STONE_TYPES.map((t) => {
      const IconComp = STONE_TYPE_ICONS[t];
      return { value: t, label: STONE_TYPE_NAMES[t], icon: <IconComp size={16} /> };
    }), []
  );

  // Shape options for select
  const shapeOptions = useMemo(() =>
    availableShapes.map((s) => {
      const IconComp = STONE_SHAPE_ICONS[s];
      return { value: s, label: STONE_SHAPE_NAMES[s], icon: <IconComp size={16} /> };
    }), [availableShapes]
  );

  // Handlers
  const handleTypeChange = useCallback((type: StoneType) => {
    const updates: Partial<Stone> = { type };
    if (type === 'diamond') updates.shape = 'krug';
    updateStone(stone.id, updates);
  }, [stone.id, updateStone]);

  const handleShapeChange = useCallback((s: StoneShape) => {
    updateStone(stone.id, { shape: s });
  }, [stone.id, updateStone]);

  const handleLChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateStone(stone.id, { L: val });
    // Auto-calc H for enamel
    if (stone.type === 'enamel') {
      const l = parseFloat(val.replace(',', '.')) || 0;
      const w = parseFloat(stone.W.replace(',', '.')) || l;
      const autoH = l > 0 ? ((l * w) / 100).toFixed(2) : '';
      updateStone(stone.id, { L: val, H: autoH });
    } else if (stone.autoH) {
      // Auto H = W * 0.6
      const w = parseFloat(stone.W.replace(',', '.')) || parseFloat(val.replace(',', '.'));
      if (w > 0) {
        updateStone(stone.id, { L: val, H: (w * 0.6).toFixed(2) });
      } else {
        updateStone(stone.id, { L: val, H: '' });
      }
    }
  }, [stone.id, stone.type, stone.W, stone.autoH, updateStone]);

  const handleWChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const updates: Partial<Stone> = { W: val };
    if (stone.type === 'enamel') {
      const l = parseFloat(stone.L.replace(',', '.')) || 0;
      const w = parseFloat(val.replace(',', '.')) || l;
      updates.H = l > 0 ? ((l * w) / 100).toFixed(2) : '';
    } else if (stone.autoH) {
      const w = parseFloat(val.replace(',', '.')) || parseFloat(stone.L.replace(',', '.'));
      updates.H = w > 0 ? (w * 0.6).toFixed(2) : '';
    }
    updateStone(stone.id, updates);
  }, [stone.id, stone.type, stone.L, stone.autoH, updateStone]);

  const handleHChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateStone(stone.id, { H: val, autoH: val === '' });
  }, [stone.id, updateStone]);

  const handleQChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateStone(stone.id, { Q: e.target.value });
  }, [stone.id, updateStone]);

  const handleRemove = useCallback(() => {
    removeStone(stone.id);
  }, [stone.id, removeStone]);

  return (
    <div className={`${styles.row} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.content}>
        {/* Expanded: editing inputs */}
        <div className={styles.inputs}>
          <CustomSelect
            options={typeOptions}
            value={stone.type}
            onChange={handleTypeChange}
            ariaLabel="Тип вставки"
          />
          <CustomSelect
            options={shapeOptions}
            value={stone.shape}
            onChange={handleShapeChange}
            hidden={hideShape}
            ariaLabel="Форма"
          />
          <input
            type="text"
            inputMode="decimal"
            className={styles.glassInput}
            placeholder={placeholderL}
            value={stone.L}
            onChange={handleLChange}
            aria-label="Размер L"
          />
          {!hideW && (
            <input
              type="text"
              inputMode="decimal"
              className={styles.glassInput}
              placeholder={placeholderW}
              value={stone.W}
              onChange={handleWChange}
              aria-label="Размер W"
            />
          )}
          {!hideH && (
            <input
              type="text"
              inputMode="decimal"
              className={styles.glassInput}
              placeholder={placeholderH}
              value={stone.H}
              onChange={handleHChange}
              disabled={disableH}
              aria-label="Высота H"
            />
          )}
          {stone.type === 'enamel' && (
            <input
              type="text"
              inputMode="decimal"
              className={styles.glassInput}
              placeholder={placeholderH}
              value={stone.H}
              disabled
              aria-label="Площадь"
            />
          )}
          <input
            type="text"
            inputMode="decimal"
            className={styles.qtyInput}
            value={stone.Q}
            onChange={handleQChange}
            aria-label="Количество"
          />
        </div>

        {/* Collapsed: summary badge */}
        <div className={styles.summary} onClick={onToggle}>
          <div className={styles.summaryText}>
            {L_parsed > 0 ? (
              <>
                <span className={styles.summaryIcon}><Icon size={16} /></span>
                <span style={{ color: 'var(--text-main)', marginLeft: 4 }}>{displayName}</span>
                <span className={styles.badgeQty}>{Q} шт</span>
                <div className={styles.summaryResult}>
                  <b style={{ color: 'var(--danger)' }}>-{massResult.gram.toFixed(3)} г</b>
                  {massResult.ct > 0 && (
                    <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
                      ({massResult.ct.toFixed(2)} ct)
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <span className={styles.summaryIcon}><Icon size={16} /></span>
                <span style={{ marginLeft: 8, color: 'var(--text-secondary)' }}>
                  Вставка (нажмите для ввода)
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <button className={styles.btnRemove} onClick={handleRemove} title="Удалить" aria-label="Удалить вставку">
        ×
      </button>
    </div>
  );
});

StoneRow.displayName = 'StoneRow';
