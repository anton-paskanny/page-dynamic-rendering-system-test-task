import { useState, useRef, useEffect, type FC } from 'react';
import type { Field } from '../types/layout';
import { FieldType } from '../types/layout';

interface EditableFieldProps {
  field: Field;
  currentValue: string | number | boolean;
  onSave: (field: Field, newValue: string | number | boolean) => Promise<void>;
}

export const EditableField: FC<EditableFieldProps> = ({ field, currentValue, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string | number | boolean>(currentValue);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  // Update editValue when currentValue changes (from parent updates, including rollback)
  useEffect(() => {
    setEditValue(currentValue);
  }, [currentValue]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (field.editable) {
      setIsEditing(true);
      setEditValue(currentValue);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(currentValue);
  };

  const isEmpty = editValue === '' || (typeof editValue === 'string' && editValue.trim() === '');

  const handleSave = () => {
    if (editValue === currentValue || isEmpty) {
      setIsEditing(false);
      return;
    }

    // Optimistic: leave edit mode immediately: parent updates state right away and
    // rolls it back (which flows back in as `currentValue`) if the save fails.
    setIsEditing(false);
    void onSave(field, editValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!field.editable) {
    return (
      <div className="info-row">
        <span className="label">{field.label}</span>
        <span className="value">{currentValue}</span>
      </div>
    );
  }

  if (isEditing) {
    const stringValue = typeof editValue === 'string' ? editValue : String(editValue);
    const numberValue = typeof editValue === 'number' ? editValue : Number(editValue);

    return (
      <div className="info-row editing">
        <label htmlFor={`field-${field.id}`} className="label">{field.label}</label>
        <div className="edit-controls">
          {field.type === FieldType.SELECT && field.options ? (
            <select
              id={`field-${field.id}`}
              name={field.id}
              ref={inputRef as React.RefObject<HTMLSelectElement>}
              value={stringValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label={`Edit ${field.label}`}
            >
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : field.type === FieldType.NUMBER ? (
            <input
              id={`field-${field.id}`}
              name={field.id}
              type="number"
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={numberValue}
              onChange={(e) => setEditValue(Number(e.target.value))}
              onKeyDown={handleKeyDown}
              aria-label={`Edit ${field.label}`}
            />
          ) : (
            <input
              id={`field-${field.id}`}
              name={field.id}
              type="text"
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={stringValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label={`Edit ${field.label}`}
            />
          )}

          <div className="edit-actions">
            <button
              id={`save-${field.id}`}
              type="button"
              className="save-btn"
              onClick={handleSave}
              disabled={isEmpty}
              title={isEmpty ? "Cannot save empty value" : "Save"}
              aria-label={`Save changes to ${field.label}`}
            >
              ✓
            </button>
            <button
              id={`cancel-${field.id}`}
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              title="Cancel"
              aria-label={`Cancel editing ${field.label}`}
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="info-row clickable" onClick={handleEdit}>
      <span className="label">{field.label}</span>
      <div className="edit-controls">
        <span className="value">{currentValue}</span>
        <span className="edit-indicator">✏️</span>
      </div>
    </div>
  );
};
