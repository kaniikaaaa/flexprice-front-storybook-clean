import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BreadcrumbsView from './BreadcrumbsView';

describe('<BreadcrumbsView />', () => {
	it('renders every label in order', () => {
		render(
			<BreadcrumbsView
				items={[
					{ label: 'Billing', href: '/billing' },
					{ label: 'Customers', href: '/billing/customers' },
					{ label: 'Acme Corp' },
				]}
			/>,
		);
		const labels = ['Billing', 'Customers', 'Acme Corp'];
		labels.forEach((l) => expect(screen.getByText(l)).toBeInTheDocument());
	});

	it('marks only the last item with aria-current="page" and renders it as non-interactive', () => {
		render(
			<BreadcrumbsView
				items={[
					{ label: 'Tools', href: '/tools' },
					{ label: 'Imports' },
				]}
			/>,
		);
		// Last item gets aria-current
		expect(screen.getByText('Imports')).toHaveAttribute('aria-current', 'page');
		// And is NOT a link
		expect(screen.queryByRole('link', { name: 'Imports' })).toBeNull();
		// First item IS a link
		expect(screen.getByRole('link', { name: 'Tools' })).toBeInTheDocument();
	});

	it('uses anchors when href is provided and buttons when onClick is provided instead', () => {
		const onClick = vi.fn();
		render(
			<BreadcrumbsView
				items={[
					{ label: 'Anchor link', href: '/somewhere' },
					{ label: 'Button click', onClick },
					{ label: 'Current' },
				]}
			/>,
		);
		expect(screen.getByRole('link', { name: 'Anchor link' })).toHaveAttribute('href', '/somewhere');
		expect(screen.getByRole('button', { name: 'Button click' })).toBeInTheDocument();
	});

	it('fires onClick when a button-style item is clicked', async () => {
		const onClick = vi.fn();
		const user = userEvent.setup();
		render(
			<BreadcrumbsView
				items={[
					{ label: 'Developers', onClick },
					{ label: 'API Keys' },
				]}
			/>,
		);
		await user.click(screen.getByRole('button', { name: 'Developers' }));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('renders without chevrons when only one item is provided', () => {
		const { container } = render(<BreadcrumbsView items={[{ label: 'Revenue' }]} />);
		// Chevron icons render as SVGs from lucide — none should be present
		expect(container.querySelectorAll('svg')).toHaveLength(0);
	});

	it('exposes a Breadcrumb landmark via aria-label', () => {
		render(<BreadcrumbsView items={[{ label: 'Home' }, { label: 'Settings' }]} />);
		expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
	});
});
