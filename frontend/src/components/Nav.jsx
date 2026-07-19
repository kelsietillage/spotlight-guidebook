import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { T } from "@/constants/testIds";
import { Button } from "@/components/ui/button";
import { LogOut, Printer } from "lucide-react";

const links = [
  { to: "/", label: "Home", tid: T.nav.home, end: true },
  { to: "/winners", label: "Past Winners", tid: T.nav.winners },
  { to: "/themes", label: "Themes", tid: T.nav.themes },
  { to: "/timelines", label: "Timelines", tid: T.nav.timelines },
  { to: "/nomination", label: "Nomination", tid: T.nav.nomination },
  { to: "/rubric", label: "Rubric", tid: T.nav.rubric },
  { to: "/tracking", label: "Tracking", tid: T.nav.tracking },
  { to: "/correspondence", label: "Correspondence", tid: "nav-correspondence" },
  { to: "/contacts", label: "Contacts", tid: "nav-contacts" },
];

const LOGO = "https://customer-assets-cm19k8pv.emergentagent.net/job_spotlight-co-chair/artifacts/oos0yto2_BP%20Logo.png";

export default function Nav() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="no-print sticky top-0 z-40 backdrop-blur-xl bg-white/85 border-b border-[#DCE6F2]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
        <Link to="/" data-testid="brand-link" className="flex items-center gap-3 shrink-0 no-underline hover:no-underline">
          <img src={LOGO} alt="The Blueprint" className="w-11 h-11 rounded-full border border-[#114488]/40 bg-white object-contain" />
          <div className="leading-tight">
            <div className="font-serif-editorial text-lg text-[#114488] no-underline">The Spelman Blueprint</div>
            <div className="text-[10px] tracking-[0.24em] uppercase text-[#3E7CB1] font-medium mt-0.5">Spotlight Award Guidebook</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4 flex-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              data-testid={l.tid}
              className={({ isActive }) =>
                `px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive
                    ? "text-[#114488] bg-[#EDF2FB]"
                    : "text-[#334] hover:text-[#114488] hover:bg-[#EBE8E3]/60"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            data-testid={T.nav.print}
            onClick={() => window.print()}
            className="hidden sm:inline-flex"
          >
            <Printer className="w-4 h-4 mr-1" /> Print
          </Button>
          {user ? (
            <>
              <NavLink to="/admin" data-testid={T.nav.admin}>
                <Button size="sm" className="bg-[#114488] hover:bg-[#0c3468]">Admin</Button>
              </NavLink>
              <Button
                variant="outline"
                size="sm"
                data-testid={T.nav.logout}
                onClick={() => { logout(); nav("/"); }}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <NavLink to="/login" data-testid={T.nav.login}>
              <Button size="sm" variant="outline" className="border-[#114488] text-[#114488]">
                Co-Chair Login
              </Button>
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
