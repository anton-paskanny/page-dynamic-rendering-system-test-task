// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableField } from './EditableField';
import { FieldType, type Field } from '../types/layout';

const stringField: Field = {
  id: 'first-name',
  label: 'First Name',
  value: 'Adam',
  type: FieldType.STRING,
  editable: true,
};

describe('EditableField - edit mode UX', () => {
  it('renders a read-only row without edit affordances for a non-editable field', async () => {
    const onSave = vi.fn();
    render(<EditableField field={{ ...stringField, editable: false }} currentValue="Adam" onSave={onSave} />);

    expect(screen.getByText('Adam')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('Adam'));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('clicking an editable field toggles it into edit mode with save/cancel controls', async () => {
    const onSave = vi.fn();
    render(<EditableField field={stringField} currentValue="Adam" onSave={onSave} />);

    await userEvent.click(screen.getByText('Adam'));

    expect(screen.getByRole('textbox')).toHaveValue('Adam');
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel editing/i })).toBeInTheDocument();
  });

  it('Save sends the new value to the BFF via onSave and leaves edit mode', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<EditableField field={stringField} currentValue="Adam" onSave={onSave} />);

    await userEvent.click(screen.getByText('Adam'));
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Jane');
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(onSave).toHaveBeenCalledWith(stringField, 'Jane');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('Cancel reverts the edit without calling onSave', async () => {
    const onSave = vi.fn();
    render(<EditableField field={stringField} currentValue="Adam" onSave={onSave} />);

    await userEvent.click(screen.getByText('Adam'));
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Something Else');
    await userEvent.click(screen.getByRole('button', { name: /cancel editing/i }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Adam')).toBeInTheDocument();
  });

  it('disables Save and does not call onSave when the value is cleared to empty', async () => {
    const onSave = vi.fn();
    render(<EditableField field={stringField} currentValue="Adam" onSave={onSave} />);

    await userEvent.click(screen.getByText('Adam'));
    await userEvent.clear(screen.getByRole('textbox'));

    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled();
  });
});
