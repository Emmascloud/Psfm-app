"use client";

import { useActionState } from "react";
import { updateProfile, type ActionState } from "@/app/auth/actions";
import { MonthDayFields } from "@/components/DateFields";
import type { Profile } from "@/lib/types";

const initialState: ActionState = { error: null };

export default function ProfileForm({ profile, phone }: { profile: Profile | null; phone?: string }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="font-body text-sm text-ink-on-paper/70 block mb-1" htmlFor="full_name">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          defaultValue={profile?.full_name ?? ""}
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
          defaultValue={phone ?? ""}
          className="w-full rounded-lg border border-paper-dim bg-white px-3 py-2 font-body text-ink-on-paper"
        />
      </div>

      <fieldset>
        <legend className="font-body text-sm text-ink-on-paper/70 mb-2">Status</legend>
        <div className="flex gap-4 font-body text-sm text-ink-on-paper">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="single"
              defaultChecked={profile?.status === "single"}
            />{" "}
            Single
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="married"
              defaultChecked={profile?.status === "married"}
            />{" "}
            Married
          </label>
        </div>
      </fieldset>

      <MonthDayFields
        label="Birthday"
        monthName="birth_month"
        dayName="birth_day"
        required
        defaultMonth={profile?.birth_month}
        defaultDay={profile?.birth_day}
      />

      <MonthDayFields
        label="Wedding anniversary (optional)"
        monthName="anniversary_month"
        dayName="anniversary_day"
        defaultMonth={profile?.anniversary_month}
        defaultDay={profile?.anniversary_day}
      />

      {state.error && <p className="font-body text-sm text-ember">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-marigold px-6 py-3 font-body font-medium text-ink-on-paper hover:bg-marigold-soft transition-colors disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
