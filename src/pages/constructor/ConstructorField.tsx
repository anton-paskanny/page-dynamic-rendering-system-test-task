import type { CSSProperties, FC } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Field } from '../../types/layout';

interface ConstructorFieldRowProps {
  field: Field;
  blockId: string;
  onToggleHidden: () => void;
}

export const ConstructorFieldRow: FC<ConstructorFieldRowProps> = ({ field, blockId, onToggleHidden }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    data: { type: 'field', blockId },
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`constructor-field-row${field.hidden ? ' hidden-item' : ''}`}
    >
      <span className="drag-handle" {...attributes} {...listeners} aria-label={`Drag ${field.label}`}>
        ⠿
      </span>
      <span className="constructor-field-label">{field.label}</span>
      <span className="constructor-field-type">{field.type}</span>
      <button
        type="button"
        className="visibility-toggle"
        onClick={onToggleHidden}
        title={field.hidden ? 'Show field' : 'Hide field'}
        aria-label={field.hidden ? `Show ${field.label}` : `Hide ${field.label}`}
      >
        {field.hidden ? '🙈' : '👁'}
      </button>
    </div>
  );
};
