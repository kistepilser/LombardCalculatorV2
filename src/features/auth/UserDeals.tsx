import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store';
import { GlassCard } from '@/shared/ui';
import styles from './Panels.module.css';

export const UserDeals: React.FC = () => {
  const { currentUser, deals } = useAuthStore();
  const [tab, setTab] = useState<'all' | 'completed' | 'not'>('all');

  const userDeals = useMemo(() => {
    if (!currentUser) return [];
    return deals.filter((d) => d.createdBy === currentUser.username);
  }, [deals, currentUser]);

  const filteredDeals = useMemo(() => {
    if (tab === 'completed') return userDeals.filter((d) => d.completed);
    if (tab === 'not') return userDeals.filter((d) => !d.completed);
    return userDeals;
  }, [userDeals, tab]);

  const totalCompleted = userDeals.filter((d) => d.completed).length;
  const totalNotCompleted = userDeals.filter((d) => !d.completed).length;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className={styles.panel}>
      <GlassCard>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>📋 Мои сделки</span>
          <div className={styles.tabs}>
            <button
              className={tab === 'all' ? styles.tabActive : styles.tab}
              onClick={() => setTab('all')}
            >
              Все ({userDeals.length})
            </button>
            <button
              className={tab === 'completed' ? styles.tabActive : styles.tab}
              onClick={() => setTab('completed')}
            >
              ✓ Совершённые ({totalCompleted})
            </button>
            <button
              className={tab === 'not' ? styles.tabActive : styles.tab}
              onClick={() => setTab('not')}
            >
              ✗ Несовершённые ({totalNotCompleted})
            </button>
          </div>
        </div>

        {filteredDeals.length === 0 ? (
          <div className={styles.emptyState}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
            <p>
              {tab === 'all'
                ? 'Сделок пока нет. Сделайте расчёт и сохраните результат.'
                : tab === 'completed'
                  ? 'Нет совершённых сделок'
                  : 'Нет несовершённых сделок'}
            </p>
          </div>
        ) : (
          filteredDeals.map((deal) => (
            <div key={deal.id} className={styles.dealCard}>
              <div className={styles.dealHeader}>
                <span className={styles.dealType}>
                  {deal.operation} — {deal.itemType}
                </span>
                <span className={`${styles.dealBadge} ${deal.completed ? styles.badgeCompleted : styles.badgeNotCompleted}`}>
                  {deal.completed ? '✓ Совершена' : '✗ Не совершена'}
                </span>
              </div>
              <div className={styles.dealInfo}>
                <span>Вес: {deal.totalWeight}</span>
                <span>Проба: {deal.purity}</span>
                <span>Чист.: {deal.netWeight}</span>
              </div>
              <div className={styles.dealAmount}>
                {deal.totalAmount.toLocaleString('ru-RU')} ₽
              </div>
              <div className={styles.dealDate}>{formatDate(deal.date)}</div>
            </div>
          ))
        )}
      </GlassCard>
    </div>
  );
};
