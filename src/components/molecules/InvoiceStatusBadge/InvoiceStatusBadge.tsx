import { FC } from 'react';
import { Check, Clock, X, FileText, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import Chip from '@/components/atoms/Chip/Chip';
import { INVOICE_STATUS } from '@/models/Invoice';
import { PAYMENT_STATUS } from '@/constants/payment';

type ChipVariant = 'default' | 'success' | 'warning' | 'failed' | 'info';

interface StatusConfig {
	variant: ChipVariant;
	label: string;
	Icon: typeof Check;
}

const INVOICE_CONFIG: Record<INVOICE_STATUS, StatusConfig> = {
	[INVOICE_STATUS.DRAFT]: { variant: 'info', label: 'Draft', Icon: FileText },
	[INVOICE_STATUS.FINALIZED]: { variant: 'success', label: 'Finalized', Icon: Check },
	[INVOICE_STATUS.VOIDED]: { variant: 'default', label: 'Void', Icon: AlertCircle },
	[INVOICE_STATUS.SKIPPED]: { variant: 'default', label: 'Skipped', Icon: AlertCircle },
};

const PAYMENT_CONFIG: Record<PAYMENT_STATUS, StatusConfig> = {
	[PAYMENT_STATUS.PENDING]: { variant: 'warning', label: 'Pending', Icon: Clock },
	[PAYMENT_STATUS.PROCESSING]: { variant: 'warning', label: 'Processing', Icon: Loader2 },
	[PAYMENT_STATUS.INITIATED]: { variant: 'warning', label: 'Initiated', Icon: Clock },
	[PAYMENT_STATUS.SUCCEEDED]: { variant: 'success', label: 'Succeeded', Icon: Check },
	[PAYMENT_STATUS.FAILED]: { variant: 'failed', label: 'Failed', Icon: X },
	[PAYMENT_STATUS.REFUNDED]: { variant: 'default', label: 'Refunded', Icon: RefreshCw },
	[PAYMENT_STATUS.PARTIALLY_REFUNDED]: { variant: 'default', label: 'Partially Refunded', Icon: RefreshCw },
	[PAYMENT_STATUS.OVERPAID]: { variant: 'warning', label: 'Overpaid', Icon: AlertCircle },
};

interface InvoiceStatusBadgeProps {
	/** Either an invoice status (DRAFT/FINALIZED/VOIDED/SKIPPED) or a payment status (PENDING/SUCCEEDED/FAILED/…). */
	status: INVOICE_STATUS | PAYMENT_STATUS;
	/** Override the displayed label. */
	label?: string;
}

/**
 * Coloured chip + icon mapping a FlexPrice invoice or payment status to its
 * canonical dashboard visual. Centralises the status → (variant, label, icon)
 * lookup in one place — replaces the icon-less `getStatusChip` /
 * `getPaymentStatusChip` helpers in `InvoiceTable`.
 */
const InvoiceStatusBadge: FC<InvoiceStatusBadgeProps> = ({ status, label }) => {
	const config =
		(INVOICE_CONFIG as Record<string, StatusConfig | undefined>)[status] ??
		(PAYMENT_CONFIG as Record<string, StatusConfig | undefined>)[status];
	if (!config) return <Chip variant='default' label={label ?? status} />;
	const { variant, label: defaultLabel, Icon } = config;
	return <Chip variant={variant} label={label ?? defaultLabel} icon={<Icon size={14} />} />;
};

export default InvoiceStatusBadge;
