import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { ModeToggle } from "@/components/utils/mode-toggle";
import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="auth-layout min-h-svh grid lg:grid-cols-2">
      <AuthBrandPanel />

      <div className="auth-form-panel relative flex min-h-svh flex-col overflow-hidden">
        {/* Ambient background orbs */}
        <div aria-hidden className="auth-orb auth-orb-violet" />
        <div aria-hidden className="auth-orb auth-orb-blue" />
        <div aria-hidden className="auth-orb auth-orb-emerald" />
        <div aria-hidden className="auth-orb auth-orb-orange" />

        <header className="absolute right-0 top-0 z-10 p-4 sm:p-6">
          <ModeToggle />
        </header>

        <main className="relative z-[1] flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-8">
          <div className="w-full max-w-[460px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
