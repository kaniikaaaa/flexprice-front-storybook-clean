import type { Meta, StoryObj } from '@storybook/react';
import Progress from './Progress';

const meta = {
	title: 'Atoms/Progress',
	component: Progress,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Progress bar built on Radix Progress. Used as the basis for `UsageBar` / `MeterProgress` patterns showing used vs. entitled units across customer dashboards. Supports custom indicator colour, background colour, and a label rendered below the bar.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
		indicatorColor: { control: 'text', description: 'Tailwind class for the filled portion (e.g. `bg-emerald-500`).' },
		backgroundColor: { control: 'text', description: 'Tailwind class for the track.' },
		label: { control: 'text' },
	},
	args: { value: 60, label: '60 / 100 GB used' },
	decorators: [
		(Story) => (
			<div style={{ width: 420 }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — 60% filled with a usage caption below the bar. */
export const Default: Story = {};

/** No label — just the bare progress bar. */
export const NoLabel: Story = {
	args: { value: 60, label: undefined },
};

/** Empty / 0% — used when usage hasn't started yet. */
export const Empty: Story = { args: { value: 0, label: '0 / 100 GB used' } };

/** Complete / 100%. */
export const Complete: Story = { args: { value: 100, label: '100 / 100 GB used' } };

/** Common dashboard pattern — usage-bar style with a green indicator while under quota. */
export const UsageUnderLimit: Story = {
	args: {
		value: 35,
		indicatorColor: 'bg-emerald-500',
		backgroundColor: 'bg-emerald-100',
		label: '35,000 / 100,000 API calls',
	},
};

/** Approaching limit — orange. */
export const UsageApproachingLimit: Story = {
	args: {
		value: 85,
		indicatorColor: 'bg-orange-500',
		backgroundColor: 'bg-orange-100',
		label: '85,000 / 100,000 API calls',
	},
};

/** Over limit — red. */
export const UsageOverLimit: Story = {
	args: {
		value: 100,
		indicatorColor: 'bg-red-500',
		backgroundColor: 'bg-red-100',
		label: '105,000 / 100,000 API calls — over by 5,000',
	},
};

/** Stack of meter rows — typical entitlements panel on the customer page. */
export const EntitlementsPanel: Story = {
	render: () => (
		<div className="space-y-4">
			<Progress value={20} indicatorColor="bg-emerald-500" backgroundColor="bg-emerald-100" label="2,000 / 10,000 events" />
			<Progress value={75} indicatorColor="bg-orange-500" backgroundColor="bg-orange-100" label="75 / 100 GB storage" />
			<Progress value={100} indicatorColor="bg-red-500" backgroundColor="bg-red-100" label="500 / 500 seats — at limit" />
		</div>
	),
};
