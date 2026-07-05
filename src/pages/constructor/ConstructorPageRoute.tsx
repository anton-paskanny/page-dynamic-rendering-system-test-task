import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { CollisionDetection, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { LayoutService } from '../../services/LayoutService';
import { formatError } from '../../utils/errorHandler';
import type { Block, Field, Layout } from '../../types/layout';
import { FieldType } from '../../types/layout';
import { ConstructorBlock } from './ConstructorBlock';
import type { NewFieldDraft } from './AddFieldForm';
import { blockFieldsContainerId, generateFieldId } from './idUtils';
import './constructor.css';

type ActiveDrag =
  | { type: 'block'; block: Block }
  | { type: 'field'; field: Field };

const findBlockIndexByFieldId = (blocks: Block[], fieldId: string): number =>
  blocks.findIndex((block) => block.fields.some((field) => field.id === fieldId));

const findBlockIndexByContainerId = (blocks: Block[], containerId: string): number =>
  blocks.findIndex((block) => blockFieldsContainerId(block.id) === containerId);

// Blocks and fields are both sortable items in the same DndContext, so the default
// closestCenter would happily match a field row as the "over" target while dragging a
// block (and vice versa). Restrict collision candidates to same-kind targets so a
// block drag only ever resolves against other blocks, and a field drag only against
// other fields / block containers.
const collisionDetectionForActiveType: CollisionDetection = (args) => {
  const activeType = args.active.data.current?.type;

  const droppableContainers = args.droppableContainers.filter((container) => {
    const containerType = container.data.current?.type;
    if (activeType === 'block') {
      return containerType === 'block';
    }
    return containerType === 'field' || containerType === 'block-container';
  });

  return closestCenter({ ...args, droppableContainers });
};

const defaultValueFor = (draft: NewFieldDraft): string | number | boolean => {
  if (draft.type === FieldType.NUMBER) return 0;
  if (draft.type === FieldType.BOOLEAN) return false;
  if (draft.type === FieldType.SELECT) return draft.options?.[0] ?? '';
  return '';
};

export const ConstructorPageRoute = () => {
  const [layout, setLayout] = useState<Layout | null>(null);
  const [savedLayout, setSavedLayout] = useState<Layout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);

  // Guards against React StrictMode's intentional double-invoke of effects in
  // development, which would otherwise fetch the layout twice.
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    const fetchLayout = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await LayoutService.getAccountLayout();
        setLayout(data);
        setSavedLayout(data);
      } catch (err) {
        setError(formatError(err, 'Failed to load layout'));
      } finally {
        setLoading(false);
      }
    };

    fetchLayout();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const isDirty = layout !== null && savedLayout !== null && JSON.stringify(layout) !== JSON.stringify(savedLayout);

  const updateBlocks = useCallback((updater: (blocks: Block[]) => Block[]) => {
    setLayout((prev) => (prev ? { ...prev, blocks: updater(prev.blocks) } : prev));
  }, []);

  const handleRenameBlock = (blockId: string, title: string) => {
    updateBlocks((blocks) => blocks.map((block) => (block.id === blockId ? { ...block, title } : block)));
  };

  const handleToggleBlockHidden = (blockId: string) => {
    updateBlocks((blocks) =>
      blocks.map((block) => (block.id === blockId ? { ...block, hidden: !block.hidden } : block))
    );
  };

  const handleToggleFieldHidden = (blockId: string, fieldId: string) => {
    updateBlocks((blocks) =>
      blocks.map((block) =>
        block.id !== blockId
          ? block
          : {
              ...block,
              fields: block.fields.map((field) =>
                field.id === fieldId ? { ...field, hidden: !field.hidden } : field
              ),
            }
      )
    );
  };

  const handleAddField = (blockId: string, draft: NewFieldDraft) => {
    if (!layout) return;

    const newField: Field = {
      id: generateFieldId(draft.label, layout),
      label: draft.label,
      type: draft.type,
      value: defaultValueFor(draft),
      editable: draft.editable,
      required: draft.required,
      ...(draft.options ? { options: draft.options } : {}),
    };

    updateBlocks((blocks) =>
      blocks.map((block) => (block.id === blockId ? { ...block, fields: [...block.fields, newField] } : block))
    );
  };

  const handleSave = async () => {
    if (!layout) return;

    setSaving(true);
    const loadingToast = toast.loading('Saving layout...');

    try {
      const updated = await LayoutService.updateAccountLayout(layout);
      setLayout(updated);
      setSavedLayout(updated);
      toast.success('Layout saved successfully!');
    } catch (err) {
      toast.error(formatError(err, 'Failed to save layout'));
    } finally {
      toast.dismiss(loadingToast);
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setLayout(savedLayout);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (!layout || !data) return;

    if (data.type === 'block') {
      const block = layout.blocks.find((b) => b.id === event.active.id);
      if (block) setActiveDrag({ type: 'block', block });
    } else if (data.type === 'field') {
      const blockIndex = findBlockIndexByFieldId(layout.blocks, String(event.active.id));
      const field = blockIndex >= 0
        ? layout.blocks[blockIndex].fields.find((f) => f.id === event.active.id)
        : undefined;
      if (field) setActiveDrag({ type: 'field', field });
    }
  };

  // Live-moves a dragged field into the block it's currently hovering over so the
  // preview reflects where it will land; final in-block order is settled in onDragEnd.
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.data.current?.type !== 'field') return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    setLayout((prev) => {
      if (!prev) return prev;

      const sourceBlockIndex = findBlockIndexByFieldId(prev.blocks, activeId);
      const overFieldBlockIndex = findBlockIndexByFieldId(prev.blocks, overId);
      const destBlockIndex = overFieldBlockIndex >= 0
        ? overFieldBlockIndex
        : findBlockIndexByContainerId(prev.blocks, overId);

      if (sourceBlockIndex < 0 || destBlockIndex < 0 || sourceBlockIndex === destBlockIndex) {
        return prev;
      }

      const blocks = prev.blocks.map((block) => ({ ...block, fields: [...block.fields] }));
      const sourceFields = blocks[sourceBlockIndex].fields;
      const activeIndex = sourceFields.findIndex((field) => field.id === activeId);
      const [movedField] = sourceFields.splice(activeIndex, 1);

      const destFields = blocks[destBlockIndex].fields;
      const overIndex = destFields.findIndex((field) => field.id === overId);
      destFields.splice(overIndex >= 0 ? overIndex : destFields.length, 0, movedField);

      return { ...prev, blocks };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDrag(null);
    if (!over || !layout) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (active.data.current?.type === 'block') {
      if (activeId === overId) return;
      const oldIndex = layout.blocks.findIndex((block) => block.id === activeId);
      const newIndex = layout.blocks.findIndex((block) => block.id === overId);
      if (oldIndex < 0 || newIndex < 0) return;
      setLayout({ ...layout, blocks: arrayMove(layout.blocks, oldIndex, newIndex) });
      return;
    }

    if (active.data.current?.type === 'field') {
      const blockIndex = findBlockIndexByFieldId(layout.blocks, activeId);
      if (blockIndex < 0) return;

      const fields = layout.blocks[blockIndex].fields;
      const oldIndex = fields.findIndex((field) => field.id === activeId);
      const newIndex = fields.findIndex((field) => field.id === overId);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

      const reordered = arrayMove(fields, oldIndex, newIndex);
      const blocks = layout.blocks.map((block, index) =>
        index === blockIndex ? { ...block, fields: reordered } : block
      );
      setLayout({ ...layout, blocks });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading layout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="error-container">
        <h2>No Data</h2>
        <p>Unable to load the layout.</p>
      </div>
    );
  }

  return (
    <div className="constructor-page">
      <div className="constructor-toolbar">
        <h1>Layout Constructor</h1>
        <div className="constructor-toolbar-actions">
          <button type="button" className="cancel-btn" onClick={handleDiscard} disabled={!isDirty || saving}>
            Discard Changes
          </button>
          <button type="button" className="save-btn" onClick={handleSave} disabled={!isDirty || saving}>
            {saving ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionForActiveType}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* rectSortingStrategy (not verticalListSortingStrategy) because blocks render in a
            2-column CSS grid - the vertical strategy only ever computes a Y offset and can't
            represent moving between columns in the same row. */}
        <SortableContext items={layout.blocks.map((block) => block.id)} strategy={rectSortingStrategy}>
          <div className="constructor-grid">
            {layout.blocks.map((block) => (
              <ConstructorBlock
                key={block.id}
                block={block}
                onRename={(title) => handleRenameBlock(block.id, title)}
                onToggleHidden={() => handleToggleBlockHidden(block.id)}
                onToggleFieldHidden={(fieldId) => handleToggleFieldHidden(block.id, fieldId)}
                onAddField={(draft) => handleAddField(block.id, draft)}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeDrag?.type === 'block' && (
            <div className="card constructor-card drag-overlay-card">{activeDrag.block.title}</div>
          )}
          {activeDrag?.type === 'field' && (
            <div className="constructor-field-row drag-overlay-row">{activeDrag.field.label}</div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
