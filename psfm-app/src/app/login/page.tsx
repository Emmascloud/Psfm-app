"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type ActionState } from "@/app/auth/actions";

const initialState: ActionState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg text-cream block mb-10 text-center">
          PSFM <span className="text-marigold">Circle</span>
        </Link>

        <div className="rounded-2xl bg-paper p-8">
          <h1 className="font-display text-2xl text-ink-on-paper mb-1">Welcome back</h1>
          <p className="font-body text-sm text-ink-on-paper/60 mb-6">
            Sign in to see the circle.
          </p>

          <form action={formAction} className="space-y-4">
            <div>
              <label className="font-body text-sm text-ink-on-paper/70 block mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-paper-dim bg-white px-3 py-2 font-body text-ink-on-paper"
              />
            </div>
            <div>
              <label className="font-body text-sm text-ink-on-paper/70 block mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-lg border border-paper-dim bg-white px-3 py-2 font-body text-ink-on-paper"
              />
            </div>

            {state.error && (
              <p className="font-body text-sm text-ember">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-marigold px-6 py-3 font-body font-medium text-ink-on-paper hover:bg-marigold-soft transition-colors disabled:opacity-60"
            >
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="font-body text-sm text-sage text-center mt-6">
          New to the circle?{" "}
          <Link href="/signup" className="text-marigold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
