import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import React, { PropsWithChildren } from 'react';
import {
	createQueryConfig,
	createDefaultQueryClient,
	QUERY_PRESETS,
} from './queryConfig';

const MIN = 60 * 1000;

describe('createQueryConfig — preset shapes', () => {
	it('REALTIME preset has staleTime 0 (always treated as stale)', () => {
		expect(QUERY_PRESETS.REALTIME.staleTime).toBe(0);
		expect(createQueryConfig('REALTIME')).toEqual(QUERY_PRESETS.REALTIME);
	});

	it('DEFAULT preset is 5 min staleTime / 10 min gcTime', () => {
		expect(QUERY_PRESETS.DEFAULT).toEqual({ staleTime: 5 * MIN, gcTime: 10 * MIN });
		expect(createQueryConfig('DEFAULT')).toEqual(QUERY_PRESETS.DEFAULT);
	});

	it('STATIC preset is 30 min staleTime / 60 min gcTime', () => {
		expect(QUERY_PRESETS.STATIC).toEqual({ staleTime: 30 * MIN, gcTime: 60 * MIN });
		expect(createQueryConfig('STATIC')).toEqual(QUERY_PRESETS.STATIC);
	});

	it('defaults to DEFAULT preset when no name is passed', () => {
		expect(createQueryConfig()).toEqual(QUERY_PRESETS.DEFAULT);
	});
});

describe('createQueryConfig — call-site overrides', () => {
	it('override wins over preset value (declarative escape hatch)', () => {
		const cfg = createQueryConfig('DEFAULT', { staleTime: 0 });
		expect(cfg.staleTime).toBe(0);
		expect(cfg.gcTime).toBe(QUERY_PRESETS.DEFAULT.gcTime);
	});

	it('undefined override values do NOT clobber preset defaults', () => {
		const cfg = createQueryConfig('STATIC', { staleTime: undefined });
		expect(cfg.staleTime).toBe(QUERY_PRESETS.STATIC.staleTime);
	});

	it('passes through extra options like refetchOnWindowFocus', () => {
		const cfg = createQueryConfig('DEFAULT', { refetchOnWindowFocus: true });
		expect(cfg.refetchOnWindowFocus).toBe(true);
	});

	it('returns a fresh object per call (no shared mutable reference to a preset)', () => {
		const a = createQueryConfig('DEFAULT');
		const b = createQueryConfig('DEFAULT');
		expect(a).not.toBe(b);
		// Mutating a does not affect b or the preset
		(a as { staleTime: number }).staleTime = 999;
		expect(b.staleTime).toBe(QUERY_PRESETS.DEFAULT.staleTime);
	});
});

describe('createDefaultQueryClient — global defaults', () => {
	it('produces a QueryClient configured with the DEFAULT preset', () => {
		const client = createDefaultQueryClient();
		const defaults = client.getDefaultOptions().queries!;
		expect(defaults.staleTime).toBe(QUERY_PRESETS.DEFAULT.staleTime);
		expect(defaults.gcTime).toBe(QUERY_PRESETS.DEFAULT.gcTime);
	});

	it('disables retry for mutations', () => {
		const client = createDefaultQueryClient();
		expect(client.getDefaultOptions().mutations!.retry).toBe(false);
	});
});

// Documents real cache behaviour: a query with staleTime 5min that has
// just resolved should NOT trigger another network call when remounted.
describe('createQueryConfig — observed cache behaviour', () => {
	function wrapper(client: QueryClient) {
		return ({ children }: PropsWithChildren) =>
			React.createElement(QueryClientProvider, { client }, children);
	}

	it('DEFAULT preset prevents refetch on remount within staleTime window', async () => {
		const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		const fetcher = vi.fn().mockResolvedValue('plan-list');

		// First mount — should fetch
		const first = renderHook(
			() => useQuery({ queryKey: ['plans'], queryFn: fetcher, ...createQueryConfig('DEFAULT') }),
			{ wrapper: wrapper(client) },
		);
		await waitFor(() => expect(first.result.current.isSuccess).toBe(true));
		expect(fetcher).toHaveBeenCalledTimes(1);
		first.unmount();

		// Second mount, same key, same client, well within 5min staleTime — no new fetch
		const second = renderHook(
			() => useQuery({ queryKey: ['plans'], queryFn: fetcher, ...createQueryConfig('DEFAULT') }),
			{ wrapper: wrapper(client) },
		);
		await waitFor(() => expect(second.result.current.isSuccess).toBe(true));
		expect(fetcher).toHaveBeenCalledTimes(1); // Cache hit — no extra call
		second.unmount();
	});

	it('REALTIME preset (staleTime 0) refetches every mount, even from cache', async () => {
		const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		const fetcher = vi.fn().mockResolvedValue('events-feed');

		const first = renderHook(
			() => useQuery({ queryKey: ['events'], queryFn: fetcher, ...createQueryConfig('REALTIME') }),
			{ wrapper: wrapper(client) },
		);
		await waitFor(() => expect(first.result.current.isSuccess).toBe(true));
		expect(fetcher).toHaveBeenCalledTimes(1);
		first.unmount();

		const second = renderHook(
			() => useQuery({ queryKey: ['events'], queryFn: fetcher, ...createQueryConfig('REALTIME') }),
			{ wrapper: wrapper(client) },
		);
		await waitFor(() => expect(second.result.current.isSuccess).toBe(true));
		// staleTime = 0 → cached value is "stale" immediately, so a refetch is triggered
		expect(fetcher).toHaveBeenCalledTimes(2);
	});

	it('per-call override of staleTime: 0 promotes a DEFAULT hook to real-time', async () => {
		const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		const fetcher = vi.fn().mockResolvedValue('invoices');

		// Mount once with DEFAULT (5 min stale) — populates cache
		const first = renderHook(
			() => useQuery({ queryKey: ['invoices'], queryFn: fetcher, ...createQueryConfig('DEFAULT') }),
			{ wrapper: wrapper(client) },
		);
		await waitFor(() => expect(first.result.current.isSuccess).toBe(true));
		expect(fetcher).toHaveBeenCalledTimes(1);
		first.unmount();

		// Now a different consumer overrides staleTime to 0 → should refetch
		const second = renderHook(
			() => useQuery({ queryKey: ['invoices'], queryFn: fetcher, ...createQueryConfig('DEFAULT', { staleTime: 0 }) }),
			{ wrapper: wrapper(client) },
		);
		await waitFor(() => expect(second.result.current.isSuccess).toBe(true));
		expect(fetcher).toHaveBeenCalledTimes(2);
	});
});
