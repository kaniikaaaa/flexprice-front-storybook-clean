import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { useState } from 'react';
import DateRangePicker from './DateRangePicker';

const meta = {
	title: 'Atoms/DateRangePicker',
	component: DateRangePicker,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Date-range picker used on the Revenue page (e.g. "Apr 1, 2026 — Jul 1, 2026") and other analytics filters. Two-month calendar popup, timezone-aware, with a clear (✕) affordance once a range is selected.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		title: { control: 'text' },
		placeholder: { control: 'text' },
		disabled: { control: 'boolean' },
		onChange: { action: 'changed' },
	},
	args: {
		placeholder: 'Select range',
		onChange: fn(),
	},
	decorators: [
		(Story) => (
			<div style={{ width: 320 }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — empty range. */
export const Default: Story = {};

/** With a title above the picker. */
export const WithTitle: Story = {
	args: { title: 'Reporting period' },
};

/** Pre-filled — the Revenue page default ("This quarter"). */
export const PreSelected: Story = {
	args: {
		title: 'This quarter',
		startDate: new Date('2026-04-01'),
		endDate: new Date('2026-07-01'),
	},
};

/** Disabled. */
export const Disabled: Story = {
	args: { disabled: true, startDate: new Date('2026-04-01'), endDate: new Date('2026-07-01') },
};

/**
 * Interaction test — clicks the trigger and asserts the calendar popover
 * mounts (two-month grid renders into the document). Picking individual
 * dates is delegated to react-day-picker's own internals — verifying the
 * popover opens is the right contract for a Storybook smoke test.
 */
export const OpenInteraction: Story = {
	args: { placeholder: 'Select range' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByText(/select range/i);
		await userEvent.click(trigger);
		await waitFor(async () => {
			const grid = await within(document.body).findByRole('grid');
			await expect(grid).toBeInTheDocument();
		});
	},
};

/** Controlled — local state drives the picker. */
export const Controlled: Story = {
	render: function Render(args) {
		const [range, setRange] = useState<{ startDate?: Date; endDate?: Date }>({});
		return (
			<div className="space-y-3">
				<DateRangePicker
					{...args}
					startDate={range.startDate}
					endDate={range.endDate}
					onChange={(r) => {
						setRange(r);
						args.onChange(r);
					}}
				/>
				<p className="text-sm text-muted-foreground">
					From <code>{range.startDate?.toISOString().slice(0, 10) ?? '—'}</code> to{' '}
					<code>{range.endDate?.toISOString().slice(0, 10) ?? '—'}</code>
				</p>
			</div>
		);
	},
	args: { title: 'Reporting period' },
};
