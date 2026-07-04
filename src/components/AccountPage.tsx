import { type FC } from 'react';
import type { Layout, AccountData } from '../types/layout';
import { Block } from './Block';

interface AccountPageProps {
  layout: Layout;
  accountData: AccountData;
  onFieldUpdate: (fieldId: string, newValue: string | number | boolean) => Promise<void>;
}

export const AccountPage: FC<AccountPageProps> = ({ layout, accountData, onFieldUpdate }) => {
  return (
    <div className="account-page">
      <div className="account-container">
        <div className="account-grid">
          {layout.blocks.map((block) => (
            <Block 
              key={block.id} 
              block={block} 
              accountId={accountData.id}
              accountData={accountData}
              onFieldUpdate={onFieldUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
