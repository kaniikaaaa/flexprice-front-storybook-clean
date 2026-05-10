import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { useState } from 'react';
import { DollarSign, Euro, IndianRupee, JapaneseYen } from 'lucide-react';
import Select, { SelectOption } from './Select';

const sampleOptions: SelectOption[] = [
	{ value: 'USD', label: 'US Dollar', prefixIcon: <DollarSign size={14} /> },
	{ value: 'EUR', label: 'Euro', prefixIcon: <Euro size={14} /> },
	{ value: 'INR', label: 'Indian Rupee', prefixIcon: <IndianRupee size={14} /> },
	{ value: 'JPY', label: 'Japanese Yen', prefixIcon: <JapaneseYen size={14} /> },
];

const planOptions: SelectOption[] = [
	{ value: 'free', label: 'Free', description: '$0 / month' },
	{ value: 'starter', label: 'Starter', description: '$29 / month' },
	{ value: 'pro', label: 'Pro', description: '$99 / month' },
	{ value: 'enterprise', label: 'Enterprise', description: 'Contact sales', disabled: true },
];

const meta = {
	title: 'Atoms/Select',
	component: Select,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Dropdown built on top of Radix Select. Supports per-option icons, descriptions, disabled options, a "no options" fallback, and a radio-button visual variant. Used everywhere on Plans, Pricing, and filter bars.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		disabled: { control: 'boolean' },
		required: { control: 'boolean' },
		isRadio: { control: 'boolean' },
		label: { control: 'text' },
		placeholder: { control: 'text' },
		description: { control: 'text' },
		error: { control: 'text' },
		onChange: { action: 'changed' },
	},
	args: {
		options: sampleOptions,
		placeholder: 'Select a currency',
		onChange: fn(),
	},
	decorators: [
		(Story) => (
			<div style={{ width: 320 }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — uncontrolled select with currency options. */
export const Default: Story = {};

/** With a label, used inside form fields. */
export const WithLabel: Story = {
	args: { label: 'Currency', required: true },
};

/** Helper description below the field. */
export const WithDescription: Story = {
	args: {
		label: 'Currency',
		description: 'The currency invoices will be generated in.',
	},
};

/** Error state — used in form validation. */
export const WithError: Story = {
	args: { label: 'Currency', error: 'Please select a currency.' },
};

/** Options with descriptions — used on the Plans page. */
export const WithOptionDescriptions: Story = {
	args: {
		label: 'Plan',
		options: planOptions,
		placeholder: 'Choose a plan',
	},
};

/** Radio-button visual variant — used in pickers like billing cycle. */
export const RadioVariant: Story = {
	args: {
		label: 'Billing cycle',
		isRadio: true,
		options: [
			{ value: 'monthly', label: 'Monthly', description: 'Billed every month' },
			{ value: 'annual', label: 'Annual', description: 'Save 20% with annual billing' },
		],
		placeholder: 'Pick a cycle',
	},
};

/** Empty options with custom message. */
export const EmptyOptions: Story = {
	args: {
		label: 'Customers',
		options: [],
		noOptionsText: 'No customers found',
		placeholder: 'Pick a customer',
	},
};

/** Disabled. */
export const Disabled: Story = {
	args: { label: 'Currency', disabled: true, value: 'USD' },
};

/** Controlled select with live state — useful for verifying the change contract. */
export const Controlled: Story = {
	render: function Render(args) {
		const [val, setVal] = useState<string>('');
		return (
			<div>
				<Select {...args} value={val} onChange={(v) => { setVal(v); args.onChange?.(v); }} />
				<p className="mt-3 text-sm text-muted-foreground">Selected: <code>{val || '(none)'}</code></p>
			</div>
		);
	},
	args: { label: 'Currency' },
};

/**
 * Interaction test — opens the dropdown and selects an option, asserting
 * `onChange` fires with the option's `value`. Radix portals the listbox to
 * `document.body`, so options are queried from `screen` rather than the canvas.
 */
export const SelectInteraction: Story = {
	args: { label: 'Currency', placeholder: 'Pick a currency' },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('combobox');
		await userEvent.click(trigger);
		// Listbox content is portalled to document.body; wait for it to mount.
		const option = await waitFor(async () => {
			const opt = await within(document.body).findByText('Indian Rupee');
			return opt;
		});
		await userEvent.click(option);
		await waitFor(() => expect(args.onChange).toHaveBeenCalledWith('INR'));
	},
};
