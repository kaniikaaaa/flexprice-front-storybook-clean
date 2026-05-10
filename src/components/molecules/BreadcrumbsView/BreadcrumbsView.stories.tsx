import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import BreadcrumbsView, { BreadcrumbItem } from './BreadcrumbsView';

const meta = {
	title: 'Molecules/BreadcrumbsView',
	component: BreadcrumbsView,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Presentational breadcrumb chain. Decoupled version of the dashboard `BreadCrumbs` (which is wired to the Zustand breadcrumbs store and react-router) — this one takes items as props for isolated use, tests, and Storybook.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		items: { control: 'object' },
	},
	args: {
		items: [
			{ label: 'Product Catalog', href: '/product-catalog' },
			{ label: 'Features' },
		],
	},
} satisfies Meta<typeof BreadcrumbsView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two-level breadcrumb — matches the Features page in the live dashboard. */
export const Default: Story = {};

/** Three levels deep. */
export const ThreeLevels: Story = {
	args: {
		items: [
			{ label: 'Billing', href: '/billing' },
			{ label: 'Customers', href: '/billing/customers' },
			{ label: 'Acme Corp' },
		],
	},
};

/** Single item — only the current page (no chevrons). */
export const SinglePage: Story = {
	args: { items: [{ label: 'Revenue' }] },
};

/** Long labels truncate gracefully without breaking the layout. */
export const LongLabels: Story = {
	args: {
		items: [
			{ label: 'Tools', href: '/tools' },
			{ label: 'Bulk Imports', href: '/tools/imports' },
			{ label: 'a-very-long-import-task-name-that-should-truncate-not-overflow' },
		],
	},
};

/** Click handlers instead of hrefs — useful when you don't want a real navigation. */
export const ClickHandlers: Story = {
	args: {
		items: [
			{ label: 'Developers', onClick: fn() },
			{ label: 'API Keys', onClick: fn() },
			{ label: 'fp_live_xxxxx' },
		] satisfies BreadcrumbItem[],
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const developers = canvas.getByRole('button', { name: /developers/i });
		await userEvent.click(developers);

		// The clicked item's onClick is the contract being verified.
		await expect(args.items[0].onClick).toHaveBeenCalledTimes(1);

		// The last item is the current page — non-interactive (no role=button).
		await expect(canvas.queryByRole('button', { name: /fp_live_xxxxx/i })).toBeNull();
	},
};
