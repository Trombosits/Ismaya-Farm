"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: LoginErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Format email tidak valid.";
    }

    if (!password) {
      nextErrors.password = "Password wajib diisi.";
    } else if (password.length < 6) {
      nextErrors.password = "Password minimal 6 karakter.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // Prototype only: simulate a login request, then enter the application.
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      router.push("/");
    }, 900);
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-brand-900">
      {/* Background image */}
      <div
        aria-hidden
        className="absolute inset-0 bg-no-repeat opacity-15 bg-cover"
        style={{
          backgroundImage: "url('/images/ismaya-farm-inside.jpg')",
          backgroundSize: "100%",
          backgroundPosition: "center 10%",
        }}
      />

      {/* Brand overlay */}
      <div aria-hidden className="absolute inset-0 bg-brand-900/80" />

      {/* Login foreground */}
      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/images/ismaya-farm-logo-hi.png"
              alt="Ismaya Farm Bandung"
              width={96}
              height={96}
              priority
              className="size-20 drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)] sm:size-24"
            />
            <h1 className="mt-4 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Ismaya Farm Bandung
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Sistem Manajemen
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-7 flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm sm:p-6"
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-email"
                className="text-xs font-medium text-white/80"
              >
                Email
              </label>
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nama@ismaya.farm"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrors((current) => ({ ...current, email: undefined }));
                }}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "login-email-error" : undefined}
                className={errors.email ? "ring-1 ring-red-400/70" : undefined}
              />
              {errors.email ? (
                <p
                  id="login-email-error"
                  role="alert"
                  className="text-xs text-red-300"
                >
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-password"
                className="text-xs font-medium text-white/80"
              >
                Password
              </label>
              <Input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors((current) => ({
                    ...current,
                    password: undefined,
                  }));
                }}
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={
                  errors.password ? "login-password-error" : undefined
                }
                className={
                  errors.password ? "ring-1 ring-red-400/70" : undefined
                }
              />
              {errors.password ? (
                <p
                  id="login-password-error"
                  role="alert"
                  className="text-xs text-red-300"
                >
                  {errors.password}
                </p>
              ) : null}
            </div>

            <Button loading={loading} className="mt-1 w-full" onClick={() => router.push("/")}>
              Masuk
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-white/40">
            © 2026 Teknik Komputer · Universitas Pendidikan Indonesia
          </p>
        </div>
      </div>
    </main>
  );
}
