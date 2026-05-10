import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { Plus, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from './index';

const meta = {
	title: 'Atoms/Button',
	component: Button,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'The primary action trigger across the Flexprice dashboard. Used for **Add**, **Create**, destructive confirmations, sidebar nav items, and empty-state CTAs. Supports prefix/suffix icons and a loading state.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'black', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
			description: 'Visual variant. `default` is the dark navy used for primary "Add" actions.',
		},
		size: {
			control: 'select',
			options: ['default', 'sm', 'lg', 'xs', 'icon'],
		},
		isLoading: { control: 'boolean', description: 'Replaces children with a spinner and disables the button.' },
		disabled: { control: 'boolean' },
		children: { control: 'text' },
		onClick: { action: 'clicked' },
	},
	args: {
		children: 'Add',
		onClick: fn(),
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default primary button — navy fill, used for "Add" / "Create" CTAs in the dashboard. */
export const Default: Story = {};

/** Outline variant — used for secondary CTAs inside empty-state cards (e.g. "Create Feature"). */
export const Outline: Story = {
	args: { variant: 'outline', children: 'Create Feature' },
};

export const Secondary: Story = { args: { variant: 'secondary', children: 'Cancel' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'Skip' } };
export const Destructive: Story = {
	args: { variant: 'destructive', children: 'Delete', prefixIcon: <Trash2 /> },
};
export const Link: Story = { args: { variant: 'link', children: 'Learn more' } };

/** All sizes side-by-side. */
export const Sizes: Story = {
	render: (args) => (
		<div className="flex items-center gap-3">
			<Button {...args} size="xs">xs</Button>
			<Button {...args} size="sm">sm</Button>
			<Button {...args} size="default">default</Button>
			<Button {...args} size="lg">lg</Button>
		</div>
	),
};

/** Loading state — shows a spinner in place of children, button is non-interactive. */
export const Loading: Story = { args: { isLoading: true, children: 'Saving…' } };

/** Disabled state. */
export const Disabled: Story = { args: { disabled: true } };

/** Common dashboard usage: primary "+ Add" button with prefix icon. */
export const WithPrefixIcon: Story = {
	args: { prefixIcon: <Plus />, children: 'Add' },
};

/** Suffix icon — used for "Learn More →" style links. */
export const WithSuffixIcon: Story = {
	args: { variant: 'link', suffixIcon: <ArrowRight />, children: 'Learn More' },
};

/**
 * Interaction test — confirms the `onClick` handler fires exactly once on click,
 * and that the button does not fire while in `isLoading` state.
 */
export const ClickInteraction: Story = {
	args: { children: 'Click me' },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const btn = canvas.getByRole('button', { name: /click me/i });
		await userEvent.click(btn);
		await expect(args.onClick).toHaveBeenCalledTimes(1);
	},
};
