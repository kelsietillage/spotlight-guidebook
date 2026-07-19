import Nav from "@/components/Nav";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <main className="max-w-7xl mx-auto px-6 py-10 print-container">
        {children}
      </main>
      <footer className="no-print border-t border-[#DCE6F2] mt-16 py-8 text-center">
        <div className="font-serif-editorial text-[#114488]">The Spelman Blueprint · Spotlight Award Guidebook</div>
      </footer>
    </div>
  );
}
