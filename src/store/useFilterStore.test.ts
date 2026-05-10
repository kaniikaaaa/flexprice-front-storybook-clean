import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilterStore, fingerprint, _resetFilterStoreForTests } from './useFilterStore';

interface InvoiceFilters {
	status: 'all' | 'paid' | 'failed';
	plan: 'all' | 'free' | 'pro';
	search: string;
}

const defaults: InvoiceFilters = { status: 'all', plan: 'all', search: '' };

describe('useFilterStore', () => {
	beforeEach(() => {
		_resetFilterStoreForTests();
		// jsdom keeps URL across tests — reset query string explicitly
		window.history.replaceState(null, '', '/');
	});

	it('returns defaults on first mount when sessionStorage is empty', () => {
		const { result } = renderHook(() => useFilterStore('invoices', defaults));
		expect(result.current.filters).toEqual(defaults);
	});

	it('setFilter updates a single key and leaves others untouched', () => {
		const { result } = renderHook(() => useFilterStore('invoices', defaults));
		act(() => result.current.setFilter('status', 'paid'));
		expect(result.current.filters).toEqual({ ...defaults, status: 'paid' });
	});

	it('persists state to sessionStorage under filters:<route>', () => {
		const { result } = renderHook(() => useFilterStore('invoices', defaults));
		act(() => result.current.setFilter('status', 'paid'));
		const raw = sessionStorage.getItem('filters:invoices');
		expect(raw).not.toBeNull();
		expect(JSON.parse(raw!)).toEqual({ ...defaults, status: 'paid' });
	});

	it('isolates state across different route keys', () => {
		const invoices = renderHook(() => useFilterStore('invoices', defaults));
		const customers = renderHook(() => useFilterStore('customers', { ...defaults, search: 'acme' }));
		act(() => invoices.result.current.setFilter('status', 'failed'));
		expect(invoices.result.current.filters.status).toBe('failed');
		expect(customers.result.current.filters.status).toBe('all');
		expect(customers.result.current.filters.search).toBe('acme');
	});

	it('resetFilters reverts to the defaults passed at mount', () => {
		const { result } = renderHook(() => useFilterStore('invoices', defaults));
		act(() => result.current.setFilter('status', 'paid'));
		act(() => result.current.setFilter('search', 'hello'));
		act(() => result.current.resetFilters());
		expect(result.current.filters).toEqual(defaults);
	});

	it('hydrates from sessionStorage on first mount', () => {
		sessionStorage.setItem('filters:invoices', JSON.stringify({ ...defaults, status: 'failed', search: 'urgent' }));
		const { result } = renderHook(() => useFilterStore('invoices', defaults));
		expect(result.current.filters).toEqual({ ...defaults, status: 'failed', search: 'urgent' });
	});

	it('writes only a fingerprint to the URL, never the full filter object', () => {
		const { result } = renderHook(() => useFilterStore('invoices', defaults));
		act(() => result.current.setFilter('status', 'paid'));
		const url = new URL(window.location.href);
		// The fingerprint param must be present
		expect(url.searchParams.get('fp')).toBeTruthy();
		// And the full filter values must NOT leak into the URL
		expect(url.search).not.toContain('paid');
		expect(url.search).not.toContain('status');
	});

	it('fingerprint is stable for equivalent state and changes when state changes', () => {
		const a = fingerprint({ status: 'paid', plan: 'pro' });
		const b = fingerprint({ plan: 'pro', status: 'paid' }); // different key order
		const c = fingerprint({ status: 'failed', plan: 'pro' });
		expect(a).toBe(b);
		expect(a).not.toBe(c);
	});

	it('getFilters returns latest state synchronously (no React render needed)', () => {
		const { result } = renderHook(() => useFilterStore('invoices', defaults));
		act(() => result.current.setFilter('status', 'paid'));
		expect(result.current.getFilters()).toEqual({ ...defaults, status: 'paid' });
	});
});
