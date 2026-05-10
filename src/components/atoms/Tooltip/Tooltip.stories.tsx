import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Info, HelpCircle, AlertTriangle } from 'lucide-react';
import Tooltip from './Tooltip';
import { Button } from '@/components/atoms';

const meta = {
	title: 'Atoms/Tooltip',
	component: Tooltip,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Hover-tooltip built on top of Radix Tooltip. Used across the dashboard for explaining truncated cell values, KPI definitions on the home page, and "?" help icons in form fields. Supports four sides, three alignments, custom delay, and arbitrary `ReactNode` content.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		side: {
			control: 'select',
			options: ['top', 'right', 'bottom', 'left'],
			description: 'Side of the trigger to show the tooltip.',
		},
		align: { control: 'select', options: ['start', 'center', 'end'] },
		sideOffset: {
			control: { type: 'number', min: 0, max: 20, step: 1 },
			description: 'Pixel gap between the tooltip and the trigger.',
		},
		delayDuration: {
			control: { type: 'number', min: 0, max: 2000, step: 50 },
			description: 'Delay in ms before the tooltip appears on hover.',
		},
		content: { control: 'text' },
	},
	args: {
		content: 'Total revenue across all active subscriptions.',
		children: <Button variant='outline'>Hover me</Button>,
		side: 'top',
		align: 'center',
		sideOffset: 4,
		delayDuration: 200,
	},
	decorators: [
		(Story) => (
			<div className='py-20'>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — short hover tooltip on a button. The dashboard pattern for KPI definitions. */
export const Default: Story = {};

/** All four sides side-by-side. */
export const Sides: Story = {
	render: () => (
		<div className='flex items-center gap-6'>
			{(['top', 'right', 'bottom', 'left'] as const).map((side) => (
				<Tooltip key={side} content={`side: ${side}`} side={side}>
					<Button variant='outline' size='sm'>
						{side}
					</Button>
				</Tooltip>
			))}
		</div>
	),
};

/** Help-icon trigger — used in form labels to explain a field. */
export const HelpIcon: Story = {
	args: {
		content: (
			<span className='max-w-[220px] block text-xs leading-snug'>
				MRR is calculated from active subscriptions, ignoring trials and one-off charges.
			</span>
		),
		children: (
			<button
				type='button'
				className='inline-flex items-center justify-center rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
				aria-label='What does MRR include?'>
				<HelpCircle size={14} />
			</button>
		),
	},
};

/** Rich content — supports any ReactNode, including icons + multi-line copy. */
export const RichContent: Story = {
	args: {
		side: 'right',
		content: (
			<div className='flex items-start gap-2 max-w-[260px]'>
				<AlertTriangle size={14} className='mt-0.5 shrink-0' />
				<div className='text-xs leading-snug'>
					This action is irreversible. The subscription will be cancelled at the end of the
					current billing cycle.
				</div>
			</div>
		),
		children: (
			<Button variant='destructive' size='sm'>
				Cancel subscription
			</Button>
		),
	},
};

/** Long delay — useful for table cells where casual hover should not flicker tooltips. */
export const LongDelay: Story = {
	args: { delayDuration: 800, content: 'Appears after 800ms of hover.' },
};

/** Inline info icon next to a label — the most common dashboard pattern. */
export const InlineInfoIcon: Story = {
	render: () => (
		<div className='flex items-center gap-1.5 text-sm font-medium text-gray-700'>
			Active subscriptions
			<Tooltip content='Customers with at least one non-cancelled subscription.'>
				<Info size={14} className='text-gray-400 hover:text-gray-700 cursor-help' />
			</Tooltip>
		</div>
	),
};

/**
 * Interaction test — hover the trigger and assert the tooltip content appears
 * in the document. Radix portals the tooltip to `document.body`, so we query
 * the screen, not the canvas.
 */
export const HoverInteraction: Story = {
	args: {
		content: 'Tooltip is visible',
		children: <Button variant='outline'>Hover for tooltip</Button>,
		delayDuration: 0,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /hover for tooltip/i });
		await userEvent.hover(trigger);
		await waitFor(async () => {
			const tooltips = await within(document.body).findAllByText('Tooltip is visible');
			await expect(tooltips.length).toBeGreaterThan(0);
		});
	},
};
