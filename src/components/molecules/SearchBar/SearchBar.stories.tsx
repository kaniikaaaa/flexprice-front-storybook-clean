import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { useState } from 'react';
import SearchBar from './SearchBar';

const meta = {
	title: 'Molecules/SearchBar',
	component: SearchBar,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Debounced search input used in the Customers, Invoices, and Events list pages. The component owns its text state internally and emits the typed value via `onSearch` after `debounceMs` of inactivity. Clicking the clear (`X`) button bypasses the debounce window for snappy UX.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		debounceMs: {
			control: { type: 'number', min: 0, max: 1000, step: 50 },
			description: 'Inactivity window before `onSearch` fires. `0` = synchronous.',
		},
		width: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'full'] },
		placeholder: { control: 'text' },
		disabled: { control: 'boolean' },
		onSearch: { action: 'searched' },
	},
	args: {
		debounceMs: 250,
		width: 'md',
		placeholder: 'Search customers…',
		onSearch: fn(),
	},
	decorators: [
		(Story) => (
			<div style={{ minWidth: 320 }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — 250ms debounce, medium width. */
export const Default: Story = {};

/** No debounce — fires `onSearch` on every keystroke. */
export const NoDebounce: Story = { args: { debounceMs: 0 } };

/** Long debounce — for expensive server-side searches. */
export const LongDebounce: Story = { args: { debounceMs: 800 } };

/** Pre-populated via `defaultValue`. */
export const WithDefaultValue: Story = {
	args: { defaultValue: 'acme corp', placeholder: 'Search customers…' },
};

/** Disabled — used while a parent loading state is in flight. */
export const Disabled: Story = { args: { disabled: true, defaultValue: 'archived' } };

/** Wider variant used on the Customers full-page filter bar. */
export const Wide: Story = { args: { width: 'lg', placeholder: 'Search by name, email, or ID…' } };

/**
 * Live demo — emit count + last search value to the right of the input.
 * Useful for verifying the debounce behaviour in the Controls panel.
 */
export const LiveEcho: Story = {
	render: function Render(args) {
		const [last, setLast] = useState('');
		const [count, setCount] = useState(0);
		return (
			<div className='flex items-center gap-4'>
				<SearchBar
					{...args}
					onSearch={(v) => {
						setLast(v);
						setCount((c) => c + 1);
						args.onSearch?.(v);
					}}
				/>
				<div className='text-xs text-gray-600'>
					<div>
						<strong>Searches fired:</strong> <code>{count}</code>
					</div>
					<div>
						<strong>Last value:</strong> <code>{last || '(empty)'}</code>
					</div>
				</div>
			</div>
		);
	},
};

/**
 * Interaction test — types into the input, waits past the debounce window,
 * and asserts `onSearch` fired with the typed string. Then clicks the clear
 * button and asserts an immediate empty-string fire.
 */
export const TypeAndClearInteraction: Story = {
	args: { debounceMs: 50, placeholder: 'Search…' },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole('searchbox');
		await userEvent.type(input, 'acme');
		await waitFor(() => expect(args.onSearch).toHaveBeenLastCalledWith('acme'));

		const clearBtn = canvas.getByRole('button', { name: /clear search/i });
		await userEvent.click(clearBtn);
		await expect(args.onSearch).toHaveBeenLastCalledWith('');
	},
};
