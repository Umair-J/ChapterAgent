import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-4xl font-bold">Chapter Agent</h1>
      <p className="mb-8 max-w-md text-center text-lg text-gray-600">
        AI-powered 90-day engagement planning for chapter leaders.
        Generate plans, create content, and sync to Google Calendar.
      </p>
      <Link
        href="/login"
        className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
      >
        Get Started
      </Link>
    </main>
  );
}
