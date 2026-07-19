import useSWR from "swr";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { T } from "@/constants/testIds";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const fetcher = (url) => api.get(url).then((r) => r.data);

function PhotoGallery({ year }) {
  const { data = [] } = useSWR("/photos", fetcher);
  const photos = data.filter((p) => Number(p.year) === Number(year));
  if (!photos.length) {
    return (
      <div className="border border-dashed border-[#D5D1CB] rounded-md p-8 text-center text-[#556]">
        No photos yet for {year}. Co-chairs can add photo links from the Admin panel.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {photos.map((p) => (
        <figure key={p.id} data-testid={`photo-${p.id}`} className="group border border-[#D5D1CB] rounded-md overflow-hidden bg-white">
          <div className="aspect-[4/3] overflow-hidden">
            <img src={p.url} alt={p.caption || `Spotlight ${year}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          {p.caption && (
            <figcaption className="p-3 text-sm text-[#334] font-serif-editorial">{p.caption}</figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

export default function Themes() {
  const { data = [] } = useSWR("/themes", fetcher);
  const [active, setActive] = useState("");

  useEffect(() => {
    if (data.length && !active) setActive(String(data[0].year));
  }, [data, active]);

  if (!data.length) return null;

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div className="eyebrow-line">Editorial Concepts</div>
        <h1 className="font-serif-editorial text-5xl md:text-6xl tracking-tight text-[#0A0F1A]">Themes</h1>
        <p className="text-[#334] max-w-2xl">
          Each year&apos;s theme sets the editorial voice for the Spotlight Awards — from tagline to FAQ to photo gallery.
        </p>
      </header>

      <Tabs value={active} onValueChange={setActive}>
        <TabsList className="bg-[#EBE8E3]">
          {data.map((t) => (
            <TabsTrigger
              key={t.year}
              value={String(t.year)}
              data-testid={T.themes.tab(t.year)}
              className="data-[state=active]:bg-[#114488] data-[state=active]:text-white"
            >
              {t.year} · {t.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {data.map((t) => (
          <TabsContent key={t.year} value={String(t.year)} className="mt-8 space-y-10">
            <article className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-7 space-y-6">
                <div>
                  <div className="eyebrow">Theme · {t.year}</div>
                  <h2 className="font-serif-editorial text-5xl tracking-tight text-[#114488]">{t.title}</h2>
                  <p className="font-serif-editorial text-2xl italic text-[#3E7CB1] mt-3">&ldquo;{t.tagline}&rdquo;</p>
                </div>
                <div className="rule-line" />
                <div className="text-[#334] leading-relaxed text-lg whitespace-pre-line">{t.description}</div>
              </div>
              <aside className="md:col-span-5">
                <div className="border border-[#D5D1CB] rounded-md p-6 bg-white">
                  <div className="eyebrow mb-4">Frequently Asked</div>
                  <Accordion type="single" collapsible>
                    {(t.faq || []).map((f, i) => (
                      <AccordionItem key={i} value={`i-${i}`}>
                        <AccordionTrigger className="text-left font-serif-editorial text-lg">{f.q}</AccordionTrigger>
                        <AccordionContent className="text-[#334]">{f.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </aside>
            </article>

            <section>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div className="eyebrow">Gallery</div>
                  <h3 className="font-serif-editorial text-3xl text-[#0A0F1A]">Photos · {t.year}</h3>
                </div>
              </div>
              <div className="rule-line mb-6" />
              <PhotoGallery year={t.year} />
            </section>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
