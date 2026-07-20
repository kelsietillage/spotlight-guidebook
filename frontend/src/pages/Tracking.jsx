import useSWR from "swr";
import { useMemo, useState } from "react";
import api from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const fetcher = (url) => api.get(url).then((r) => r.data);

function TrackingTable({ rows }) {
  const cols = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => Object.keys(r.data || {}).forEach((k) => set.add(k)));
    return Array.from(set);
  }, [rows]);

  if (!rows.length) return <p className="text-[#556]">No rows yet.</p>;

  return (
    <div className="border border-[#D5D1CB] rounded-md overflow-x-auto bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#EBE8E3]">
            {cols.map((c) => <TableHead key={c}>{c}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} data-testid={`tracking-row-${r.id}`}>
              {cols.map((c) => <TableCell key={c}>{r.data?.[c] ?? ""}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function Tracking() {
  const { data = [] } = useSWR("/tracking", fetcher);
  const [tab, setTab] = useState("selection");
  const rows = data.filter((r) => r.board === tab);

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div className="eyebrow-line">Templates</div>
        <h1 className="font-serif-editorial text-5xl md:text-6xl tracking-tight text-[#0A0F1A]">Tracking</h1>
        <p className="text-[#334] max-w-2xl">
          Selection and production trackers used by past co-chairs. Duplicate an existing starter sheet or create a new one for each cycle.
        </p>
        <div className="border-l-4 border-[#3E7CB1] bg-[#EAF1F9]/40 p-4 max-w-3xl rounded-r-md">
          <div className="eyebrow text-[#114488]">Interview Recording Policy</div>
          <p className="text-sm text-[#334] mt-1">
            All awardee interviews <strong>must be recorded</strong>. Use <strong>Zoom</strong> for remote interviews (auto-save cloud recording)
            or a <strong>voice memo / audio recorder</strong> if conducted in person. Recordings must be linked in the production tracker.
          </p>
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[#EBE8E3]">
          <TabsTrigger value="selection" data-testid="tracking-tab-selection"
            className="data-[state=active]:bg-[#114488] data-[state=active]:text-white">
            Selection Tracker
          </TabsTrigger>
          <TabsTrigger value="production" data-testid="tracking-tab-production"
            className="data-[state=active]:bg-[#114488] data-[state=active]:text-white">
            Article Production
          </TabsTrigger>
        </TabsList>
        <TabsContent value="selection" className="mt-6"><TrackingTable rows={rows} /></TabsContent>
        <TabsContent value="production" className="mt-6"><TrackingTable rows={rows} /></TabsContent>
      </Tabs>
    </div>
  );
}
