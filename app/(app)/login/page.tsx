export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-900">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-no-repeat opacity-30"
        style={{
          backgroundImage: "url('/images/domba.png')",
          backgroundSize: "70%",
          backgroundPosition: "right 20%",
        }}
      />

      {/* Brand overlay */}
      <div className="absolute inset-0 bg-brand-900/80" />

      {/* Content area — nanti form login di sini */}
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        {/* Login form akan ditambahkan di sini */}
      </div>
    </main>
  );
}