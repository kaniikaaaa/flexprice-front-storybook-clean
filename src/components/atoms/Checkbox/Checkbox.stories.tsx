import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { useState } from 'react';
import Checkbox from './Checkbox';

const meta = {
	title: 'Atoms/Checkbox',
	component: Checkbox,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Radix-based checkbox with optional label and description. Used in feature toggles, plan customisation, and bulk-action selection on tables across the dashboard.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		checked: { control: 'boolean' },
		label: { control: 'text' },
		description: { control: 'text' },
		onCheckedChange: { action: 'changed' },
	},
	args: {
		id: 'cb-default',
		label: 'Enable usage tracking',
		onCheckedChange: fn(),
	},
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — unchecked checkbox with a label. */
export const Default: Story = {};

/** Checked state. */
export const Checked: Story = { args: { id: 'cb-checked', checked: true } };

/** With a helper description below the label. */
export const WithDescription: Story = {
	args: {
		id: 'cb-desc',
		label: 'Auto-charge invoices',
		description: 'Charges the customer’s default payment method when an invoice is finalised.',
	},
};

/** Multiple checkboxes — common in feature/permission lists. */
export const Group: Story = {
	render: () => (
		<div className="space-y-3">
			<Checkbox id="g-1" label="Email notifications" description="Send a summary email when usage hits 80% of the plan." />
			<Checkbox id="g-2" label="Slack notifications" />
			<Checkbox id="g-3" label="Webhook notifications" description="POST to your configured endpoint." />
		</div>
	),
};

/**
 * Interaction test — clicking the checkbox toggles its state and fires `onCheckedChange`.
 */
export const ToggleInteraction: Story = {
	args: { id: 'cb-toggle', label: 'Click to toggle' },
	render: function Render(args) {
		const [checked, setChecked] = useState(false);
		return (
			<Checkbox
				{...args}
				checked={checked}
				onCheckedChange={(c) => {
					setChecked(c);
					args.onCheckedChange?.(c);
				}}
			/>
		);
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const cb = canvas.getByRole('checkbox');
		await userEvent.click(cb);
		await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
	},
};
