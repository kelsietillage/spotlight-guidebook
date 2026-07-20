import useSWR from "swr";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Mail, Phone, Pencil } from "lucide-react";

const fetcher = (url) => api.get(url).then((r) => r.data);

export default function Contacts() {
  const { data = [] } = useSWR("/contacts", fetcher);
  const { user } = useAuth();

  const creator = data.find((c) => /creator|founder/i.test(c.role));
  const chairs = data.filter((c) => c !== creator);

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div className="eyebrow-line">People</div>
        <h1 className="font-serif-editorial text-5xl md:text-6xl tracking-tight text-[#0A0F1A]">Contacts</h1>
        <p className="text-[#334] max-w-2xl">
          Chairs can log in through the Admin Panel to add their name or update their email at any time.
          If you ever need anything—whether it's advice, ideas, or a helping hand—please don't hesitate to reach out.
          Wishing you all the best as you continue making the Spotlight Awards a tradition that celebrates the very best of Spelman.
        </p>
        {user && (
          <Link to="/admin" data-testid="contacts-edit-cta"
            className="inline-flex items-center gap-2 text-sm text-[#114488] hover:underline">
            <Pencil className="w-4 h-4" /> Update your info in Admin → Contacts
          </Link>
        )}
      </header>

      {creator && (
        <section className="border border-[#3E7CB1]/50 rounded-md p-8 bg-white relative overflow-hidden">
          <div className="relative">
            <div className="eyebrow text-[#114488]">{creator.role} · {creator.year}</div>
            <div className="font-serif-editorial text-4xl text-[#114488] mt-1">{creator.name}</div>
            {creator.note && <p className="text-[#334] mt-3 max-w-2xl">{creator.note}</p>}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {creator.email && (
                <a href={`mailto:${creator.email}`} className="inline-flex items-center gap-2 text-[#114488] hover:underline">
                  <Mail className="w-4 h-4" /> {creator.email}
                </a>
              )}
              {creator.phone && (
                <a href={`tel:${creator.phone}`} className="inline-flex items-center gap-2 text-[#114488] hover:underline">
                  <Phone className="w-4 h-4" /> {creator.phone}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="eyebrow">Co-Chairs by Year</div>
            <h2 className="font-serif-editorial text-3xl text-[#0A0F1A]">Chairs</h2>
          </div>
        </div>
        <div className="rule-line mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chairs.map((c) => (
            <div key={c.id} data-testid={`contact-${c.id}`} className="border border-[#D5D1CB] rounded-md p-5 bg-white">
              <div className="eyebrow">{c.role}{c.year ? ` · ${c.year}` : ""}</div>
              <div className="font-serif-editorial text-2xl text-[#0A0F1A] mt-1">{c.name}</div>
              {c.note && <p className="text-sm text-[#556] mt-2">{c.note}</p>}
              <div className="mt-3 space-y-1 text-sm">
                {c.email && (
                  <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-[#114488] hover:underline">
                    <Mail className="w-4 h-4" /> {c.email}
                  </a>
                )}
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-[#114488] hover:underline">
                    <Phone className="w-4 h-4" /> {c.phone}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
