export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="app-header-bismillah">
        <span lang="ar" dir="rtl">بسم الله الرحمن الرحيم</span>
      </header>
      {children}
    </>
  );
}
