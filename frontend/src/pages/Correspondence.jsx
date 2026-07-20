import useSWR from "swr";
import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Mail } from "lucide-react";
import { toast } from "sonner";

const fetcher = (url) => api.get(url).then((r) => r.data);

function highlightPlaceholders(text) {
  // Render [placeholders] as an accent-blue pill inline
  const parts = text.split(/(\[[^\]]+\])/g);
  return parts.map((p, i) =>
    /^\[.+\]$/.test(p) ? (
      <span key={i} className="inline-block px-1.5 py-0.5 rounded bg-[#EAF1F9] text-[#114488] text-[0.85em] font-medium">
        {p}
      </span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

function EmailCard({ email }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy. Select and copy manually.");
    }
  };

  return (
    <article data-testid={`email-card-${email.id}`}
      className="border border-[#DCE6F2] rounded-md bg-white overflow-hidden">
      <header className="px-6 py-5 border-b border-[#DCE6F2] flex items-start justify-between gap-4">
        <div>
          <Badge variant="outline" className="border-[#114488]/40 text-[#114488] bg-[#EAF1F9]">
            {email.audience}
          </Badge>
          <h2 className="font-serif-editorial text-2xl mt-2 text-[#0A0F1A]">{email.title}</h2>
          {email.when && <p className="text-xs text-[#556] mt-1">{email.when}</p>}
        </div>
        <Button size="sm" variant="outline" onClick={copy}
          data-testid={`email-copy-${email.id}`}
          className="border-[#114488] text-[#114488] hover:bg-[#EAF1F9] shrink-0">
          {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </header>

      <div className="px-6 py-5 bg-[#F7FAFD] border-b border-[#DCE6F2]">
        <div className="eyebrow">Subject</div>
        <p className="mt-1 font-serif-editorial text-lg text-[#0A0F1A] leading-snug">
          {highlightPlaceholders(email.subject)}
        </p>
      </div>

      <div className="px-6 py-6">
        <div className="eyebrow mb-3">Body</div>
        <div className="whitespace-pre-line text-[#334] leading-relaxed text-[15px]">
          {highlightPlaceholders(email.body)}
        </div>
      </div>
    </article>
  );
}

export default function Correspondence() {
  const { data = [] } = useSWR("/emails", fetcher);

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div className="eyebrow-line">Communications</div>
        <h1 className="font-serif-editorial text-5xl md:text-6xl tracking-tight text-[#0A0F1A]">Correspondence</h1>
        <p className="text-[#334] max-w-2xl">
          A library of customizable email templates to simplify communication at every step of the Spotlight Awards process.
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-[#3E7CB1]">
          <Mail className="w-4 h-4" /> Tap <em>Copy</em> on any template to paste it straight into Gmail.
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.map((e) => <EmailCard key={e.id} email={e} />)}
      </div>
    </div>
  );
}
