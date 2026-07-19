import useSWR from "swr";
import api from "@/lib/api";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const fetcher = (url) => api.get(url).then((r) => r.data);

export default function Rubric() {
  const { data = [] } = useSWR("/rubric", fetcher);
  const total = data.reduce((s, r) => s + (r.max_score || 0), 0);

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div className="eyebrow-line">Selection Committee</div>
        <h1 className="font-serif-editorial text-5xl md:text-6xl tracking-tight text-[#0A0F1A]">Scoring Rubric</h1>
        <p className="text-[#334] max-w-2xl">
          Every criterion is scored on a <strong className="text-[#114488]">1&ndash;5 scale</strong> (5 being exceptional). Sum the five criteria for
          a maximum total of <strong className="text-[#114488]">25</strong>.
        </p>
      </header>

      <div className="border border-[#D5D1CB] rounded-md overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#EBE8E3]">
              <TableHead className="w-16">#</TableHead>
              <TableHead>Criterion</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right w-28">Max score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((r, i) => (
              <TableRow key={r.id} data-testid={`rubric-row-${r.id}`}>
                <TableCell className="text-[#3E7CB1] font-serif-editorial">{String(i + 1).padStart(2, "0")}</TableCell>
                <TableCell className="font-medium text-[#0A0F1A]">{r.name}</TableCell>
                <TableCell className="text-[#334]">{r.description}</TableCell>
                <TableCell className="text-right font-serif-editorial text-xl text-[#114488]">{r.max_score}</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-[#EAF1F9]/50">
              <TableCell />
              <TableCell colSpan={2} className="font-serif-editorial text-lg">Total possible</TableCell>
              <TableCell className="text-right font-serif-editorial text-2xl text-[#114488]">{total}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="border-l-4 border-[#3E7CB1] bg-[#EAF1F9]/40 px-5 py-4 rounded-r-md max-w-3xl" data-testid="rubric-bonus-note">
        <div className="eyebrow text-[#114488]">Nomination Bonus</div>
        <p className="text-[#334] text-sm mt-1">
          Additional nominations are worth <strong>+0.5 points each</strong> — every extra nomination (beyond the first,
          and from a unique nominator) adds half a point to the nominee&apos;s total. Add this on top of the 25-point rubric total.
        </p>
      </div>
    </div>
  );
}
