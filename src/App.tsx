import React, { useState } from 'react';
import { useAuthStore } from '@/store';
import { CalculatorPage } from '@/features/calculator';
import { LoginPage, AdminPanel, UserDeals, AppHeader } from '@/features/auth';
import { FallingJewelry } from '@/shared/ui/FallingJewelry';

const App: React.FC = () => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [showPanel, setShowPanel] = useState(false);

  // Not logged in → show login
  if (!currentUser) {
    return (
      <>
        <FallingJewelry />
        <LoginPage />
      </>
    );
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <>
      <FallingJewelry />
      <AppHeader
        showPanel={showPanel}
        onTogglePanel={() => setShowPanel(!showPanel)}
      />
      {showPanel ? (
        isAdmin ? <AdminPanel /> : <UserDeals />
      ) : (
        <CalculatorPage />
      )}
    </>
  );
};

export default App;
