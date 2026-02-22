import React, { useState } from 'react';
import { useAuthStore, ROLE_LABELS } from '@/store';
import type { UserRole } from '@/store';
import { GlassCard, Modal } from '@/shared/ui';
import styles from './Panels.module.css';
import modalStyles from '../../shared/ui/Modal/Modal.module.css';

// ─── Role SVG Icons ─────────────────────────

const RoleIcon: React.FC<{ role: UserRole; size?: number }> = ({ role, size = 14 }) => {
  const icons: Record<UserRole, React.ReactNode> = {
    admin: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26z" />
      </svg>
    ),
    user: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    tovaroved: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5z" />
        <circle cx="6" cy="9" r="1" fill="currentColor" />
        <path d="M15 5l4 4-5.71 5.71" />
      </svg>
    ),
    division: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a4 4 0 0 0-8 0v2" />
        <circle cx="12" cy="14" r="2" />
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

const ALL_ROLES: UserRole[] = ['admin', 'user', 'tovaroved', 'division'];

// ─── Admin Panel ────────────────────────────

export const AdminPanel: React.FC = () => {
  const { users, addUser, removeUser, changePassword, deals } = useAuthStore();

  // Add form
  const [newName, setNewName] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [newGroup, setNewGroup] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Password modal
  const [passTarget, setPassTarget] = useState<string | null>(null);
  const [newPassValue, setNewPassValue] = useState('');
  const [passMsg, setPassMsg] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPass.trim()) {
      setMsg({ type: 'err', text: 'Заполните все поля' });
      return;
    }
    const ok = addUser(newName.trim(), newPass, newRole, newGroup.trim() || undefined);
    if (ok) {
      setMsg({ type: 'ok', text: `Пользователь "${newName}" добавлен` });
      setNewName(''); setNewPass(''); setNewRole('user'); setNewGroup('');
    } else {
      setMsg({ type: 'err', text: 'Такой логин уже существует' });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      removeUser(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const confirmChangePass = () => {
    if (passTarget && newPassValue.trim()) {
      changePassword(passTarget, newPassValue.trim());
      setPassMsg('✓ Пароль изменён');
      setNewPassValue('');
      setTimeout(() => { setPassMsg(null); setPassTarget(null); }, 1500);
    }
  };

  const countDeals = (username: string) => {
    const userDeals = deals.filter((d) => d.createdBy === username);
    return {
      total: userDeals.length,
      completed: userDeals.filter((d) => d.completed).length,
      notCompleted: userDeals.filter((d) => !d.completed).length,
    };
  };

  return (
    <div className={styles.panel}>
      <GlassCard>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>👥 Пользователи</span>
        </div>

        {/* Add user form */}
        <form className={styles.addForm} onSubmit={handleAdd}>
          <input type="text" className={styles.addInput} placeholder="Логин"
            value={newName} onChange={(e) => setNewName(e.target.value)} />
          <input type="password" className={styles.addInput} placeholder="Пароль"
            value={newPass} onChange={(e) => setNewPass(e.target.value)} />
          <select className={styles.addSelect} value={newRole}
            onChange={(e) => setNewRole(e.target.value as UserRole)}>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
          <input type="text" className={styles.addInput} placeholder="Группа (опц.)"
            value={newGroup} onChange={(e) => setNewGroup(e.target.value)}
            style={{ maxWidth: 140 }} />
          <button type="submit" className={styles.btnAdd}>+ Добавить</button>
        </form>

        {msg && (
          <div className={msg.type === 'ok' ? styles.successMsg : styles.errorMsg}>{msg.text}</div>
        )}

        {/* Users table */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Логин</th>
              <th>Роль</th>
              <th>Группа</th>
              <th>Сделки</th>
              <th>✓</th>
              <th>✗</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const dc = countDeals(u.username);
              return (
                <tr key={u.username}>
                  <td style={{ fontWeight: 700 }}>{u.username}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${ROLE_STYLE_MAP[u.role] || styles.roleUser}`}>
                      <RoleIcon role={u.role} />
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.group || '—'}</td>
                  <td>{dc.total}</td>
                  <td style={{ color: 'var(--success)' }}>{dc.completed}</td>
                  <td style={{ color: 'var(--danger)' }}>{dc.notCompleted}</td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className={styles.btnEdit} onClick={() => { setPassTarget(u.username); setNewPassValue(''); setPassMsg(null); }}>
                        🔑
                      </button>
                      {u.username !== 'Admin' && (
                        <button className={styles.btnDanger} onClick={() => setDeleteTarget(u.username)}>
                          ✕
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GlassCard>

      {/* Delete confirmation modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Удаление пользователя">
        <p className={modalStyles.modalText}>
          Вы уверены, что хотите удалить пользователя <span className={modalStyles.modalTextBold}>"{deleteTarget}"</span>?
          <br />Все его сделки будут сохранены.
        </p>
        <div className={modalStyles.modalBtns}>
          <button className={modalStyles.modalBtnCancel} onClick={() => setDeleteTarget(null)}>Отмена</button>
          <button className={modalStyles.modalBtnDanger} onClick={confirmDelete}>Удалить</button>
        </div>
      </Modal>

      {/* Password change modal */}
      <Modal open={!!passTarget} onClose={() => setPassTarget(null)} title="Смена пароля">
        {passMsg ? (
          <div className={styles.successMsg}>{passMsg}</div>
        ) : (
          <>
            <p className={modalStyles.modalText}>
              Новый пароль для <span className={modalStyles.modalTextBold}>"{passTarget}"</span>
            </p>
            <input
              type="password"
              className={modalStyles.modalInput}
              placeholder="Введите новый пароль"
              value={newPassValue}
              onChange={(e) => setNewPassValue(e.target.value)}
              autoFocus
            />
            <div className={modalStyles.modalBtns}>
              <button className={modalStyles.modalBtnCancel} onClick={() => setPassTarget(null)}>Отмена</button>
              <button className={modalStyles.modalBtnPrimary} onClick={confirmChangePass}>Сохранить</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};
