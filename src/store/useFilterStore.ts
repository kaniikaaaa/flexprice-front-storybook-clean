/**
 * useFilterStore — per-route filter persistence.
 *
 * Solves the "URL bloat" problem: list pages have multi-dimensional filter
 * state (date range, status, plan, search, sort column, sort direction) that
 * is too large to round-trip through `?key=value` URL params on every render.
 *
 * Strategy:
 *  - State lives in a single Zustand store, namespaced by routeKey.
 *  - The full filter object is mirrored to **sessionStorage** at `filters:<route>`
 *    so reloads, back-forward navigation, and tab restoration keep state.
 *  - Only a **shallow fingerprint** — a stable 32-bit hash of the active
 *    filters — is synced to the URL as `?fp=<hash>`. The URL stays bookmarkable
 *    and changes when filters change, but never bloats.
 *  - Per-route hooks consume a slice with bound `setFilter` / `resetFilters` /
 *    `getFilters` API so callers don't have to thread `routeKey` everywhere.
 */

import { useEffect, useMemo, useRef } from 'react';
import { create } from 'zustand';

type FilterMap = Record<string, unknown>;

interface FilterRegistryState {
	routes: Record<string, FilterMap>;
	hydrated: Record<string, boolean>;
	_setRoute: (route: string, filters: FilterMap) => void;
	_setOne: (route: string, key: string, value: unknown) => void;
	_resetRoute: (route: string, defaults: FilterMap) => void;
}

const STORAGE_PREFIX = 'filters:';
const URL_PARAM = 'fp';

// 32-bit FNV-1a hash → base36 short string. Stable, dependency-free.
export function fingerprint(value: unknown): string {
	const json = JSON.stringify(value, Object.keys(value as object).sort());
	let hash = 0x811c9dc5;
	for (let i = 0; i < json.length; i++) {
		hash ^= json.charCodeAt(i);
		hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
	}
	return hash.toString(36);
}

function safeSessionStorage(): Storage | null {
	try {
		if (typeof window === 'undefined' || !window.sessionStorage) return null;
		return window.sessionStorage;
	} catch {
		return null;
	}
}

function loadFromSession(route: string): FilterMap | null {
	const ss = safeSessionStorage();
	if (!ss) return null;
	try {
		const raw = ss.getItem(STORAGE_PREFIX + route);
		return raw ? (JSON.parse(raw) as FilterMap) : null;
	} catch {
		return null;
	}
}

function saveToSession(route: string, filters: FilterMap): void {
	const ss = safeSessionStorage();
	if (!ss) return;
	try {
		ss.setItem(STORAGE_PREFIX + route, JSON.stringify(filters));
	} catch {
		// quota / private mode — ignore, in-memory state still works
	}
}

function syncUrlFingerprint(filters: FilterMap): void {
	if (typeof window === 'undefined' || !window.history?.replaceState) return;
	try {
		const url = new URL(window.location.href);
		url.searchParams.set(URL_PARAM, fingerprint(filters));
		window.history.replaceState(null, '', url.toString());
	} catch {
		// ignore — non-fatal
	}
}

const useFilterRegistry = create<FilterRegistryState>((set) => ({
	routes: {},
	hydrated: {},
	_setRoute: (route, filters) =>
		set((state) => ({
			routes: { ...state.routes, [route]: filters },
			hydrated: { ...state.hydrated, [route]: true },
		})),
	_setOne: (route, key, value) =>
		set((state) => {
			const next = { ...(state.routes[route] ?? {}), [key]: value };
			saveToSession(route, next);
			syncUrlFingerprint(next);
			return { routes: { ...state.routes, [route]: next } };
		}),
	_resetRoute: (route, defaults) =>
		set((state) => {
			saveToSession(route, defaults);
			syncUrlFingerprint(defaults);
			return { routes: { ...state.routes, [route]: { ...defaults } } };
		}),
}));

export interface UseFilterStoreApi<T extends FilterMap> {
	/** Current filter values for this route. */
	filters: T;
	/** Update a single filter key. Persists to sessionStorage and updates the URL fingerprint. */
	setFilter: <K extends keyof T>(key: K, value: T[K]) => void;
	/** Reset to the defaults passed at hook initialisation. */
	resetFilters: () => void;
	/** Read the latest filters synchronously (for use outside React renders). */
	getFilters: () => T;
	/** Current 32-bit fingerprint of the filter state — also synced to `?fp=` in the URL. */
	fingerprint: string;
}

/**
 * `useFilterStore` — bind a route's persisted filter state.
 *
 * @param routeKey  Stable key (e.g. `"invoices"`, `"customers"`). Used as the
 *                  sessionStorage suffix and the namespace inside the registry.
 * @param defaults  Default filter values. Used on first mount if no persisted
 *                  state exists, and as the target of `resetFilters()`.
 */
export function useFilterStore<T extends FilterMap>(routeKey: string, defaults: T): UseFilterStoreApi<T> {
	const filters = useFilterRegistry((s) => (s.routes[routeKey] as T | undefined) ?? defaults);
	const setOne = useFilterRegistry((s) => s._setOne);
	const resetRoute = useFilterRegistry((s) => s._resetRoute);
	const setRoute = useFilterRegistry((s) => s._setRoute);
	const isHydrated = useFilterRegistry((s) => s.hydrated[routeKey] ?? false);

	// Snapshot defaults at first mount so a fresh-object `defaults` literal on
	// every render does not retrigger hydration.
	const defaultsRef = useRef(defaults);

	// Hydrate persisted state into the registry on commit, not during render.
	// Calling a Zustand setter inside the render body breaks React's rules
	// (StrictMode double-render warnings, potential render loops).
	useEffect(() => {
		if (isHydrated || typeof window === 'undefined') return;
		const persisted = loadFromSession(routeKey);
		const initial = persisted ?? defaultsRef.current;
		setRoute(routeKey, initial);
		syncUrlFingerprint(initial);
	}, [isHydrated, routeKey, setRoute]);

	const fp = useMemo(() => fingerprint(filters), [filters]);

	return {
		filters,
		setFilter: (key, value) => setOne(routeKey, key as string, value),
		resetFilters: () => resetRoute(routeKey, defaults),
		getFilters: () => (useFilterRegistry.getState().routes[routeKey] as T) ?? defaults,
		fingerprint: fp,
	};
}

// Test-only helper: clear the in-memory registry and sessionStorage. Not exported in barrels.
export function _resetFilterStoreForTests(): void {
	useFilterRegistry.setState({ routes: {}, hydrated: {} });
	const ss = safeSessionStorage();
	if (!ss) return;
	const keys: string[] = [];
	for (let i = 0; i < ss.length; i++) {
		const k = ss.key(i);
		if (k && k.startsWith(STORAGE_PREFIX)) keys.push(k);
	}
	keys.forEach((k) => ss.removeItem(k));
}
