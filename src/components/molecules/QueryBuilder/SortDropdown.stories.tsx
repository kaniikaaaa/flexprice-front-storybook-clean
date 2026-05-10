import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { useState } from 'react';
import SortDropdown from './SortDropdown';
import { SortOption, SortDirection } from '@/types/common/QueryBuilder';

const options: SortOption[] = [
	{ field: 'name', label: 'Name' },
	{ field: 'created_at', label: 'Created At' },
	{ field: 'updated_at', label: 'Updated At' },
	{ field: 'status', label: 'Status' },
	{ field: 'priority', label: 'Priority' },
	{ field: 'est_hours', label: 'Est. Hours' },
	{ field: 'assigned_to', label: 'Assigned To' },
	{ field: 'due_date', label: 'Due Date' },
];

const meta = {
	title: 'Molecules/QueryBuilder/SortDropdown',
	component: SortDropdown,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Multi-key sort builder used by the Customers and Invoices list pages. Opens as a popover from a "Sort" trigger and lets users stack multiple sort conditions (e.g. *Status asc, then Created At desc*). Sortable rows can be drag-reordered to change priority. Caps at `maxSorts` (default 10).',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		disabled: { control: 'boolean' },
		maxSorts: {
			control: { type: 'number', min: 1, max: 10, step: 1 },
			description: 'Maximum number of stacked sort conditions allowed.',
		},
		onChange: { action: 'changed' },
	},
	args: {
		options,
		value: [],
		onChange: fn(),
		maxSorts: 10,
		disabled: false,
	},
	decorators: [
		(Story) => (
			<div className='p-10'>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SortDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — empty sort list. Click "Sort" then "Add" to push the first condition. */
export const Default: Story = {
	render: function Render(args) {
		const [sorts, setSorts] = useState<SortOption[]>(args.value);
		return (
			<SortDropdown
				{...args}
				value={sorts}
				onChange={(v) => {
					setSorts(v);
					args.onChange?.(v);
				}}
			/>
		);
	},
};

/** Pre-seeded with two active conditions — the common "saved view" pattern. */
export const WithInitialSorts: Story = {
	args: {
		value: [
			{ field: 'created_at', label: 'Created At', direction: SortDirection.DESC },
			{ field: 'priority', label: 'Priority', direction: SortDirection.ASC },
		],
	},
	render: function Render(args) {
		const [sorts, setSorts] = useState<SortOption[]>(args.value);
		return (
			<SortDropdown
				{...args}
				value={sorts}
				onChange={(v) => {
					setSorts(v);
					args.onChange?.(v);
				}}
			/>
		);
	},
};

/** Disabled — prevents the popover from opening. Used while a parent query is in flight. */
export const Disabled: Story = {
	args: { disabled: true, value: [{ field: 'name', label: 'Name', direction: SortDirection.ASC }] },
};

/** `maxSorts: 2` — once two conditions are added, the "Add" button disables. */
export const MaxTwoSorts: Story = {
	args: { maxSorts: 2 },
};

/**
 * Interaction test — opens the popover and asserts the empty-state "Add" CTA
 * is visible. The popover is portalled to `document.body`.
 */
export const OpenInteraction: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /sort/i });
		await userEvent.click(trigger);
		await waitFor(async () => {
			const addBtn = await within(document.body).findByRole('button', { name: /add/i });
			await expect(addBtn).toBeInTheDocument();
		});
	},
};
