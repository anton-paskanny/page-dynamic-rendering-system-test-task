import { useState, type FC, type FormEvent } from 'react';
import { FieldType } from '../../types/layout';

export interface NewFieldDraft {
  label: string;
  type: FieldType;
  options?: string[];
  editable: boolean;
  required: boolean;
}

interface AddFieldFormProps {
  onAdd: (draft: NewFieldDraft) => void;
  onCancel: () => void;
}

export const AddFieldForm: FC<AddFieldFormProps> = ({ onAdd, onCancel }) => {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<FieldType>(FieldType.STRING);
  const [optionsText, setOptionsText] = useState('');
  const [editable, setEditable] = useState(true);
  const [required, setRequired] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      return;
    }

    const options = type === FieldType.SELECT
      ? optionsText.split(',').map((option) => option.trim()).filter(Boolean)
      : undefined;

    if (type === FieldType.SELECT && (!options || options.length === 0)) {
      return;
    }

    onAdd({ label: trimmedLabel, type, options, editable, required });
  };

  return (
    <form className="add-field-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Field label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        aria-label="New field label"
        autoFocus
      />
      <select value={type} onChange={(e) => setType(e.target.value as FieldType)} aria-label="New field type">
        <option value={FieldType.STRING}>String</option>
        <option value={FieldType.NUMBER}>Number</option>
        <option value={FieldType.BOOLEAN}>Boolean</option>
        <option value={FieldType.SELECT}>Select</option>
      </select>
      {type === FieldType.SELECT && (
        <input
          type="text"
          placeholder="Options, comma-separated"
          value={optionsText}
          onChange={(e) => setOptionsText(e.target.value)}
          aria-label="New field options"
        />
      )}
      <label className="add-field-checkbox">
        <input type="checkbox" checked={editable} onChange={(e) => setEditable(e.target.checked)} />
        Editable
      </label>
      <label className="add-field-checkbox">
        <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
        Required
      </label>
      <div className="add-field-actions">
        <button type="submit" className="save-btn">Add</button>
        <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};
