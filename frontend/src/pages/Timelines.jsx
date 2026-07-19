import useSWR from "swr";
import { useState, useEffect, useMemo } from "react";
import api from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const fetcher = (url) => api.get(url).then((r) => r.data);

export default function Timelines() {
  const { data = [] } = useSWR("/timelines", fetcher);
  const [year, setYear] = useState("");

  const years = useMemo(
    () => Array.from(new Set(data.map((r) => r.year))).sort((a, b) => b - a),
    [data],
  );

  useEffect(() => { if (years.length && !year) setYear(String(years[0])); }, [years, year]);

  const rows = data.filter((r) => String(r.year) === year);

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div className="eyebrow-line">Planning Calendar</div>
        <h1 className="font-serif-editorial text-5xl md:text-6xl tracking-tight text-[#0A0F1A]">Timelines</h1>
        <p className="text-[#334] max-w-2xl">
          These are rough drafts of the final timeline. Please account for big campus events when planning,
          and note that all awardees, articles, and pictures should be ready to be announced on{" "}
          <strong className="text-[#114488]">Founders Day, April 11th</strong>.
        </p>
      </header>

      <Tabs value={year} onValueChange={setYear}>
        <TabsList className="bg-[#EBE8E3]">
          {years.map((y) => (
            <TabsTrigger
              key={y}
              value={String(y)}
              data-testid={`timeline-tab-${y}`}
              className="data-[state=active]:bg-[#114488] data-[state=active]:text-white"
            >
              {y}
            </TabsTrigger>
          ))}
        </TabsList>
        {years.map((y) => (
          <TabsContent key={y} value={String(y)} className="mt-8">
            <ol className="relative border-l-2 border-[#3E7CB1]/50 ml-4 space-y-8">
              {rows.map((r) => (
                <li key={r.id} data-testid={`timeline-row-${r.id}`} className="pl-6 relative">
                  <span className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-[#114488] border-2 border-white shadow-sm" />
                  <div className="eyebrow text-[#3E7CB1]">{r.month}</div>
                  <div className="font-serif-editorial text-2xl text-[#0A0F1A]">{r.date_range}</div>
                  <ul className="mt-3 space-y-1 text-[#334]">
                    {(r.items || []).map((it, i) => (
                      <li key={i} className="pl-4 relative">
                        <span className="absolute left-0 top-2 w-1 h-1 rounded-full bg-[#114488]" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
