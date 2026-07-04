import { useState, useRef, useEffect, type FC } from 'react';
import toast from 'react-hot-toast';
import type { Field } from '../types/layout';
import { FieldType } from '../types/layout';
import { AccountService } from '../services/AccountService';
import { handleApiError } from '../utils/errorHandler';

interface EditableFieldProps {
  field: Field;
  accountId: string;
  currentValue: string | number | boolean;
  onUpdate: (fieldId: string, newValue: string | number | boolean) => Promise<void>;
}

export const EditableField: FC<EditableFieldProps> = ({ field, accountId, currentValue, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string | number | boolean>(currentValue);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  // Update editValue when currentValue changes (from parent updates)
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

  const handleSave = async () => {
    // Check if the value is empty or only whitespace
    if (editValue === currentValue || 
        editValue === '' || 
        (typeof editValue === 'string' && editValue.trim() === '')) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);

    let loadingToast: string | null = null;

    try {
      // Show loading toast
      loadingToast = toast.loading(`Saving ${field.label}...`);
      
      // Send update to backend first
      await AccountService.updateAccount(accountId, { [field.id]: editValue });
      
      // If backend update succeeds, update the frontend state
      await onUpdate(field.id, editValue);
      
      toast.success(`${field.label} updated successfully!`);
      
      setIsEditing(false);
    } catch (err) {
      // Use the shared error handling helper
      const errorMessage = handleApiError(err, field.label);
      toast.error(errorMessage);
    } finally {
      // Dismiss loading toast and show success
      if (loadingToast) toast.dismiss(loadingToast);
      setIsSaving(false);
    }
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
    return (
      <div className="info-row editing">
        <label htmlFor={`field-${field.id}`} className="label">{field.label}</label>
        <div className="edit-controls">
          {field.type === FieldType.SELECT && field.options ? (
            <select
              id={`field-${field.id}`}
              name={field.id}
              ref={inputRef as React.RefObject<HTMLSelectElement>}
              value={editValue as string}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
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
              value={editValue as number}
              onChange={(e) => setEditValue(Number(e.target.value))}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              aria-label={`Edit ${field.label}`}
            />
          ) : (
            <input
              id={`field-${field.id}`}
              name={field.id}
              type="text"
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={editValue as string}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              aria-label={`Edit ${field.label}`}
            />
          )}
          
          <div className="edit-actions">
            <button
              id={`save-${field.id}`}
              type="button"
              className="save-btn"
              onClick={handleSave}
              disabled={isSaving || 
                       editValue === '' || 
                       (typeof editValue === 'string' && editValue.trim() === '')}
              title={editValue === '' || (typeof editValue === 'string' && editValue.trim() === '') 
                     ? "Cannot save empty value" 
                     : "Save"}
              aria-label={`Save changes to ${field.label}`}
            >
              {isSaving ? '...' : '✓'}
            </button>
            <button
              id={`cancel-${field.id}`}
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              disabled={isSaving}
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
