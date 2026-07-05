// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccountPage } from './AccountPage';
import { BlockColor, FieldType, type Layout, type AccountData } from '../types/layout';

const buildLayout = (): Layout => ({
  blocks: [
    {
      id: 'block-a',
      title: 'Block A',
      color: BlockColor.BLUE,
      fields: [
        { id: 'field-1', label: 'Field One', value: 'v1', type: FieldType.STRING, editable: false },
        { id: 'field-2', label: 'Field Two', value: 'v2', type: FieldType.STRING, editable: false },
        { id: 'field-3', label: 'Field Three', value: 'v3', type: FieldType.STRING, editable: false, hidden: true },
      ],
    },
    {
      id: 'block-b',
      title: 'Block B',
      color: BlockColor.GREEN,
      fields: [
        { id: 'field-4', label: 'Field Four', value: 'v4', type: FieldType.STRING, editable: false },
      ],
    },
    {
      id: 'block-c',
      title: 'Block C (hidden)',
      color: BlockColor.SLATE,
      hidden: true,
      fields: [
        { id: 'field-5', label: 'Field Five', value: 'v5', type: FieldType.STRING, editable: false },
      ],
    },
  ],
});

const accountData: AccountData = { id: '1' };

const labelOrder = () =>
  screen.getAllByText(/^Field (One|Two|Three|Four|Five)$/).map((el) => el.textContent);

describe('AccountPage - layout-driven rendering guardrail', () => {
  it('renders blocks and fields in the exact order given by the layout JSON', () => {
    const layout = buildLayout();
    render(<AccountPage layout={layout} accountData={accountData} onFieldUpdate={vi.fn()} />);

    expect(screen.getByText('Block A')).toBeInTheDocument();
    expect(screen.getByText('Block B')).toBeInTheDocument();
    expect(labelOrder()).toEqual(['Field One', 'Field Two', 'Field Four']);
  });

  it('re-renders in the new order when the layout JSON is reordered, with no code changes', () => {
    const layout = buildLayout();
    const reordered: Layout = {
      blocks: [layout.blocks[1], layout.blocks[0], layout.blocks[2]],
    };

    render(<AccountPage layout={reordered} accountData={accountData} onFieldUpdate={vi.fn()} />);

    expect(labelOrder()).toEqual(['Field Four', 'Field One', 'Field Two']);
  });

  it('omits hidden blocks and hidden fields from the rendered output', () => {
    const layout = buildLayout();
    render(<AccountPage layout={layout} accountData={accountData} onFieldUpdate={vi.fn()} />);

    expect(screen.queryByText('Block C (hidden)')).not.toBeInTheDocument();
    expect(screen.queryByText('Field Three')).not.toBeInTheDocument();
    expect(screen.queryByText('Field Five')).not.toBeInTheDocument();
  });
});
