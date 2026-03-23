import WizardForm from "@/components/plan/WizardForm";

export default function NewPlanPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-center text-3xl font-bold">Create Your Engagement Plan</h1>
        <p className="mb-8 text-center text-gray-600">
          Tell us about your chapter and we&apos;ll generate a personalized 90-day plan.
        </p>
        <WizardForm />
      </div>
    </main>
  );
}
