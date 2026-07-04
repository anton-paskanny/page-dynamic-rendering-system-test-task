import type { Layout } from '../../shared/types/layout';
import { BlockColor } from '../../shared/types/layout';

// In-memory storage for layouts
const layouts = new Map<string, Layout>();

// Initialize with mock layouts
const initializeLayouts = () => {
  const accountLayout: Layout = {
    blocks: [
      {
        id: 'general-info',
        title: 'General Information',
        color: BlockColor.ORANGE,
        fields: [
          { id: 'created-on', label: 'Created On', value: '5/25/2024', type: 'string', editable: false },
          { id: 'lead-status', label: 'Lead Status', value: 'New', type: 'select', options: ['New', 'Qualified', 'Proposal', 'Negotiation', 'Closed'], editable: true },
          { id: 'account-status', label: 'Account Status', value: 'Real', type: 'select', options: ['Real', 'Demo', 'Test'], editable: true },
          { id: 'ftd-exists', label: 'FTD Exists', value: 'Yes', type: 'boolean', editable: false },
          { id: 'ftd-date', label: 'FTD Date', value: '09/12/2024', type: 'string', editable: false },
          { id: 'ftd-amount', label: 'FTD Amount', value: '$250', type: 'string', editable: false },
          { id: 'assigned-agent', label: 'Assigned Agent', value: 'Camila Oliveria', type: 'string', editable: true },
          { id: 'documents-supplied', label: 'Supplied Necessary Documents', value: 'No', type: 'boolean', editable: false }
        ]
      },
      {
        id: 'marketing-data',
        title: 'Marketing Data',
        color: BlockColor.GREEN,
        fields: [
          { id: 'affiliate', label: 'Affiliate', value: 'Google Ads', type: 'string', editable: true },
          { id: 'sub-affiliate', label: 'Sub-Affiliate', value: 'SEO', type: 'string', editable: true },
          { id: 'tag', label: 'Tag', value: 'Tex Pex', type: 'string', editable: true },
          { id: 'tag1', label: 'Tag1', value: '--', type: 'string', editable: true },
          { id: 'aff-transaction-id', label: 'Aff Transaction ID', value: '18', type: 'number', editable: false },
          { id: 'ip', label: 'IP', value: '2822:14d:12b2:13a1:adbd:2f27:15c9:1z28', type: 'string', editable: false },
          { id: 'utm-campaign', label: 'UtmCampaign', value: 'NovemberSale', type: 'string', editable: true },
          { id: 'utm-source', label: 'UTM Source', value: 'ib48', type: 'string', editable: true }
        ]
      },
      {
        id: 'account-info',
        title: 'Account Information',
        color: BlockColor.SLATE,
        fields: [
          { id: 'first-name', label: 'First Name', value: 'Adam', type: 'string', editable: true },
          { id: 'last-name', label: 'Last Name', value: 'Nelson', type: 'string', editable: true },
          { id: 'country', label: 'Country', value: 'Spain', type: 'select', options: ['Spain', 'USA', 'UK', 'Germany', 'France'], editable: true },
          { id: 'language', label: 'Language', value: 'Spanish', type: 'select', options: ['Spanish', 'English', 'French', 'German'], editable: true },
          { id: 'date-of-birth', label: 'Date of Birth', value: '05/06/1993', type: 'string', editable: false },
          { id: 'age', label: 'Age', value: 32, type: 'number', editable: true }
        ]
      },
      {
        id: 'contact-info',
        title: 'Contact Information',
        color: BlockColor.BLUE,
        fields: [
          { id: 'email', label: 'Email', value: 'example_email@gmail.com', type: 'string', editable: true },
          { id: 'phone1-country-code', label: 'Phone 1: Country Code', value: '+352', type: 'string', editable: true },
          { id: 'phone1-area-code', label: 'Phone1: Area Code', value: '128', type: 'string', editable: true },
          { id: 'primary-phone', label: 'Primary Phone Number', value: '66458454', type: 'string', editable: true },
          { id: 'secondary-phone', label: 'Secondary Phone Number', value: '************', type: 'string', editable: true },
          { id: 'mobile-phone', label: 'Mobile Phone Number', value: '849785121', type: 'string', editable: true }
        ]
      }
    ]
  };
  
  layouts.set('account', accountLayout);
};

// Initialize layouts on module load
initializeLayouts();

export const getLayout = (layoutType: string): Layout | undefined => {
  return layouts.get(layoutType);
};

// Not yet wired to a route - reserved for the proposed Phase 4 Constructor
// (PUT /api/layouts/account). See Strategy.md.
export const updateLayout = (layoutType: string, layout: Layout): Layout => {
  layouts.set(layoutType, layout);
  return layout;
};
