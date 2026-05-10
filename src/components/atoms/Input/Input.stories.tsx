import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { useState } from 'react';
import Input from './Input';

const meta = {
	title: 'Atoms/Input',
	component: Input,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Text and number input used across forms in the Flexprice dashboard. Supports `text`, `number`, `formatted-number`, and `integer` variants, with prefix/suffix slots (e.g. `$` currency prefix), label, description, and error states.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['text', 'number', 'formatted-number', 'integer'],
			description: '`formatted-number` adds thousand-separators while typing.',
		},
		size: { control: 'select', options: ['default', 'sm', 'lg'] },
		disabled: { control: 'boolean' },
		label: { control: 'text' },
		placeholder: { control: 'text' },
		description: { control: 'text' },
		error: { control: 'text' },
		onChange: { action: 'changed' },
	},
	args: {
		placeholder: 'Enter text',
		onChange: fn(),
	},
	decorators: [
		(Story) => (
			<div style={{ width: 360 }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default text input. */
export const Default: Story = {};

/** With a label above the field. */
export const WithLabel: Story = {
	args: { label: 'Email', placeholder: 'you@company.com', type: 'email' },
};

/** Error state — used inline in form validation. */
export const WithError: Story = {
	args: {
		label: 'Password',
		type: 'password',
		error: 'Password must be at least 8 characters',
		placeholder: 'Enter password',
	},
};

/** Helper description below the input. */
export const WithDescription: Story = {
	args: {
		label: 'Lookup key',
		description: 'A unique slug used to reference this resource via the API.',
		placeholder: 'starter-plan',
	},
};

/** Currency prefix — used everywhere on Plans / Pricing pages. */
export const WithCurrencyPrefix: Story = {
	args: {
		label: 'Price',
		variant: 'formatted-number',
		inputPrefix: <span className="text-muted-foreground">$</span>,
		placeholder: '0.00',
	},
};

/** Suffix — used for unit hints like "/ month" or "tokens". */
export const WithSuffix: Story = {
	args: {
		label: 'Rate',
		variant: 'formatted-number',
		suffix: '/ month',
		placeholder: '0',
	},
};

/** Disabled state. */
export const Disabled: Story = {
	args: { label: 'Customer ID', value: 'cus_42xK9pQ', disabled: true },
};

/** Integer-only variant — rejects non-digit characters at the keystroke level. */
export const IntegerOnly: Story = {
	args: { label: 'Quantity', variant: 'integer', placeholder: '0' },
};

/**
 * Interaction test — types into the input and asserts `onChange` was called
 * with the entered value. Confirms the controlled-input contract.
 */
export const TypingInteraction: Story = {
	args: { label: 'Name', placeholder: 'Type here', id: 'test-input' },
	render: function Render(args) {
		const [val, setVal] = useState('');
		return (
			<Input
				{...args}
				value={val}
				onChange={(v) => {
					setVal(v);
					args.onChange?.(v);
				}}
			/>
		);
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByPlaceholderText('Type here');
		await userEvent.type(input, 'hello');
		await expect(args.onChange).toHaveBeenCalled();
		await expect((input as HTMLInputElement).value).toBe('hello');
	},
};
