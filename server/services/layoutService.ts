import type { Layout } from '../../shared/types/layout';
import { BlockColor, FieldType } from '../../shared/types/layout';
import { DEFAULT_ACCOUNT_ID } from '../../shared/constants/account';
import { getAccountData } from './accountService';

type LayoutType = 'account';

// In-memory storage for layouts
const layouts = new Map<LayoutType, Layout>();

// Initialize with mock layouts
const initializeLayouts = () => {
  // Field defaults are sourced from the mock account record so the layout and
  // account data can't drift out of sync with each other.
  const defaults = getAccountData(DEFAULT_ACCOUNT_ID);
  if (!defaults) {
    throw new Error(`Cannot build account layout: no account found with ID: ${DEFAULT_ACCOUNT_ID}`);
  }

  const accountLayout: Layout = {
    blocks: [
      {
        id: 'general-info',
        title: 'General Information',
        color: BlockColor.ORANGE,
        fields: [
          { id: 'created-on', label: 'Created On', value: defaults['created-on'], type: FieldType.STRING, editable: false },
          { id: 'lead-status', label: 'Lead Status', value: defaults['lead-status'], type: FieldType.SELECT, options: ['New', 'Qualified', 'Proposal', 'Negotiation', 'Closed'], editable: true },
          { id: 'account-status', label: 'Account Status', value: defaults['account-status'], type: FieldType.SELECT, options: ['Real', 'Demo', 'Test'], editable: true },
          { id: 'ftd-exists', label: 'FTD Exists', value: defaults['ftd-exists'], type: FieldType.BOOLEAN, editable: false },
          { id: 'ftd-date', label: 'FTD Date', value: defaults['ftd-date'], type: FieldType.STRING, editable: false },
          { id: 'ftd-amount', label: 'FTD Amount', value: defaults['ftd-amount'], type: FieldType.STRING, editable: false },
          { id: 'assigned-agent', label: 'Assigned Agent', value: defaults['assigned-agent'], type: FieldType.STRING, editable: true },
          { id: 'documents-supplied', label: 'Supplied Necessary Documents', value: defaults['documents-supplied'], type: FieldType.BOOLEAN, editable: false }
        ]
      },
      {
        id: 'marketing-data',
        title: 'Marketing Data',
        color: BlockColor.GREEN,
        fields: [
          { id: 'affiliate', label: 'Affiliate', value: defaults['affiliate'], type: FieldType.STRING, editable: true },
          { id: 'sub-affiliate', label: 'Sub-Affiliate', value: defaults['sub-affiliate'], type: FieldType.STRING, editable: true },
          { id: 'tag', label: 'Tag', value: defaults['tag'], type: FieldType.STRING, editable: true },
          { id: 'tag1', label: 'Tag1', value: defaults['tag1'], type: FieldType.STRING, editable: true },
          { id: 'aff-transaction-id', label: 'Aff Transaction ID', value: defaults['aff-transaction-id'], type: FieldType.NUMBER, editable: false },
          { id: 'ip', label: 'IP', value: defaults['ip'], type: FieldType.STRING, editable: false },
          { id: 'utm-campaign', label: 'UtmCampaign', value: defaults['utm-campaign'], type: FieldType.STRING, editable: true },
          { id: 'utm-source', label: 'UTM Source', value: defaults['utm-source'], type: FieldType.STRING, editable: true }
        ]
      },
      {
        id: 'account-info',
        title: 'Account Information',
        color: BlockColor.SLATE,
        fields: [
          { id: 'first-name', label: 'First Name', value: defaults['first-name'], type: FieldType.STRING, editable: true },
          { id: 'last-name', label: 'Last Name', value: defaults['last-name'], type: FieldType.STRING, editable: true },
          { id: 'country', label: 'Country', value: defaults['country'], type: FieldType.SELECT, options: ['Spain', 'USA', 'UK', 'Germany', 'France'], editable: true },
          { id: 'language', label: 'Language', value: defaults['language'], type: FieldType.SELECT, options: ['Spanish', 'English', 'French', 'German'], editable: true },
          { id: 'date-of-birth', label: 'Date of Birth', value: defaults['date-of-birth'], type: FieldType.STRING, editable: false },
          { id: 'age', label: 'Age', value: defaults['age'], type: FieldType.NUMBER, editable: true }
        ]
      },
      {
        id: 'contact-info',
        title: 'Contact Information',
        color: BlockColor.BLUE,
        fields: [
          { id: 'email', label: 'Email', value: defaults['email'], type: FieldType.STRING, editable: true },
          { id: 'phone1-country-code', label: 'Phone 1: Country Code', value: defaults['phone1-country-code'], type: FieldType.STRING, editable: true },
          { id: 'phone1-area-code', label: 'Phone1: Area Code', value: defaults['phone1-area-code'], type: FieldType.STRING, editable: true },
          { id: 'primary-phone', label: 'Primary Phone Number', value: defaults['primary-phone'], type: FieldType.STRING, editable: true },
          { id: 'secondary-phone', label: 'Secondary Phone Number', value: defaults['secondary-phone'], type: FieldType.STRING, editable: true },
          { id: 'mobile-phone', label: 'Mobile Phone Number', value: defaults['mobile-phone'], type: FieldType.STRING, editable: true }
        ]
      }
    ]
  };

  layouts.set('account', accountLayout);
};

// Initialize layouts on module load
initializeLayouts();

export const getLayout = (layoutType: LayoutType): Layout | undefined => {
  return layouts.get(layoutType);
};

// Not yet wired to a route - reserved for the proposed Phase 4 Constructor
// (PUT /api/layouts/account). See Strategy.md.
export const updateLayout = (layoutType: LayoutType, layout: Layout): Layout => {
  layouts.set(layoutType, layout);
  return layout;
};
