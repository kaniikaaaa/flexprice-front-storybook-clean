import type { Meta, StoryObj } from '@storybook/react';
import Spinner from './Spinner';

const meta = {
	title: 'Atoms/Spinner',
	component: Spinner,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Lightweight CSS-animated spinner. Inherits colour from `currentColor`, so it adapts to whatever container it sits inside (button, card, table cell). Default size is 24px.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		size: { control: { type: 'range', min: 12, max: 96, step: 4 } },
		className: { control: 'text' },
	},
	args: { size: 24 },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default 24px spinner. */
export const Default: Story = {};

export const Small: Story = { args: { size: 16 } };
export const Large: Story = { args: { size: 48 } };

/** Spinner inheriting colour from a coloured container. */
export const Coloured: Story = {
	render: (args) => (
		<div className="text-blue-600">
			<Spinner {...args} />
		</div>
	),
	args: { size: 32 },
};

/** Common in-button usage — small spinner replacing button label. */
export const InButton: Story = {
	render: () => (
		<button className="inline-flex items-center gap-2 rounded-md bg-[#092E44] px-4 py-2 text-sm text-white">
			<Spinner size={14} />
			Saving…
		</button>
	),
};

/** Sizes side-by-side. */
export const Sizes: Story = {
	render: () => (
		<div className="flex items-center gap-6 text-gray-600">
			<Spinner size={16} />
			<Spinner size={24} />
			<Spinner size={36} />
			<Spinner size={48} />
		</div>
	),
};
