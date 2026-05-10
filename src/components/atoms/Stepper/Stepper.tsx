import { cn } from '@/lib/utils';
import React, { FC } from 'react';
import { IoCheckmarkCircleSharp } from 'react-icons/io5';

interface Step {
	/** Label shown next to the step indicator. */
	label: string;
}

interface StepperProps {
	/** Ordered list of steps (left to right). */
	steps: Step[];
	/**
	 * Zero-based index of the active step. Indices `< activeStep` render as
	 * completed (✓), index `=== activeStep` renders as active (numbered, dark
	 * border), and indices `> activeStep` render as upcoming (numbered, muted).
	 * Pass `steps.length` to render every step as completed.
	 */
	activeStep: number;
}

/**
 * Horizontal step indicator used in multi-step wizards (Plan creation,
 * Subscription setup, Bulk Imports). Renders a left-to-right row of
 * numbered/checked circles connected by dividers, with three visual
 * states per step: completed, active, and upcoming.
 */
const Stepper: FC<StepperProps> = ({ steps, activeStep }) => {
	return (
		<div className='flex items-center w-full'>
			{steps.map((step, index) => {
				const isActive = index === activeStep;
				const isCompleted = index < activeStep;

				return (
					<React.Fragment key={index}>
						{/* Step Circle */}
						<div className='flex items-center py-4 select-none'>
							<div
								className={cn('flex items-center justify-center size-5 rounded-full  text-base', {
									'': isCompleted,
									'border-[#333333] text-black border': isActive && !isCompleted,
									'border-[#EBEBEB] text-[#999999] bg-[#00000005] border': !isActive && !isCompleted,
								})}>
								{isCompleted ? <IoCheckmarkCircleSharp className='text-[#333333] size-5' /> : <span className='text-xs'>{index + 1}</span>}
							</div>

							{/* Step Label */}
							<div
								className={cn('ml-2 text-xs font-semibold', {
									'text-[#333333]': isCompleted || isActive,
									'text-[#999999]': !isCompleted && !isActive,
								})}>
								{step.label}
							</div>
						</div>

						{/* Divider */}
						{index < steps.length - 1 && (
							<div
								className={cn('flex-1 border mx-2', {
									'bg-black': isCompleted,
									'bg-gray-300': !isCompleted,
								})}></div>
						)}
					</React.Fragment>
				);
			})}
		</div>
	);
};

export default Stepper;
