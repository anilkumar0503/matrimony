export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Decorative orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#7B1D1D] opacity-15 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#C9972C] opacity-10 blur-[100px] pointer-events-none" />
      {children}
    </div>
  );
}
