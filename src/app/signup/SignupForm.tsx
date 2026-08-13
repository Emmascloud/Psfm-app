"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type ActionState } from "@/app/auth/actions";
import { MonthDayFields } from "@/components/DateFields";

const initialState: ActionState = { error: null };

type Prefill = {
  full_name: string;
  birth_month: number;
  birth_day: number;
  anniversary_month: number | null;
  anniversary_day: number | null;
  invite_token: string;
} | null;

export default function SignupForm({ prefill }: { prefill?: Prefill }) {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="font-display text-lg text-cream block mb-10 text-center">
          PSMF <span className="text-marigold">Family</span>
        </Link>

        <div className="rounded-2xl bg-paper p-8">
          <h1 className="font-display text-2xl text-ink-on-paper mb-1">Join the family</h1>
          {prefill ? (
            <p className="font-body text-sm text-marigold mb-6">
              Welcome, {prefill.full_name.split(" ")[0]} — your name and birthday are
              already filled in below. Just add your own email and a password.
            </p>
          ) : (
            <p className="font-body text-sm text-ink-on-paper/60 mb-6">
              Your dates are only ever visible to signed-in members.
            </p>
          )}

          <form action={formAction} className="space-y-5">
            {prefill && <input type="hidden" name="invite_token" value={prefill.invite_token} />}
            <div>
              <label className="font-body text-sm text-ink-on-paper/70 block mb-1" htmlFor="full_name">
                Full name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                defaultValue={prefill?.full_name ?? ""}
                className="w-full rounded-lg border border-paper-dim bg-white px-3 py-2 font-body text-ink-on-paper"
              />
            </div>

            <fieldset>
              <legend className="font-body text-sm text-ink-on-paper/70 mb-2">Status</legend>
              <div className="flex gap-4 font-body text-sm text-ink-on-paper">
                <label className="flex items-center gap-2">
                  <input type="radio" name="status" value="single" /> Single
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="status" value="married" /> Married
                </label>
              </div>
            </fieldset>

            <MonthDayFields
              label="Birthday"
              monthName="birth_month"
              dayName="birth_day"
              required
              defaultMonth={prefill?.birth_month}
              defaultDay={prefill?.birth_day}
            />

            <MonthDayFields
              label="Wedding anniversary (optional)"
              monthName="anniversary_month"
              dayName="anniversary_day"
              defaultMonth={prefill?.anniversary_month ?? undefined}
              defaultDay={prefill?.anniversary_day ?? undefined}
            />

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
              <label className="font-body text-sm text-ink-on-paper/70 block mb-1" htmlFor="phone">
                Phone number <span className="text-ink-on-paper/40">(private — only you and admins see this)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
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
                minLength={6}
                className="w-full rounded-lg border border-paper-dim bg-white px-3 py-2 font-body text-ink-on-paper"
              />
            </div>

            <label className="flex items-start gap-2 font-body text-xs text-ink-on-paper/70">
              <input type="checkbox" name="agree" required className="mt-0.5" />
              <span>
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="text-marigold hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="text-marigold hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            {state.error && (
              <p className="font-body text-sm text-ember">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-marigold px-6 py-3 font-body font-medium text-ink-on-paper hover:bg-marigold-soft transition-colors disabled:opacity-60"
            >
              {pending ? "Creating your profile…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="font-body text-sm text-sage text-center mt-6">
          Already a member?{" "}
          <Link href="/login" className="text-marigold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
