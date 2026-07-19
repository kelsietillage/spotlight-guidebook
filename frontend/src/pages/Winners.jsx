import { useState, useMemo } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { T } from "@/constants/testIds";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

const fetcher = (url) => api.get(url).then((r) => r.data);
const CATS = ["Arts & Academia", "Entrepreneurship & Business", "Public Service & Community Engagement"];
const CAT_COLOR = {
  "Arts & Academia": "bg-[#EDF2FB] text-[#114488] border-[#114488]/30",
  "Entrepreneurship & Business": "bg-[#EAF1F9] text-[#114488] border-[#3E7CB1]/50",
  "Public Service & Community Engagement": "bg-[#E3F1FA] text-[#095c85] border-[#55BBEE]/40",
};

export default function Winners() {
  const { data = [] } = useSWR("/winners", fetcher);
  const [q, setQ] = useState("");
  const [year, setYear] = useState("all");
  const [cat, setCat] = useState("all");

  const years = useMemo(
    () => Array.from(new Set(data.map((w) => w.year))).sort((a, b) => b - a),
    [data],
  );

  const filtered = data.filter((w) => {
    if (q && !w.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (year !== "all" && String(w.year) !== year) return false;
    if (cat !== "all" && w.category !== cat) return false;
    return true;
  });

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div className="eyebrow-line">The Archive</div>
        <h1 className="font-serif-editorial text-5xl md:text-6xl tracking-tight text-[#0A0F1A]">Past Winners</h1>
        <p className="text-[#334] max-w-2xl">
          Every Spelmanite spotlighted since inception. Filter by year, category, or search by name.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 no-print">
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#889]" />
          <Input
            data-testid={T.winners.search}
            placeholder="Search by name"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="md:col-span-3">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger data-testid={T.winners.yearFilter}><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3">
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger data-testid={T.winners.categoryFilter}><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-[#556]">Showing {filtered.length} of {data.length}</div>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((w) => (
          <li
            key={w.id}
            data-testid={T.winners.row(w.id)}
            className="border border-[#D5D1CB] rounded-md p-5 bg-white hover:border-[#114488] transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-serif-editorial text-xl text-[#0A0F1A] leading-tight">{w.name}</div>
                <div className="eyebrow mt-2">{w.year} · {w.theme}</div>
              </div>
            </div>
            <Badge className={`mt-3 border ${CAT_COLOR[w.category] || ""}`} variant="outline">
              {w.category}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
