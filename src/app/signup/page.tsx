import type { Metadata } from "next";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "Join the Family",
  description:
    "Create your PSMF Family account — add your birthday, and never miss a celebration in the group again.",
};

export default function SignupPage() {
  return <SignupForm />;
}
