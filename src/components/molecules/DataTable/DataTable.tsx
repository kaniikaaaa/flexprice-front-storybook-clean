import { useMemo, useRef, useState, ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc' | null;

export interface DataTableColumn<T> {
	/** Stable id used for sorting and React keys. */
	id: string;
	/** Header label. */
	header: ReactNode;
	/** How to render a row's value for this column. */
	render: (row: T, rowIndex: number) => ReactNode;
	/** Optional comparator override. If omitted but `sortable` is true, comparison uses `String(render(...))`. */
	sortBy?: (row: T) => string | number | Date;
	/** Whether this column shows sort affordances and accepts clicks on the header. */
	sortable?: boolean;
	/** Fixed pixel width or any valid CSS width. */
	width?: number | string;
	className?: string;
	headerClassName?: string;
}

export interface PaginationProps {
	page: number;
	pageSize: number;
	total: number;
	onPageChange: (page: number) => void;
}

export interface DataTableProps<T> {
	columns: DataTableColumn<T>[];
	data: T[];
	getRowId?: (row: T, index: number) => string;
	loading?: boolean;
	loadingRowCount?: number;
	emptyState?: ReactNode;

	/** Enable row virtualisation via `@tanstack/react-virtual`. Required for large lists. */
	virtualized?: boolean;
	/** Estimated row height in pixels. Used by the virtualizer to size the scrollback before rows mount. */
	estimatedRowHeight?: number;
	/** Number of rows to render outside the viewport on each side. Trades memory for scroll smoothness. */
	overscan?: number;
	/** Container height (only used when `virtualized` is true). Accepts any valid CSS height. */
	height?: number | string;

	pagination?: PaginationProps;
	className?: string;
}

/**
 * Sortable, optionally virtualised data table. Used as the base for Customers,
 * Invoices, Events, and other list pages in the dashboard.
 *
 * Pass `virtualized` when rendering >500 rows — the table will only mount the
 * rows currently visible in the viewport (plus an `overscan` buffer), making
 * 10k+ row scenarios scroll at 60fps.
 *
 * `estimatedRowHeight` is a hint, not a constraint — `react-virtual` measures
 * each rendered row dynamically and adjusts, so rows with variable heights
 * (e.g. truncated descriptions, badges that wrap) work correctly.
 */
function DataTable<T>({
	columns,
	data,
	getRowId,
	loading = false,
	loadingRowCount = 8,
	emptyState,
	virtualized = false,
	estimatedRowHeight = 44,
	overscan = 8,
	height = 480,
	pagination,
	className,
}: DataTableProps<T>) {
	const [sort, setSort] = useState<{ columnId: string; direction: SortDirection }>({ columnId: '', direction: null });

	const gridTemplateColumns = useMemo(
		() =>
			columns
				.map((c) => (typeof c.width === 'number' ? `${c.width}px` : c.width || '1fr'))
				.join(' '),
		[columns],
	);

	const sortedData = useMemo(() => {
		if (!sort.direction || !sort.columnId) return data;
		const col = columns.find((c) => c.id === sort.columnId);
		if (!col || !col.sortable) return data;
		const valueOf = (row: T) =>
			col.sortBy ? col.sortBy(row) : String(col.render(row, 0));
		const sign = sort.direction === 'asc' ? 1 : -1;
		return [...data].sort((a, b) => {
			const av = valueOf(a);
			const bv = valueOf(b);
			if (av < bv) return -1 * sign;
			if (av > bv) return 1 * sign;
			return 0;
		});
	}, [data, columns, sort]);

	const handleSort = (columnId: string) => {
		setSort((prev) => {
			if (prev.columnId !== columnId) return { columnId, direction: 'asc' };
			if (prev.direction === 'asc') return { columnId, direction: 'desc' };
			if (prev.direction === 'desc') return { columnId: '', direction: null };
			return { columnId, direction: 'asc' };
		});
	};

	const renderSortIcon = (col: DataTableColumn<T>) => {
		if (!col.sortable) return null;
		const active = sort.columnId === col.id && sort.direction;
		if (!active) return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" />;
		return sort.direction === 'asc'
			? <ChevronUp className="h-3.5 w-3.5 text-gray-700" />
			: <ChevronDown className="h-3.5 w-3.5 text-gray-700" />;
	};

	const tableHeader = (
		<div className="grid border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
			style={{ gridTemplateColumns }}>
			{columns.map((col) => (
				<div
					key={col.id}
					role={col.sortable ? 'button' : undefined}
					tabIndex={col.sortable ? 0 : undefined}
					onClick={col.sortable ? () => handleSort(col.id) : undefined}
					onKeyDown={col.sortable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort(col.id); } } : undefined}
					className={cn(
						'flex items-center gap-2 px-3 py-2',
						col.sortable && 'cursor-pointer select-none hover:bg-gray-100',
						col.headerClassName,
					)}>
					<span>{col.header}</span>
					{renderSortIcon(col)}
				</div>
			))}
		</div>
	);

	const renderRow = (row: T, rowIndex: number, key?: string | number) => (
		<div
			key={key ?? (getRowId ? getRowId(row, rowIndex) : rowIndex)}
			data-testid="datatable-row"
			className="grid border-b text-sm hover:bg-gray-50"
			style={{ gridTemplateColumns }}>
			{columns.map((col) => (
				<div key={col.id} className={cn('px-3 py-2.5 truncate', col.className)}>
					{col.render(row, rowIndex)}
				</div>
			))}
		</div>
	);

	// --- Loading skeleton ---
	if (loading) {
		return (
			<div className={cn('rounded-md border bg-white', className)}>
				{tableHeader}
				<div>
					{Array.from({ length: loadingRowCount }).map((_, i) => (
						<div
							key={i}
							className="grid border-b"
							style={{ gridTemplateColumns }}>
							{columns.map((col) => (
								<div key={col.id} className="px-3 py-3">
									<div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
								</div>
							))}
						</div>
					))}
				</div>
			</div>
		);
	}

	// --- Empty state ---
	if (sortedData.length === 0) {
		return (
			<div className={cn('rounded-md border bg-white', className)}>
				{tableHeader}
				<div className="p-10 text-center text-sm text-gray-500">
					{emptyState ?? 'No data found'}
				</div>
			</div>
		);
	}

	// --- Virtualised body ---
	if (virtualized) {
		return (
			<div className={cn('rounded-md border bg-white overflow-hidden', className)}>
				{tableHeader}
				<VirtualBody
					rows={sortedData}
					columns={columns}
					gridTemplateColumns={gridTemplateColumns}
					estimatedRowHeight={estimatedRowHeight}
					overscan={overscan}
					height={height}
					getRowId={getRowId}
				/>
				{pagination && <Pagination {...pagination} />}
			</div>
		);
	}

	// --- Plain body (paginated or full) ---
	const visible = pagination
		? sortedData.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize)
		: sortedData;

	return (
		<div className={cn('rounded-md border bg-white', className)}>
			{tableHeader}
			<div>
				{visible.map((row, i) => renderRow(row, (pagination ? (pagination.page - 1) * pagination.pageSize : 0) + i))}
			</div>
			{pagination && <Pagination {...pagination} />}
		</div>
	);
}

function VirtualBody<T>({
	rows,
	columns,
	gridTemplateColumns,
	estimatedRowHeight,
	overscan,
	height,
	getRowId,
}: {
	rows: T[];
	columns: DataTableColumn<T>[];
	gridTemplateColumns: string;
	estimatedRowHeight: number;
	overscan: number;
	height: number | string;
	getRowId?: (row: T, index: number) => string;
}) {
	const parentRef = useRef<HTMLDivElement>(null);

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => estimatedRowHeight,
		overscan,
	});

	const virtualItems = rowVirtualizer.getVirtualItems();
	const totalSize = rowVirtualizer.getTotalSize();

	return (
		<div ref={parentRef} className="overflow-auto" style={{ height }}>
			<div style={{ height: totalSize, position: 'relative', width: '100%' }}>
				{virtualItems.map((virtualRow) => {
					const row = rows[virtualRow.index];
					return (
						<div
							key={getRowId ? getRowId(row, virtualRow.index) : virtualRow.index}
							ref={rowVirtualizer.measureElement}
							data-index={virtualRow.index}
							data-testid="datatable-row"
							className="grid border-b text-sm hover:bg-gray-50"
							style={{
								gridTemplateColumns,
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								transform: `translateY(${virtualRow.start}px)`,
							}}>
							{columns.map((col) => (
								<div key={col.id} className={cn('px-3 py-2.5 truncate', col.className)}>
									{col.render(row, virtualRow.index)}
								</div>
							))}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const end = Math.min(page * pageSize, total);
	return (
		<div className="flex items-center justify-between border-t bg-gray-50 px-3 py-2 text-sm text-gray-600">
			<span>
				Showing <span className="font-medium text-gray-900">{start}</span>–<span className="font-medium text-gray-900">{end}</span> of{' '}
				<span className="font-medium text-gray-900">{total}</span>
			</span>
			<div className="flex items-center gap-1">
				<button
					type="button"
					className="inline-flex items-center rounded border bg-white px-2 py-1 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
					disabled={page <= 1}
					onClick={() => onPageChange(page - 1)}
					aria-label="Previous page">
					<ChevronLeft className="h-4 w-4" />
				</button>
				<span className="px-2">
					Page <span className="font-medium text-gray-900">{page}</span> of {totalPages}
				</span>
				<button
					type="button"
					className="inline-flex items-center rounded border bg-white px-2 py-1 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
					disabled={page >= totalPages}
					onClick={() => onPageChange(page + 1)}
					aria-label="Next page">
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
}

export default DataTable;
