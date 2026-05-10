import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { useState } from 'react';
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import RadioGroup, { RadioMenuItem } from './RadioGroup';

const billingItems: RadioMenuItem[] = [
	{ value: 'monthly', label: 'Monthly', description: 'Billed every month', icon: Calendar },
	{ value: 'quarterly', label: 'Quarterly', description: 'Billed every 3 months — save 10%', icon: CalendarDays },
	{ value: 'annual', label: 'Annual', description: 'Billed once a year — save 20%', icon: CalendarRange },
];

const meta = {
	title: 'Atoms/RadioGroup',
	component: RadioGroup,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Card-based radio picker — used in plan-creation flows for billing cycle, model selection, and other one-of-N choices. Each item supports an icon, label, and description.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		title: { control: 'text' },
		disabled: { control: 'boolean' },
		onChange: { action: 'changed' },
	},
	args: { title: 'Billing cycle', items: billingItems, onChange: fn() },
	decorators: [
		(Story) => (
			<div style={{ width: 420 }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — no item pre-selected. */
export const Default: Story = {};

/** Pre-selected item. */
export const WithSelection: Story = {
	args: { selected: billingItems[1] },
};

/** Without a title. */
export const NoTitle: Story = {
	args: { title: undefined },
};

/** Disabled — entire group is non-interactive. */
export const Disabled: Story = {
	args: { selected: billingItems[0], disabled: true },
};

/** Items without icons. */
export const NoIcons: Story = {
	args: {
		items: [
			{ value: 'flat', label: 'Flat fee', description: 'A single price per billing period.' },
			{ value: 'tiered', label: 'Tiered', description: 'Different prices at different volume tiers.' },
			{ value: 'usage', label: 'Usage-based', description: 'Charge based on metered usage.' },
		],
	},
};

/**
 * Interaction test — clicking an item fires `onChange` with the full item object,
 * and the selection visually updates.
 */
export const SelectionInteraction: Story = {
	render: function Render(args) {
		const [selected, setSelected] = useState<RadioMenuItem | undefined>(undefined);
		return (
			<RadioGroup
				{...args}
				selected={selected}
				onChange={(item) => {
					setSelected(item);
					args.onChange?.(item);
				}}
			/>
		);
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const annualLabel = canvas.getByText('Annual');
		await userEvent.click(annualLabel);
		await expect(args.onChange).toHaveBeenCalled();
	},
};
