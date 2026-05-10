import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { Check, AlertCircle, X, Info, Clock } from 'lucide-react';
import Chip from './Chip';

const meta = {
	title: 'Atoms/Chip',
	component: Chip,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Compact label/badge used to surface status across the dashboard: invoice payment status (Paid / Failed / Draft), subscription status (Active / Cancelled), plan status, and tags. Five built-in variants map to the standard Flexprice colour scheme.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'success', 'warning', 'failed', 'info'],
		},
		label: { control: 'text' },
		disabled: { control: 'boolean' },
		onClick: { action: 'clicked' },
	},
	args: { label: 'Active', variant: 'success' },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default success chip — the green "Active" / "Paid" pill seen in tables across the app. */
export const Default: Story = {};

export const Failed: Story = { args: { label: 'Failed', variant: 'failed' } };
export const Warning: Story = { args: { label: 'Pending', variant: 'warning' } };
export const InfoVariant: Story = { args: { label: 'Draft', variant: 'info' } };
export const Neutral: Story = { args: { label: 'Archived', variant: 'default' } };

/** All five variants side-by-side — the canonical status palette. */
export const AllVariants: Story = {
	render: () => (
		<div className="flex items-center gap-3">
			<Chip variant="success" label="Paid" />
			<Chip variant="failed" label="Failed" />
			<Chip variant="warning" label="Pending" />
			<Chip variant="info" label="Draft" />
			<Chip variant="default" label="Archived" />
		</div>
	),
};

/** Common invoice-status pattern: chip + leading icon. */
export const WithIcon: Story = {
	args: { label: 'Paid', variant: 'success', icon: <Check size={14} /> },
};

/** Maps directly to the FlexPrice invoice payment statuses. */
export const InvoiceStatuses: Story = {
	render: () => (
		<div className="flex flex-col gap-2">
			<Chip variant="success" label="Paid" icon={<Check size={14} />} />
			<Chip variant="failed" label="Failed" icon={<X size={14} />} />
			<Chip variant="warning" label="Pending" icon={<Clock size={14} />} />
			<Chip variant="info" label="Draft" icon={<Info size={14} />} />
			<Chip variant="default" label="Void" icon={<AlertCircle size={14} />} />
		</div>
	),
};

/** Disabled (non-interactive) chip. */
export const Disabled: Story = { args: { label: 'Active', disabled: true, onClick: fn() } };

/**
 * Interaction test — confirms the chip fires `onClick` when clicked,
 * and stays silent when `disabled`.
 */
export const ClickInteraction: Story = {
	args: { label: 'Click me', variant: 'info', onClick: fn() },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const chip = canvas.getByText('Click me');
		await userEvent.click(chip);
		await expect(args.onClick).toHaveBeenCalledTimes(1);
	},
};
