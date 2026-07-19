import useSWR from "swr";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";

const fetcher = (url) => api.get(url).then((r) => r.data);

export default function Nomination() {
  const { data = [] } = useSWR("/nomination", fetcher);
  const SECTION_ORDER = ["Nominator Information", "About the Nominee", "Impact & Excellence", "Confirmation"];
  const bySection = data.reduce((acc, q) => {
    (acc[q.section] = acc[q.section] || []).push(q);
    return acc;
  }, {});
  const orderedSections = [
    ...SECTION_ORDER.filter((s) => bySection[s]),
    ...Object.keys(bySection).filter((s) => !SECTION_ORDER.includes(s)),
  ];

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div className="eyebrow-line">Template</div>
        <h1 className="font-serif-editorial text-5xl md:text-6xl tracking-tight text-[#0A0F1A]">Nomination Form</h1>
        <p className="text-[#334] max-w-2xl">
          Example questions used in previous nomination cycles. Reuse, adapt, or extend them for future themes.
        </p>
      </header>

      <div className="space-y-8">
        {orderedSections.map((section) => {
          const items = bySection[section];
          return (
          <section key={section} className="border border-[#D5D1CB] rounded-md p-8 bg-white">
            <div className="eyebrow">Section</div>
            <h2 className="font-serif-editorial text-3xl text-[#114488] mt-1">{section}</h2>
            <div className="rule-line my-6" />
            <ol className="space-y-5">
              {items.map((q, i) => (
                <li key={q.id} className="flex gap-4">
                  <div className="font-serif-editorial text-3xl text-[#3E7CB1] leading-none w-10 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1">
                    <div className="text-[#0A0F1A] font-medium">{q.question}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="border-[#114488]/30 text-[#114488]">
                        {q.type === "short" ? "Short answer" : q.type === "long" ? "Paragraph" : "Multiple choice"}
                      </Badge>
                      {q.options?.length > 0 && q.options.map((o) => (
                        <span key={o} className="text-xs px-2 py-1 bg-[#EBE8E3] rounded">{o}</span>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          );
        })}
      </div>
    </div>
  );
}
