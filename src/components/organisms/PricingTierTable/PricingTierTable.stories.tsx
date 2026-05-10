import type { Meta, StoryObj } from '@storybook/react';
import PricingTierTable, { PricingTier } from './PricingTierTable';

const apiCallTiers: PricingTier[] = [
	{ from: 0, to: 1_000, unitPrice: 0 },
	{ from: 1_001, to: 10_000, unitPrice: 0.005 },
	{ from: 10_001, to: 100_000, unitPrice: 0.0025 },
	{ from: 100_001, to: null, unitPrice: 0.001 },
];

const tieredWithFlatFees: PricingTier[] = [
	{ from: 0, to: 100, unitPrice: 0, flatFee: 0 },
	{ from: 101, to: 1_000, unitPrice: 0.05, flatFee: 25 },
	{ from: 1_001, to: 10_000, unitPrice: 0.04, flatFee: 100 },
	{ from: 10_001, to: null, unitPrice: 0.03, flatFee: 500 },
];

const meta = {
	title: 'Organisms/PricingTierTable',
	component: PricingTierTable,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Tabular view of a usage-based pricing schedule. Supports **graduated** (per-tier rate) and **volume** (all-units-at-active-tier-rate) modes, optional flat fees, and an `Active` row highlight for showing a customer\'s current usage tier.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		mode: { control: 'inline-radio', options: ['graduated', 'volume'] },
		currency: { control: 'select', options: ['USD', 'EUR', 'INR', 'GBP'] },
		unitLabel: { control: 'text' },
		highlightTierIndex: {
			control: { type: 'number', min: -1, max: 5, step: 1 },
			description: 'Index of the tier to highlight as Active. Use -1 to disable.',
		},
	},
	args: {
		tiers: apiCallTiers,
		mode: 'graduated',
		currency: 'USD',
		unitLabel: 'API call',
	},
	decorators: [
		(Story) => (
			<div style={{ maxWidth: 720 }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof PricingTierTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — graduated API-call pricing, 4 tiers, no active highlight. */
export const Default: Story = {};

/** Volume mode — all units billed at the rate of the tier the total falls into. */
export const VolumePricing: Story = {
	args: { mode: 'volume' },
};

/** With a tier highlighted as the customer's current usage tier. */
export const WithActiveTier: Story = {
	args: { highlightTierIndex: 2 },
};

/** Includes flat fees alongside per-unit pricing — common in enterprise contracts. */
export const WithFlatFees: Story = {
	args: {
		tiers: tieredWithFlatFees,
		unitLabel: 'GB',
		highlightTierIndex: 1,
	},
};

/** Custom unit label and currency — Indian rupees per SMS. */
export const CustomUnitAndCurrency: Story = {
	args: {
		currency: 'INR',
		unitLabel: 'SMS',
		tiers: [
			{ from: 0, to: 5_000, unitPrice: 0.15 },
			{ from: 5_001, to: 50_000, unitPrice: 0.1 },
			{ from: 50_001, to: null, unitPrice: 0.07 },
		],
	},
};

/** Two-tier: simple "first 1000 free, then $0.01/call" plan. */
export const SimpleTwoTier: Story = {
	args: {
		tiers: [
			{ from: 0, to: 1_000, unitPrice: 0 },
			{ from: 1_001, to: null, unitPrice: 0.01 },
		],
	},
};
