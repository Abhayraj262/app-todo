import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Register",
  description: "Create an account to manage your tasks.",
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}