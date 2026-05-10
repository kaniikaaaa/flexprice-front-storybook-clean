import { FC } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
	label: string;
	href?: string;
	onClick?: () => void;
}

interface BreadcrumbsViewProps {
	items: BreadcrumbItem[];
	className?: string;
}

/**
 * Presentational breadcrumb chain. A decoupled version of the dashboard's
 * `BreadCrumbs` molecule (which is wired to the Zustand breadcrumbs store
 * and react-router) — this one takes its items as props so it can be used
 * in isolation, in tests, and in Storybook.
 *
 * Renders each item separated by a chevron. The last item is rendered as
 * bold/non-clickable; earlier items are anchors (or buttons if `onClick`
 * is provided instead of `href`).
 */
const BreadcrumbsView: FC<BreadcrumbsViewProps> = ({ items, className }) => {
	return (
		<nav className={cn('flex items-center gap-2 text-sm text-gray-500', className)} aria-label="Breadcrumb">
			{items.map((item, index) => {
				const isLast = index === items.length - 1;
				const labelClass = cn(
					'capitalize max-w-[160px] truncate',
					isLast ? 'font-medium text-[#020617]' : 'hover:text-gray-800',
				);

				return (
					<span key={`${item.label}-${index}`} className="flex items-center gap-2 min-w-0">
						{isLast ? (
							<span className={labelClass} title={item.label} aria-current="page">
								{item.label}
							</span>
						) : item.onClick ? (
							<button type="button" onClick={item.onClick} className={cn(labelClass, 'cursor-pointer')} title={item.label}>
								{item.label}
							</button>
						) : (
							<a href={item.href ?? '#'} className={labelClass} title={item.label}>
								{item.label}
							</a>
						)}
						{!isLast && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
					</span>
				);
			})}
		</nav>
	);
};

export default BreadcrumbsView;
