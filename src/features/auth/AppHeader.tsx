import React from 'react';
import { useAuthStore, ROLE_LABELS } from '@/store';
import type { UserRole } from '@/store';
import styles from './Panels.module.css';

// Role SVG icons (inline, small)
const RoleIconSmall: React.FC<{ role: UserRole }> = ({ role }) => {
  const s = 12;
  const icons: Record<UserRole, React.ReactNode> = {
    admin: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26z" />
      </svg>
    ),
    user: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    tovaroved: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5z" />
        <circle cx="6" cy="9" r="1" fill="currentColor" />
      </svg>
    ),
    division: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a4 4 0 0 0-8 0v2" />
      </svg>
    ),
  };
  return <>{icons[role]}</>;
};

const ROLE_STYLE_MAP: Record<UserRole, string> = {
  admin: styles.roleAdmin,
  user: styles.roleUser,
  tovaroved: styles.roleTovaroved,
  division: styles.roleDivision,
};

interface AppHeaderProps {
  showPanel: boolean;
  onTogglePanel: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ showPanel, onTogglePanel }) => {
  const { currentUser, logout } = useAuthStore();
  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';
  const initial = currentUser.username.charAt(0).toUpperCase();

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <span className={styles.headerTitle}>Ломбардный эксперт</span>
      </div>
      <div className={styles.headerUser}>
        <div className={styles.avatarBadge}>{initial}</div>
        <span>{currentUser.username}</span>
        <span className={`${styles.roleBadge} ${ROLE_STYLE_MAP[currentUser.role] || styles.roleUser}`}>
          <RoleIconSmall role={currentUser.role} />
          {ROLE_LABELS[currentUser.role]}
        </span>
        <button className={styles.btnPanel} onClick={onTogglePanel}>
          {showPanel ? '🔙 Калькулятор' : isAdmin ? '👥 Пользователи' : '📋 Сделки'}
        </button>
        <button className={styles.btnLogout} onClick={logout}>
          Выход
        </button>
      </div>
    </div>
  );
};
