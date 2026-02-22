// ──────────────────────────────────────────────
// SVG Icon components for stone types and shapes
// Source: main.js SVGS object (lines 13–39)
// ──────────────────────────────────────────────
import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

const icon = (children: React.ReactNode): React.FC<IconProps> => {
  const Comp: React.FC<IconProps> = ({ className, size = 16 }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      width={size}
      height={size}
      className={className}
      style={{ flexShrink: 0 }}
    >
      {children}
    </svg>
  );
  Comp.displayName = 'SvgIcon';
  return Comp;
};

// ─── Stone Type Icons ───────────────────────

export const FianiteIcon = icon(
  <polygon points="12 2 2 8 12 22 22 8 12 2"><line x1="2" y1="8" x2="22" y2="8" /></polygon>
);

export const DiamondIcon = icon(
  <>
    <polygon points="12 2 2 8 12 22 22 8 12 2" />
    <line x1="2" y1="8" x2="22" y2="8" />
    <polyline points="12 2 12 22" />
    <polyline points="12 2 6 8 12 22" />
    <polyline points="12 2 18 8 12 22" />
  </>
);

export const AmberIcon = icon(
  <>
    <path d="M12 3C8 3 4 7.5 4 13c0 4 3.5 8 8 8s8-4 8-8c0-5.5-4-10-8-10z" />
    <path d="M9.5 10c1.5-2 3-3 4.5-3" strokeLinecap="round" opacity="0.5" />
  </>
);

export const PearlIcon = icon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 7.5c1.5-1.5 3.5-2 5-1" strokeLinecap="round" opacity="0.5" />
    <path d="M7.5 10c0.5-0.5 1.5-0.8 2-0.5" strokeLinecap="round" opacity="0.3" />
  </>
);

export const EnamelIcon = icon(
  <>
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10" />
    <path d="M22 12c0-2-1.5-3.5-3.5-3.5S15 10 15 12s1.5 3.5 3.5 3.5" />
    <circle cx="9" cy="13" r="1.5" fill="currentColor" stroke="none" />
  </>
);

// ─── Shape Icons ────────────────────────────

export const KrugIcon = icon(<circle cx="12" cy="12" r="8" />);

export const OvalIcon = icon(<ellipse cx="12" cy="12" rx="6" ry="10" />);

export const BagetIcon = icon(<rect x="7" y="3" width="10" height="18" rx="1" />);

export const KvadratIcon = icon(<rect x="5" y="5" width="14" height="14" rx="1" />);

export const MarkizIcon = icon(
  <path d="M12 2C18 8 18 16 12 22C6 16 6 8 12 2Z" />
);

export const GrushaIcon = icon(
  <path d="M12 2C12 2 6 10 6 15A6 6 0 0 0 18 15C18 10 12 2 12 2Z" />
);

export const OktagonIcon = icon(
  <polygon points="8 3 16 3 21 8 21 16 16 21 8 21 3 16 3 8" />
);

export const SerdtseIcon = icon(
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
);

export const TreugolnikIcon = icon(
  <polygon points="12 3 3 20 21 20" />
);

export const TrillionIcon = icon(
  <path d="M12 3C15 9 21 19 21 19C16 21 8 21 3 19C3 19 9 9 12 3Z" />
);

export const SharIcon = icon(<circle cx="12" cy="12" r="8" />);

// ─── Arrow Icon ─────────────────────────────

export const ChevronDownIcon: React.FC<IconProps> = ({ className, size = 18 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    width={size}
    height={size}
    className={className}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── Lookup Maps ────────────────────────────

import type { StoneType, StoneShape } from '@/domain/types';

export const STONE_TYPE_ICONS: Record<StoneType, React.FC<IconProps>> = {
  fianite: FianiteIcon,
  diamond: DiamondIcon,
  amber: AmberIcon,
  pearl: PearlIcon,
  enamel: EnamelIcon,
};

export const STONE_SHAPE_ICONS: Record<StoneShape, React.FC<IconProps>> = {
  krug: KrugIcon,
  oval: OvalIcon,
  baget: BagetIcon,
  kvadrat: KvadratIcon,
  markiz: MarkizIcon,
  grusha: GrushaIcon,
  oktagon: OktagonIcon,
  serdtse: SerdtseIcon,
  treugolnik: TreugolnikIcon,
  trillion: TrillionIcon,
  shar: SharIcon,
};

/**
 * Get the appropriate icon for a stone.
 * For enamel/pearl/amber, use the type icon; otherwise use shape icon.
 */
export function getStoneIcon(type: StoneType, shape: StoneShape): React.FC<IconProps> {
  if (type === 'enamel' || type === 'pearl' || type === 'amber') {
    return STONE_TYPE_ICONS[type];
  }
  return STONE_SHAPE_ICONS[shape] || STONE_TYPE_ICONS[type];
}
