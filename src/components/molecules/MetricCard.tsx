import { formatNumber } from '@/utils/common';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
	/** Label rendered above the value (e.g. "MRR", "Active customers"). */
	title: string;
	/** Primary numeric value. Formatted to 2 decimals via `formatNumber`. */
	value: number;
	/** ISO 4217 code — when set, the currency symbol is prefixed to the value. */
	currency?: string;
	/** Display value as a percentage (appends "%"). Mutually exclusive with `currency`. */
	isPercent?: boolean;
	/** Show the trend arrow + (optionally) the `change` value beside the value. */
	showChangeIndicator?: boolean;
	/** Inverts the arrow direction and uses the red palette. */
	isNegative?: boolean;
	/**
	 * Period-over-period delta to render alongside the trend arrow (e.g. `+12.4`
	 * shown as `+12.4%`). When omitted, only the arrow icon is shown.
	 */
	change?: number;
}

/**
 * KPI card used on the Home dashboard and on per-feature analytics pages.
 * Renders a label above a large primary value, with an optional trend
 * indicator (up/down arrow + numeric delta) on the right. Currency vs
 * percentage formatting is mutually exclusive — pass exactly one of
 * `currency` or `isPercent`.
 */
const MetricCard: React.FC<MetricCardProps> = ({
	title,
	value,
	currency,
	isPercent = false,
	showChangeIndicator = false,
	isNegative = false,
	change,
}) => {
	const arrowColor = isNegative ? 'text-[#DC2626]' : 'text-[#16A34A]';

	const renderValue = () => {
		if (isPercent) {
			return `${formatNumber(value, 2)}%`;
		}
		if (currency) {
			return `${getCurrencySymbol(currency)} ${formatNumber(value, 2)}`;
		}
		return formatNumber(value, 2);
	};

	return (
		<div className='bg-white border border-[#E5E7EB] p-[25px] flex flex-col gap-3 rounded-md'>
			<p className='text-[14px] leading-[21px] text-[#4B5563] font-normal'>{title}</p>
			<p className='text-[24px] leading-[28px] font-medium text-[#111827] flex items-center'>
				{renderValue()}
				{showChangeIndicator && (
					<span className={`inline-flex items-center gap-1 ${arrowColor} ml-3 text-[14px] font-medium`}>
						{isNegative ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
						{change !== undefined && (
							<span>
								{isNegative ? '' : '+'}
								{formatNumber(change, 1)}%
							</span>
						)}
					</span>
				)}
			</p>
		</div>
	);
};

export default MetricCard;
