import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { T } from "@/constants/testIds";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export default function Login() {
  const { user, pinLogin } = useAuth();
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await pinLogin(password);
      toast.success("Welcome back, co-chair.");
      nav("/admin");
    } catch (e2) {
      const d = e2?.response?.data?.detail;
      const msg = typeof d === "string" ? d : "Incorrect password";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <div className="eyebrow-line">Restricted</div>
      <h1 className="font-serif-editorial text-4xl text-[#0A0F1A] tracking-tight">Co-Chair Access</h1>
      <p className="text-[#556] mt-2">Enter the co-chair passcode to edit the guidebook.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5 border border-[#D5D1CB] rounded-md p-8 bg-white">
        <div>
          <Label htmlFor="password">Passcode</Label>
          <div className="relative mt-1">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#889]" />
            <Input id="password" type="password" data-testid={T.login.password}
              value={password} onChange={(e) => setPassword(e.target.value)}
              required autoFocus autoComplete="current-password"
              placeholder="Enter passcode"
              className="pl-9" />
          </div>
        </div>
        {err && <div data-testid={T.login.error} className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded">{err}</div>}
        <Button type="submit" data-testid={T.login.submit} disabled={busy}
          className="w-full bg-[#114488] hover:bg-[#0c3468]">
          {busy ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
