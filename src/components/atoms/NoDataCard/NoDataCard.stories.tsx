import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Plus } from 'lucide-react';
import { Button } from '@/components/atoms';
import NoDataCard from './NoDataCard';

const meta = {
	title: 'Atoms/NoDataCard',
	component: NoDataCard,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'The bordered "empty-state" card that appears in place of every data table or chart when there is nothing to show — Customers, Features, Invoices, Bulk Imports, etc. Title + subtitle + optional CTA.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		title: { control: 'text' },
		subtitle: { control: 'text' },
	},
	args: {
		title: 'Customers',
		subtitle: 'Create a plan to display pricing and start billing customers.',
		cta: <Button variant="outline" prefixIcon={<Plus />} onClick={fn()}>Create Customer</Button>,
	},
	decorators: [
		(Story) => (
			<div style={{ width: 720 }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof NoDataCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — the common Customers-empty state with a primary CTA. */
export const Default: Story = {};

/** Title + subtitle only — when no CTA makes sense (e.g. read-only views). */
export const WithoutCTA: Story = {
	args: {
		title: 'Customers',
		subtitle: 'No customers yet.',
		cta: undefined,
	},
};

/** Features empty state — different copy and icon. */
export const FeaturesEmpty: Story = {
	args: {
		title: 'Features',
		subtitle: 'Create your first feature to define what customers pay for.',
		cta: <Button variant="outline" prefixIcon={<Plus />} onClick={fn()}>Create Feature</Button>,
	},
};

/** Bulk Imports empty state. */
export const BulkImportsEmpty: Story = {
	args: {
		title: 'Ready to Import Data?',
		subtitle: 'Upload your first import file to bring in customer or events data.',
		cta: <Button variant="outline" onClick={fn()}>Create Import Task</Button>,
	},
};

/** Long subtitle wraps gracefully. */
export const LongSubtitle: Story = {
	args: {
		title: 'No invoices yet',
		subtitle:
			'Once you create a plan and add customers, invoices will be generated automatically based on your billing cycle. They will appear here for review and reconciliation.',
		cta: <Button variant="outline" onClick={fn()}>Create your first plan</Button>,
	},
};
