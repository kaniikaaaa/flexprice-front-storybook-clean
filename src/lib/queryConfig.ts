/**
 * createQueryConfig — declarative caching presets for TanStack Query v5.
 *
 * The dashboard uses `useQuery` for everything from the live event feed
 * (which should be fresh on every render) to plan definitions (which
 * change weeks apart). Hardcoding `staleTime` / `gcTime` per call site
 * leads to inconsistent cache behaviour and accidental over-fetching.
 *
 * This module standardises three presets and exposes one builder:
 *
 *   QUERY_PRESETS.REALTIME  — staleTime 0,        gcTime 1 min  (events feed)
 *   QUERY_PRESETS.DEFAULT   — staleTime 5 min,    gcTime 10 min (most lists)
 *   QUERY_PRESETS.STATIC    — staleTime 30 min,   gcTime 60 min (plan defs)
 *
 *   createQueryConfig(preset, overrides?)
 *
 * Use it in custom query hooks:
 *
 *     const useInvoices = (overrides?: QueryConfigOverrides) =>
 *       useQuery({
 *         queryKey: ['invoices'],
 *         queryFn: fetchInvoices,
 *         ...createQueryConfig('DEFAULT', overrides),
 *       });
 *
 * Then opt into freshness at a specific call site without editing the hook:
 *
 *     useInvoices({ staleTime: 0 }); // real-time view
 *
 * `createDefaultQueryClient()` builds a `QueryClient` pre-configured with
 * the DEFAULT preset, ready to drop into `<QueryClientProvider>`.
 */

import { QueryClient } from '@tanstack/react-query';

const MIN = 60 * 1000;

export const QUERY_PRESETS = {
	REALTIME: { staleTime: 0, gcTime: 1 * MIN },
	DEFAULT: { staleTime: 5 * MIN, gcTime: 10 * MIN },
	STATIC: { staleTime: 30 * MIN, gcTime: 60 * MIN },
} as const;

export type QueryPresetName = keyof typeof QUERY_PRESETS;

export interface QueryConfigOverrides {
	staleTime?: number;
	gcTime?: number;
	refetchOnWindowFocus?: boolean;
	refetchOnMount?: boolean | 'always';
	refetchOnReconnect?: boolean;
	retry?: boolean | number;
}

export interface ResolvedQueryConfig {
	staleTime: number;
	gcTime: number;
	refetchOnWindowFocus?: boolean;
	refetchOnMount?: boolean | 'always';
	refetchOnReconnect?: boolean;
	retry?: boolean | number;
}

/**
 * Build a query config by merging a named preset with an override object.
 * Overrides win on a per-key basis — undefined keys fall back to the preset.
 */
export function createQueryConfig(
	preset: QueryPresetName = 'DEFAULT',
	overrides?: QueryConfigOverrides,
): ResolvedQueryConfig {
	const base = QUERY_PRESETS[preset];
	if (!overrides) return { ...base };

	const merged: ResolvedQueryConfig = { ...base };
	(Object.keys(overrides) as (keyof QueryConfigOverrides)[]).forEach((k) => {
		const v = overrides[k];
		if (v !== undefined) {
			(merged as Record<string, unknown>)[k] = v;
		}
	});
	return merged;
}

/**
 * Build a QueryClient pre-configured with the DEFAULT preset as global
 * defaults. Drop into `<QueryClientProvider client={createDefaultQueryClient()}>`.
 */
export function createDefaultQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: { ...QUERY_PRESETS.DEFAULT },
			mutations: { retry: false },
		},
	});
}
