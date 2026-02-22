import React from 'react';
import styles from './GlassCard.module.css';

interface GlassCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, title, className = '', style }) => (
  <div className={`${styles.panel} ${className}`} style={style}>
    {title && <h1 className={styles.title}>{title}</h1>}
    {children}
  </div>
);
