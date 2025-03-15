import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-900">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-zinc-800 border-zinc-700",
            headerTitle: "text-zinc-100",
            headerSubtitle: "text-zinc-400",
            formButtonPrimary: "bg-zinc-700 hover:bg-zinc-600",
            formFieldInput: "bg-zinc-900 border-zinc-700 text-zinc-100",
            formFieldLabel: "text-zinc-400",
            footerActionLink: "text-zinc-400 hover:text-zinc-300",
          },
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
      />
    </div>
  );
}