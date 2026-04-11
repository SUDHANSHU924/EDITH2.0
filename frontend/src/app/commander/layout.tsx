import TopBar from "@/components/layout/TopBar";

export default function CommanderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen grid-bg">
      <TopBar />
      <div className="flex h-[calc(100vh-48px)]">{children}</div>
    </div>
  );
}
