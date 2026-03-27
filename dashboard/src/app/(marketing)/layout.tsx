export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#1a1a1a' }}>
      {children}
    </div>
  );
}
