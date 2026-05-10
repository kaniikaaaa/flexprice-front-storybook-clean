import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { useState } from 'react';
import {
	Home,
	Layers2,
	Landmark,
	BarChart3,
	Settings,
	CodeXml,
	Puzzle,
	GalleryHorizontalEnd,
} from 'lucide-react';
import SidebarNav, { SidebarNavItem } from './SidebarNav';

const navItems: SidebarNavItem[] = [
	{ id: 'home', label: 'Home', icon: Home },
	{
		id: 'catalog',
		label: 'Product Catalog',
		icon: Layers2,
		items: [
			{ id: 'features', label: 'Features' },
			{ id: 'plans', label: 'Plans' },
			{ id: 'coupons', label: 'Coupons' },
			{ id: 'addons', label: 'Addons' },
			{ id: 'price-units', label: 'Price Units' },
		],
	},
	{
		id: 'billing',
		label: 'Billing',
		icon: Landmark,
		items: [
			{ id: 'customers', label: 'Customers' },
			{ id: 'subscriptions', label: 'Subscriptions' },
			{ id: 'invoices', label: 'Invoices' },
			{ id: 'credit-notes', label: 'Credit Notes' },
			{ id: 'payments', label: 'Payments' },
		],
	},
	{ id: 'revenue', label: 'Revenue', icon: BarChart3 },
	{
		id: 'tools',
		label: 'Tools',
		icon: Settings,
		items: [
			{ id: 'imports', label: 'Imports' },
			{ id: 'exports', label: 'Exports' },
		],
	},
	{
		id: 'developers',
		label: 'Developers',
		icon: CodeXml,
		items: [
			{ id: 'events', label: 'Events Debugger' },
			{ id: 'api-keys', label: 'API Keys' },
			{ id: 'webhooks', label: 'Webhooks' },
		],
	},
	{ id: 'integrations', label: 'Integrations', icon: Puzzle },
	{ id: 'pricing', label: 'Pricing Widget', icon: GalleryHorizontalEnd },
];

const meta = {
	title: 'Organisms/SidebarNav',
	component: SidebarNav,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'The dashboard left-rail navigation. Top-level items can be flat links or collapsible groups. The active item is highlighted by matching `activeId`; the parent of an active sub-item auto-expands on first mount. Pure presentation — wire `onSelect` to your routing layer.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		collapsed: { control: 'boolean' },
		activeId: { control: 'text' },
		onSelect: { action: 'selected' },
	},
	args: {
		items: navItems,
		activeId: 'invoices',
		collapsed: false,
		onSelect: fn(),
	},
	decorators: [
		(Story) => (
			<div className='h-[640px] flex bg-white'>
				<Story />
				<div className='flex-1 p-6 text-sm text-gray-400'>Page content</div>
			</div>
		),
	],
} satisfies Meta<typeof SidebarNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — Billing → Invoices is active, the Billing group auto-expands. */
export const Default: Story = {};

/** Collapsed (icon-only) rail — used on smaller viewports or when the user pins it. */
export const Collapsed: Story = { args: { collapsed: true } };

/** Active leaf is a flat top-level item (Home, Revenue). */
export const FlatItemActive: Story = { args: { activeId: 'revenue' } };

/** Active sub-item inside a deeply nested group — `developers / api-keys`. */
export const DeepActive: Story = { args: { activeId: 'api-keys' } };

/** Header + footer slots — drop in environment selector, logo, user profile, etc. */
export const WithChrome: Story = {
	args: {
		header: (
			<div className='flex items-center gap-2 px-2 py-1.5 rounded-md border border-gray-200 bg-white text-xs font-medium text-gray-700'>
				<span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
				Production
			</div>
		),
		footer: (
			<div className='flex items-center gap-2 px-2 py-1'>
				<div className='w-7 h-7 rounded-full bg-zinc-300' />
				<div className='flex flex-col text-xs leading-tight'>
					<span className='font-medium text-gray-900'>Kanika</span>
					<span className='text-gray-500'>Acme Inc</span>
				</div>
			</div>
		),
	},
};

/**
 * Live demo — clicking a leaf updates the active item. Demonstrates the
 * parent-sub-item activation contract.
 */
export const Interactive: Story = {
	render: function Render(args) {
		const [active, setActive] = useState<string>('home');
		return <SidebarNav {...args} activeId={active} onSelect={setActive} />;
	},
};

/**
 * Interaction test — expand the "Billing" group, click "Customers", and
 * assert `onSelect` fires with the leaf id.
 */
export const ClickInteraction: Story = {
	args: { activeId: 'home' },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		// Billing is a parent group — first click expands the accordion.
		const billing = canvas.getByRole('button', { name: /billing/i });
		await userEvent.click(billing);
		// Customers is a sub-item — second click selects it.
		const customers = await canvas.findByRole('button', { name: 'Customers' });
		await userEvent.click(customers);
		await expect(args.onSelect).toHaveBeenCalledWith('customers');
	},
};
