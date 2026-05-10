import type { Meta, StoryObj } from '@storybook/react';
import { useState, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import Chip from '@/components/atoms/Chip/Chip';
import { Button } from '@/components/atoms';
import Input from '@/components/atoms/Input/Input';
import { useFilterStore } from '@/store/useFilterStore';
import DataTable, { DataTableColumn } from './DataTable';

interface Customer {
	id: string;
	name: string;
	email: string;
	plan: 'Free' | 'Starter' | 'Pro' | 'Enterprise';
	status: 'active' | 'past_due' | 'cancelled' | 'trialing';
	mrr: number;
	createdAt: string;
}

const PLANS: Customer['plan'][] = ['Free', 'Starter', 'Pro', 'Enterprise'];
const STATUSES: Customer['status'][] = ['active', 'past_due', 'cancelled', 'trialing'];
const FIRSTS = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Stark', 'Wayne', 'Cyberdyne', 'Soylent', 'Tyrell', 'Massive Dynamic'];
const SECONDS = ['Corp', 'Industries', 'Labs', 'Systems', 'Holdings', 'Group', 'Co', 'LLC'];

const seedRandom = (seed: number) => {
	let state = seed;
	return () => {
		state = (state * 9301 + 49297) % 233280;
		return state / 233280;
	};
};

const buildCustomers = (count: number): Customer[] => {
	const rand = seedRandom(42);
	return Array.from({ length: count }, (_, i) => {
		const first = FIRSTS[Math.floor(rand() * FIRSTS.length)];
		const second = SECONDS[Math.floor(rand() * SECONDS.length)];
		return {
			id: `cus_${(i + 1).toString().padStart(6, '0')}`,
			name: `${first} ${second} #${i + 1}`,
			email: `billing+${i + 1}@${first.toLowerCase()}.com`,
			plan: PLANS[Math.floor(rand() * PLANS.length)],
			status: STATUSES[Math.floor(rand() * STATUSES.length)],
			mrr: Math.round(rand() * 5000) / 10 * 10,
			createdAt: new Date(2024, 0, 1 + Math.floor(rand() * 730)).toISOString().slice(0, 10),
		};
	});
};

const statusToVariant: Record<Customer['status'], 'success' | 'failed' | 'warning' | 'default'> = {
	active: 'success',
	past_due: 'failed',
	cancelled: 'default',
	trialing: 'warning',
};

const customerColumns: DataTableColumn<Customer>[] = [
	{ id: 'id', header: 'ID', render: (r) => <code className="text-xs text-gray-600">{r.id}</code>, width: 110, sortable: true, sortBy: (r) => r.id },
	{ id: 'name', header: 'Customer', render: (r) => <span className="font-medium">{r.name}</span>, sortable: true, sortBy: (r) => r.name },
	{ id: 'email', header: 'Email', render: (r) => <span className="text-gray-600">{r.email}</span>, sortable: true, sortBy: (r) => r.email },
	{ id: 'plan', header: 'Plan', render: (r) => r.plan, width: 110, sortable: true, sortBy: (r) => r.plan },
	{
		id: 'status',
		header: 'Status',
		render: (r) => <Chip label={r.status.replace('_', ' ')} variant={statusToVariant[r.status]} />,
		width: 130,
		sortable: true,
		sortBy: (r) => r.status,
	},
	{ id: 'mrr', header: 'MRR', render: (r) => `$${r.mrr.toLocaleString()}`, width: 100, sortable: true, sortBy: (r) => r.mrr, className: 'tabular-nums' },
	{ id: 'createdAt', header: 'Created', render: (r) => r.createdAt, width: 120, sortable: true, sortBy: (r) => r.createdAt },
];

const meta = {
	title: 'Molecules/DataTable',
	component: DataTable,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Generic, sortable data table with loading skeleton, empty state, pagination, and optional virtualisation via `@tanstack/react-virtual`. The same component drives Customers, Invoices, and Events list pages.',
			},
		},
	},
	tags: ['autodocs'],
	args: {
		columns: customerColumns,
		data: buildCustomers(20),
		getRowId: (r: Customer) => r.id,
	},
	decorators: [
		(Story) => (
			<div style={{ width: 'min(100%, 1080px)' }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof DataTable<Customer>>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — 20 customer rows, all columns sortable. Click a header to sort. */
export const Default: Story = {};

/** Loading skeleton — used while a query is in flight. */
export const LoadingSkeleton: Story = {
	args: { loading: true, loadingRowCount: 10 },
};

/** Empty state — what users see when filters narrow the result to zero. */
export const Empty: Story = {
	args: { data: [], emptyState: 'No customers match your filters.' },
};

/** Sortable columns — the `Status` chevron toggles asc → desc → none on each header click. */
export const SortableSorting: Story = {
	args: { data: buildCustomers(50) },
	parameters: {
		docs: { description: { story: 'Click any column header to sort. Sort cycles asc → desc → none.' } },
	},
};

/** Paginated — 200 rows split into pages of 10. */
export const Paginated: Story = {
	render: function Render(args) {
		const allRows = useMemo(() => buildCustomers(200), []);
		const [page, setPage] = useState(1);
		return (
			<DataTable
				{...args}
				data={allRows}
				pagination={{ page, pageSize: 10, total: allRows.length, onPageChange: setPage }}
			/>
		);
	},
};

/**
 * **Advanced Challenge B — virtualised 10,000 rows.**
 *
 * Only the rows in the viewport (plus an `overscan` buffer) are mounted.
 * Scroll the table — it stays at 60fps even with 10k rows.
 *
 * Open DevTools Elements panel and inspect the table body: you'll see only
 * ~20–30 row `<div>`s in the DOM at any time, even though `data.length` is 10,000.
 */
export const Virtualised10kRows: Story = {
	args: {
		data: buildCustomers(10_000),
		virtualized: true,
		estimatedRowHeight: 44,
		overscan: 10,
		height: 520,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Virtualisation via `@tanstack/react-virtual`. With `data.length = 10000`, only ~20–30 rows are mounted at any given scroll position. `overscan: 10` keeps scroll smooth even on slower devices. Each row is measured dynamically (`measureElement`), so variable row heights are supported.',
			},
		},
	},
};

/**
 * Same as above, but with **dynamic row heights** — every 7th row carries
 * a long name + a wrapped status chip, demonstrating that the virtualizer's
 * `measureElement` adjusts the scroll runway as rows mount.
 */
export const VirtualisedDynamicHeights: Story = {
	args: {
		data: buildCustomers(5_000).map((r, i) =>
			i % 7 === 0
				? { ...r, name: r.name + ' — ' + 'lorem ipsum dolor sit amet '.repeat(3) }
				: r,
		),
		virtualized: true,
		estimatedRowHeight: 44,
		overscan: 10,
		height: 520,
		columns: customerColumns.map((c) => (c.id === 'name' ? { ...c, className: 'whitespace-normal break-words' } : c)),
	},
};

// =============================================================================
// Advanced Challenge A — DataTable wired up to useFilterStore
// =============================================================================

interface CustomersFilters extends Record<string, unknown> {
	status: 'all' | Customer['status'];
	plan: 'all' | Customer['plan'];
	search: string;
}

const customersFilterDefaults: CustomersFilters = { status: 'all', plan: 'all', search: '' };

/**
 * **Advanced Challenge A — `useFilterStore` wired to `DataTable`.**
 *
 * - Filter state is held in `useFilterStore('storybook-customers', …)`.
 * - On change, state is mirrored to **`sessionStorage['filters:storybook-customers']`** —
 *   refresh the Storybook iframe and your filters survive.
 * - Only a **shallow fingerprint** (`?fp=…`) is written to the URL, not the
 *   full filter object — open DevTools and watch the URL change as you filter.
 * - Click "Reset" to revert to defaults via `resetFilters()`.
 */
export const WithFilterStore: Story = {
	render: function Render(args) {
		const allRows = useMemo(() => buildCustomers(500), []);
		const { filters, setFilter, resetFilters, fingerprint: fp } = useFilterStore(
			'storybook-customers',
			customersFilterDefaults,
		);

		const filtered = useMemo(() => {
			return allRows.filter((r) => {
				if (filters.status !== 'all' && r.status !== filters.status) return false;
				if (filters.plan !== 'all' && r.plan !== filters.plan) return false;
				if (filters.search) {
					const q = filters.search.toLowerCase();
					if (!r.name.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q)) return false;
				}
				return true;
			});
		}, [allRows, filters]);

		const FilterChips = ({ name, value, options }: {
			name: keyof CustomersFilters;
			value: string;
			options: { value: string; label: string }[];
		}) => (
			<div className="flex items-center gap-1">
				<span className="text-xs font-medium uppercase text-gray-500 mr-2">{String(name)}</span>
				{options.map((opt) => (
					<button
						key={opt.value}
						type="button"
						onClick={() => setFilter(name, opt.value as never)}
						className={
							value === opt.value
								? 'rounded-full border border-[#092E44] bg-[#092E44] px-2.5 py-0.5 text-xs text-white'
								: 'rounded-full border border-gray-200 px-2.5 py-0.5 text-xs text-gray-700 hover:bg-gray-50'
						}>
						{opt.label}
					</button>
				))}
			</div>
		);

		return (
			<div className="space-y-3">
				<div className="rounded-md border bg-white p-3 space-y-3">
					<div className="flex flex-wrap items-center gap-x-6 gap-y-2">
						<FilterChips
							name="status"
							value={filters.status}
							options={[
								{ value: 'all', label: 'All' },
								{ value: 'active', label: 'Active' },
								{ value: 'trialing', label: 'Trialing' },
								{ value: 'past_due', label: 'Past due' },
								{ value: 'cancelled', label: 'Cancelled' },
							]}
						/>
						<FilterChips
							name="plan"
							value={filters.plan}
							options={[
								{ value: 'all', label: 'All' },
								{ value: 'Free', label: 'Free' },
								{ value: 'Starter', label: 'Starter' },
								{ value: 'Pro', label: 'Pro' },
								{ value: 'Enterprise', label: 'Enterprise' },
							]}
						/>
					</div>
					<div className="flex items-center gap-3">
						<div className="flex-1 max-w-sm">
							<Input
								placeholder="Search name or email…"
								value={filters.search}
								onChange={(v) => setFilter('search', v)}
							/>
						</div>
						<Button variant="outline" size="sm" prefixIcon={<RotateCcw />} onClick={resetFilters}>
							Reset
						</Button>
					</div>
					<div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t">
						<span>
							<strong className="text-gray-900">{filtered.length}</strong> of {allRows.length} rows match
						</span>
						<span>
							URL fingerprint: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-700">?fp={fp}</code>
						</span>
					</div>
				</div>
				<DataTable
					{...args}
					data={filtered}
					emptyState={'No customers match the current filters. Try resetting.'}
				/>
				<p className="text-xs text-gray-500">
					Refresh the Storybook iframe — your filter selections persist via{' '}
					<code className="rounded bg-gray-100 px-1 py-0.5">sessionStorage['filters:storybook-customers']</code>.
					Only the fingerprint, not the full filter object, is in the URL.
				</p>
			</div>
		);
	},
};
