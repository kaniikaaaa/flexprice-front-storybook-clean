import 'tailwindcss/tailwind.css';
// Project CSS variables — required for `border-input`, `bg-popover`, `--border`,
// etc. to resolve. Without this, Button outline borders render as black,
// Popover-backed components (DatePicker, DateRangePicker) render with no
// background, and Card borders fall back to the default colour.
import '../src/index.css';
import type { Preview } from '@storybook/react';

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
};

export default preview;
