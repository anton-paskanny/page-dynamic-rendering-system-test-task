import type { AccountData } from '../../shared/types/layout';

export const DEFAULT_ACCOUNT_ID = '1';

// In-memory storage for account data
const accounts = new Map<string, AccountData>();

// Initialize with mock data
const initializeAccounts = () => {
  const mockAccount: AccountData = {
    id: DEFAULT_ACCOUNT_ID,
    'created-on': '5/25/2024',
    'lead-status': 'New',
    'account-status': 'Real',
    'ftd-exists': 'Yes',
    'ftd-date': '09/12/2024',
    'ftd-amount': '$250',
    'assigned-agent': 'Camila Oliveria',
    'documents-supplied': 'No',
    'affiliate': 'Google Ads',
    'sub-affiliate': 'SEO',
    'tag': 'Tex Pex',
    'tag1': '--',
    'aff-transaction-id': 18,
    'ip': '2822:14d:12b2:13a1:adbd:2f27:15c9:1z28',
    'utm-campaign': 'NovemberSale',
    'utm-source': 'ib48',
    'first-name': 'Adam',
    'last-name': 'Nelson',
    'country': 'Spain',
    'language': 'Spanish',
    'date-of-birth': '05/06/1993',
    'age': 32,
    'email': 'example_email@gmail.com',
    'phone1-country-code': '+352',
    'phone1-area-code': '128',
    'primary-phone': '66458454',
    'secondary-phone': '************',
    'mobile-phone': '849785121'
  };
  
  accounts.set(DEFAULT_ACCOUNT_ID, mockAccount);
};

// Initialize accounts on module load
initializeAccounts();

export const getAccountData = (id: string): AccountData | undefined => {
  return accounts.get(id);
};

export const updateAccountData = (id: string, updates: Partial<AccountData>): AccountData | undefined => {
  const account = accounts.get(id);
  if (!account) {
    return undefined;
  }

  // Create a new account object with updates
  const updatedAccount: AccountData = {
    ...account,
    ...updates,
    id // Ensure ID cannot be changed
  };

  // Store the updated account
  accounts.set(id, updatedAccount);

  return updatedAccount;
};
