import './App.css'
import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { AccountPage } from './components/AccountPage';
import { LayoutService } from './services/LayoutService';
import { AccountService } from './services/AccountService';
import { extractErrorMessage } from './utils/errorHandler';
import type { Layout, AccountData } from './types/layout';

export default function App() {
  const [layout, setLayout] = useState<Layout | null>(null);
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Show loading toast
        const loadingToast = toast.loading('Loading account data...');

        // Fetch both layout and account data in parallel
        const [layoutData, accountData] = await Promise.all([
          LayoutService.getAccountLayout(),
          AccountService.getAccount('1')
        ]);

        setLayout(layoutData);
        setAccountData(accountData);
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success('Account data loaded successfully!');
      } catch (err) {
        // Use the shared error handling helper
        const errorMessage = extractErrorMessage(err, 'Failed to load data');
        
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFieldUpdate = async (fieldId: string, newValue: string | number | boolean) => {
    if (accountData) {
      // Optimistic update
      setAccountData(prev => prev ? { ...prev, [fieldId]: newValue } : null);

      try {
        // Refresh account data from backend to ensure consistency
        const refreshedAccountData = await AccountService.getAccount('1');
        setAccountData(refreshedAccountData);
      } catch (err) {
        console.error('Failed to refresh account data:', err);
        // If refresh fails, we keep the optimistic update
        // The user will see their change, but it might not be fully synced
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading account data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => {
          toast.loading('Retrying...');
          window.location.reload();
        }}>Retry</button>
      </div>
    );
  }

  if (!layout || !accountData) {
    return (
      <div className="error-container">
        <h2>No Data</h2>
        <p>Unable to load account data.</p>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <AccountPage
        layout={layout}
        accountData={accountData}
        onFieldUpdate={handleFieldUpdate}
      />
    </>
  );
}
