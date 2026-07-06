import LoginBackground from "@/components/LoginBackground";
import LoginHero from "@/components/LoginHero";
import LoginForm from "@/components/LoginForm";

export default function Login() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617]">

      <LoginBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">

        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-20 items-center">

          {/* Left */}

          <LoginHero />

          {/* Right */}

          <LoginForm />

        </div>

      </div>

    </main>
  );
}