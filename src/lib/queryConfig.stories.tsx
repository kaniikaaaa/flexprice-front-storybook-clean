import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/atoms';
import {
	QUERY_PRESETS,
	createQueryConfig,
	type QueryPresetName,
} from './queryConfig';

interface PresetCardProps {
	name: QueryPresetName;
	description: string;
}

const PresetCard = ({ name, description }: PresetCardProps) => {
	const cfg = QUERY_PRESETS[name];
	return (
		<div className="rounded-md border bg-white p-4">
			<div className="flex items-baseline gap-3">
				<code className="text-sm font-semibold text-[#092E44]">{name}</code>
				<span className="text-sm text-gray-500">{description}</span>
			</div>
			<dl className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-600">
				<div>
					<dt className="uppercase tracking-wide">staleTime</dt>
					<dd className="text-gray-900 font-medium">
						{cfg.staleTime === 0 ? '0 ms (always stale)' : `${cfg.staleTime / 60_000} min`}
					</dd>
				</div>
				<div>
					<dt className="uppercase tracking-wide">gcTime</dt>
					<dd className="text-gray-900 font-medium">
						{cfg.gcTime === 60_000 ? '1 min' : `${cfg.gcTime / 60_000} min`}
					</dd>
				</div>
			</dl>
		</div>
	);
};

const ConfigDemo = ({ presetName, override }: { presetName: QueryPresetName; override?: { staleTime: number } }) => {
	const cfg = createQueryConfig(presetName, override);
	return (
		<pre className="rounded-md bg-gray-50 border border-gray-200 p-3 text-xs text-gray-800 overflow-x-auto">
{`createQueryConfig('${presetName}'${override ? `, ${JSON.stringify(override)}` : ''})

→ ${JSON.stringify(cfg, null, 2)}`}
		</pre>
	);
};

const meta = {
	title: 'Lib/createQueryConfig',
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Centralised TanStack Query caching presets. Standardises `staleTime` / `gcTime` across the dashboard so callers opt into freshness explicitly rather than picking ad-hoc values per call site.',
			},
		},
	},
	tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The three presets at a glance. */
export const Presets: Story = {
	render: () => (
		<div className="grid gap-3">
			<PresetCard name="REALTIME" description="Live event feed, usage counters, in-flight job status." />
			<PresetCard name="DEFAULT" description="Most list pages — customers, invoices, subscriptions." />
			<PresetCard name="STATIC" description="Plan definitions, currency/region lists, and other rarely-changing reference data." />
		</div>
	),
};

/** Resolved config for each preset. */
export const ResolvedConfigs: Story = {
	render: () => (
		<div className="space-y-3">
			<ConfigDemo presetName="REALTIME" />
			<ConfigDemo presetName="DEFAULT" />
			<ConfigDemo presetName="STATIC" />
		</div>
	),
};

/** Per-call-site override — promote a DEFAULT hook to real-time without editing the hook. */
export const WithOverride: Story = {
	render: () => (
		<div className="space-y-3">
			<p className="text-sm text-gray-700">
				Each call site can opt into freshness without forking the hook:
			</p>
			<ConfigDemo presetName="DEFAULT" override={{ staleTime: 0 }} />
			<p className="text-xs text-gray-500">
				Useful for one-off live views (e.g. an admin debugger) when the underlying hook normally uses cached data.
			</p>
		</div>
	),
};

/**
 * Live cache behaviour — click the button to remount the same query.
 * With **DEFAULT**, the second mount is a cache hit (counter stays).
 * With **REALTIME**, every mount triggers a fresh fetcher call.
 */
export const LiveCacheBehaviour: Story = {
	render: function Render() {
		const [presetName, setPresetName] = useState<QueryPresetName>('DEFAULT');
		const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
		const [showHook, setShowHook] = useState(true);

		return (
			<QueryClientProvider client={client}>
				<div className="space-y-4 max-w-xl">
					<div className="flex items-center gap-2">
						<span className="text-sm text-gray-600 mr-2">Preset:</span>
						{(['REALTIME', 'DEFAULT', 'STATIC'] as QueryPresetName[]).map((p) => (
							<button
								key={p}
								type="button"
								onClick={() => {
									setPresetName(p);
									client.clear();
								}}
								className={
									presetName === p
										? 'rounded border border-[#092E44] bg-[#092E44] px-2.5 py-1 text-xs text-white'
										: 'rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50'
								}>
								{p}
							</button>
						))}
					</div>
					<div className="rounded-md border bg-white p-4 text-sm">
						{showHook ? <CountingHook presetName={presetName} /> : <p className="text-gray-400">Hook unmounted</p>}
					</div>
					<div className="flex gap-2">
						<Button variant="outline" size="sm" onClick={() => setShowHook((v) => !v)}>
							{showHook ? 'Unmount' : 'Mount'} hook
						</Button>
						<Button variant="outline" size="sm" onClick={() => client.clear()}>
							Clear cache
						</Button>
					</div>
					<p className="text-xs text-gray-500">
						The fetcher is a counter. Unmount/Remount the hook with each preset to compare:
						<br />• <strong>REALTIME</strong> → counter increments on every remount.
						<br />• <strong>DEFAULT</strong> → counter sticks (cache hit) until you Clear cache.
					</p>
				</div>
			</QueryClientProvider>
		);
	},
};

let counter = 0;
const CountingHook = ({ presetName }: { presetName: QueryPresetName }) => {
	const { data, isFetching } = useQuery({
		queryKey: ['demo', presetName],
		queryFn: async () => {
			counter += 1;
			return { fetchCount: counter, ts: new Date().toLocaleTimeString() };
		},
		...createQueryConfig(presetName),
	});

	return (
		<div className="space-y-1 text-sm">
			<div>
				Fetcher invocations: <strong className="text-[#092E44]">{data?.fetchCount ?? 0}</strong>
				{isFetching && <span className="ml-2 text-xs text-gray-400">fetching…</span>}
			</div>
			<div className="text-xs text-gray-500">Last result at: {data?.ts ?? '—'}</div>
		</div>
	);
};
