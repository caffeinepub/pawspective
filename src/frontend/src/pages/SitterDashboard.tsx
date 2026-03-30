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
  Fingerprint,
  Loader2,
  PawPrint,
  Save,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { View } from "../App";
import type { AvailabilityEntry, Public, Public__3 } from "../backend.d";
import BookingCard from "../components/BookingCard";
import ServiceLogTimeline from "../components/ServiceLogTimeline";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllSitters,
  useBookingsBySitter,
  useCallerProfile,
  useCreateSitter,
  useSaveProfile,
  useSetSitterAvailability,
  useSitterAvailability,
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
        Set your weekly availability. Clients will see when you’re available.
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

interface Props {
  navigate: (view: View) => void;
}

export default function SitterDashboard({ navigate }: Props) {
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
    pending: (bookings as Public__3[]).filter(
      (b) => (b.status as string) === "pending",
    ),
    confirmed: (bookings as Public__3[]).filter(
      (b) => (b.status as string) === "confirmed",
    ),
    completed: (bookings as Public__3[]).filter(
      (b) => (b.status as string) === "completed",
    ),
    cancelled: (bookings as Public__3[]).filter(
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
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            <User size={12} />
            <span className="hidden sm:inline">
              {principal?.slice(0, 12)}...
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="bookings">
          <TabsList className="rounded-full mb-6">
            <TabsTrigger value="bookings" className="rounded-full">
              Bookings
            </TabsTrigger>
            <TabsTrigger value="profile" className="rounded-full">
              Profile
            </TabsTrigger>
            <TabsTrigger value="availability" className="rounded-full">
              Availability
            </TabsTrigger>
          </TabsList>

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

          {/* Bookings tab */}
          <TabsContent value="bookings">
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6">
              <h2 className="font-display text-xl font-bold mb-5">
                Your Bookings
              </h2>
              {bookingsLoading ? (
                <div>
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl mb-3" />
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
                              key={b.id.toString()}
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
                              extraContent={
                                mySitter &&
                                (tab === "confirmed" || tab === "completed") ? (
                                  <ServiceLogTimeline
                                    bookingId={b.id}
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
        </Tabs>
      </div>
    </div>
  );
}
