import { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
	icon?: ReactNode;
	title: string;
	description?: string;
	action?: ReactNode;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

/**
 * Full-area empty state — icon + headline + subtext + optional CTA, vertically
 * centered inside a bordered card. Used in place of a data table or chart when
 * there is nothing to show. Distinct from `NoDataCard`, which is the inline
 * panel variant.
 *
 * `size` controls the card height (`sm` = 240px, `md` = 360px, `lg` = 480px)
 * for use in tighter or fuller layouts.
 */
const EmptyState: FC<EmptyStateProps> = ({ icon, title, description, action, size = 'md', className }) => {
	const heightClass = {
		sm: 'min-h-[240px]',
		md: 'min-h-[360px]',
		lg: 'min-h-[480px]',
	}[size];

	return (
		<div
			className={cn(
				'bg-[#fafafa] border border-[#E9E9E9] rounded-[6px] w-full flex flex-col items-center justify-center px-6 py-10 text-center',
				heightClass,
				className,
			)}>
			{icon && <div className="mb-6 text-gray-400">{icon}</div>}
			<h3 className="font-medium text-[20px] leading-normal text-gray-700 mb-2">{title}</h3>
			{description && (
				<p className="font-normal text-[15px] leading-relaxed text-gray-500 mb-6 max-w-[420px]">{description}</p>
			)}
			{action && <div>{action}</div>}
		</div>
	);
};

export default EmptyState;
