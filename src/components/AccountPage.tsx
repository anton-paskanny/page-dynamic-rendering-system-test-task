import { type FC } from 'react';
import type { Layout, AccountData, Field } from '../types/layout';
import { Block } from './Block';

interface AccountPageProps {
  layout: Layout;
  accountData: AccountData;
  onFieldUpdate: (field: Field, newValue: string | number | boolean) => Promise<void>;
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
              accountData={accountData}
              onFieldUpdate={onFieldUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
