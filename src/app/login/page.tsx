import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your PSMF Family account.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-6 py-16">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
