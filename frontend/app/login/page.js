import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Log in",
  description: "Log in to manage your tasks.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
