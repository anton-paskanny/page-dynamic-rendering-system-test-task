import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { AccountPage } from '../components/AccountPage';
import { LayoutService } from '../services/LayoutService';
import { AccountService } from '../services/AccountService';
import { formatError } from '../utils/errorHandler';
import { DEFAULT_ACCOUNT_ID } from '../../shared/constants/account';
import type { Layout, AccountData, Field } from '../types/layout';

export const AccountPageRoute = () => {
  const [layout, setLayout] = useState<Layout | null>(null);
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guards against React StrictMode's intentional double-invoke of effects in
  // development, which would otherwise fetch twice and show two success toasts.
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Show loading toast
        const loadingToast = toast.loading('Loading account data...');

        // Fetch both layout and account data in parallel
        const [layoutData, accountData] = await Promise.all([
          LayoutService.getAccountLayout(),
          AccountService.getAccount(DEFAULT_ACCOUNT_ID)
        ]);

        setLayout(layoutData);
        setAccountData(accountData);

        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success('Account data loaded successfully!');
      } catch (err) {
        // Use the shared error handling helper
        const errorMessage = formatError(err, 'Failed to load data');

        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFieldUpdate = async (field: Field, newValue: string | number | boolean) => {
    if (!accountData) {
      return;
    }

    const previousValue = accountData[field.id];

    // Optimistic update - the UI reflects the change before the server confirms it
    setAccountData(prev => (prev ? { ...prev, [field.id]: newValue } : prev));

    const loadingToast = toast.loading(`Saving ${field.label}...`);

    try {
      const updatedAccount = await AccountService.updateAccount(accountData.id, { [field.id]: newValue });
      setAccountData(updatedAccount);
      toast.success(`${field.label} updated successfully!`);
    } catch (err) {
      // Roll back to the previous value on failure
      setAccountData(prev => (prev ? { ...prev, [field.id]: previousValue } : prev));
      toast.error(formatError(err, `Failed to update ${field.label}`));
    } finally {
      toast.dismiss(loadingToast);
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
    <AccountPage
      layout={layout}
      accountData={accountData}
      onFieldUpdate={handleFieldUpdate}
    />
  );
};
