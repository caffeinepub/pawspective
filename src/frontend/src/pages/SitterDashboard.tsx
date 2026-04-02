import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Clock,
  Loader2,
  Moon,
  PawPrint,
  Receipt,
  Save,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { View } from "../App";
import type { AvailabilityEntry, Public, Public__4 } from "../backend.d";
import BookingCard from "../components/BookingCard";
import ServiceLogTimeline from "../components/ServiceLogTimeline";
import SitterInvoicesTab from "../components/SitterInvoicesTab";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllSitters,
  useBookingsBySitter,
  useCallerProfile,
  useClaimFirstAdmin,
  useCreateSitter,
  useIsAdminAssigned,
  useSaveProfile,
  useSetSitterAvailability,
  useSetSitterServiceRates,
  useSitterAvailability,
  useSitterServiceRates,
  useUpdateBookingStatus,
  useUpdateSitter,
} from "../hooks/useQueries";

const ALL_SERVICES = [
  "Dog Walking",
  "Boarding",
  "Overnight Stay",
  "Drop-In Visit",
  "Pet Feeding",
  "Playtime & Hang Out",
  "Cat Sitting",
  "Pet Sitting",
  "Small Pet Care",
  "Bird Care",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

function AvailabilityEditor({ sitterId }: { sitterId: bigint }) {
  const { data: existingEntries = [] } = useSitterAvailability(sitterId);
  const setAvailability = useSetSitterAvailability();

  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DAYS.map(() => ({ enabled: false, startTime: "09:00", endTime: "17:00" })),
  );

  useEffect(() => {
    if (existingEntries.length > 0) {
      setSchedule((prev) => {
        const updated = [...prev];
        for (const entry of existingEntries as AvailabilityEntry[]) {
          const idx = Number(entry.dayOfWeek);
          if (idx >= 0 && idx < 7) {
            updated[idx] = {
              enabled: true,
              startTime: minutesToTime(Number(entry.startTime)),
              endTime: minutesToTime(Number(entry.endTime)),
            };
          }
        }
        return updated;
      });
    }
  }, [existingEntries]);

  const handleSave = async () => {
    const entries: AvailabilityEntry[] = schedule
      .map((d, i) =>
        d.enabled
          ? {
              dayOfWeek: BigInt(i),
              startTime: BigInt(timeToMinutes(d.startTime)),
              endTime: BigInt(timeToMinutes(d.endTime)),
            }
          : null,
      )
      .filter((e): e is AvailabilityEntry => e !== null);
    try {
      await setAvailability.mutateAsync({ sitterId, entries });
      toast.success("Availability saved!");
    } catch {
      toast.error("Failed to save availability");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Set your weekly availability. Clients will see when you're available.
      </p>
      <div className="space-y-2">
        {DAYS.map((day, idx) => (
          <div
            key={day}
            className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl"
          >
            <Switch
              checked={schedule[idx].enabled}
              onCheckedChange={(v) =>
                setSchedule((prev) =>
                  prev.map((d, i) => (i === idx ? { ...d, enabled: v } : d)),
                )
              }
            />
            <span className="w-8 text-sm font-medium">{day}</span>
            {schedule[idx].enabled ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={schedule[idx].startTime}
                  onChange={(e) =>
                    setSchedule((prev) =>
                      prev.map((d, i) =>
                        i === idx ? { ...d, startTime: e.target.value } : d,
                      ),
                    )
                  }
                  className="border border-border rounded-lg px-2 py-1 text-sm bg-background text-foreground"
                />
                <span className="text-muted-foreground text-sm">to</span>
                <input
                  type="time"
                  value={schedule[idx].endTime}
                  onChange={(e) =>
                    setSchedule((prev) =>
                      prev.map((d, i) =>
                        i === idx ? { ...d, endTime: e.target.value } : d,
                      ),
                    )
                  }
                  className="border border-border rounded-lg px-2 py-1 text-sm bg-background text-foreground"
                />
              </div>
            ) : (
              <span className="text-sm text-muted-foreground flex-1">
                Not available
              </span>
            )}
          </div>
        ))}
      </div>
      <Button
        data-ocid="availability.save_button"
        onClick={handleSave}
        disabled={setAvailability.isPending}
        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
      >
        {setAvailability.isPending ? (
          <>
            <Loader2 size={14} className="mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save size={14} className="mr-2" />
            Save Availability
          </>
        )}
      </Button>
    </div>
  );
}

function ServiceRatesEditor({
  sitter,
  selectedServices,
}: { sitter: Public; selectedServices: string[] }) {
  const { data: existingRates = [] } = useSitterServiceRates(sitter.id);
  const setRates = useSetSitterServiceRates();
  const [rateMap, setRateMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const map: Record<string, string> = {};
    // Pre-fill from existing rates or fall back to sitter hourlyRate
    for (const svc of selectedServices) {
      const existing = (
        existingRates as Array<{ service: string; ratePerHour: bigint }>
      ).find((r) => r.service === svc);
      map[svc] = existing
        ? String(existing.ratePerHour)
        : String(sitter.hourlyRate);
    }
    setRateMap(map);
  }, [existingRates, selectedServices, sitter.hourlyRate]);

  const handleSaveRates = async () => {
    try {
      const rates = selectedServices.map((svc) => ({
        service: svc,
        ratePerHour: BigInt(rateMap[svc] || "0"),
      }));
      await setRates.mutateAsync({ sitterId: sitter.id, rates });
      toast.success("Service rates saved!");
    } catch {
      toast.error("Failed to save rates.");
    }
  };

  return (
    <div className="mt-4 p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-3 sm:col-span-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-indigo-900">
          Service Rates ($/day)
        </p>
        <Button
          size="sm"
          onClick={handleSaveRates}
          disabled={setRates.isPending}
          className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-4 text-xs font-semibold"
          data-ocid="profile.rates.save_button"
        >
          {setRates.isPending ? (
            <>
              <Loader2 size={12} className="mr-1 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={12} className="mr-1" />
              Save Rates
            </>
          )}
        </Button>
      </div>
      <div className="space-y-2">
        {selectedServices.map((svc) => (
          <div key={svc} className="flex items-center gap-3">
            <span className="flex-1 text-sm text-indigo-800 font-medium">
              {svc}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                min="0"
                value={rateMap[svc] ?? ""}
                onChange={(e) =>
                  setRateMap((prev) => ({ ...prev, [svc]: e.target.value }))
                }
                className="w-24 rounded-lg h-9 text-sm"
                placeholder="0"
              />
              <span className="text-xs text-muted-foreground">/hr</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminClaimSection({
  navigate,
}: { navigate: (view: import("../App").View) => void }) {
  const { data: adminAssigned } = useIsAdminAssigned();
  const claimAdmin = useClaimFirstAdmin();

  if (adminAssigned === true) return null;

  return (
    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl sm:col-span-2">
      <div className="flex items-start gap-3">
        <ShieldCheck size={18} className="text-amber-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-800">Admin Access</p>
          <p className="text-xs text-amber-700 mt-0.5">
            No admin has been configured yet. You can claim admin access for
            this app.
          </p>
          <Button
            size="sm"
            onClick={() =>
              claimAdmin.mutate(undefined, {
                onSuccess: (claimed) => {
                  if (claimed) {
                    toast.success("Admin access claimed!");
                    navigate("admin-dashboard");
                  } else {
                    toast.error("Admin is already configured by someone else.");
                  }
                },
                onError: () => toast.error("Failed to claim admin access."),
              })
            }
            disabled={claimAdmin.isPending}
            className="mt-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white h-8 px-4 text-xs font-semibold"
            data-ocid="profile.claim_admin.button"
          >
            {claimAdmin.isPending ? (
              <>
                <Loader2 size={12} className="mr-1 animate-spin" />
                Claiming...
              </>
            ) : (
              "Claim Admin Access"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  navigate: (view: View) => void;
  darkMode?: boolean;
  setDarkMode?: (v: boolean) => void;
}

export default function SitterDashboard({
  navigate,
  darkMode,
  setDarkMode,
}: Props) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const { data: allSitters = [] } = useAllSitters();
  const updateStatus = useUpdateBookingStatus();
  const saveProfile = useSaveProfile();
  const createSitter = useCreateSitter();
  const updateSitter = useUpdateSitter();

  const principal = identity?.getPrincipal().toString();
  const mySitter =
    (allSitters as Public[]).find((s) => s.owner?.toString() === principal) ??
    null;
  const { data: bookings = [], isLoading: bookingsLoading } =
    useBookingsBySitter(mySitter?.id ?? null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setEmail(profile.email ?? "");
    }
  }, [profile]);

  useEffect(() => {
    if (mySitter) {
      setBio(mySitter.bio ?? "");
      setLocation(mySitter.location ?? "");
      setHourlyRate(String(mySitter.hourlyRate));
      setPhotoUrl(mySitter.photoUrl ?? "");
      setSelectedServices(mySitter.services ?? []);
    }
  }, [mySitter]);

  const toggleService = (s: string) =>
    setSelectedServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  if (!identity) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
          <PawPrint size={28} className="text-primary-foreground" />
        </div>
        <h2 className="font-display text-2xl font-bold">Sitter Portal</h2>
        <p className="text-muted-foreground text-center">
          Sign in with Internet Identity to manage your profile and bookings.
        </p>
        <Button
          data-ocid="sitter.login.button"
          onClick={login}
          disabled={isLoggingIn}
          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 font-semibold"
        >
          {isLoggingIn ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            "Log In with Internet Identity"
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate("home")}
          className="text-muted-foreground"
        >
          <ArrowLeft size={14} className="mr-1" /> Back to Home
        </Button>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    try {
      await saveProfile.mutateAsync({
        name,
        email: email || undefined,
        role: "user",
      });
      if (mySitter) {
        await updateSitter.mutateAsync({
          id: mySitter.id,
          name,
          bio,
          location,
          hourlyRate: BigInt(hourlyRate || "0"),
          photoUrl,
          isActive: true,
          services: selectedServices,
        });
      } else {
        await createSitter.mutateAsync({
          name,
          bio,
          location,
          hourlyRate: BigInt(hourlyRate || "0"),
          photoUrl,
          services: selectedServices,
        });
      }
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile.");
    }
  };

  const groupedBookings = {
    pending: (bookings as unknown as Public__4[]).filter(
      (b) => (b.status as string) === "pending",
    ),
    confirmed: (bookings as unknown as Public__4[]).filter(
      (b) => (b.status as string) === "confirmed",
    ),
    completed: (bookings as unknown as Public__4[]).filter(
      (b) => (b.status as string) === "completed",
    ),
    cancelled: (bookings as unknown as Public__4[]).filter(
      (b) => (b.status as string) === "cancelled",
    ),
  };

  const handleStatus = (
    bookingId: bigint,
    status: "confirmed" | "completed" | "cancelled",
  ) => {
    updateStatus.mutate(
      { bookingId, status },
      {
        onSuccess: () => toast.success(`Booking ${status}`),
        onError: () => toast.error("Failed to update status"),
      },
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("home")}
              className="flex items-center gap-1.5 text-sm text-primary hover:opacity-80"
            >
              <ArrowLeft size={16} /> Home
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="font-display font-semibold">Sitter Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            {setDarkMode && (
              <button
                type="button"
                data-ocid="nav.dark_mode.toggle"
                onClick={() => setDarkMode(!darkMode)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label={darkMode ? "Light mode" : "Dark mode"}
              >
                {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <User size={12} />
              <span className="hidden sm:inline">
                {principal?.slice(0, 12)}...
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {mySitter && !mySitter.isActive && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
            <Clock size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">
                Application Pending Review
              </p>
              <p className="text-amber-700 text-sm mt-0.5">
                Your application is pending admin review. You&apos;ll be
                notified once approved and your profile will become visible to
                clients.
              </p>
            </div>
          </div>
        )}
        <Tabs defaultValue="bookings">
          <TabsList className="rounded-full mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="bookings" className="rounded-full">
              Bookings
            </TabsTrigger>
            <TabsTrigger value="invoices" className="rounded-full gap-1.5">
              <Receipt size={13} />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="profile" className="rounded-full">
              Profile
            </TabsTrigger>
            <TabsTrigger value="availability" className="rounded-full">
              Availability
            </TabsTrigger>
          </TabsList>

          {/* Bookings tab */}
          <TabsContent value="bookings">
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6">
              <h2 className="font-display text-xl font-bold mb-5">
                Your Bookings
              </h2>
              {bookingsLoading ? (
                <div>
                  {["bk-1", "bk-2"].map((k) => (
                    <Skeleton key={k} className="h-16 w-full rounded-xl mb-3" />
                  ))}
                </div>
              ) : (
                <Tabs defaultValue="confirmed">
                  <TabsList className="rounded-full mb-4 w-full sm:w-auto overflow-x-auto">
                    {(
                      [
                        "pending",
                        "confirmed",
                        "completed",
                        "cancelled",
                      ] as const
                    ).map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="rounded-full capitalize text-xs"
                      >
                        {tab} ({groupedBookings[tab].length})
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {(
                    ["pending", "confirmed", "completed", "cancelled"] as const
                  ).map((tab) => (
                    <TabsContent key={tab} value={tab}>
                      {groupedBookings[tab].length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-3xl mb-2">💭</div>
                          <p className="text-muted-foreground">
                            No {tab} bookings
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {groupedBookings[tab].map((b, i) => (
                            <BookingCard
                              key={(b as any).id.toString()}
                              booking={b}
                              senderName={mySitter?.name ?? "Sitter"}
                              index={i}
                              onConfirm={
                                tab === "pending"
                                  ? (id) => handleStatus(id, "confirmed")
                                  : undefined
                              }
                              onComplete={
                                tab === "confirmed"
                                  ? (id) => handleStatus(id, "completed")
                                  : undefined
                              }
                              onCancel={(id) => handleStatus(id, "cancelled")}
                              allSitters={allSitters as Public[]}
                              extraContent={
                                mySitter &&
                                (tab === "confirmed" || tab === "completed") ? (
                                  <ServiceLogTimeline
                                    bookingId={(b as any).id}
                                    sitterId={mySitter.id}
                                    sitterName={mySitter.name}
                                    isActive={tab === "confirmed"}
                                  />
                                ) : undefined
                              }
                            />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </div>
          </TabsContent>

          {/* Invoices tab */}
          <TabsContent value="invoices">
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6">
              <h2 className="font-display text-xl font-bold mb-5">
                Invoices &amp; Payments
              </h2>
              {mySitter ? (
                <SitterInvoicesTab
                  bookings={bookings as unknown as Public__4[]}
                  allSitters={allSitters as Public[]}
                  sitterName={mySitter.name}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-3xl mb-2">🧾</div>
                  <p className="text-muted-foreground text-sm">
                    Create your sitter profile to start managing invoices.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Profile tab */}
          <TabsContent value="profile">
            {profileLoading ? (
              <Skeleton className="h-64 w-full rounded-2xl" />
            ) : (
              <div className="bg-card rounded-2xl border border-border shadow-xs p-6">
                <h2 className="font-display text-xl font-bold mb-5">
                  Your Profile
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Display Name *</Label>
                    <Input
                      data-ocid="profile.name.input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input
                      data-ocid="profile.email.input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Bio</Label>
                    <Textarea
                      data-ocid="profile.bio.textarea"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="rounded-lg resize-none"
                      rows={3}
                      placeholder="Tell clients about yourself..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Location</Label>
                    <Input
                      data-ocid="profile.location.input"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Austin, TX"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Daily Rate ($)</Label>
                    <Input
                      data-ocid="profile.rate.input"
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="25"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Photo URL</Label>
                    <Input
                      data-ocid="profile.photo.input"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://..."
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Services You Offer</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ALL_SERVICES.map((svc) => (
                        <label
                          key={svc}
                          htmlFor={`svc-dash-${svc}`}
                          className="flex items-center gap-2 cursor-pointer text-sm"
                        >
                          <Checkbox
                            id={`svc-dash-${svc}`}
                            checked={selectedServices.includes(svc)}
                            onCheckedChange={() => toggleService(svc)}
                          />
                          {svc}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Service Rates Editor */}
                {mySitter && selectedServices.length > 0 && (
                  <ServiceRatesEditor
                    sitter={mySitter}
                    selectedServices={selectedServices}
                  />
                )}
                {/* Admin Access */}
                <AdminClaimSection navigate={navigate} />
                <Button
                  data-ocid="profile.save_button"
                  onClick={handleSaveProfile}
                  disabled={
                    saveProfile.isPending ||
                    createSitter.isPending ||
                    updateSitter.isPending
                  }
                  className="mt-5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
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
          </TabsContent>

          {/* Availability tab */}
          <TabsContent value="availability">
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6">
              <h2 className="font-display text-xl font-bold mb-5">
                Your Availability
              </h2>
              {mySitter ? (
                <AvailabilityEditor sitterId={mySitter.id} />
              ) : (
                <p className="text-muted-foreground text-sm">
                  Create your sitter profile first to set availability.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
