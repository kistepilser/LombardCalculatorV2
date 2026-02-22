import React, { useState } from 'react';
import { useAuthStore } from '@/store';
import { GlassCard } from '@/shared/ui';
import styles from './LoginPage.module.css';

export const LoginPage: React.FC = () => {
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Заполните все поля');
      return;
    }
    const ok = login(username.trim(), password);
    if (!ok) {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className={styles.container}>
      <GlassCard className={styles.card}>
        <div className={styles.logo}>
          <h1>Ломбардный эксперт</h1>
          <p>Войдите для доступа к калькулятору</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="login-user">Логин</label>
            <input
              type="text"
              id="login-user"
              className={styles.input}
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              placeholder="Введите логин"
              autoComplete="username"
              autoFocus
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="login-pass">Пароль</label>
            <input
              type="password"
              id="login-pass"
              className={styles.input}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Введите пароль"
              autoComplete="current-password"
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.loginBtn}>
            Войти
          </button>
        </form>
      </GlassCard>
    </div>
  );
};
