import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

interface CustomProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
	/** Tailwind class for the filled portion (e.g. `bg-emerald-500`). */
	indicatorColor?: string;
	/** Tailwind class for the rail. Defaults to `bg-secondary`. */
	backgroundColor?: string;
	/** Optional caption rendered below the bar (e.g. "8 / 10 GB used"). */
	label?: React.ReactNode;
	/** Tailwind class for the label text colour. */
	labelColor?: string;
	className?: string;
}

/**
 * Determinate progress bar built on top of Radix Progress, with an optional
 * caption row below. Used as the underlying primitive for usage meters
 * (entitlement vs consumption), import progress, and onboarding completion
 * percentages. Recolour via `indicatorColor` / `backgroundColor` Tailwind
 * classes — the component does not enforce a green/red threshold itself.
 */
const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, CustomProgressProps>(
	({ className, value, indicatorColor, label, backgroundColor, labelColor, ...props }, ref) => (
		<div className='flex flex-col gap-1'>
			<ProgressPrimitive.Root
				ref={ref}
				className={cn('relative h-4 w-full overflow-hidden rounded-full', backgroundColor ? backgroundColor : 'bg-secondary', className)}
				{...props}>
				<ProgressPrimitive.Indicator
					className={cn('h-full w-full flex-1 transition-all', indicatorColor ? indicatorColor : 'bg-primary')}
					style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
				/>
			</ProgressPrimitive.Root>
			<p className={cn('text-xs font-medium w-full', labelColor)}>{label}</p>
		</div>
	),
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export default Progress;
