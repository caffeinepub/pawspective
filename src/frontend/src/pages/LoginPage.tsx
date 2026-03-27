import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, PawPrint, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { View } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCallerProfile,
  useIsAdmin,
  useSaveProfile,
} from "../hooks/useQueries";

interface Props {
  navigate: (view: View) => void;
}

export default function LoginPage({ navigate }: Props) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const { data: isAdmin } = useIsAdmin();
  const saveProfile = useSaveProfile();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setEmail(profile.email ?? "");
      setSaved(true);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await saveProfile.mutateAsync({
        name,
        email: email || undefined,
        role: "user",
      });
      setSaved(true);
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("home")}
            className="flex items-center gap-1.5 text-sm text-primary hover:opacity-80"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="font-display font-semibold">
            Sitter &amp; Admin Portal
          </span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <PawPrint size={28} className="text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold">
              Sitter &amp; Admin Portal
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Clients don't need an account —{" "}
              <button
                type="button"
                onClick={() => navigate("home")}
                className="text-primary underline underline-offset-2 hover:no-underline"
              >
                just book directly
              </button>{" "}
              and track via email.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-xs p-8 space-y-6">
            {!identity ? (
              <>
                <div className="bg-secondary rounded-xl p-4 flex gap-3">
                  <ShieldCheck
                    size={20}
                    className="text-primary shrink-0 mt-0.5"
                  />
                  <div className="text-sm">
                    <p className="font-semibold">
                      Secure Login via Internet Identity
                    </p>
                    <p className="text-muted-foreground mt-0.5">
                      Privacy-preserving authentication built on the Internet
                      Computer. No passwords, no tracking.
                    </p>
                  </div>
                </div>
                <Button
                  data-ocid="login.primary_button"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Log In Securely"
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <div>
                    <p className="font-semibold text-emerald-800 text-sm">
                      Authenticated
                    </p>
                    <p className="text-xs text-emerald-600 font-mono">
                      {identity.getPrincipal().toString().slice(0, 24)}...
                    </p>
                  </div>
                </div>

                {profileLoading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-10 bg-muted rounded-lg" />
                    <div className="h-10 bg-muted rounded-lg" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-display font-semibold">
                      {saved ? "Update Profile" : "Set Up Your Profile"}
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="login-name">Display Name</Label>
                      <Input
                        data-ocid="login.name.input"
                        id="login-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email (optional)</Label>
                      <Input
                        data-ocid="login.email.input"
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="rounded-lg"
                      />
                    </div>
                    <Button
                      data-ocid="login.save_button"
                      onClick={handleSave}
                      disabled={saveProfile.isPending || !name}
                      className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {saveProfile.isPending ? (
                        <>
                          <Loader2 size={14} className="mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Profile"
                      )}
                    </Button>
                  </div>
                )}

                {saved && (
                  <div className="space-y-3 border-t border-border pt-5">
                    <Button
                      data-ocid="login.dashboard.button"
                      onClick={() =>
                        navigate(
                          isAdmin ? "admin-dashboard" : "sitter-dashboard",
                        )
                      }
                      className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    >
                      {isAdmin
                        ? "Go to Admin Dashboard"
                        : "Go to Sitter Dashboard"}
                    </Button>
                    <Button
                      data-ocid="login.logout.button"
                      onClick={clear}
                      variant="outline"
                      className="w-full rounded-full border-border text-muted-foreground hover:bg-muted"
                    >
                      Log Out
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
