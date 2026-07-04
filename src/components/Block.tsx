import React from 'react';
import type { Block as BlockType, AccountData, Field } from '../types/layout';
import { BlockColor } from '../types/layout';
import { EditableField } from './EditableField';

interface BlockProps {
  block: BlockType;
  accountData: AccountData;
  onFieldUpdate: (field: Field, newValue: string | number | boolean) => Promise<void>;
}

export const Block: React.FC<BlockProps> = ({ block, accountData, onFieldUpdate }) => {
  const getDotClass = (color: BlockColor) => {
    switch (color) {
      case BlockColor.ORANGE: return 'dot-orange';
      case BlockColor.GREEN: return 'dot-green';
      case BlockColor.SLATE: return 'dot-slate';
      case BlockColor.BLUE: return 'dot-blue';
      default: return 'dot-slate';
    }
  };

  return (
    <section className="card">
      <header className="card-header">
        <h2 className="card-title">
          <span className={`dot ${getDotClass(block.color)}`} />
          {block.title}
        </h2>
      </header>
      <div className="card-content">
        <div className="info-list">
          {block.fields.map((field, index) => (
            <div key={field.id}>
              <EditableField
                field={field}
                currentValue={accountData[field.id] ?? field.value}
                onSave={onFieldUpdate}
              />
              {index < block.fields.length - 1 && <div className="border-bottom" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
