import { FC, useMemo } from 'react';
import { cn } from '@/lib/utils';

export type PricingMode = 'volume' | 'graduated';

export interface PricingTier {
	/** Inclusive lower bound of the tier (in units). */
	from: number;
	/** Inclusive upper bound. `null` (or undefined) means "and above". */
	to?: number | null;
	/** Per-unit price within this tier, in the smallest currency unit (e.g. cents). */
	unitPrice: number;
	/** Optional flat fee charged once per period when this tier is active. */
	flatFee?: number;
}

interface PricingTierTableProps {
	/** Ordered list of tiers — must be contiguous and ascending by `from`. */
	tiers: PricingTier[];
	/**
	 * Pricing mode:
	 * - `graduated` — each unit charged at the rate of the tier it falls into (most usage-based plans).
	 * - `volume` — all units charged at the rate of the tier the **total** falls into.
	 */
	mode?: PricingMode;
	/** ISO 4217 currency code, e.g. `USD`. */
	currency?: string;
	/** Per-unit display label (e.g. "API call", "GB"). */
	unitLabel?: string;
	/** Highlight a specific tier (0-indexed) — used to show the current usage tier. */
	highlightTierIndex?: number;
	className?: string;
}

// Sub-cent prices (e.g. $0.005 / API call) need 4 decimals; cent-and-up prices
// look right at 2. Two formatters per currency, memoized at the table level.
const buildFormatters = (currency: string) => ({
	low: new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 4, maximumFractionDigits: 4 }),
	high: new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }),
});

const formatRange = (tier: PricingTier, unitLabel: string): string => {
	const from = tier.from.toLocaleString();
	if (tier.to == null) return `${from}+ ${unitLabel}s`;
	return `${from} – ${tier.to.toLocaleString()} ${unitLabel}s`;
};

/**
 * Tabular representation of a usage-based pricing schedule. Renders each tier
 * as a row showing the unit-range, per-unit price, and optional flat fee.
 *
 * Supports both **graduated** (per-unit at each tier's rate) and **volume**
 * (all units at the active tier's rate) pricing modes — the difference is
 * surfaced in the header copy.
 *
 * `highlightTierIndex` is the most useful prop in real dashboards: pass the
 * customer's current usage tier and the row will be visually flagged so a
 * support agent can see at a glance what they're paying.
 */
const PricingTierTable: FC<PricingTierTableProps> = ({
	tiers,
	mode = 'graduated',
	currency = 'USD',
	unitLabel = 'unit',
	highlightTierIndex,
	className,
}) => {
	const showFlatFee = tiers.some((t) => t.flatFee && t.flatFee > 0);
	const fmt = useMemo(() => buildFormatters(currency), [currency]);
	const formatPrice = (price: number) =>
		price === 0 ? 'Free' : (price < 1 ? fmt.low : fmt.high).format(price);

	return (
		<div
			className={cn(
				'rounded-md border border-gray-200 bg-white overflow-hidden',
				className,
			)}>
			<div className='flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50'>
				<h3 className='text-sm font-medium text-gray-900'>
					{mode === 'graduated' ? 'Graduated tiered pricing' : 'Volume tiered pricing'}
				</h3>
				<span className='text-xs text-gray-500'>
					{mode === 'graduated'
						? 'Each unit billed at its tier rate'
						: 'All units billed at the active tier rate'}
				</span>
			</div>

			<table className='w-full text-sm'>
				<thead>
					<tr className='text-left text-xs uppercase text-gray-500 border-b border-gray-200'>
						<th className='px-4 py-2 font-medium'>Tier</th>
						<th className='px-4 py-2 font-medium'>Range</th>
						<th className='px-4 py-2 font-medium text-right'>Per {unitLabel}</th>
						{showFlatFee && <th className='px-4 py-2 font-medium text-right'>Flat fee</th>}
					</tr>
				</thead>
				<tbody>
					{tiers.map((tier, idx) => {
						const isHighlighted = idx === highlightTierIndex;
						return (
							<tr
								key={`${tier.from}-${tier.to ?? 'inf'}`}
								className={cn(
									'border-b border-gray-100 last:border-b-0',
									isHighlighted && 'bg-blue-50/60',
								)}>
								<td
									className={cn(
										'px-4 py-2.5 font-medium tabular-nums',
										isHighlighted ? 'text-blue-700' : 'text-gray-900',
									)}>
									{idx + 1}
									{isHighlighted && (
										<span className='ml-2 text-[10px] uppercase tracking-wide font-semibold text-blue-600'>
											Active
										</span>
									)}
								</td>
								<td className='px-4 py-2.5 text-gray-700 tabular-nums'>
									{formatRange(tier, unitLabel)}
								</td>
								<td className='px-4 py-2.5 text-right font-medium text-gray-900 tabular-nums'>
									{formatPrice(tier.unitPrice)}
								</td>
								{showFlatFee && (
									<td className='px-4 py-2.5 text-right text-gray-700 tabular-nums'>
										{tier.flatFee ? formatPrice(tier.flatFee, currency) : '—'}
									</td>
								)}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

export default PricingTierTable;
