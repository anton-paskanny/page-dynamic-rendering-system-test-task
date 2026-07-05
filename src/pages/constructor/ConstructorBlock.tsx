import { useState, type CSSProperties, type FC } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Block } from '../../types/layout';
import { BlockColor } from '../../types/layout';
import { ConstructorFieldRow } from './ConstructorField';
import { AddFieldForm, type NewFieldDraft } from './AddFieldForm';
import { blockFieldsContainerId } from './idUtils';

interface ConstructorBlockProps {
  block: Block;
  onRename: (title: string) => void;
  onToggleHidden: () => void;
  onToggleFieldHidden: (fieldId: string) => void;
  onAddField: (draft: NewFieldDraft) => void;
}

const DOT_CLASS_BY_COLOR: Record<BlockColor, string> = {
  [BlockColor.ORANGE]: 'dot-orange',
  [BlockColor.GREEN]: 'dot-green',
  [BlockColor.SLATE]: 'dot-slate',
  [BlockColor.BLUE]: 'dot-blue',
};

export const ConstructorBlock: FC<ConstructorBlockProps> = ({
  block,
  onRename,
  onToggleHidden,
  onToggleFieldHidden,
  onAddField,
}) => {
  const [isAddingField, setIsAddingField] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: { type: 'block' },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: blockFieldsContainerId(block.id),
    data: { type: 'block-container', blockId: block.id },
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={`card constructor-card${block.hidden ? ' hidden-item' : ''}`}
    >
      <header className="card-header constructor-block-header">
        <span className="drag-handle" {...attributes} {...listeners} aria-label={`Drag ${block.title}`}>
          ⠿
        </span>
        <span className={`dot ${DOT_CLASS_BY_COLOR[block.color]}`} />
        <input
          type="text"
          className="constructor-block-title-input"
          value={block.title}
          onChange={(e) => onRename(e.target.value)}
          aria-label="Block title"
        />
        <button
          type="button"
          className="visibility-toggle"
          onClick={onToggleHidden}
          title={block.hidden ? 'Show block' : 'Hide block'}
          aria-label={block.hidden ? `Show ${block.title}` : `Hide ${block.title}`}
        >
          {block.hidden ? '🙈' : '👁'}
        </button>
      </header>
      <div className="card-content">
        <SortableContext items={block.fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
          <div ref={setDroppableRef} className="constructor-field-list">
            {block.fields.map((field) => (
              <ConstructorFieldRow
                key={field.id}
                field={field}
                blockId={block.id}
                onToggleHidden={() => onToggleFieldHidden(field.id)}
              />
            ))}
          </div>
        </SortableContext>

        {isAddingField ? (
          <AddFieldForm
            onAdd={(draft) => {
              onAddField(draft);
              setIsAddingField(false);
            }}
            onCancel={() => setIsAddingField(false)}
          />
        ) : (
          <button type="button" className="add-field-trigger" onClick={() => setIsAddingField(true)}>
            + Add field
          </button>
        )}
      </div>
    </section>
  );
};
