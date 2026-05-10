import type { Meta, StoryObj } from '@storybook/react';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import { INVOICE_STATUS } from '@/models/Invoice';
import { PAYMENT_STATUS } from '@/constants/payment';

const ALL_STATUSES = [
	...Object.values(INVOICE_STATUS),
	...Object.values(PAYMENT_STATUS),
] as const;

const meta = {
	title: 'Molecules/InvoiceStatusBadge',
	component: InvoiceStatusBadge,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Centralises the `invoice/payment status → (colour, icon, label)` mapping so every cell, row, and detail panel renders consistently. Accepts the canonical `INVOICE_STATUS` and `PAYMENT_STATUS` enums.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		status: { control: 'select', options: ALL_STATUSES },
		label: { control: 'text' },
	},
	args: { status: PAYMENT_STATUS.SUCCEEDED },
} satisfies Meta<typeof InvoiceStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — a successful payment. */
export const Default: Story = {};

/** All invoice statuses (DRAFT / FINALIZED / VOIDED / SKIPPED). */
export const InvoiceStatuses: Story = {
	render: () => (
		<div className='flex flex-col items-start gap-2'>
			{Object.values(INVOICE_STATUS).map((s) => (
				<InvoiceStatusBadge key={s} status={s} />
			))}
		</div>
	),
};

/** All payment statuses (PENDING / SUCCEEDED / FAILED / REFUNDED / …). */
export const PaymentStatuses: Story = {
	render: () => (
		<div className='flex flex-col items-start gap-2'>
			{Object.values(PAYMENT_STATUS).map((s) => (
				<InvoiceStatusBadge key={s} status={s} />
			))}
		</div>
	),
};

export const Pending: Story = { args: { status: PAYMENT_STATUS.PENDING } };
export const Failed: Story = { args: { status: PAYMENT_STATUS.FAILED } };
export const Draft: Story = { args: { status: INVOICE_STATUS.DRAFT } };
export const Voided: Story = { args: { status: INVOICE_STATUS.VOIDED } };

/** Custom label — for when the API returns a localised override. */
export const CustomLabel: Story = {
	args: { status: PAYMENT_STATUS.FAILED, label: 'Card declined' },
};
