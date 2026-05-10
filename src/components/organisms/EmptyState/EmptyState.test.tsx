import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from './EmptyState';

describe('<EmptyState />', () => {
	it('renders the title at heading level 3', () => {
		render(<EmptyState title="No customers yet" />);
		expect(screen.getByRole('heading', { level: 3, name: 'No customers yet' })).toBeInTheDocument();
	});

	it('renders the description when provided and omits it otherwise', () => {
		const { rerender } = render(
			<EmptyState title="Empty" description="Try adjusting your filters." />,
		);
		expect(screen.getByText('Try adjusting your filters.')).toBeInTheDocument();

		rerender(<EmptyState title="Empty" />);
		expect(screen.queryByText('Try adjusting your filters.')).toBeNull();
	});

	it('renders the action node when provided and dispatches its click handler', async () => {
		const onClick = vi.fn();
		const user = userEvent.setup();
		render(
			<EmptyState
				title="No invoices"
				description="Once you create a plan, invoices will appear here."
				action={<button onClick={onClick}>Create plan</button>}
			/>,
		);
		const cta = screen.getByRole('button', { name: 'Create plan' });
		expect(cta).toBeInTheDocument();
		await user.click(cta);
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('renders the icon node verbatim', () => {
		render(
			<EmptyState
				title="No data"
				icon={<svg data-testid="empty-icon" aria-hidden="true" />}
			/>,
		);
		expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
	});

	it('applies the small size when size="sm" is passed', () => {
		const { container } = render(<EmptyState title="Empty" size="sm" />);
		// The min-height class is the public contract that "size" controls
		expect(container.firstChild).toHaveClass('min-h-[240px]');
	});

	it('applies the large size when size="lg" is passed', () => {
		const { container } = render(<EmptyState title="Empty" size="lg" />);
		expect(container.firstChild).toHaveClass('min-h-[480px]');
	});

	it('defaults to the medium size when size is omitted', () => {
		const { container } = render(<EmptyState title="Empty" />);
		expect(container.firstChild).toHaveClass('min-h-[360px]');
	});
});
