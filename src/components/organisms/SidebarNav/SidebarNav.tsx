import { FC, ReactNode, useState } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarNavSubItem {
	id: string;
	label: string;
	href?: string;
	icon?: LucideIcon;
}

export interface SidebarNavItem {
	id: string;
	label: string;
	href?: string;
	icon: LucideIcon;
	items?: SidebarNavSubItem[];
}

interface SidebarNavProps {
	/** Top-level nav sections. Items with `items` render as collapsible groups. */
	items: SidebarNavItem[];
	/** ID of the currently active leaf — matched against item.id and subItem.id. */
	activeId?: string;
	/** Whether the sidebar is in collapsed (icon-only) state. */
	collapsed?: boolean;
	/** Optional header rendered above the nav (e.g. environment selector, logo). */
	header?: ReactNode;
	/** Optional footer rendered below the nav (e.g. user profile, upgrade CTA). */
	footer?: ReactNode;
	/** Called when any leaf nav item is clicked. */
	onSelect?: (id: string) => void;
	className?: string;
}

/**
 * Collapsible left-rail navigation organism, modelled on the FlexPrice dashboard
 * sidebar. Top-level items can be either flat links (Home, Revenue) or
 * accordion sections that expand into sub-items (Product Catalog, Billing,
 * Developers).
 *
 * - When `collapsed`, only icons render (24×24) with an aria-label tooltip.
 * - The active item is highlighted by matching `activeId` against `item.id` or
 *   any `subItem.id`. The parent of an active sub-item is auto-expanded.
 * - Pure presentation: routing is the consumer's responsibility — wire `onSelect`
 *   to `react-router` (or whatever routing layer) at the application boundary.
 */
const SidebarNav: FC<SidebarNavProps> = ({
	items,
	activeId,
	collapsed = false,
	header,
	footer,
	onSelect,
	className,
}) => {
	const isParentActive = (item: SidebarNavItem): boolean =>
		item.id === activeId || (item.items?.some((s) => s.id === activeId) ?? false);

	const [openIds, setOpenIds] = useState<Set<string>>(
		() => new Set(items.filter((i) => i.items?.some((s) => s.id === activeId)).map((i) => i.id)),
	);

	const toggleOpen = (id: string) => {
		setOpenIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	return (
		<nav
			aria-label='Main navigation'
			className={cn(
				'flex flex-col h-full bg-[#f9f9f9] border-r border-gray-200 transition-[width] duration-200',
				collapsed ? 'w-[60px] px-2 py-3' : 'w-[240px] px-3 py-3',
				className,
			)}>
			{header && <div className='mb-3'>{header}</div>}

			<ul className='flex flex-col gap-0.5 flex-1 overflow-y-auto'>
				{items.map((item) => {
					const Icon = item.icon;
					const hasChildren = !!item.items?.length;
					const open = openIds.has(item.id) && !collapsed;
					const active = isParentActive(item);

					return (
						<li key={item.id}>
							<button
								type='button'
								aria-label={collapsed ? item.label : undefined}
								aria-expanded={hasChildren ? open : undefined}
								onClick={() => {
									if (hasChildren && !collapsed) toggleOpen(item.id);
									else onSelect?.(item.id);
								}}
								className={cn(
									'w-full flex items-center gap-2 h-10 rounded-md text-[14px] transition-colors',
									collapsed ? 'justify-center px-0' : 'px-2',
									active
										? 'bg-zinc-200 border border-zinc-300 font-medium text-gray-900'
										: 'border border-transparent font-normal text-gray-700 hover:bg-gray-100',
								)}>
								<Icon
									absoluteStrokeWidth
									className={cn(
										'!size-5 !stroke-[1.5px] shrink-0',
										active ? 'text-blue-600' : 'text-[#3F3F46]',
									)}
								/>
								{!collapsed && <span className='flex-1 text-left truncate'>{item.label}</span>}
								{!collapsed && hasChildren && (
									<ChevronDown
										size={14}
										className={cn(
											'shrink-0 text-gray-400 transition-transform duration-200',
											open && 'rotate-180',
										)}
									/>
								)}
							</button>

							{hasChildren && open && (
								<ul className='mt-0.5 ml-2 pl-3 border-l border-gray-200 flex flex-col gap-0.5'>
									{item.items!.map((sub) => {
										const SubIcon = sub.icon;
										const subActive = sub.id === activeId;
										return (
											<li key={sub.id}>
												<button
													type='button'
													onClick={() => onSelect?.(sub.id)}
													className={cn(
														'w-full flex items-center gap-2 h-8 px-2 rounded-md text-[13px] transition-colors',
														subActive
															? 'text-blue-600 font-medium'
															: 'text-gray-600 font-normal hover:text-gray-900',
													)}>
													{SubIcon && (
														<SubIcon
															absoluteStrokeWidth
															className={cn('!size-4 !stroke-[1.5px] shrink-0')}
														/>
													)}
													<span className='flex-1 text-left truncate'>{sub.label}</span>
												</button>
											</li>
										);
									})}
								</ul>
							)}
						</li>
					);
				})}
			</ul>

			{footer && <div className='mt-3 pt-3 border-t border-gray-200'>{footer}</div>}
		</nav>
	);
};

export default SidebarNav;
