import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Dog,
  DollarSign,
  Heart,
  Lock,
  PawPrint,
  Share2,
  Shield,
  Sparkles,
  Star,
  User,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { View } from "../App";
import type { Public } from "../backend.d";
import { useAllSitters, useCreateSitter } from "../hooks/useQueries";

const SERVICES = [
  "Dog Walking",
  "Overnight Stay",
  "Drop-In Visit",
  "Dog Boarding",
  "Cat Sitting",
  "Pet Feeding",
  "Playtime",
];

const EXPERIENCE_OPTIONS = [
  { value: "<1", label: "Less than 1 year" },
  { value: "1-2", label: "1–2 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "5+", label: "5+ years" },
];

interface Props {
  navigate: (view: View) => void;
}

interface FormData {
  name: string;
  location: string;
  bio: string;
  photoUrl: string;
  services: string[];
  hourlyRate: string;
  experience: string;
  ownPets: string;
  whyPawspective: string;
  ref1Name: string;
  ref1Contact: string;
  ref2Name: string;
  ref2Contact: string;
}

const INITIAL_FORM: FormData = {
  name: "",
  location: "",
  bio: "",
  photoUrl: "",
  services: [],
  hourlyRate: "",
  experience: "",
  ownPets: "",
  whyPawspective: "",
  ref1Name: "",
  ref1Contact: "",
  ref2Name: "",
  ref2Contact: "",
};

function StepIndicator({ step, total }: { step: number; total: number }) {
  const steps = [
    { label: "Your Info", icon: User },
    { label: "Experience & Fit", icon: Heart },
    { label: "Services & Rates", icon: DollarSign },
  ];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const isActive = i + 1 === step;
        const isDone = i + 1 < step;
        return (
          <div key={s.label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
              </div>
              <span
                className={`text-[10px] font-medium whitespace-nowrap ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < total - 1 && (
              <div
                className={`w-12 h-0.5 mb-4 rounded-full ${
                  isDone ? "bg-emerald-500" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SitterApplicationPage({ navigate }: Props) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: allSitters = [] } = useAllSitters();
  const createSitter = useCreateSitter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const principal = identity?.getPrincipal();
  const myProfile = principal
    ? (allSitters as Public[]).find(
        (s) => s.owner?.toString() === principal.toString(),
      )
    : undefined;

  const set = (key: keyof FormData, value: string | string[]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleService = (svc: string) => {
    set(
      "services",
      form.services.includes(svc)
        ? form.services.filter((s) => s !== svc)
        : [...form.services, svc],
    );
  };

  const handleSubmit = async () => {
    const refs = [
      form.ref1Name && `${form.ref1Name} (${form.ref1Contact})`,
      form.ref2Name && `${form.ref2Name} (${form.ref2Contact})`,
    ]
      .filter(Boolean)
      .join(" | ");

    const fullBio = [
      form.bio,
      "",
      "--- Application Details ---",
      `Experience: ${form.experience}`,
      `Own pets: ${form.ownPets === "yes" ? "Yes" : "No"}`,
      `Why Pawspective: ${form.whyPawspective}`,
      refs ? `References: ${refs}` : "",
    ]
      .filter((l) => l !== "")
      .join("\n");

    try {
      await createSitter.mutateAsync({
        name: form.name,
        bio: fullBio,
        location: form.location,
        photoUrl: form.photoUrl,
        services: form.services,
        hourlyRate: BigInt(Math.round(Number(form.hourlyRate))),
      });
      setSubmittedName(form.name);
      setSubmitted(true);
    } catch {
      // error is surfaced via createSitter.isError
    }
  };

  // --- NOT LOGGED IN ---
  if (!identity) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.28 0.18 265) 0%, oklch(0.35 0.22 280) 50%, oklch(0.40 0.16 255) 100%)",
        }}
      >
        <header className="py-5 px-6">
          <button
            type="button"
            onClick={() => navigate("home")}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Back to Home</span>
          </button>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-5">
                <PawPrint size={32} className="text-white" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                Join Our Sitter Community
              </h1>
              <p className="text-white/70 text-base leading-relaxed">
                Turn your passion for pets into a rewarding side income.
                Thousands of families trust Pawspective sitters.
              </p>
            </div>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white mb-6">
              <CardContent className="p-6">
                <p className="text-sm text-white/80 mb-5 text-center">
                  To apply, you'll need to verify your identity with a secure
                  passkey — no password required.
                </p>
                <div className="grid grid-cols-1 gap-3 mb-6">
                  {[
                    {
                      icon: Shield,
                      title: "Phishing-proof",
                      desc: "Your account can't be hacked or stolen",
                    },
                    {
                      icon: Zap,
                      title: "One tap to sign in",
                      desc: "Face ID or fingerprint — instant access",
                    },
                    {
                      icon: Lock,
                      title: "No password to remember",
                      desc: "The same tech used by Apple & Google",
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white/5"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                          <Icon size={15} className="text-amber-300" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {item.title}
                          </p>
                          <p className="text-xs text-white/60">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button
                  data-ocid="sitter-apply.primary_button"
                  className="w-full rounded-xl font-bold text-base py-6"
                  style={{
                    backgroundColor: "oklch(0.72 0.18 55)",
                    color: "#1a1a2e",
                  }}
                  onClick={login}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Connecting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Shield size={18} />
                      Sign In with Face ID / Touch ID
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3 justify-center text-sm text-white/50">
              <span className="flex items-center gap-1">
                <Star size={12} className="text-amber-400" /> Top sitters earn
                $1,200/mo
              </span>
              <span className="flex items-center gap-1">
                <Dog size={12} /> Flexible schedule
              </span>
              <span className="flex items-center gap-1">
                <Heart size={12} className="text-rose-400" /> Do what you love
              </span>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // --- Item 12: Enhanced Success Screen (submitted or already has profile) ---
  if (submitted || myProfile) {
    const isApproved = myProfile?.isActive ?? false;
    const displayName = submittedName || myProfile?.name || "you";
    const appDate = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.28 0.18 265) 0%, oklch(0.35 0.22 280) 50%, oklch(0.40 0.16 255) 100%)",
        }}
      >
        <header className="py-5 px-6">
          <button
            type="button"
            onClick={() => navigate("home")}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Back to Home</span>
          </button>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md space-y-5"
          >
            {/* Animated checkmark */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  damping: 10,
                  stiffness: 200,
                  delay: 0.1,
                }}
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                  isApproved ? "bg-emerald-500/20" : "bg-emerald-500/20"
                }`}
              >
                <CheckCircle2 size={44} className="text-emerald-400" />
              </motion.div>

              <Badge
                data-ocid="sitter-apply.success_state"
                className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-sm font-bold px-4 py-1.5 mb-4"
              >
                {isApproved ? "✓ Approved!" : "✓ Application Submitted!"}
              </Badge>

              <h2 className="font-display text-3xl font-bold text-white mb-2">
                {isApproved
                  ? `Welcome, ${displayName}!`
                  : "Application Received!"}
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">
                {isApproved
                  ? "Congratulations! Your profile is live. Clients can now discover and book you."
                  : "Your application is under review. You'll be notified once approved."}
              </p>
            </div>

            {/* Item 12: Next steps checklist */}
            {!isApproved && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-5 space-y-3">
                  <p className="text-white/80 text-sm font-semibold">
                    What happens next:
                  </p>
                  {[
                    {
                      icon: CheckCircle2,
                      label: "Application received",
                      done: true,
                      color: "text-emerald-400",
                    },
                    {
                      icon: Clock,
                      label: "Admin review (1–3 business days)",
                      done: false,
                      color: "text-amber-400",
                    },
                    {
                      icon: PawPrint,
                      label: "Check status via your Sitter Portal",
                      done: false,
                      color: "text-white/50",
                    },
                    {
                      icon: Star,
                      label: "Once approved, you'll appear in search",
                      done: false,
                      color: "text-white/50",
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center gap-3">
                        <Icon size={16} className={item.color} />
                        <span
                          className={`text-sm ${item.done ? "text-emerald-300 font-medium" : "text-white/70"}`}
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Item 12: Shareable candidate card */}
            {!isApproved && (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                      Candidate Card
                    </p>
                    <Share2 size={13} className="text-white/30" />
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center">
                      <span className="text-white font-bold text-lg font-display">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-display font-bold text-white text-base">
                        {displayName}
                      </p>
                      <p className="text-white/50 text-xs">
                        Pawspective Sitter Candidate
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-white/40 text-xs">
                    <Calendar size={12} />
                    <span>Applied {appDate}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              {isApproved ? (
                <Button
                  data-ocid="sitter-apply.primary_button"
                  className="rounded-full px-8 py-6 font-bold text-base"
                  style={{
                    backgroundColor: "oklch(0.72 0.18 55)",
                    color: "#1a1a2e",
                  }}
                  onClick={() => navigate("sitter-dashboard")}
                >
                  Go to My Dashboard
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button
                  data-ocid="sitter-apply.primary_button"
                  className="w-full rounded-full py-6 font-bold text-base"
                  style={{
                    backgroundColor: "oklch(0.72 0.18 55)",
                    color: "#1a1a2e",
                  }}
                  onClick={() => navigate("login")}
                >
                  <PawPrint size={16} className="mr-2" />
                  Go to Sitter Portal
                </Button>
              )}
              <Button
                data-ocid="sitter-apply.secondary_button"
                variant="outline"
                className="w-full rounded-full py-5 font-semibold border-white/30 text-white bg-white/10 hover:bg-white/20"
                onClick={() => navigate("home")}
              >
                Back to Home
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // --- APPLICATION FORM ---
  const canProceedStep1 =
    form.name.trim() && form.location.trim() && form.bio.trim();
  const canProceedStep2 =
    form.experience && form.ownPets && form.whyPawspective.trim();
  const canSubmit =
    form.services.length > 0 && form.hourlyRate && agreedToTerms;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.28 0.18 265) 0%, oklch(0.35 0.22 280) 100%)",
      }}
    >
      <header className="py-5 px-6">
        <button
          type="button"
          onClick={() => (step > 1 ? setStep(step - 1) : navigate("home"))}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">
            {step > 1 ? "Back" : "Back to Home"}
          </span>
        </button>
      </header>

      <main className="flex-1 px-4 py-6 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-4 border border-white/20">
              <Sparkles size={13} className="text-amber-300" />
              Sitter Application
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              Join Our Sitter Community
            </h1>
            <p className="text-white/60 text-sm">
              Step {step} of 3 — tell us about yourself
            </p>
          </div>

          <StepIndicator step={step} total={3} />

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div>
                      <Label className="text-white/80 text-sm font-medium mb-1.5 block">
                        Full Name *
                      </Label>
                      <Input
                        data-ocid="sitter-apply.input"
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="Sarah Johnson"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12 text-base"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80 text-sm font-medium mb-1.5 block">
                        City / Location *
                      </Label>
                      <Input
                        data-ocid="sitter-apply.input"
                        value={form.location}
                        onChange={(e) => set("location", e.target.value)}
                        placeholder="Austin, TX"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12 text-base"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80 text-sm font-medium mb-1.5 block">
                        About You *
                      </Label>
                      <Textarea
                        data-ocid="sitter-apply.textarea"
                        value={form.bio}
                        onChange={(e) => set("bio", e.target.value)}
                        placeholder="Tell pet owners what makes you an amazing sitter..."
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/30 text-base min-h-[100px] resize-none"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label className="text-white/80 text-sm font-medium mb-1.5 block">
                        Profile Photo URL{" "}
                        <span className="text-white/40 font-normal">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        data-ocid="sitter-apply.input"
                        value={form.photoUrl}
                        onChange={(e) => set("photoUrl", e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12 text-base"
                      />
                    </div>
                    <Button
                      data-ocid="sitter-apply.primary_button"
                      className="w-full h-12 rounded-xl font-bold text-base"
                      style={{
                        backgroundColor: "oklch(0.72 0.18 55)",
                        color: "#1a1a2e",
                      }}
                      onClick={() => setStep(2)}
                      disabled={!canProceedStep1}
                    >
                      Continue
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div>
                      <Label className="text-white/80 text-sm font-medium mb-2 block">
                        Years of Pet Care Experience *
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {EXPERIENCE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => set("experience", opt.value)}
                            className={`h-11 rounded-xl text-sm font-semibold transition-all border ${
                              form.experience === opt.value
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-white/5 text-white/70 border-white/20 hover:bg-white/10"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-white/80 text-sm font-medium mb-2 block">
                        Do you have pets of your own? *
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {["yes", "no"].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => set("ownPets", val)}
                            className={`h-11 rounded-xl text-sm font-semibold transition-all border capitalize ${
                              form.ownPets === val
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-white/5 text-white/70 border-white/20 hover:bg-white/10"
                            }`}
                          >
                            {val === "yes" ? "Yes!" : "Not right now"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-white/80 text-sm font-medium mb-1.5 block">
                        Why do you want to be a Pawspective sitter? *
                      </Label>
                      <Textarea
                        data-ocid="sitter-apply.textarea"
                        value={form.whyPawspective}
                        onChange={(e) => set("whyPawspective", e.target.value)}
                        placeholder="Share your passion for pets and what makes you stand out..."
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/30 text-base min-h-[90px] resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-white/80 text-sm font-medium block">
                        References{" "}
                        <span className="text-white/40 font-normal">
                          (optional)
                        </span>
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={form.ref1Name}
                          onChange={(e) => set("ref1Name", e.target.value)}
                          placeholder="Ref 1 Name"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
                        />
                        <Input
                          value={form.ref1Contact}
                          onChange={(e) => set("ref1Contact", e.target.value)}
                          placeholder="Phone or email"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
                        />
                        <Input
                          value={form.ref2Name}
                          onChange={(e) => set("ref2Name", e.target.value)}
                          placeholder="Ref 2 Name"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
                        />
                        <Input
                          value={form.ref2Contact}
                          onChange={(e) => set("ref2Contact", e.target.value)}
                          placeholder="Phone or email"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
                        />
                      </div>
                    </div>

                    <Button
                      data-ocid="sitter-apply.primary_button"
                      className="w-full h-12 rounded-xl font-bold text-base"
                      style={{
                        backgroundColor: "oklch(0.72 0.18 55)",
                        color: "#1a1a2e",
                      }}
                      onClick={() => setStep(3)}
                      disabled={!canProceedStep2}
                    >
                      Continue
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div>
                      <Label className="text-white/80 text-sm font-medium mb-3 block">
                        Services You Offer *
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {SERVICES.map((svc) => (
                          <button
                            key={svc}
                            type="button"
                            onClick={() => toggleService(svc)}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all w-full text-left ${
                              form.services.includes(svc)
                                ? "bg-primary/20 border-primary text-white"
                                : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
                            }`}
                          >
                            <Checkbox
                              checked={form.services.includes(svc)}
                              onCheckedChange={() => toggleService(svc)}
                              className="border-white/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <span className="text-sm font-medium">{svc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-white/80 text-sm font-medium mb-1.5 block">
                        Base Hourly Rate ($/hr) *
                      </Label>
                      <div className="relative">
                        <DollarSign
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                        />
                        <Input
                          data-ocid="sitter-apply.input"
                          type="number"
                          min="5"
                          max="200"
                          value={form.hourlyRate}
                          onChange={(e) => set("hourlyRate", e.target.value)}
                          placeholder="25"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12 text-base pl-9"
                        />
                      </div>
                      <p className="text-xs text-white/40 mt-1">
                        You can set per-service rates in your dashboard after
                        approval.
                      </p>
                    </div>

                    {/* Terms & Conditions acceptance */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/15">
                      <Checkbox
                        id="sitter-terms"
                        checked={agreedToTerms}
                        onCheckedChange={(v) => setAgreedToTerms(v === true)}
                        className="mt-0.5 border-white/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        data-ocid="sitter-apply.terms_checkbox"
                      />
                      <label
                        htmlFor="sitter-terms"
                        className="text-sm text-white/70 leading-relaxed cursor-pointer select-none"
                      >
                        I have read and agree to the{" "}
                        <button
                          type="button"
                          onClick={() => navigate("terms")}
                          className="text-amber-300 underline hover:text-amber-200 transition-colors"
                        >
                          Terms &amp; Conditions
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          onClick={() => navigate("privacy")}
                          className="text-amber-300 underline hover:text-amber-200 transition-colors"
                        >
                          Privacy Policy
                        </button>
                        . I understand that Pawspective does not conduct
                        background checks and that I am an independent
                        contractor, not an employee.
                      </label>
                    </div>

                    <Button
                      data-ocid="sitter-apply.submit_button"
                      className="w-full h-12 rounded-xl font-bold text-base"
                      style={{
                        backgroundColor: "oklch(0.72 0.18 55)",
                        color: "#1a1a2e",
                      }}
                      onClick={handleSubmit}
                      disabled={!canSubmit || createSitter.isPending}
                    >
                      {createSitter.isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 size={16} />
                          Submit Application
                        </span>
                      )}
                    </Button>

                    {createSitter.isError && (
                      <p
                        data-ocid="sitter-apply.error_state"
                        className="text-red-400 text-sm text-center"
                      >
                        Something went wrong. Please try again.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
