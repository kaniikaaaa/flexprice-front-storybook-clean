import type { Meta, StoryObj } from '@storybook/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/atoms';
import Card, { CardHeader } from './Card';

const meta = {
	title: 'Atoms/Card',
	component: Card,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Container primitive used for every panel in the dashboard — empty-state cards, metric tiles, settings sections, drawers. Five variants (`default`, `notched`, `bordered`, `elevated`, `warning`) cover the styles seen across the app. The `notched` variant adds a coloured stripe on the left/right used by `NoDataCard`.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		variant: { control: 'select', options: ['default', 'notched', 'bordered', 'elevated', 'warning'] },
		notchPosition: {
			control: 'select',
			options: ['left', 'right'],
			if: { arg: 'variant', eq: 'notched' },
		},
		notchSize: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
			if: { arg: 'variant', eq: 'notched' },
		},
		notchColor: {
			control: 'select',
			options: ['zinc', 'primary'],
			if: { arg: 'variant', eq: 'notched' },
		},
		noPadding: { control: 'boolean' },
	},
	args: {
		children: <p className="text-sm text-gray-700">A simple card body. Cards typically contain a header, body, and optional footer.</p>,
	},
	decorators: [
		(Story) => (
			<div style={{ width: 720 }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default bordered card. */
export const Default: Story = {};

/** Notched card — what `NoDataCard` is built on top of. */
export const Notched: Story = {
	args: { variant: 'notched' },
};

/** Notch on the right instead of the left. */
export const NotchRight: Story = {
	args: { variant: 'notched', notchPosition: 'right', notchColor: 'primary' },
};

/** Stronger 2px border. */
export const Bordered: Story = { args: { variant: 'bordered' } };

/** Drop-shadow elevation. */
export const Elevated: Story = { args: { variant: 'elevated' } };

/** Warning variant — red border + red text, used for destructive panels. */
export const Warning: Story = {
	args: {
		variant: 'warning',
		children: <p className="text-sm">This action cannot be undone. Subscriptions and invoices for this customer will be archived.</p>,
	},
};

/** Composed pattern — Card + CardHeader + body. The default layout used everywhere. */
export const WithHeader: Story = {
	args: {
		children: (
			<>
				<CardHeader title="Recent Subscriptions" subtitle="Created in the last 7 days" cta={<Button variant="outline" size="sm" prefixIcon={<Plus />}>Add</Button>} />
				<div className="text-3xl font-semibold mt-2">0</div>
				<p className="text-sm text-muted-foreground">New subscriptions</p>
			</>
		),
	},
};

/** Card without padding — useful for tables that should bleed to the edges. */
export const NoPadding: Story = {
	args: {
		noPadding: true,
		children: (
			<table className="w-full text-sm">
				<thead className="border-b">
					<tr><th className="p-3 text-left font-medium">Customer</th><th className="p-3 text-left font-medium">Status</th></tr>
				</thead>
				<tbody>
					<tr className="border-b"><td className="p-3">Acme Corp</td><td className="p-3">Active</td></tr>
					<tr><td className="p-3">Globex</td><td className="p-3">Active</td></tr>
				</tbody>
			</table>
		),
	},
};
