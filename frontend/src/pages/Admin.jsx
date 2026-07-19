import { useState } from "react";
import { Navigate } from "react-router-dom";
import useSWR, { mutate as globalMutate } from "swr";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { T } from "@/constants/testIds";
import { toast } from "sonner";
import { Trash2, Plus, Save } from "lucide-react";

const fetcher = (url) => api.get(url).then((r) => r.data);

function useCollection(path) {
  const { data = [], mutate } = useSWR(path, fetcher);
  const refresh = () => { mutate(); globalMutate(path); };
  return { data, refresh };
}

// ------- Winners editor -------
function WinnersAdmin() {
  const { data, refresh } = useCollection("/winners");
  const empty = { name: "", year: new Date().getFullYear(), category: "Arts & Academia", theme: "", notes: "" };
  const [form, setForm] = useState(empty);

  const create = async () => {
    if (!form.name || !form.theme) return toast.error("Name and theme are required.");
    await api.post("/winners", { ...form, year: Number(form.year) });
    setForm(empty);
    refresh();
    toast.success("Winner added");
  };

  const update = async (row, patch) => {
    await api.put(`/winners/${row.id}`, { ...row, ...patch, year: Number(patch.year ?? row.year) });
    refresh();
  };

  const remove = async (id) => {
    await api.delete(`/winners/${id}`);
    refresh();
    toast.success("Deleted");
  };

  return (
    <div className="space-y-6">
      <div className="border border-[#D5D1CB] rounded-md p-6 bg-white">
        <div className="eyebrow">Add winner</div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-3">
          <Input placeholder="Name" data-testid="admin-new-winner-name"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input type="number" placeholder="Year" data-testid="admin-new-winner-year"
            value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          <Input placeholder="Category" data-testid="admin-new-winner-category"
            value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input placeholder="Theme" data-testid="admin-new-winner-theme"
            value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} />
          <Button data-testid={T.admin.add("winners")} onClick={create} className="bg-[#114488] hover:bg-[#0c3468]">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      <div className="border border-[#D5D1CB] rounded-md bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#EBE8E3]">
              <TableHead>Name</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Theme</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((w) => (
              <TableRow key={w.id}>
                <TableCell>
                  <Input value={w.name} onChange={(e) => update(w, { name: e.target.value })}
                    data-testid={T.admin.field("winners", w.id, "name")} />
                </TableCell>
                <TableCell className="w-24">
                  <Input type="number" value={w.year} onChange={(e) => update(w, { year: e.target.value })} />
                </TableCell>
                <TableCell>
                  <Input value={w.category} onChange={(e) => update(w, { category: e.target.value })} />
                </TableCell>
                <TableCell>
                  <Input value={w.theme} onChange={(e) => update(w, { theme: e.target.value })} />
                </TableCell>
                <TableCell className="w-16">
                  <Button size="icon" variant="ghost" data-testid={T.admin.del("winners", w.id)}
                    onClick={() => remove(w.id)}>
                    <Trash2 className="w-4 h-4 text-red-700" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ------- Tracking editor (per-board key/value spreadsheet rows) -------
function TrackingAdmin() {
  const { data, refresh } = useCollection("/tracking");
  const [board, setBoard] = useState("selection");
  const [newData, setNewData] = useState("");
  const rows = data.filter((r) => r.board === board);

  // Columns for the selected board
  const cols = Array.from(
    rows.reduce((set, r) => { Object.keys(r.data || {}).forEach((k) => set.add(k)); return set; }, new Set()),
  );

  const addRow = async () => {
    const parsed = {};
    (newData || "").split("\n").forEach((line) => {
      const [k, ...rest] = line.split(":");
      if (k && rest.length) parsed[k.trim()] = rest.join(":").trim();
    });
    if (!Object.keys(parsed).length) { toast.error("Enter one 'Key: value' per line."); return; }
    await api.post("/tracking", { board, data: parsed });
    setNewData("");
    refresh();
    toast.success("Row added");
  };

  const updateCell = async (row, key, val) => {
    const next = { ...(row.data || {}), [key]: val };
    await api.put(`/tracking/${row.id}`, { board: row.board, data: next });
    refresh();
  };

  const remove = async (id) => {
    await api.delete(`/tracking/${id}`);
    refresh();
    toast.success("Deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {["selection", "production"].map((b) => (
          <Button key={b} onClick={() => setBoard(b)} variant={board === b ? "default" : "outline"}
            data-testid={`admin-tracking-board-${b}`}
            className={board === b ? "bg-[#114488] hover:bg-[#0c3468]" : "border-[#114488] text-[#114488]"}>
            {b === "selection" ? "Selection Tracker" : "Article Production"}
          </Button>
        ))}
      </div>

      <div className="border border-[#D5D1CB] rounded-md p-5 bg-white">
        <div className="eyebrow mb-2">Add row · {board}</div>
        <Textarea rows={4} value={newData} onChange={(e) => setNewData(e.target.value)}
          placeholder={board === "selection"
            ? "Name: Jane Doe\nStatus: Accepted\nNominations: 3\nAvg Score: 22.5\nNotes: "
            : "Awardee: Jane Doe\nStaff Writer: \nEditor: \nInterview: \nArticle: \nUploaded: "} />
        <Button className="mt-3 bg-[#114488] hover:bg-[#0c3468]" onClick={addRow}
          data-testid={`admin-add-tracking-${board}`}>
          <Plus className="w-4 h-4 mr-1" /> Add row
        </Button>
      </div>

      <div className="border border-[#D5D1CB] rounded-md bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#EBE8E3]">
              {cols.map((c) => <TableHead key={c}>{c}</TableHead>)}
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                {cols.map((c) => (
                  <TableCell key={c}>
                    <Input value={String(r.data?.[c] ?? "")}
                      onChange={(e) => updateCell(r, c, e.target.value)} />
                  </TableCell>
                ))}
                <TableCell className="w-16">
                  <Button size="icon" variant="ghost"
                    data-testid={`admin-del-tracking-${r.id}`}
                    onClick={() => remove(r.id)}>
                    <Trash2 className="w-4 h-4 text-red-700" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ------- Generic single-doc editor (Themes / Timelines / Nomination / Rubric) -------
function GenericAdmin({ path, fields, extraDefaults = {} }) {
  const { data, refresh } = useCollection(path);
  const [drafts, setDrafts] = useState({});

  const setDraft = (id, patch) => setDrafts((d) => ({ ...d, [id]: { ...(d[id] ?? {}), ...patch } }));

  const save = async (row) => {
    const patch = drafts[row.id] || {};
    const merged = { ...row, ...patch };
    delete merged.id; delete merged.created_at; delete merged.updated_at; delete merged._id;
    await api.put(`${path}/${row.id}`, merged);
    setDrafts((d) => { const c = { ...d }; delete c[row.id]; return c; });
    refresh();
    toast.success("Saved");
  };

  const remove = async (id) => {
    await api.delete(`${path}/${id}`);
    refresh();
    toast.success("Deleted");
  };

  const [newRow, setNewRow] = useState({});
  const create = async () => {
    const payload = { ...extraDefaults, ...newRow };
    for (const f of fields) {
      if (f.type === "number") payload[f.key] = Number(payload[f.key] ?? 0);
      if (f.type === "list") payload[f.key] = (payload[f.key] || "").split("\n").filter(Boolean);
    }
    await api.post(path, payload);
    setNewRow({});
    refresh();
    toast.success("Added");
  };

  return (
    <div className="space-y-6">
      <div className="border border-[#D5D1CB] rounded-md p-6 bg-white">
        <div className="eyebrow mb-3">Add new</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fields.map((f) => (
            <div key={f.key} className={f.wide ? "md:col-span-2" : ""}>
              <Label className="text-xs">{f.label}</Label>
              {f.type === "textarea" || f.type === "list" ? (
                <Textarea rows={3} value={newRow[f.key] || ""}
                  placeholder={f.type === "list" ? "One item per line" : ""}
                  onChange={(e) => setNewRow({ ...newRow, [f.key]: e.target.value })} />
              ) : (
                <Input type={f.type === "number" ? "number" : "text"}
                  value={newRow[f.key] || ""} onChange={(e) => setNewRow({ ...newRow, [f.key]: e.target.value })} />
              )}
            </div>
          ))}
        </div>
        <Button className="mt-4 bg-[#114488] hover:bg-[#0c3468]"
          data-testid={T.admin.add(path.slice(1))} onClick={create}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      <div className="space-y-4">
        {data.map((row) => {
          const draft = drafts[row.id] ?? {};
          const val = (k) => draft[k] !== undefined ? draft[k] :
            fields.find((f) => f.key === k)?.type === "list" ? (row[k] || []).join("\n") : (row[k] ?? "");
          const dirty = Object.keys(draft).length > 0;
          return (
            <div key={row.id} className="border border-[#D5D1CB] rounded-md p-5 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fields.map((f) => (
                  <div key={f.key} className={f.wide ? "md:col-span-2" : ""}>
                    <Label className="text-xs">{f.label}</Label>
                    {f.type === "textarea" || f.type === "list" ? (
                      <Textarea rows={3} value={val(f.key)}
                        onChange={(e) => setDraft(row.id, { [f.key]: e.target.value })} />
                    ) : (
                      <Input type={f.type === "number" ? "number" : "text"} value={val(f.key)}
                        onChange={(e) => setDraft(row.id, { [f.key]: e.target.value })}
                        data-testid={T.admin.field(path.slice(1), row.id, f.key)} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" disabled={!dirty} onClick={() => save(row)}
                  data-testid={T.admin.save(`${path.slice(1)}-${row.id}`)}
                  className="bg-[#114488] hover:bg-[#0c3468]">
                  <Save className="w-4 h-4 mr-1" /> Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => remove(row.id)}
                  data-testid={T.admin.del(path.slice(1), row.id)}>
                  <Trash2 className="w-4 h-4 mr-1 text-red-700" /> Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ------- Photos editor with file upload -------
function PhotosAdmin() {
  const { data, refresh } = useCollection("/photos");
  const [year, setYear] = useState(new Date().getFullYear());
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [busy, setBusy] = useState(false);

  const upload = async () => {
    if (!file) return toast.error("Choose an image file first.");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("year", String(year));
      fd.append("caption", caption);
      await api.post("/photos/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setFile(null);
      setCaption("");
      setFileKey((k) => k + 1);
      refresh();
      toast.success("Photo uploaded");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    await api.delete(`/photos/${id}`);
    refresh();
    toast.success("Deleted");
  };

  return (
    <div className="space-y-6">
      <div className="border border-[#D5D1CB] rounded-md p-6 bg-white">
        <div className="eyebrow mb-3">Upload photo</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <Label className="text-xs">Year</Label>
            <Input type="number" value={year} data-testid="admin-photo-year"
              onChange={(e) => setYear(Number(e.target.value))} />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Caption</Label>
            <Input value={caption} data-testid="admin-photo-caption"
              onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Award show — Founders Day" />
          </div>
          <div>
            <Label className="text-xs">Image file</Label>
            <Input type="file" accept="image/*" data-testid="admin-photo-file" key={fileKey}
              onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
        </div>
        <Button onClick={upload} disabled={busy} data-testid="admin-photo-upload"
          className="mt-4 bg-[#114488] hover:bg-[#0c3468]">
          <Plus className="w-4 h-4 mr-1" /> {busy ? "Uploading…" : "Upload photo"}
        </Button>
        <p className="text-xs text-[#556] mt-2">Max 6 MB per image. Files are stored inline in the guidebook.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((p) => (
          <div key={p.id} data-testid={`admin-photo-card-${p.id}`}
            className="border border-[#D5D1CB] rounded-md overflow-hidden bg-white">
            <div className="aspect-[4/3] overflow-hidden bg-[#EBE8E3]">
              <img src={p.url} alt={p.caption || "Spotlight"} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <div className="eyebrow">Year {p.year}</div>
              <div className="text-sm text-[#334] mt-1 truncate">{p.caption}</div>
              <Button size="sm" variant="outline" className="mt-3 w-full"
                data-testid={`admin-photo-del-${p.id}`}
                onClick={() => remove(p.id)}>
                <Trash2 className="w-4 h-4 mr-1 text-red-700" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-[#556]">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="space-y-8">
      <header>
        <div className="eyebrow-line">Editor</div>
        <h1 className="font-serif-editorial text-5xl tracking-tight text-[#0A0F1A]">Admin Panel</h1>
        <p className="text-[#556] mt-2">Update any section of the guidebook. Changes save instantly.</p>
      </header>

      <Tabs defaultValue="winners">
        <TabsList className="bg-[#EBE8E3] flex-wrap h-auto">
          {["winners","themes","timelines","nomination","rubric","tracking","emails","photos","contacts"].map((k) => (
            <TabsTrigger key={k} value={k} data-testid={T.admin.tab(k)}
              className="data-[state=active]:bg-[#114488] data-[state=active]:text-white capitalize">
              {k === "emails" ? "Correspondence" : k}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="winners" className="mt-6"><WinnersAdmin /></TabsContent>

        <TabsContent value="themes" className="mt-6">
          <GenericAdmin path="/themes" fields={[
            { key: "year", label: "Year", type: "number" },
            { key: "title", label: "Title" },
            { key: "tagline", label: "Tagline", wide: true },
            { key: "description", label: "Description", type: "textarea", wide: true },
          ]} />
        </TabsContent>

        <TabsContent value="timelines" className="mt-6">
          <GenericAdmin path="/timelines" fields={[
            { key: "year", label: "Year", type: "number" },
            { key: "month", label: "Month" },
            { key: "date_range", label: "Date range", wide: true },
            { key: "items", label: "Items (one per line)", type: "list", wide: true },
          ]} />
        </TabsContent>

        <TabsContent value="nomination" className="mt-6">
          <GenericAdmin path="/nomination" fields={[
            { key: "section", label: "Section" },
            { key: "order", label: "Order", type: "number" },
            { key: "question", label: "Question", wide: true },
            { key: "type", label: "Type (short/long/choice)" },
            { key: "options", label: "Options (one per line, for choice)", type: "list", wide: true },
          ]} />
        </TabsContent>

        <TabsContent value="rubric" className="mt-6">
          <GenericAdmin path="/rubric" fields={[
            { key: "order", label: "Order", type: "number" },
            { key: "max_score", label: "Max score (default 5)", type: "number" },
            { key: "name", label: "Criterion", wide: true },
            { key: "description", label: "Description", type: "textarea", wide: true },
          ]} />
        </TabsContent>

        <TabsContent value="tracking" className="mt-6"><TrackingAdmin /></TabsContent>

        <TabsContent value="emails" className="mt-6">
          <GenericAdmin path="/emails" fields={[
            { key: "order", label: "Order", type: "number" },
            { key: "audience", label: "Audience (e.g. Awardee, Nominator)" },
            { key: "title", label: "Title", wide: true },
            { key: "when", label: "When to send", wide: true },
            { key: "subject", label: "Subject line", wide: true },
            { key: "body", label: "Email body (use [placeholders] for fill-in fields)", type: "textarea", wide: true },
          ]} />
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          <PhotosAdmin />
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <GenericAdmin path="/contacts" fields={[
            { key: "role", label: "Role (e.g., Co-Chair, Creator)" },
            { key: "year", label: "Year(s) served" },
            { key: "name", label: "Full name", wide: true },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "note", label: "Note", type: "textarea", wide: true },
          ]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
