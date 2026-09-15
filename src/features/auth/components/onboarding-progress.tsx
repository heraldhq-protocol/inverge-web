type OnboardingProgressProps = {
  currentStep: 1 | 2;
  label: string;
};

export function OnboardingProgress({
  currentStep,
  label,
}: OnboardingProgressProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex items-center justify-between text-xs font-medium text-muted">
        <span>{label}</span>
        <span>{currentStep} of 2</span>
      </div>
      <div
        role="progressbar"
        aria-label="Onboarding progress"
        aria-valuemin={1}
        aria-valuemax={2}
        aria-valuenow={currentStep}
        className="mt-3 h-1 overflow-hidden rounded-full bg-border"
      >
        <span
          className={`block h-full rounded-full bg-brand transition-[width] ${
            currentStep === 1 ? "w-1/2" : "w-full"
          }`}
        />
      </div>
    </div>
  );
}
