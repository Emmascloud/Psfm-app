"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type ForgotPasswordState } from "@/app/auth/actions";

const initialState: ForgotPasswordState = { error: null, sent: false };

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg text-cream block mb-10 text-center">
          PSMF <span className="text-marigold">Family</span>
        </Link>

        <div className="rounded-2xl bg-paper p-8">
          {state.sent ? (
            <>
              <h1 className="font-display text-2xl text-ink-on-paper mb-2">Check your email</h1>
              <p className="font-body text-sm text-ink-on-paper/70 leading-relaxed">
                If that address has an account, a reset link is on its way.
                Open it on this device to choose a new password. It expires
                after a while, so use it soon.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl text-ink-on-paper mb-1">Reset your password</h1>
              <p className="font-body text-sm text-ink-on-paper/60 mb-6">
                Enter the email you signed up with — we'll send a link to set
                a new password.
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

                {state.error && <p className="font-body text-sm text-ember">{state.error}</p>}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-full bg-marigold px-6 py-3 font-body font-medium text-ink-on-paper hover:bg-marigold-soft transition-colors disabled:opacity-60"
                >
                  {pending ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="font-body text-sm text-sage text-center mt-6">
          <Link href="/login" className="text-marigold hover:underline">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
