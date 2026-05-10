import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useState } from 'react';
import Stepper from './Stepper';
import { Button } from '@/components/atoms';

const planSteps = [
	{ label: 'Plan details' },
	{ label: 'Pricing' },
	{ label: 'Entitlements' },
	{ label: 'Review' },
];

const meta = {
	title: 'Atoms/Stepper',
	component: Stepper,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Horizontal step indicator used in multi-step flows like Plan creation, Subscription setup, and Bulk Imports. Shows completed (✓), active (numbered, dark border), and upcoming (numbered, muted) states with a divider between each step.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		activeStep: { control: { type: 'number', min: 0, max: 5 } },
	},
	args: { steps: planSteps, activeStep: 1 },
	decorators: [
		(Story) => (
			<div style={{ width: 720 }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Step 2 of 4 active. */
export const Default: Story = {};

/** First step, nothing completed yet. */
export const FirstStep: Story = { args: { activeStep: 0 } };

/** Mid-flow — two steps complete. */
export const MidFlow: Story = { args: { activeStep: 2 } };

/** All steps completed (activeStep > last index). */
export const AllComplete: Story = { args: { activeStep: planSteps.length } };

/** Two-step variant. */
export const TwoSteps: Story = {
	args: {
		steps: [{ label: 'Choose plan' }, { label: 'Confirm' }],
		activeStep: 0,
	},
};

/** Five-step variant — long labels truncate gracefully via the layout. */
export const FiveSteps: Story = {
	args: {
		steps: [
			{ label: 'Workspace' },
			{ label: 'Team members' },
			{ label: 'Billing' },
			{ label: 'Integrations' },
			{ label: 'Done' },
		],
		activeStep: 2,
	},
};

/** Interactive demo — Next/Back buttons drive the stepper. */
export const Interactive: Story = {
	render: function Render() {
		const [step, setStep] = useState(0);
		return (
			<div className="space-y-6">
				<Stepper steps={planSteps} activeStep={step} />
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
					<Button onClick={() => setStep((s) => Math.min(planSteps.length, s + 1))} disabled={step >= planSteps.length}>Next</Button>
				</div>
				<p className="text-sm text-muted-foreground" data-testid="active-step">Active step index: {step}</p>
			</div>
		);
	},
	/**
	 * Interaction test — clicks Next twice, then Back once, asserting the
	 * displayed active-step index advances from 0 → 2 → 1.
	 */
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const next = canvas.getByRole('button', { name: /next/i });
		const back = canvas.getByRole('button', { name: /back/i });
		const indicator = canvas.getByTestId('active-step');

		await expect(indicator).toHaveTextContent('Active step index: 0');
		await userEvent.click(next);
		await userEvent.click(next);
		await expect(indicator).toHaveTextContent('Active step index: 2');
		await userEvent.click(back);
		await expect(indicator).toHaveTextContent('Active step index: 1');
	},
};
