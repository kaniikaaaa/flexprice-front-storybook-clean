import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { useState } from 'react';
import DatePicker from './DatePicker';

const meta = {
	title: 'Atoms/DatePicker',
	component: DatePicker,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Single-date picker built on Radix Popover + a calendar primitive. Used in invoice due-date pickers, plan effective-date inputs, and any single-date form field. Supports min/max bounds and timezone-aware display.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		placeholder: { control: 'text' },
		label: { control: 'text' },
		disabled: { control: 'boolean' },
		setDate: { action: 'changed' },
	},
	args: {
		placeholder: 'Pick a date',
		date: undefined,
		setDate: fn(),
	},
	decorators: [
		(Story) => (
			<div style={{ width: 280 }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — empty date picker. */
export const Default: Story = {};

/** With a label above the picker. */
export const WithLabel: Story = {
	args: { label: 'Effective from' },
};

/** Pre-filled with a date. */
export const WithValue: Story = {
	args: { date: new Date('2026-05-10'), label: 'Invoice due' },
};

/** Disabled. */
export const Disabled: Story = {
	args: { disabled: true, date: new Date('2026-05-10'), label: 'Effective from' },
};

/** Bounded by min/max — only dates in May 2026 are selectable. */
export const Bounded: Story = {
	args: {
		label: 'Pick a date in May 2026',
		minDate: new Date('2026-05-01'),
		maxDate: new Date('2026-05-31'),
	},
};

/** Controlled — local state drives the picker. */
export const Controlled: Story = {
	render: function Render(args) {
		const [date, setDate] = useState<Date | undefined>(undefined);
		return (
			<div className="space-y-3">
				<DatePicker
					{...args}
					date={date}
					setDate={(d) => {
						setDate(d);
						args.setDate?.(d);
					}}
				/>
				<p className="text-sm text-muted-foreground">
					Selected: <code>{date ? date.toISOString().slice(0, 10) : '(none)'}</code>
				</p>
			</div>
		);
	},
	args: { label: 'Effective from' },
};
