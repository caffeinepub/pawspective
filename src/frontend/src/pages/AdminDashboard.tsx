import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  Clock,
  DollarSign,
  FileText,
  Fingerprint,
  Loader2,
  Moon,
  PawPrint,
  Plus,
  ShieldCheck,
  Sun,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { View } from "../App";
import type {
  AvailabilityEntry,
  PaymentMethod,
  Public,
  Public__3,
  Public__4,
} from "../backend.d";
import { PaymentStatus } from "../backend.d";
import { parseBadges } from "../components/SitterCard";
import StatusBadge from "../components/StatusBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllBookings,
  useAllPayments,
  useAllSitters,
  useApproveSitter,
  useAssignRole,
  useClaimFirstAdmin,
  useConfirmManualPayment,
  useCreatePayment,
  useCreateSitter,
  useIsAdmin,
  useIsAdminAssigned,
  useSetSitterAvailability,
  useSitterAvailability,
  useUpdateBookingStatus,
  useUpdatePaymentSplits,
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

function formatDate(ts: bigint): string {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface Props {
  navigate: (view: View) => void;
  darkMode?: boolean;
  setDarkMode?: (v: boolean) => void;
}

function AddSitterDialog({ onClose }: { onClose: () => void }) {
  const createSitter = useCreateSitter();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [rate, setRate] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [services, setServices] = useState<string[]>([]);

  const toggleService = (s: string) =>
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const handleSubmit = async () => {
    if (!name || !bio || !location || !rate) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createSitter.mutateAsync({
        name,
        bio,
        location,
        hourlyRate: BigInt(rate),
        photoUrl,
        services,
      });
      toast.success(`${name} added as a sitter`);
      onClose();
    } catch {
      toast.error("Failed to add sitter");
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 col-span-2">
          <Label>Name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            className="rounded-lg"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Location *</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Austin, TX"
            className="rounded-lg"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Daily Rate ($) *</Label>
          <Input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="35"
            className="rounded-lg"
          />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label>Bio *</Label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell clients about this sitter..."
            className="rounded-lg resize-none"
            rows={3}
          />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label>Photo URL</Label>
          <Input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://..."
            className="rounded-lg"
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Services</Label>
          <div className="grid grid-cols-2 gap-2">
            {ALL_SERVICES.map((svc) => (
              <label
                key={svc}
                htmlFor={`svc-admin-${svc}`}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <Checkbox
                  id={`svc-admin-${svc}`}
                  checked={services.includes(svc)}
                  onCheckedChange={() => toggleService(svc)}
                />
                {svc}
              </label>
            ))}
          </div>
        </div>
      </div>
      <Button
        data-ocid="admin.add_sitter.submit_button"
        onClick={handleSubmit}
        disabled={createSitter.isPending}
        className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
      >
        {createSitter.isPending ? (
          <>
            <Loader2 size={14} className="mr-2 animate-spin" />
            Adding...
          </>
        ) : (
          "Add Sitter"
        )}
      </Button>
    </div>
  );
}

// Item 6: Admin badge editor - toggle badges in sitter bio
const ALL_BADGES = ["Background Checked", "5+ Years Experience", "Top Sitter"];

function AdminBadgeEditor({ sitter }: { sitter: Public }) {
  const updateSitterMut = useUpdateSitter();
  const { badges, cleanBio } = parseBadges(sitter.bio ?? "");
  const [localBadges, setLocalBadges] = useState<string[]>(badges);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const badgePrefix =
      localBadges.length > 0 ? `[badges:${localBadges.join(",")}]` : "";
    const newBio = badgePrefix
      ? `${badgePrefix}${cleanBio ? ` ${cleanBio}` : ""}`
      : cleanBio;
    try {
      await updateSitterMut.mutateAsync({
        id: sitter.id,
        name: sitter.name,
        bio: newBio,
        location: sitter.location,
        photoUrl: sitter.photoUrl,
        services: sitter.services,
        hourlyRate: sitter.hourlyRate,
        isActive: sitter.isActive,
      });
      toast.success("Badges updated!");
    } catch {
      toast.error("Failed to update badges");
    }
    setSaving(false);
  };

  return (
    <div className="p-3 space-y-2 min-w-[200px]">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Badges
      </p>
      {ALL_BADGES.map((badge) => (
        <label
          key={badge}
          htmlFor={`badge-${sitter.id}-${badge}`}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Checkbox
            id={`badge-${sitter.id}-${badge}`}
            checked={localBadges.includes(badge)}
            onCheckedChange={(checked) =>
              setLocalBadges((prev) =>
                checked ? [...prev, badge] : prev.filter((b) => b !== badge),
              )
            }
          />
          <span className="text-sm">{badge}</span>
        </label>
      ))}
      <Button
        size="sm"
        onClick={handleSave}
        disabled={saving}
        className="w-full mt-1 rounded-full bg-primary text-primary-foreground h-7 text-xs"
      >
        {saving ? "Saving..." : "Save Badges"}
      </Button>
    </div>
  );
}

function AnalyticsTab({
  bookings,
  sitters,
  payments,
}: {
  bookings: Public__4[];
  sitters: Public[];
  payments: Public__3[];
}) {
  // Item 9: date range filter state
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">(
    "all",
  );

  const cutoff = (() => {
    if (dateRange === "all") return 0;
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    return Date.now() - days * 86400000;
  })();

  const filteredBookings =
    dateRange === "all"
      ? bookings
      : bookings.filter((b) => Number(b.createdAt / 1_000_000n) >= cutoff);

  const filteredPayments =
    dateRange === "all"
      ? payments
      : payments.filter((p) => {
          const booking = bookings.find((b) => b.id === p.bookingId);
          return booking
            ? Number(booking.createdAt / 1_000_000n) >= cutoff
            : false;
        });

  const totalRevenue = filteredPayments
    .filter((p) => p.status === PaymentStatus.paid)
    .reduce((sum, p) => sum + Number(p.totalAmount), 0);
  const pendingRevenue = filteredPayments
    .filter((p) => p.status === PaymentStatus.pending)
    .reduce((sum, p) => sum + Number(p.totalAmount), 0);

  // Item 9: avg booking value
  const avgBookingValue =
    filteredPayments.length > 0
      ? filteredPayments.reduce((sum, p) => sum + Number(p.totalAmount), 0) /
        filteredPayments.length
      : 0;

  const statusCounts = {
    pending: filteredBookings.filter((b) => (b.status as string) === "pending")
      .length,
    confirmed: filteredBookings.filter(
      (b) => (b.status as string) === "confirmed",
    ).length,
    completed: filteredBookings.filter(
      (b) => (b.status as string) === "completed",
    ).length,
    cancelled: filteredBookings.filter(
      (b) => (b.status as string) === "cancelled",
    ).length,
  };
  const maxCount = Math.max(...Object.values(statusCounts), 1);

  // Item 9: top sitters with booking count AND revenue
  const sitterStats = sitters
    .map((s) => {
      const sitterBookings = filteredBookings.filter((b) =>
        b.sitterIds?.includes(s.id),
      );
      const sitterPayments = filteredPayments.filter((p) =>
        sitterBookings.some((b) => b.id === p.bookingId),
      );
      const revenue = sitterPayments.reduce(
        (sum, p) => sum + Number(p.totalAmount),
        0,
      );
      return { name: s.name, count: sitterBookings.length, revenue };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentBookings = [...filteredBookings]
    .sort((a, b) => Number(b.createdAt - a.createdAt))
    .slice(0, 5);

  // Item 9: repeat clients
  const emailCounts: Record<string, number> = {};
  for (const b of filteredBookings) {
    if (b.clientEmail)
      emailCounts[b.clientEmail] = (emailCounts[b.clientEmail] || 0) + 1;
  }
  const repeatClients = Object.values(emailCounts).filter((c) => c >= 2).length;

  // Item 9: weekly booking trend (last 8 weeks)
  const weeklyData: Array<{ label: string; count: number }> = [];
  const now = Date.now();
  for (let w = 7; w >= 0; w--) {
    const weekStart = now - (w + 1) * 7 * 86400000;
    const weekEnd = now - w * 7 * 86400000;
    const label = new Date(weekStart).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const count = bookings.filter((b) => {
      const ts = Number(b.createdAt / 1_000_000n);
      return ts >= weekStart && ts < weekEnd;
    }).length;
    weeklyData.push({ label, count });
  }
  const maxWeekCount = Math.max(...weeklyData.map((w) => w.count), 1);

  // Item 9: peak day of week
  const dayCounts: Record<number, number> = {};
  for (const b of filteredBookings) {
    const day = new Date(Number(b.createdAt / 1_000_000n)).getDay();
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  }
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const peakDayNum = Object.entries(dayCounts).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];
  const peakDay =
    peakDayNum !== undefined ? dayNames[Number(peakDayNum)] : "N/A";

  const STAT_COLORS: Record<string, string> = {
    pending: "bg-amber-500",
    confirmed: "bg-blue-500",
    completed: "bg-emerald-500",
    cancelled: "bg-red-400",
  };

  return (
    <div className="space-y-6">
      {/* Item 9: Date range filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-display font-semibold text-lg">Analytics</h3>
        <div className="flex gap-1.5">
          {(["7d", "30d", "90d", "all"] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDateRange(range)}
              data-ocid={`admin.analytics.${range}.tab`}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${dateRange === range ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
            >
              {range === "all"
                ? "All Time"
                : range === "7d"
                  ? "7 Days"
                  : range === "30d"
                    ? "30 Days"
                    : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: `$${totalRevenue.toLocaleString()}`,
            Icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Pending Revenue",
            value: `$${pendingRevenue.toLocaleString()}`,
            Icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Total Bookings",
            value: filteredBookings.length,
            Icon: FileText,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Active Sitters",
            value: sitters.filter((s) => s.isActive).length,
            Icon: Users,
            color: "text-primary",
            bg: "bg-primary/10",
          },
        ].map(({ label, value, Icon, color, bg }) => (
          <div
            key={label}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div
              className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-2`}
            >
              <Icon size={18} className={color} />
            </div>
            <p className={`font-display font-bold text-2xl ${color}`}>
              {value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Item 9: Extra metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">
            Avg Booking Value
          </p>
          <p className="font-display font-bold text-xl text-foreground">
            ${avgBookingValue > 0 ? avgBookingValue.toFixed(0) : "—"}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Repeat Clients</p>
          <p className="font-display font-bold text-xl text-foreground">
            {repeatClients}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Peak Day</p>
          <p className="font-display font-bold text-xl text-foreground">
            {peakDay}
          </p>
        </div>
      </div>

      {/* Item 9: Weekly booking trend */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-semibold text-base mb-4">
          Weekly Booking Trend
        </h3>
        <div className="flex items-end gap-1 h-28">
          {weeklyData.map((week) => (
            <div
              key={week.label}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <span className="text-[9px] text-muted-foreground font-bold">
                {week.count > 0 ? week.count : ""}
              </span>
              <div
                className="w-full bg-muted rounded-t-sm overflow-hidden"
                style={{ height: "80px" }}
              >
                <div
                  className="w-full bg-primary rounded-t-sm transition-all"
                  style={{ height: `${(week.count / maxWeekCount) * 100}%` }}
                />
              </div>
              <span className="text-[8px] text-muted-foreground truncate w-full text-center">
                {week.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Booking status chart */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-semibold text-base mb-4">
          Booking Status Breakdown
        </h3>
        <div className="space-y-3">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center gap-3">
              <span className="w-20 text-xs text-muted-foreground capitalize shrink-0">
                {status}
              </span>
              <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${STAT_COLORS[status] ?? "bg-primary"}`}
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold w-6 text-right shrink-0">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Item 9: Top sitters with revenue */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-semibold text-base mb-4">
            Top Sitters
          </h3>
          {sitterStats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No data yet
            </p>
          ) : (
            <div className="space-y-2.5">
              {sitterStats.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="w-5 text-xs font-bold text-muted-foreground shrink-0">
                    {i + 1}.
                  </span>
                  <span className="flex-1 text-sm font-medium truncate">
                    {s.name}
                  </span>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium shrink-0">
                    {s.count} bookings
                  </span>
                  {s.revenue > 0 && (
                    <span className="text-xs text-emerald-600 font-medium shrink-0">
                      ${s.revenue.toFixed(0)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-semibold text-base mb-4">
            Recent Bookings
          </h3>
          {recentBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No bookings yet
            </p>
          ) : (
            <div className="space-y-2">
              {recentBookings.map((b) => (
                <div key={b.id.toString()} className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    #{b.id.toString()}
                  </span>
                  <span className="text-sm flex-1 truncate">
                    {b.clientName}
                  </span>
                  <StatusBadge status={b.status as string} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminAvailabilityTab({ sitters }: { sitters: Public[] }) {
  const [selectedSitterId, setSelectedSitterId] = useState<string>("");
  const sitterId = selectedSitterId ? BigInt(selectedSitterId) : null;
  const { data: existingEntries = [] } = useSitterAvailability(sitterId);
  const setAvailabilityMut = useSetSitterAvailability();

  const [schedule, setSchedule] = useState<
    Array<{ enabled: boolean; startTime: string; endTime: string }>
  >(DAYS.map(() => ({ enabled: false, startTime: "09:00", endTime: "17:00" })));

  useEffect(() => {
    const reset = DAYS.map(() => ({
      enabled: false,
      startTime: "09:00",
      endTime: "17:00",
    }));
    if (existingEntries.length > 0) {
      for (const entry of existingEntries as AvailabilityEntry[]) {
        const idx = Number(entry.dayOfWeek);
        if (idx >= 0 && idx < 7) {
          reset[idx] = {
            enabled: true,
            startTime: minutesToTime(Number(entry.startTime)),
            endTime: minutesToTime(Number(entry.endTime)),
          };
        }
      }
    }
    setSchedule(reset);
  }, [existingEntries]);

  const handleSave = async () => {
    if (!sitterId) return;
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
      await setAvailabilityMut.mutateAsync({ sitterId, entries });
      toast.success("Availability updated!");
    } catch {
      toast.error("Failed to save availability");
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-5">
      <h3 className="font-display font-semibold text-lg">
        Sitter Availability
      </h3>
      <div className="space-y-2">
        <Label>Select Sitter</Label>
        <Select value={selectedSitterId} onValueChange={setSelectedSitterId}>
          <SelectTrigger
            data-ocid="admin.availability.select"
            className="rounded-lg max-w-xs"
          >
            <SelectValue placeholder="Choose a sitter..." />
          </SelectTrigger>
          <SelectContent>
            {sitters.map((s) => (
              <SelectItem key={s.id.toString()} value={s.id.toString()}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {sitters.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-2">
          <CalendarDays size={32} className="opacity-30" />
          <p className="text-sm font-medium">No sitters yet</p>
          <p className="text-xs">
            Add a sitter in the Sitters tab first, then manage their
            availability here.
          </p>
        </div>
      )}

      {selectedSitterId && (
        <div className="space-y-3">
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
                    className="border border-border rounded-lg px-2 py-1 text-sm bg-background"
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
                    className="border border-border rounded-lg px-2 py-1 text-sm bg-background"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground flex-1">
                  Not available
                </span>
              )}
            </div>
          ))}
          <Button
            data-ocid="admin.availability.save_button"
            onClick={handleSave}
            disabled={setAvailabilityMut.isPending}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            {setAvailabilityMut.isPending ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Availability"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function CreatePaymentDialog({
  bookings,
  sitters,
  onClose,
}: {
  bookings: Public__4[];
  sitters: Public[];
  onClose: () => void;
}) {
  const createPayment = useCreatePayment();
  const [bookingId, setBookingId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"manual" | "stripe">("manual");
  const [notes, setNotes] = useState("");
  const [splits, setSplits] = useState<
    Array<{ sitterId: string; amount: string; paid: boolean }>
  >([]);

  const selectedBooking = bookings.find((b) => b.id.toString() === bookingId);

  useEffect(() => {
    if (selectedBooking) {
      setSplits(
        selectedBooking.sitterIds.map((sid) => ({
          sitterId: sid.toString(),
          amount: "",
          paid: false,
        })),
      );
    }
  }, [selectedBooking]);

  const handleSubmit = async () => {
    if (!bookingId || !amount) {
      toast.error("Booking ID and amount are required");
      return;
    }
    try {
      await createPayment.mutateAsync({
        bookingId: BigInt(bookingId),
        totalAmount: BigInt(Math.round(Number(amount) * 100)),
        method: method as PaymentMethod,
        notes: notes || undefined,
        splits: splits.map((s) => ({
          sitterId: BigInt(s.sitterId),
          amount: BigInt(Math.round(Number(s.amount || "0") * 100)),
          paid: s.paid,
        })),
      });
      toast.success("Payment created");
      onClose();
    } catch {
      toast.error("Failed to create payment");
    }
  };

  const sitterName = (sid: string) =>
    sitters.find((s) => s.id.toString() === sid)?.name ?? `Sitter #${sid}`;

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="space-y-1.5">
        <Label>Booking</Label>
        <Select value={bookingId} onValueChange={setBookingId}>
          <SelectTrigger className="rounded-lg">
            <SelectValue placeholder="Select booking..." />
          </SelectTrigger>
          <SelectContent>
            {bookings.map((b) => (
              <SelectItem key={b.id.toString()} value={b.id.toString()}>
                #{b.id.toString()} — {b.clientName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Amount ($)</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="rounded-lg"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Method</Label>
          <Select
            value={method}
            onValueChange={(v) => setMethod(v as "manual" | "stripe")}
          >
            <SelectTrigger className="rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Notes (optional)</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-lg resize-none"
          rows={2}
        />
      </div>
      {splits.length > 0 && (
        <div className="space-y-2">
          <Label>Payment Splits</Label>
          {splits.map((split, i) => (
            <div key={split.sitterId} className="flex items-center gap-2">
              <span className="text-sm flex-1">
                {sitterName(split.sitterId)}
              </span>
              <Input
                type="number"
                value={split.amount}
                onChange={(e) =>
                  setSplits((prev) =>
                    prev.map((s, idx) =>
                      idx === i ? { ...s, amount: e.target.value } : s,
                    ),
                  )
                }
                placeholder="Amount"
                className="rounded-lg h-8 w-24 text-xs"
              />
              <label
                htmlFor={`split-paid-${i}`}
                className="flex items-center gap-1 text-xs"
              >
                <Checkbox
                  id={`split-paid-${i}`}
                  checked={split.paid}
                  onCheckedChange={(v) =>
                    setSplits((prev) =>
                      prev.map((s, idx) =>
                        idx === i ? { ...s, paid: !!v } : s,
                      ),
                    )
                  }
                />
                Paid
              </label>
            </div>
          ))}
        </div>
      )}
      <Button
        onClick={handleSubmit}
        disabled={createPayment.isPending}
        className="w-full rounded-full bg-primary text-primary-foreground font-semibold"
      >
        {createPayment.isPending ? (
          <>
            <Loader2 size={14} className="mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Payment"
        )}
      </Button>
    </div>
  );
}

export default function AdminDashboard({
  navigate,
  darkMode,
  setDarkMode,
}: Props) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: adminAssigned } = useIsAdminAssigned();
  const claimAdmin = useClaimFirstAdmin();
  const { data: sitters = [], isLoading: sittersLoading } = useAllSitters();
  const { data: bookings = [], isLoading: bookingsLoading } = useAllBookings();
  const { data: payments = [] } = useAllPayments();
  const updateStatus = useUpdateBookingStatus();
  const updateSitter = useUpdateSitter();
  const approveSitter = useApproveSitter();
  const assignRole = useAssignRole();
  const confirmPayment = useConfirmManualPayment();
  const updateSplits = useUpdatePaymentSplits();

  const [searchSitter, setSearchSitter] = useState("");
  const [addSitterOpen, setAddSitterOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState("");
  const [createPaymentOpen, setCreatePaymentOpen] = useState(false);

  if (!identity) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
          <ShieldCheck size={28} className="text-primary-foreground" />
        </div>
        <h2 className="font-display text-2xl font-bold">Admin Dashboard</h2>
        <p className="text-muted-foreground text-center">
          Sign in securely with your fingerprint or face — no password needed.
        </p>
        <Button
          data-ocid="admin.login.button"
          onClick={login}
          disabled={isLoggingIn}
          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 font-semibold gap-2 shadow-lg shadow-primary/20"
        >
          {isLoggingIn ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Verifying your identity...
            </>
          ) : (
            <>
              <Fingerprint size={16} />
              Sign In Securely →
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          3-second sign-in · No password · Phishing-proof
        </p>
        <Button
          variant="ghost"
          onClick={() => navigate("home")}
          className="text-muted-foreground text-sm"
        >
          <ArrowLeft size={14} className="mr-1" /> Back to Home
        </Button>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <ShieldCheck size={40} className="text-muted-foreground" />
        <h2 className="font-display text-xl font-bold">
          {"Set Up Admin Access"}
        </h2>
        <p className="text-muted-foreground text-center max-w-sm">
          {adminAssigned !== true
            ? "No admin has been set up yet. Since you're logged in, you can claim admin access now."
            : "You don't have admin privileges. Contact an existing admin to be granted access."}
        </p>
        {adminAssigned !== true && (
          <Button
            onClick={() =>
              claimAdmin.mutate(undefined, {
                onSuccess: (claimed) => {
                  if (claimed) {
                    toast.success("Admin access claimed! Reloading...");
                    setTimeout(() => window.location.reload(), 1000);
                  } else {
                    toast.error(
                      "Admin has already been claimed by someone else.",
                    );
                  }
                },
                onError: () => toast.error("Failed to claim admin access."),
              })
            }
            disabled={claimAdmin.isPending}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 font-semibold"
          >
            {claimAdmin.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Claiming...
              </>
            ) : (
              "Claim Admin Access"
            )}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => navigate("home")}
          className="rounded-full"
        >
          <ArrowLeft size={14} className="mr-1" /> Back to Home
        </Button>
      </div>
    );
  }

  const filteredSitters = (sitters as Public[]).filter((s) =>
    s.name.toLowerCase().includes(searchSitter.toLowerCase()),
  );

  const allBookings = bookings as Public__4[];
  const allSitters = sitters as Public[];
  const allPayments = payments as Public__3[];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("home")}
              className="flex items-center gap-1.5 text-sm text-primary hover:opacity-80"
            >
              <ArrowLeft size={16} /> Home
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="font-display font-semibold">Admin Panel</span>
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
            <div className="flex items-center gap-2 text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-medium">
              <ShieldCheck size={12} /> Admin
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="analytics">
          <TabsList className="rounded-full mb-6 overflow-x-auto flex-wrap gap-1 h-auto p-1">
            <TabsTrigger
              value="analytics"
              className="rounded-full gap-1.5 text-xs sm:text-sm"
            >
              <BarChart3 size={13} /> Analytics
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="rounded-full gap-1.5 text-xs sm:text-sm"
            >
              <UserCheck size={13} /> Applications
              {allSitters.filter((s) => !s.isActive).length > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {allSitters.filter((s) => !s.isActive).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="rounded-full gap-1.5 text-xs sm:text-sm"
            >
              <BookOpen size={13} /> Bookings
            </TabsTrigger>
            <TabsTrigger
              value="sitters"
              className="rounded-full gap-1.5 text-xs sm:text-sm"
            >
              <PawPrint size={13} /> Sitters
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="rounded-full gap-1.5 text-xs sm:text-sm"
            >
              <Wallet size={13} /> Payments
            </TabsTrigger>
            <TabsTrigger
              value="availability"
              className="rounded-full gap-1.5 text-xs sm:text-sm"
            >
              <CalendarDays size={13} /> Availability
            </TabsTrigger>
            <TabsTrigger
              value="access"
              className="rounded-full gap-1.5 text-xs sm:text-sm"
            >
              <ShieldCheck size={13} /> Access
            </TabsTrigger>
          </TabsList>

          {/* Analytics */}
          <TabsContent value="analytics">
            <AnalyticsTab
              bookings={allBookings}
              sitters={allSitters}
              payments={allPayments}
            />
          </TabsContent>

          {/* Applications */}
          <TabsContent value="applications">
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6">
              <h2 className="font-display text-xl font-bold mb-5">
                Sitter Applications
              </h2>
              {allSitters.filter((s) => !s.isActive).length === 0 ? (
                <div
                  data-ocid="admin.applications.empty_state"
                  className="text-center py-16"
                >
                  <UserCheck
                    size={40}
                    className="mx-auto text-muted-foreground mb-3"
                  />
                  <p className="text-muted-foreground font-medium">
                    No pending applications
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    New sitter applications will appear here for review.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allSitters
                    .filter((s) => !s.isActive)
                    .map((s, i) => (
                      <div
                        key={s.id.toString()}
                        data-ocid={`admin.applications.item.${i + 1}`}
                        className="border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-start gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base">
                              {s.name}
                            </h3>
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                              Pending
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {s.location}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {s.bio}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {s.services.slice(0, 4).map((svc) => (
                              <span
                                key={svc}
                                className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                              >
                                {svc}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            data-ocid={`admin.applications.confirm_button.${i + 1}`}
                            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                            disabled={approveSitter.isPending}
                            onClick={() =>
                              approveSitter.mutate(
                                {
                                  id: s.id,
                                  name: s.name,
                                  bio: s.bio,
                                  services: s.services,
                                  hourlyRate: s.hourlyRate,
                                  location: s.location,
                                  photoUrl: s.photoUrl,
                                  isActive: true,
                                },
                                {
                                  onSuccess: () =>
                                    toast.success(`${s.name} approved!`),
                                  onError: () =>
                                    toast.error("Failed to approve"),
                                },
                              )
                            }
                          >
                            <UserCheck size={13} /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`admin.applications.delete_button.${i + 1}`}
                            className="rounded-full text-destructive hover:bg-destructive/10 gap-1"
                            disabled={updateSitter.isPending}
                            onClick={() =>
                              updateSitter.mutate(
                                {
                                  id: s.id,
                                  name: s.name,
                                  bio: s.bio,
                                  location: s.location,
                                  photoUrl: s.photoUrl,
                                  services: s.services,
                                  hourlyRate: s.hourlyRate,
                                  isActive: false,
                                },
                                {
                                  onSuccess: () =>
                                    toast.success(`${s.name} declined`),
                                  onError: () =>
                                    toast.error("Failed to decline"),
                                },
                              )
                            }
                          >
                            <UserX size={13} /> Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Sitters */}
          <TabsContent value="sitters">
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="font-display font-semibold text-lg">
                  Sitter Management
                </h3>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search..."
                    value={searchSitter}
                    onChange={(e) => setSearchSitter(e.target.value)}
                    className="rounded-full text-sm w-44"
                  />
                  <Dialog open={addSitterOpen} onOpenChange={setAddSitterOpen}>
                    <DialogTrigger asChild>
                      <Button
                        data-ocid="admin.add_sitter.open_modal_button"
                        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 font-semibold"
                        size="sm"
                      >
                        <Plus size={14} /> Add Sitter
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="font-display">
                          Add New Sitter
                        </DialogTitle>
                      </DialogHeader>
                      <AddSitterDialog
                        onClose={() => setAddSitterOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              {sittersLoading ? (
                <div>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded mb-2" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSitters.map((s, i) => (
                        <TableRow
                          data-ocid={`admin.sitters.row.${i + 1}`}
                          key={s.id.toString()}
                        >
                          <TableCell className="font-medium">
                            {s.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {s.location}
                          </TableCell>
                          <TableCell>${Number(s.hourlyRate)}/day</TableCell>
                          <TableCell>
                            {s.rating > 0 ? `${s.rating.toFixed(1)} ⭐` : "New"}
                          </TableCell>
                          <TableCell>
                            {s.isActive ? (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">
                                Active
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                                Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              className={
                                s.isActive
                                  ? "text-destructive hover:bg-destructive/10 h-7 gap-1 px-2 text-xs"
                                  : "text-emerald-600 hover:bg-emerald-50 h-7 gap-1 px-2 text-xs"
                              }
                              data-ocid={`admin.sitters.delete_button.${i + 1}`}
                              onClick={() =>
                                updateSitter.mutate(
                                  {
                                    id: s.id,
                                    name: s.name,
                                    bio: s.bio,
                                    location: s.location,
                                    photoUrl: s.photoUrl,
                                    services: s.services,
                                    hourlyRate: s.hourlyRate,
                                    isActive: !s.isActive,
                                  },
                                  {
                                    onSuccess: () =>
                                      toast.success(
                                        s.isActive
                                          ? `${s.name} deactivated`
                                          : `${s.name} reactivated`,
                                      ),
                                    onError: () => toast.error("Failed"),
                                  },
                                )
                              }
                            >
                              {s.isActive ? (
                                <>
                                  <UserX size={13} /> Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck size={13} /> Reactivate
                                </>
                              )}
                            </Button>
                            {/* Item 6: Badge editor */}
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                                  data-ocid={`admin.sitters.badge_button.${i + 1}`}
                                >
                                  <Award size={12} /> Badges
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="end"
                              >
                                <AdminBadgeEditor sitter={s} />
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredSitters.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-muted-foreground py-8"
                          >
                            No sitters yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Bookings */}
          <TabsContent value="bookings">
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6">
              <h3 className="font-display font-semibold text-lg mb-4">
                All Bookings
              </h3>
              {bookingsLoading ? (
                <div>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded mb-2" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Pets</TableHead>
                        <TableHead>Services</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allBookings.map((b, i) => (
                        <TableRow
                          data-ocid={`admin.bookings.row.${i + 1}`}
                          key={b.id.toString()}
                        >
                          <TableCell className="font-mono text-xs">
                            #{b.id.toString()}
                          </TableCell>
                          <TableCell>{b.clientName}</TableCell>
                          <TableCell className="text-xs">
                            {b.pets
                              ?.map((p) => `${p.petName} (${p.petType})`)
                              .join(", ") ?? "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs max-w-32 truncate">
                            {b.services?.join(", ") ?? "—"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {formatDate(b.startDate)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={b.status as string} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {(b.status as string) === "pending" && (
                                <Button
                                  size="sm"
                                  className="text-xs rounded-full bg-emerald-600 text-white hover:bg-emerald-700 h-7 px-2"
                                  data-ocid={`admin.bookings.confirm_button.${i + 1}`}
                                  onClick={() =>
                                    updateStatus.mutate(
                                      { bookingId: b.id, status: "confirmed" },
                                      {
                                        onSuccess: () =>
                                          toast.success("Confirmed"),
                                      },
                                    )
                                  }
                                >
                                  Confirm
                                </Button>
                              )}
                              {!["cancelled", "completed"].includes(
                                b.status as string,
                              ) && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2 rounded-full"
                                  data-ocid={`admin.bookings.delete_button.${i + 1}`}
                                  onClick={() =>
                                    updateStatus.mutate(
                                      { bookingId: b.id, status: "cancelled" },
                                      {
                                        onSuccess: () =>
                                          toast.success("Cancelled"),
                                      },
                                    )
                                  }
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {allBookings.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center text-muted-foreground py-8"
                          >
                            No bookings yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments">
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="font-display font-semibold text-lg">
                  Payment Management
                </h3>
                <Dialog
                  open={createPaymentOpen}
                  onOpenChange={setCreatePaymentOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      data-ocid="admin.payments.open_modal_button"
                      className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 font-semibold"
                      size="sm"
                    >
                      <Plus size={14} /> Create Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-display">
                        Create Payment
                      </DialogTitle>
                    </DialogHeader>
                    <CreatePaymentDialog
                      bookings={allBookings}
                      sitters={allSitters}
                      onClose={() => setCreatePaymentOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Splits</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPayments.map((p, i) => (
                      <TableRow
                        data-ocid={`admin.payments.row.${i + 1}`}
                        key={`${p.bookingId.toString()}-${i}`}
                      >
                        <TableCell className="font-mono text-xs">
                          #{p.bookingId.toString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${(Number(p.totalAmount) / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={p.method as string} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={p.status as string} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {p.splits?.length > 0
                            ? p.splits
                                .map(
                                  (s) =>
                                    `#${s.sitterId}: $${(Number(s.amount) / 100).toFixed(2)} ${s.paid ? "✅" : "⏳"}`,
                                )
                                .join(", ")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {p.method === "manual" &&
                              p.status === PaymentStatus.pending && (
                                <Button
                                  size="sm"
                                  className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700 text-xs h-7 px-2"
                                  data-ocid={`admin.payments.confirm_button.${i + 1}`}
                                  disabled={confirmPayment.isPending}
                                  onClick={() =>
                                    confirmPayment.mutate(p.bookingId, {
                                      onSuccess: () =>
                                        toast.success("Payment confirmed"),
                                      onError: () => toast.error("Failed"),
                                    })
                                  }
                                >
                                  Mark Paid
                                </Button>
                              )}
                            {p.splits?.some((s) => !s.paid) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full text-xs h-7 px-2"
                                data-ocid={`admin.payments.secondary_button.${i + 1}`}
                                disabled={updateSplits.isPending}
                                onClick={() =>
                                  updateSplits.mutate(
                                    {
                                      bookingId: p.bookingId,
                                      splits: p.splits.map((s) => ({
                                        ...s,
                                        paid: true,
                                      })),
                                    },
                                    {
                                      onSuccess: () =>
                                        toast.success("Splits updated"),
                                    },
                                  )
                                }
                              >
                                Pay All Splits
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {allPayments.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground py-8"
                        >
                          No payments yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* Availability - Item 1: show skeleton while sitters are loading */}
          <TabsContent value="availability">
            {sittersLoading ? (
              <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
                <Skeleton className="h-6 w-40 rounded" />
                <Skeleton className="h-10 w-64 rounded-lg" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              </div>
            ) : (
              <AdminAvailabilityTab sitters={allSitters} />
            )}
          </TabsContent>

          {/* Access */}
          <TabsContent value="access">
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-6">
              <h3 className="font-display font-semibold text-lg">
                Role Management
              </h3>
              <p className="text-sm text-muted-foreground">
                Grant or revoke admin access by entering the user’s Principal
                ID.
              </p>
              <div className="space-y-3">
                <Label>Principal ID</Label>
                <div className="flex gap-2">
                  <Input
                    data-ocid="admin.access.input"
                    value={roleTarget}
                    onChange={(e) => setRoleTarget(e.target.value)}
                    placeholder="aaaaa-bbbbb-ccccc-..."
                    className="rounded-lg font-mono text-sm"
                  />
                  <Button
                    data-ocid="admin.access.submit_button"
                    onClick={() =>
                      assignRole.mutate(
                        { principal: roleTarget, role: "admin" },
                        {
                          onSuccess: () => {
                            toast.success("Admin role granted");
                            setRoleTarget("");
                          },
                          onError: () =>
                            toast.error("Invalid principal or failed"),
                        },
                      )
                    }
                    disabled={!roleTarget || assignRole.isPending}
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 gap-1.5 font-semibold"
                  >
                    <UserPlus size={14} /> Grant Admin
                  </Button>
                </div>
              </div>
              <div className="bg-muted/40 rounded-xl p-4 text-sm">
                <p className="font-semibold mb-1">How it works</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>New sitter or admin logs in via the Sitter Portal</li>
                  <li>They copy their Principal ID from the login screen</li>
                  <li>You paste it above and click "Grant Admin"</li>
                  <li>They reload and will have full admin access</li>
                </ol>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
