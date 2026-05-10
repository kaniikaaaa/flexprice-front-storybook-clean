import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { debounce } from 'lodash';
import { cn } from '@/lib/utils';

interface SearchBarProps {
	/** Initial value. The component owns the input state internally. */
	defaultValue?: string;
	/** Fired after `debounceMs` of inactivity, or immediately on clear. */
	onSearch: (value: string) => void;
	/** Debounce delay in ms. Set to `0` to fire on every keystroke. */
	debounceMs?: number;
	placeholder?: string;
	disabled?: boolean;
	autoFocus?: boolean;
	/** Width preset — 'sm' = 240px, 'md' = 320px (default), 'lg' = 480px, 'full' = 100%. */
	width?: 'sm' | 'md' | 'lg' | 'full';
	className?: string;
	'aria-label'?: string;
}

const widthClass = {
	sm: 'max-w-[240px]',
	md: 'max-w-[320px]',
	lg: 'max-w-[480px]',
	full: 'w-full',
} as const;

/**
 * Debounced search input with a leading magnifying-glass icon and a trailing
 * clear button. Fires `onSearch(value)` after `debounceMs` of inactivity, or
 * immediately when the user clicks the clear (`X`) button.
 *
 * The component owns its text state — `defaultValue` seeds the initial input
 * but the parent receives values exclusively via the (debounced) `onSearch`
 * callback. This is the right shape for a search filter: the parent applies
 * the search to its data, but does not need to re-render on every keystroke.
 */
const SearchBar: FC<SearchBarProps> = ({
	defaultValue = '',
	onSearch,
	debounceMs = 250,
	placeholder = 'Search…',
	disabled = false,
	autoFocus = false,
	width = 'md',
	className,
	'aria-label': ariaLabel = 'Search',
}) => {
	const [text, setText] = useState<string>(defaultValue);
	const onSearchRef = useRef(onSearch);
	onSearchRef.current = onSearch;

	const debouncedFire = useMemo(
		() =>
			debounceMs === 0
				? (v: string) => onSearchRef.current(v)
				: debounce((v: string) => onSearchRef.current(v), debounceMs),
		[debounceMs],
	);

	useEffect(() => {
		return () => {
			if ('cancel' in debouncedFire) debouncedFire.cancel();
		};
	}, [debouncedFire]);

	const handleChange = (next: string) => {
		setText(next);
		debouncedFire(next);
	};

	const handleClear = () => {
		setText('');
		if ('cancel' in debouncedFire) debouncedFire.cancel();
		onSearchRef.current('');
	};

	return (
		<div className={cn('relative', widthClass[width], className)}>
			<Search
				size={14}
				className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
			/>
			<input
				type='search'
				role='searchbox'
				aria-label={ariaLabel}
				placeholder={placeholder}
				disabled={disabled}
				autoFocus={autoFocus}
				value={text}
				onChange={(e) => handleChange(e.target.value)}
				className={cn(
					'h-9 w-full rounded-md border border-gray-200 bg-white pl-8 pr-8 text-sm placeholder:text-gray-400',
					'focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200',
					'disabled:bg-gray-50 disabled:cursor-not-allowed',
					'[&::-webkit-search-cancel-button]:hidden',
				)}
			/>
			{text.length > 0 && !disabled && (
				<button
					type='button'
					onClick={handleClear}
					aria-label='Clear search'
					className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700'>
					<X size={14} />
				</button>
			)}
		</div>
	);
};

export default SearchBar;
