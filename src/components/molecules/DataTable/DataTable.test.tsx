import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DataTable, { DataTableColumn } from './DataTable';

interface Row {
	id: string;
	name: string;
}

const buildRows = (count: number): Row[] =>
	Array.from({ length: count }, (_, i) => ({
		id: `row_${(i + 1).toString().padStart(6, '0')}`,
		name: `Customer ${i + 1}`,
	}));

const columns: DataTableColumn<Row>[] = [
	{ id: 'id', header: 'ID', render: (r) => r.id, width: 140 },
	{ id: 'name', header: 'Name', render: (r) => r.name },
];

describe('DataTable — non-virtualised behaviour', () => {
	it('mounts every row when virtualisation is OFF (10k rows in DOM)', () => {
		const rows = buildRows(10_000);
		render(<DataTable columns={columns} data={rows} getRowId={(r) => r.id} />);
		const rendered = screen.getAllByTestId('datatable-row');
		expect(rendered.length).toBe(10_000);
	});

	it('renders the loading skeleton with `loadingRowCount` rows when loading', () => {
		render(
			<DataTable
				columns={columns}
				data={[]}
				loading
				loadingRowCount={6}
			/>,
		);
		const skeletons = document.querySelectorAll('.animate-pulse');
		expect(skeletons.length).toBe(12);
	});

	it('renders the empty state when data is empty', () => {
		render(<DataTable columns={columns} data={[]} emptyState='No matches' />);
		expect(screen.getByText('No matches')).toBeInTheDocument();
		expect(screen.queryAllByTestId('datatable-row')).toHaveLength(0);
	});

	it('paginates rows when `pagination` is provided', () => {
		const rows = buildRows(100);
		render(
			<DataTable
				columns={columns}
				data={rows}
				getRowId={(r) => r.id}
				pagination={{ page: 1, pageSize: 10, total: 100, onPageChange: () => {} }}
			/>,
		);
		expect(screen.getAllByTestId('datatable-row')).toHaveLength(10);
	});
});

// jsdom reports 0 for layout, so the real `useVirtualizer` can't compute a
// viewport. Mock to a deterministic 12-row window. Visual proof of real
// virtualisation lives in the `Virtualised10kRows` Storybook story.
vi.mock('@tanstack/react-virtual', () => {
	return {
		useVirtualizer: ({
			count,
			estimateSize,
		}: {
			count: number;
			estimateSize: (i: number) => number;
		}) => {
			const VISIBLE = Math.min(count, 12);
			const rowHeight = estimateSize(0);
			const items = Array.from({ length: VISIBLE }, (_, index) => ({
				index,
				key: index,
				start: index * rowHeight,
				end: (index + 1) * rowHeight,
				size: rowHeight,
				lane: 0,
			}));
			return {
				getVirtualItems: () => items,
				getTotalSize: () => count * rowHeight,
				measureElement: () => undefined,
			};
		},
	};
});

describe('DataTable virtualisation (Advanced Challenge B)', () => {
	it('mounts only a small slice of rows when virtualisation is ON', () => {
		const rows = buildRows(10_000);
		render(
			<DataTable
				columns={columns}
				data={rows}
				getRowId={(r) => r.id}
				virtualized
				estimatedRowHeight={44}
				overscan={5}
				height={440}
			/>,
		);
		const rendered = screen.getAllByTestId('datatable-row');
		expect(rendered.length).toBe(12);
		expect(rendered.length).toBeLessThan(rows.length);
	});

	it('runway is sized to the full data length, not the visible slice', () => {
		const rows = buildRows(10_000);
		const { container } = render(
			<DataTable
				columns={columns}
				data={rows}
				getRowId={(r) => r.id}
				virtualized
				estimatedRowHeight={44}
				overscan={5}
				height={440}
			/>,
		);
		const runway = container.querySelector(
			'[style*="position: relative"]',
		) as HTMLElement | null;
		expect(runway).not.toBeNull();
		const runwayHeight = parseFloat(runway!.style.height || '0');
		expect(runwayHeight).toBe(10_000 * 44);
	});

	it('virtualised rows are absolute-positioned for the scroll runway', () => {
		const rows = buildRows(10_000);
		render(
			<DataTable
				columns={columns}
				data={rows}
				getRowId={(r) => r.id}
				virtualized
				estimatedRowHeight={44}
				height={440}
			/>,
		);
		const rendered = screen.getAllByTestId('datatable-row');
		expect(rendered[0].style.position).toBe('absolute');
		expect(rendered[0].style.transform).toMatch(/translateY/);
	});
});
