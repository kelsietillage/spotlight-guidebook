import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, BookOpen, Calendar, ClipboardList, Trophy, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";

const fetcher = (url) => api.get(url).then((r) => r.data);

const sections = [
  { to: "/winners", title: "Past Winners", icon: Trophy, desc: "Alumnae archive across years, themes, and categories." },
  { to: "/themes", title: "Themes", icon: Sparkles, desc: "Overview of each year's theme, tagline, FAQ, and photos." },
  { to: "/timelines", title: "Timelines", icon: Calendar, desc: "Month-by-month planning calendars." },
  { to: "/nomination", title: "Nomination Form", icon: BookOpen, desc: "Example questions and structure." },
  { to: "/rubric", title: "Scoring Rubric", icon: ClipboardList, desc: "Selection committee scoring criteria (1–5)." },
  { to: "/tracking", title: "Tracking Templates", icon: ClipboardList, desc: "Selection & article production trackers." },
  { to: "/correspondence", title: "Correspondence", icon: Mail, desc: "Ready-to-send emails for every stage of the award cycle." },
  { to: "/contacts", title: "Contacts", icon: BookOpen, desc: "Founder & co-chairs by year." },
];

function GalleryCarousel({ photos }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (photos.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % photos.length), 4500);
    return () => clearInterval(t);
  }, [photos.length]);

  if (!photos.length) return null;
  return (
    <div className="relative overflow-hidden rounded-lg border border-[#D5D1CB] shadow-sm h-[380px]">
      {photos.map((p, idx) => (
        <img
          key={p.id}
          src={p.url}
          alt={p.caption || "Spotlight gallery"}
          data-testid={`hero-slide-${idx}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ${idx === i ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 grain pointer-events-none" />
      {photos[i]?.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/45 text-white text-sm px-4 py-3 backdrop-blur-sm">
          {photos[i].caption}
        </div>
      )}
      <div className="absolute bottom-3 right-3 flex gap-1.5">
        {photos.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            data-testid={`hero-dot-${idx}`}
            className={`w-2 h-2 rounded-full transition-all ${idx === i ? "bg-[#3E7CB1] w-6" : "bg-white/70"}`}
            aria-label={`Show slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { data: winners } = useSWR("/winners", fetcher);
  const { data: themes } = useSWR("/themes", fetcher);
  const { data: photos = [] } = useSWR("/photos", fetcher);

  return (
    <div className="space-y-16">
      {/* Mission quote — inspired by the live Blueprint site */}
      <section className="relative">
        <div className="max-w-4xl">
          <p className="font-serif-editorial text-3xl md:text-4xl lg:text-5xl leading-[1.15] tracking-tight text-[#0A0F1A]">
            The Spelman Blueprint Spotlight Award honors outstanding Spelmanites who are making
            meaningful impacts in their fields and communities. Through this recognition, we
            <span className="text-[#114488]"> celebrate their brilliance</span>, uplift their journeys, and
            <span className="text-[#3E7CB1]"> inspire the next generation</span> to dream boldly and lead with purpose.
          </p>
          <div className="eyebrow-line mt-6">The Spelman Blueprint Spotlight Award</div>
        </div>
      </section>

      {/* Hero */}
      <section className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-end pt-4">
        <div className="md:col-span-7 space-y-6">
          <div className="eyebrow-line">A Spelman Blueprint Editorial Guidebook · Est. 2025</div>
          <h1 className="font-serif-editorial text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-[#0A0F1A]">
            The Spelman Blueprint <br />
            <span className="text-[#114488]">Spotlight Award</span> <span className="text-[#3E7CB1] italic">Guidebook</span>
          </h1>
          <p className="text-lg text-[#334] max-w-xl leading-relaxed">
            A living reference for every co-chair after us. Winners, themes, timelines, rubrics,
            and templates — everything needed to run the next season of The Spotlight Awards at Spelman.
          </p>
          <div className="flex gap-3 pt-2">
            <Link to="/themes">
              <Button data-testid="hero-cta-themes" className="bg-[#114488] hover:bg-[#0c3468] rounded-md">
                Explore Themes <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/winners">
              <Button data-testid="hero-cta-winners" variant="outline" className="border-[#114488] text-[#114488] rounded-md">
                Browse Winners
              </Button>
            </Link>
          </div>
        </div>

        <div className="md:col-span-5 relative">
          <GalleryCarousel photos={photos} />
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Winners Archived", value: winners?.length ?? "—" },
          { label: "Themes Documented", value: themes?.length ?? "—" },
          { label: "Categories", value: 3 },
          { label: "Founding Year", value: 2025 },
        ].map((s) => (
          <div key={s.label} data-testid={`stat-${s.label}`} className="border border-[#D5D1CB] rounded-md p-6 bg-white">
            <div className="eyebrow">{s.label}</div>
            <div className="font-serif-editorial text-4xl mt-2 text-[#114488]">{s.value}</div>
          </div>
        ))}
      </section>

      {/* Section cards */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="eyebrow">Contents</div>
            <h2 className="font-serif-editorial text-4xl md:text-5xl tracking-tight text-[#0A0F1A]">Inside the guidebook</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              data-testid={`section-card-${s.to.slice(1)}`}
              className="group border border-[#D5D1CB] rounded-md p-6 bg-white hover:border-[#114488] hover:-translate-y-1 transition-transform duration-200 block"
            >
              <s.icon className="w-6 h-6 text-[#3E7CB1]" />
              <div className="font-serif-editorial text-2xl mt-4 text-[#0A0F1A] group-hover:text-[#114488]">{s.title}</div>
              <p className="text-sm text-[#556] mt-2 leading-relaxed">{s.desc}</p>
              <div className="mt-4 text-sm text-[#114488] font-medium inline-flex items-center">
                Open <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
