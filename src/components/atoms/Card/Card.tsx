import { getTypographyClass } from '@/lib/typography';
import { cn } from '@/lib/utils';
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * `notched` adds a coloured vertical accent bar via `notchColor`/`notchPosition`/`notchSize`.
	 * `warning` is the red-tinted variant for inline error messages.
	 */
	variant?: 'default' | 'notched' | 'bordered' | 'elevated' | 'warning';
	/** Notch accent colour (only applied when `variant === 'notched'`). */
	notchColor?: string;
	/** Side the notch accent renders on. */
	notchPosition?: 'left' | 'right';
	/** Notch thickness. */
	notchSize?: 'sm' | 'md' | 'lg';
	/** Strip the default `p-6` padding (e.g. for cards that wrap their own table). */
	noPadding?: boolean;
	children?: React.ReactNode;
}

/**
 * General-purpose surface used across the dashboard for KPIs, list
 * containers, and modal-like panels. Supports five visual variants
 * (`default`, `notched`, `bordered`, `elevated`, `warning`) and an optional
 * `noPadding` mode for cases where the card wraps its own table or chart.
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
	(
		{
			className,
			variant = 'default',
			notchColor = 'zinc',
			notchPosition = 'left',
			notchSize = 'md',
			noPadding = false,
			children,
			...props
		},
		ref,
	) => {
		const notchSizes = {
			sm: 'before:w-0.5',
			md: 'before:w-[3px]',
			lg: 'before:w-1',
		};

		const getNotchColor = (color: string) => {
			const colors: Record<string, string> = {
				zinc: 'before:bg-zinc-300',
				primary: 'before:bg-primary',
				// warning: 'before:bg-red-500',
				// Add more color options as needed
			};
			return colors[color] || `before:bg-[${color}]`;
		};

		const variants = {
			default: 'border border-gray-300',
			notched: cn(
				'relative',
				'border border-gray-200 shadow-sm',
				notchPosition === 'left' ? 'pl-8' : 'pr-8',
				'before:absolute',
				notchPosition === 'left' ? 'before:left-0' : 'before:right-0',
				'before:top-6',
				'before:h-8',
				notchSizes[notchSize],
				notchPosition === 'left' ? 'before:rounded-r' : 'before:rounded-l',
				getNotchColor(notchColor),
			),
			bordered: 'border-2 border-gray-300',
			elevated: 'border border-gray-200 shadow-lg',
			warning: ' border border-red-200 text-red-600',
		};

		return (
			<div ref={ref} className={cn('rounded-[6px]', !noPadding && 'p-6', variants[variant], className)} {...props}>
				{children}
			</div>
		);
	},
);

Card.displayName = 'Card';

interface HeaderProps {
	title: string;
	subtitle?: string;
	cta?: React.ReactNode;
	className?: string;
	titleClassName?: string;
}
export const CardHeader = ({ title, subtitle, cta, className, titleClassName }: HeaderProps) => {
	return (
		<div>
			<div className={cn('flex items-center justify-between mb-4', className)}>
				<div>
					<h3 className={cn(getTypographyClass('card-header'), titleClassName)}>{title}</h3>
				</div>
				{cta && cta}
			</div>
			{subtitle && <p className={getTypographyClass('card-subtitle')}>{subtitle}</p>}
		</div>
	);
};

export default Card;
