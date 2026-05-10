import type { Meta, StoryObj } from '@storybook/react';
import MetricCard from './MetricCard';

const meta = {
	title: 'Molecules/MetricCard',
	component: MetricCard,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'KPI tile used across the dashboard Home page — Net Revenue, Active Subscriptions, Outstanding Invoices, etc. Renders a label + formatted value, with optional currency formatting, percentage formatting, and a green/red trend arrow indicator.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		title: { control: 'text' },
		value: { control: 'number' },
		currency: { control: 'select', options: [undefined, 'USD', 'EUR', 'INR', 'JPY'] },
		isPercent: { control: 'boolean' },
		showChangeIndicator: { control: 'boolean' },
		isNegative: { control: 'boolean' },
		change: {
			control: { type: 'number', min: 0, max: 100, step: 0.1 },
			description: 'Period-over-period delta rendered alongside the trend arrow (e.g. `12.4` → "+12.4%").',
			if: { arg: 'showChangeIndicator', truthy: true },
		},
	},
	args: {
		title: 'New subscriptions',
		value: 0,
	},
	decorators: [
		(Story) => (
			<div style={{ width: 280 }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — empty metric, used in the Home page when no data has been ingested yet. */
export const Empty: Story = {};

/** With a numeric value. */
export const WithValue: Story = {
	args: { title: 'Active subscriptions', value: 1247 },
};

/** Currency-formatted value. */
export const Currency: Story = {
	args: { title: 'Net revenue', value: 84320.5, currency: 'USD' },
};

/** Percentage-formatted value. */
export const Percentage: Story = {
	args: { title: 'Churn rate', value: 2.4, isPercent: true },
};

/** With a positive trend indicator (green) and a +12.4% delta beside the arrow. */
export const PositiveTrend: Story = {
	args: {
		title: 'Net revenue',
		value: 84320.5,
		currency: 'USD',
		showChangeIndicator: true,
		change: 12.4,
	},
};

/** With a negative trend indicator (red) and a -3.1% delta. */
export const NegativeTrend: Story = {
	args: {
		title: 'Cancellations',
		value: 12,
		showChangeIndicator: true,
		isNegative: true,
		change: 3.1,
	},
};

/** Trend arrow only — no `change` value passed, mimics the legacy dashboard. */
export const TrendArrowOnly: Story = {
	args: { title: 'Net revenue', value: 84320.5, currency: 'USD', showChangeIndicator: true },
};

/** A row of metric cards — typical Home-page layout. */
export const Row: Story = {
	render: () => (
		<div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ width: 'min(100%, 1080px)' }}>
			<MetricCard title="Net revenue" value={84320.5} currency="USD" showChangeIndicator />
			<MetricCard title="Active subscriptions" value={1247} showChangeIndicator />
			<MetricCard title="New customers" value={32} showChangeIndicator />
			<MetricCard title="Churn rate" value={2.4} isPercent showChangeIndicator isNegative />
		</div>
	),
};
