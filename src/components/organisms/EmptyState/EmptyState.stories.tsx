import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Inbox, Users, FileText, Layers, Plus } from 'lucide-react';
import { Button } from '@/components/atoms';
import EmptyState from './EmptyState';

const meta = {
	title: 'Organisms/EmptyState',
	component: EmptyState,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Full-area empty state with icon + headline + subtext + optional CTA. Used in place of a chart or table when there is no data to display. Larger and more prominent than `NoDataCard`, intended to fill the main content region.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		size: { control: 'select', options: ['sm', 'md', 'lg'] },
		title: { control: 'text' },
		description: { control: 'text' },
	},
	args: {
		title: 'No data yet',
		description: 'Once you start receiving usage events they will show up here.',
		size: 'md',
	},
	decorators: [
		(Story) => (
			<div style={{ width: 'min(100%, 960px)' }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Minimal — just title + description. */
export const Minimal: Story = {};

/** With an icon for additional visual context. */
export const WithIcon: Story = {
	args: { icon: <Inbox size={48} /> },
};

/** With a CTA button — the most common production pattern. */
export const WithCTA: Story = {
	args: {
		icon: <Users size={48} />,
		title: 'No customers yet',
		description: 'Add your first customer to start tracking subscriptions and invoices.',
		action: (
			<Button prefixIcon={<Plus />} onClick={fn()}>
				Add customer
			</Button>
		),
	},
};

/** Modeled directly off the Customers page in the live dashboard. */
export const CustomersEmpty: Story = {
	args: {
		icon: <Users size={48} />,
		title: 'Customers',
		description: 'Create a plan to display pricing and start billing customers.',
		action: <Button variant="outline" onClick={fn()}>Create Customer</Button>,
	},
};

/** Bulk Imports empty state. */
export const BulkImportsEmpty: Story = {
	args: {
		icon: <FileText size={48} />,
		title: 'Ready to Import Data?',
		description: 'Upload your first import file to bring in customer or events data.',
		action: <Button variant="outline" onClick={fn()}>Create Import Task</Button>,
	},
};

/** Small variant — fits inside half-width panels. */
export const SizeSmall: Story = {
	args: {
		size: 'sm',
		icon: <Layers size={36} />,
		title: 'No features',
		description: 'Define a feature to start metering usage.',
		action: <Button variant="outline" onClick={fn()}>Add feature</Button>,
	},
};

/** Large variant — fills the entire main content area. */
export const SizeLarge: Story = {
	args: {
		size: 'lg',
		icon: <Inbox size={56} />,
		title: 'Welcome to Flexprice',
		description: 'Start by creating your first plan, then add customers and watch usage events flow in.',
		action: <Button onClick={fn()}>Create your first plan</Button>,
	},
};
