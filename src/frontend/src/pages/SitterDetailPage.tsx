import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Car,
  Check,
  Home,
  Loader2,
  MapPin,
  PawPrint,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import type { View } from "../App";
import type {
  DayServiceSchedule,
  Pet,
  Public,
  Public__4,
  RecurrencePattern,
  ServiceSlot,
} from "../backend.d";
import StatusBadge from "../components/StatusBadge";
import {
  useActiveSitters,
  useCreateBooking,
  useSitterProfile,
} from "../hooks/useQueries";

interface Props {
  sitterId: bigint;
  navigate: (view: View, sitterId?: bigint) => void;
}

const ALL_SERVICES = [
  { name: "Dog Walking", emoji: "🚶" },
  { name: "Boarding", emoji: "🏠" },
  { name: "Overnight Stay", emoji: "🌙" },
  { name: "Drop-In Visit", emoji: "🏡" },
  { name: "Pet Feeding", emoji: "🍽️" },
  { name: "Playtime & Hang Out", emoji: "🎾" },
  { name: "Cat Sitting", emoji: "🐱" },
  { name: "Pet Sitting", emoji: "🐾" },
  { name: "Small Pet Care", emoji: "🐹" },
  { name: "Bird Care", emoji: "🦜" },
];

const PET_TYPES = [
  "Dog",
  "Cat",
  "Bird",
  "Rabbit",
  "Fish",
  "Small Animal",
  "Other",
];

const STEPS = [
  "Sitter",
  "Services",
  "Team",
  "Dates",
  "Pets",
  "Contact",
  "Review",
];

function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  ocid,
}: {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  ocid?: string;
}) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="relative w-full">
      <input
        data-ocid={ocid}
        type="date"
        value={value}
        min={today}
        onChange={(e) => {
          const val = e.target.value;
          if (val && disabled) {
            const d = new Date(`${val}T12:00:00`);
            if (disabled(d)) return;
          }
          onChange(val);
        }}
        className="w-full px-4 py-3 text-base border border-input rounded-xl bg-background text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        style={{ fontSize: "16px", minHeight: "52px" }}
        placeholder={placeholder}
      />
      {!value && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
          {placeholder}
        </span>
      )}
    </div>
  );
}

function getDaysRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function getSlotCost(slot: ServiceSlot): number {
  const hours = Number(slot.durationMinutes) / 60;
  return hours * Number(slot.ratePerHour);
}

function calcDurationMinutes(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + (sm || 0)));
}

interface DaySchedulerProps {
  startDate: string;
  endDate: string;
  selectedServices: string[];
  selectedSitterIds: bigint[];
  allSitters: Public[];
  sitter: Public;
  serviceSchedule: DayServiceSchedule[];
  onScheduleChange: (schedule: DayServiceSchedule[]) => void;
}

function DayServiceScheduler({
  startDate,
  endDate,
  selectedServices,
  selectedSitterIds,
  allSitters,
  sitter,
  serviceSchedule,
  onScheduleChange,
}: DaySchedulerProps) {
  const days = getDaysRange(startDate, endDate);

  const getOrCreateDay = (date: string): DayServiceSchedule => {
    return serviceSchedule.find((d) => d.date === date) ?? { date, slots: [] };
  };

  const updateDay = (date: string, slots: ServiceSlot[]) => {
    const existing = serviceSchedule.find((d) => d.date === date);
    if (existing) {
      onScheduleChange(
        serviceSchedule.map((d) => (d.date === date ? { ...d, slots } : d)),
      );
    } else {
      onScheduleChange([...serviceSchedule, { date, slots }]);
    }
  };

  const addSlot = (date: string) => {
    const day = getOrCreateDay(date);
    const firstSitter =
      allSitters.find((s) => selectedSitterIds.includes(s.id)) ?? sitter;
    const firstService =
      selectedServices[0] ?? sitter.services[0] ?? "Dog Walking";
    const rateObj = firstSitter.serviceRates?.find(
      (r) => r.service === firstService,
    );
    const ratePerHour = rateObj ? rateObj.ratePerHour : firstSitter.hourlyRate;
    const newSlot: ServiceSlot = {
      service: firstService,
      sitterId: firstSitter.id,
      startTime: "09:00",
      endTime: "10:00",
      durationMinutes: 60n,
      ratePerHour,
    };
    updateDay(date, [...day.slots, newSlot]);
  };

  const updateSlot = (
    date: string,
    slotIdx: number,
    updates: Partial<ServiceSlot>,
  ) => {
    const day = getOrCreateDay(date);
    const updatedSlots = day.slots.map((s, i) => {
      if (i !== slotIdx) return s;
      const merged = { ...s, ...updates };
      // Recalc duration and rate if time or service/sitter changed
      const dur = calcDurationMinutes(merged.startTime, merged.endTime);
      const targetSitter =
        allSitters.find((as) => as.id === merged.sitterId) ?? sitter;
      const rateObj = targetSitter.serviceRates?.find(
        (r) => r.service === merged.service,
      );
      const ratePerHour = rateObj
        ? rateObj.ratePerHour
        : targetSitter.hourlyRate;
      return { ...merged, durationMinutes: BigInt(dur), ratePerHour };
    });
    updateDay(date, updatedSlots);
  };

  const removeSlot = (date: string, slotIdx: number) => {
    const day = getOrCreateDay(date);
    updateDay(
      date,
      day.slots.filter((_, i) => i !== slotIdx),
    );
  };

  const allSlots = serviceSchedule.flatMap((d) =>
    d.slots.map((s) => ({ ...s, date: d.date })),
  );
  const subtotal = allSlots.reduce((sum, s) => sum + getSlotCost(s), 0);
  const bundleDiscount = allSlots.length >= 3 ? subtotal * 0.1 : 0;
  const grandTotal = subtotal - bundleDiscount;

  const servicesToShow =
    selectedServices.length > 0 ? selectedServices : sitter.services;

  return (
    <div className="space-y-4">
      {/* Day Builder */}
      <div className="space-y-3">
        {days.map((date) => {
          const day = getOrCreateDay(date);
          const d = new Date(`${date}T12:00:00`);
          const label = d.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
          return (
            <div
              key={date}
              className="border border-border rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border">
                <p className="text-sm font-semibold">{label}</p>
                <button
                  type="button"
                  onClick={() => addSlot(date)}
                  className="flex items-center gap-1 text-xs text-primary hover:opacity-80 font-medium"
                >
                  <Plus size={13} /> Add Service
                </button>
              </div>
              {day.slots.length === 0 ? (
                <p className="text-xs text-muted-foreground px-4 py-3">
                  No services — click Add Service
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {day.slots.map((slot, slotIdx) => (
                    <div
                      key={`${slot.service}-${slot.sitterId ?? ""}-${slotIdx}`}
                      className="px-4 py-3 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto_auto] gap-2 items-center"
                    >
                      <Select
                        value={slot.service}
                        onValueChange={(v) =>
                          updateSlot(date, slotIdx, { service: v })
                        }
                      >
                        <SelectTrigger className="rounded-lg h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {servicesToShow.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={slot.sitterId.toString()}
                        onValueChange={(v) =>
                          updateSlot(date, slotIdx, { sitterId: BigInt(v) })
                        }
                      >
                        <SelectTrigger className="rounded-lg h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allSitters
                            .filter((s) => selectedSitterIds.includes(s.id))
                            .map((s) => (
                              <SelectItem
                                key={s.id.toString()}
                                value={s.id.toString()}
                              >
                                {s.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          updateSlot(date, slotIdx, {
                            startTime: e.target.value,
                          })
                        }
                        className="border border-input rounded-lg px-2 py-1.5 text-sm bg-background h-9"
                      />
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          updateSlot(date, slotIdx, { endTime: e.target.value })
                        }
                        className="border border-input rounded-lg px-2 py-1.5 text-sm bg-background h-9"
                      />
                      <button
                        type="button"
                        onClick={() => removeSlot(date, slotIdx)}
                        className="text-destructive hover:bg-destructive/10 rounded-full p-1.5"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cart Panel */}
      {allSlots.length > 0 && (
        <div className="bg-indigo-950 text-white rounded-2xl p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">
            Your Order
          </p>
          <div className="space-y-2">
            {allSlots.map((slot, i) => {
              const cost = getSlotCost(slot);
              const sitterName =
                allSitters.find((s) => s.id === slot.sitterId)?.name ??
                "Sitter";
              const d = new Date(`${slot.date}T12:00:00`);
              const dayLabel = d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              return (
                <div
                  key={`${slot.service}-${slot.date}-${i}`}
                  className="flex items-start justify-between gap-2 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium leading-tight">{slot.service}</p>
                    <p className="text-indigo-300 text-xs">
                      {dayLabel} · {slot.startTime}–{slot.endTime} ·{" "}
                      {sitterName}
                    </p>
                  </div>
                  <span className="font-semibold shrink-0">
                    ${cost.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-indigo-800 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-indigo-300">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {bundleDiscount > 0 && (
              <div className="flex justify-between text-sm text-emerald-400">
                <span>Bundle discount (10%)</span>
                <span>-${bundleDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1 border-t border-indigo-800">
              <span>Total</span>
              <span className="text-amber-400">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
          {allSlots.length >= 3 && (
            <p className="text-xs text-emerald-400 text-center">
              🎉 Bundle discount applied!
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface PetFormState {
  _id: number;
  petName: string;
  petType: string;
  breed: string;
  petNotes: string;
}

export default function SitterDetailPage({ sitterId, navigate }: Props) {
  const { data: sitter, isLoading } = useSitterProfile(sitterId);
  const { data: allSitters = [] } = useActiveSitters();
  const createBooking = useCreateBooking();

  const [step, setStep] = useState(0);
  const [confirmedBooking, setConfirmedBooking] = useState<Public__4 | null>(
    null,
  );

  // Step 1: Services
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  // Step 2: Team
  const [selectedSitterIds, setSelectedSitterIds] = useState<bigint[]>([
    sitterId,
  ]);
  // Step 3: Dates
  const [serviceSchedule, setServiceSchedule] = useState<DayServiceSchedule[]>(
    [],
  );
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("17:00");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<string>("weekly");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [serviceLocation, setServiceLocation] = useState<"onsite" | "pickup">(
    "onsite",
  );
  // Step 4: Pets
  const [pets, setPets] = useState<PetFormState[]>([
    { _id: 0, petName: "", petType: "", breed: "", petNotes: "" },
  ]);
  const petIdCounter = React.useRef(1);
  const [addingPet, setAddingPet] = useState(false);
  const [newPet, setNewPet] = useState<PetFormState>({
    _id: -1,
    petName: "",
    petType: "",
    breed: "",
    petNotes: "",
  });
  const [notes, setNotes] = useState("");
  // Step 5: Contact
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calcDays = () => {
    if (!startDate || !endDate) return 1;
    return Math.max(
      1,
      Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          86400000,
      ),
    );
  };

  const totalCost = sitter
    ? Number(sitter.hourlyRate) * calcDays() * selectedSitterIds.length
    : 0;

  const toggleService = (name: string) => {
    setSelectedServices((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name],
    );
  };

  const toggleSitter = (id: bigint) => {
    if (id === sitterId) return;
    setSelectedSitterIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const removePet = (idx: number) => {
    setPets((prev) => prev.filter((_, i) => i !== idx));
  };

  const addNewPet = () => {
    if (!newPet.petName || !newPet.petType) return;
    const id = petIdCounter.current++;
    setPets((prev) => [...prev, { ...newPet, _id: id }]);
    setNewPet({ _id: -1, petName: "", petType: "", breed: "", petNotes: "" });
    setAddingPet(false);
  };

  const updatePet = (idx: number, field: keyof PetFormState, val: string) => {
    setPets((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p)),
    );
  };

  const handleSubmit = async () => {
    if (!sitter) return;
    try {
      const startNs =
        BigInt(new Date(`${startDate}T${startTime}`).getTime()) * 1_000_000n;
      const endNs =
        BigInt(new Date(`${endDate}T${endTime}`).getTime()) * 1_000_000n;
      const recEndNs = recurrenceEndDate
        ? BigInt(new Date(recurrenceEndDate).getTime()) * 1_000_000n
        : undefined;

      const mappedPets: Pet[] = pets.map((p) => ({
        petName: p.petName,
        petType: p.petType,
        breed: p.breed || undefined,
        petNotes: p.petNotes || undefined,
      }));

      // Derive services from schedule (backward compat) or use selectedServices
      const scheduleServices =
        serviceSchedule.length > 0
          ? [
              ...new Set(
                serviceSchedule.flatMap((d) => d.slots.map((s) => s.service)),
              ),
            ]
          : selectedServices;
      const booking = await createBooking.mutateAsync({
        sitterIds: selectedSitterIds,
        services: scheduleServices,
        serviceSchedule:
          serviceSchedule.length > 0 ? serviceSchedule : undefined,
        startDate: startNs,
        endDate: endNs,
        pets: mappedPets,
        clientName,
        clientEmail,
        clientPhone,
        notes:
          `[Location: ${serviceLocation === "onsite" ? "At My Home" : "Sitter Picks Up"}] ${notes}`.trim(),
        isRecurring,
        recurrencePattern: isRecurring
          ? (recurrencePattern as RecurrencePattern)
          : undefined,
        recurrenceEndDate: isRecurring ? recEndNs : undefined,
      });
      setConfirmedBooking(booking);
      setStep(7);
    } catch {
      toast.error("Failed to submit booking. Please try again.");
    }
  };

  const validPets = pets.filter((p) => p.petName && p.petType);

  const canNext = () => {
    if (step === 1) return selectedServices.length > 0;
    if (step === 3) return !!startDate && !!endDate;
    if (step === 4) return validPets.length > 0;
    if (step === 5) return !!clientName && !!clientEmail && !!clientPhone;
    return true;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="w-full max-w-xl h-96 rounded-2xl" />
      </div>
    );
  }

  if (!sitter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Sitter not found.</p>
      </div>
    );
  }

  const otherSitters = (allSitters as Public[]).filter(
    (s) => s.id !== sitterId && s.isActive,
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("home")}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="font-display font-semibold">{sitter.name}</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {step < 7 && (
          <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
            {STEPS.map((label, idx) => (
              <div key={label} className="flex items-center gap-1 shrink-0">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                    idx < step
                      ? "bg-primary text-primary-foreground"
                      : idx === step
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {idx < step ? <Check size={12} /> : idx + 1}
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-6 h-0.5",
                      idx < step ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-card rounded-2xl border border-border shadow-xs p-6 md:p-8">
          {/* Step 0: Sitter profile */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-bold">
                Meet Your Sitter
              </h2>
              <div className="flex gap-5 items-start">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                  {sitter.photoUrl ? (
                    <img
                      src={sitter.photoUrl}
                      alt={sitter.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-violet-700 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white font-display">
                        {sitter.name[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {sitter.name}
                  </h3>
                  {sitter.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                      <MapPin size={12} />
                      {sitter.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={13}
                        className={
                          i <= Math.round(sitter.rating)
                            ? "fill-accent text-accent"
                            : "text-muted-foreground"
                        }
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">
                      ({Number(sitter.reviewCount)})
                    </span>
                  </div>
                  <p className="font-display font-bold text-2xl mt-2">
                    ${Number(sitter.hourlyRate)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /day
                    </span>
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {sitter.bio ||
                  "Passionate pet lover ready to care for your furry family."}
              </p>
              <div>
                <p className="text-sm font-semibold mb-2">Services offered</p>
                <div className="flex flex-wrap gap-2">
                  {sitter.services.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground border border-primary/20"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Services */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-bold">
                  Select Services
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Choose one or more services
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ALL_SERVICES.map((svc) => {
                  const sel = selectedServices.includes(svc.name);
                  return (
                    <button
                      key={svc.name}
                      type="button"
                      onClick={() => toggleService(svc.name)}
                      className={cn(
                        "relative flex flex-col items-center text-center gap-1.5 p-3 rounded-xl border-2 transition-all min-h-[80px] justify-center",
                        sel
                          ? "border-primary bg-primary/8 shadow-xs"
                          : "border-border bg-card hover:border-primary/40",
                      )}
                    >
                      {sel && (
                        <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check
                            size={10}
                            className="text-primary-foreground"
                          />
                        </span>
                      )}
                      <span className="text-2xl">{svc.emoji}</span>
                      <span
                        className={cn(
                          "text-xs font-semibold leading-tight",
                          sel ? "text-primary" : "text-foreground",
                        )}
                      >
                        {svc.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedServices.length > 0 && (
                <p className="text-sm text-primary font-medium">
                  Selected: {selectedServices.join(", ")}
                </p>
              )}
            </div>
          )}

          {/* Step 2: Team */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-bold">
                  Your Care Team
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {sitter.name} is your primary sitter. Add more if needed.
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-primary bg-primary/5">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  {sitter.photoUrl ? (
                    <img
                      src={sitter.photoUrl}
                      alt={sitter.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center">
                      <span className="text-white font-bold">
                        {sitter.name[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{sitter.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {sitter.location}
                  </p>
                </div>
                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                  Primary
                </span>
              </div>
              {otherSitters.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Add more sitters (optional)
                  </p>
                  {otherSitters.map((s) => {
                    const sel = selectedSitterIds.includes(s.id);
                    return (
                      <button
                        key={s.id.toString()}
                        type="button"
                        onClick={() => toggleSitter(s.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                          sel
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40",
                        )}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-secondary flex items-center justify-center">
                          {s.photoUrl ? (
                            <img
                              src={s.photoUrl}
                              alt={s.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-secondary-foreground font-bold">
                              {s.name[0]}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{s.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.location} · ${Number(s.hourlyRate)}/day
                          </p>
                        </div>
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                            sel ? "border-primary bg-primary" : "border-border",
                          )}
                        >
                          {sel && (
                            <Check
                              size={11}
                              className="text-primary-foreground"
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground bg-muted/40 rounded-xl p-4 text-center">
                  <Users size={20} className="mx-auto mb-1 opacity-50" />
                  No other active sitters available
                </p>
              )}
            </div>
          )}

          {/* Step 3: Schedule & Services */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold">
                  Schedule &amp; Services
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Set dates and build your daily service schedule
                </p>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date & Time Card */}
                <div className="rounded-2xl border border-border bg-muted/30 p-4 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CalendarDays size={16} className="text-primary" />
                    Start Date &amp; Time
                  </div>
                  <DatePicker
                    value={startDate}
                    onChange={(iso) => {
                      setStartDate(iso);
                      if (endDate && endDate < iso) setEndDate("");
                      setServiceSchedule([]);
                    }}
                    placeholder="Pick start date"
                    disabled={(d) => d < today}
                    ocid="booking.start_date.button"
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-input rounded-xl bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    style={{ fontSize: "16px", minHeight: "52px" }}
                    aria-label="Start time"
                  />
                </div>
                {/* End Date & Time Card */}
                <div className="rounded-2xl border border-border bg-muted/30 p-4 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CalendarDays size={16} className="text-primary" />
                    End Date &amp; Time
                  </div>
                  <DatePicker
                    value={endDate}
                    onChange={(iso) => {
                      setEndDate(iso);
                      setServiceSchedule([]);
                    }}
                    placeholder="Pick end date"
                    disabled={(d) => {
                      if (d < today) return true;
                      if (startDate && d < new Date(`${startDate}T12:00:00`))
                        return true;
                      return false;
                    }}
                    ocid="booking.end_date.button"
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-input rounded-xl bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    style={{ fontSize: "16px", minHeight: "52px" }}
                    aria-label="End time"
                  />
                </div>
              </div>

              {/* Service Location Toggle */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Service Location
                </Label>
                <div className="flex rounded-xl border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setServiceLocation("onsite")}
                    data-ocid="booking.onsite.toggle"
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                      serviceLocation === "onsite"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Home size={16} />
                    At My Home
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceLocation("pickup")}
                    data-ocid="booking.pickup.toggle"
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-l border-border ${
                      serviceLocation === "pickup"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Car size={16} />
                    Sitter Picks Up
                  </button>
                </div>
              </div>

              {/* Day-by-Day Service Scheduler */}
              {startDate && endDate && (
                <DayServiceScheduler
                  startDate={startDate}
                  endDate={endDate}
                  selectedServices={selectedServices}
                  selectedSitterIds={selectedSitterIds}
                  allSitters={allSitters as Public[]}
                  sitter={sitter}
                  serviceSchedule={serviceSchedule}
                  onScheduleChange={setServiceSchedule}
                />
              )}

              {/* Recurring */}
              <div className="border border-border rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm flex items-center gap-2">
                      <RefreshCw size={15} className="text-primary" /> Recurring
                      Booking
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Schedule this to repeat automatically
                    </p>
                  </div>
                  <Switch
                    checked={isRecurring}
                    onCheckedChange={setIsRecurring}
                  />
                </div>
                {isRecurring && (
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div className="space-y-2">
                      <Label>Repeat Every</Label>
                      <Select
                        value={recurrencePattern}
                        onValueChange={setRecurrencePattern}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">
                            Every 2 Weeks
                          </SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Recurring Until (optional)</Label>
                      <DatePicker
                        value={recurrenceEndDate}
                        onChange={setRecurrenceEndDate}
                        placeholder="No end date"
                        disabled={(d) => d < today}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Pets */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-bold">Your Pets</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Add all pets that need care
                </p>
              </div>

              {/* Existing pets */}
              {pets.map((pet, idx) => (
                <div
                  key={pet._id}
                  className="border border-border rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">
                      {pet.petName || `Pet ${idx + 1}`}
                      {pet.petType && (
                        <span className="text-muted-foreground font-normal">
                          {" "}
                          · {pet.petType}
                        </span>
                      )}
                    </p>
                    {pets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePet(idx)}
                        className="text-destructive hover:bg-destructive/10 rounded-full p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Name *</Label>
                      <Input
                        value={pet.petName}
                        onChange={(e) =>
                          updatePet(idx, "petName", e.target.value)
                        }
                        placeholder="e.g. Buddy"
                        className="rounded-lg h-10"
                        data-ocid="booking.pet_name.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Type *</Label>
                      <Select
                        value={pet.petType}
                        onValueChange={(v) => updatePet(idx, "petType", v)}
                      >
                        <SelectTrigger
                          className="rounded-lg h-10"
                          data-ocid="booking.pet_type.select"
                        >
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {PET_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Breed (optional)</Label>
                      <Input
                        value={pet.breed}
                        onChange={(e) =>
                          updatePet(idx, "breed", e.target.value)
                        }
                        placeholder="e.g. Golden Retriever"
                        className="rounded-lg h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Notes (optional)</Label>
                      <Input
                        value={pet.petNotes}
                        onChange={(e) =>
                          updatePet(idx, "petNotes", e.target.value)
                        }
                        placeholder="e.g. needs medication"
                        className="rounded-lg h-10"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add pet form */}
              {addingPet ? (
                <div className="border border-dashed border-primary/40 rounded-xl p-4 space-y-3">
                  <p className="font-semibold text-sm">New Pet</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Name *</Label>
                      <Input
                        value={newPet.petName}
                        onChange={(e) =>
                          setNewPet((p) => ({ ...p, petName: e.target.value }))
                        }
                        placeholder="e.g. Luna"
                        className="rounded-lg h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Type *</Label>
                      <Select
                        value={newPet.petType}
                        onValueChange={(v) =>
                          setNewPet((p) => ({ ...p, petType: v }))
                        }
                      >
                        <SelectTrigger className="rounded-lg h-10">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {PET_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Breed (optional)</Label>
                      <Input
                        value={newPet.breed}
                        onChange={(e) =>
                          setNewPet((p) => ({ ...p, breed: e.target.value }))
                        }
                        placeholder="Breed..."
                        className="rounded-lg h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Notes (optional)</Label>
                      <Input
                        value={newPet.petNotes}
                        onChange={(e) =>
                          setNewPet((p) => ({ ...p, petNotes: e.target.value }))
                        }
                        placeholder="Notes..."
                        className="rounded-lg h-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="rounded-full bg-primary text-primary-foreground"
                      onClick={addNewPet}
                      disabled={!newPet.petName || !newPet.petType}
                    >
                      <Check size={14} className="mr-1" /> Add Pet
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full"
                      onClick={() => setAddingPet(false)}
                    >
                      <X size={14} className="mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl border-dashed border-primary/40 text-primary hover:bg-primary/5"
                  onClick={() => setAddingPet(true)}
                >
                  <Plus size={16} className="mr-2" /> Add Another Pet
                </Button>
              )}

              <div className="space-y-2">
                <Label>Special Instructions</Label>
                <Textarea
                  data-ocid="booking.notes.textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dietary needs, medications, favourite toys..."
                  className="rounded-lg resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 5: Contact */}
          {step === 5 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-bold">
                Your Contact Info
              </h2>
              <p className="text-muted-foreground text-sm">
                No account needed. We'll use this to update you on your booking.
              </p>
              <div className="space-y-2">
                <Label htmlFor="cname">Full Name *</Label>
                <Input
                  data-ocid="booking.name.input"
                  id="cname"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Jane Smith"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cemail">Email Address *</Label>
                <Input
                  data-ocid="booking.email.input"
                  id="cemail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cphone">Phone Number *</Label>
                <Input
                  data-ocid="booking.phone.input"
                  id="cphone"
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-bold">
                Review Your Booking
              </h2>
              <div className="bg-muted/40 rounded-xl p-4 space-y-3 text-sm">
                {[
                  [
                    "Sitter(s)",
                    `${sitter.name}${selectedSitterIds.length > 1 ? ` + ${selectedSitterIds.length - 1} more` : ""}`,
                  ],
                  ["Services", selectedServices.join(", ")],
                  [
                    "Dates & Times",
                    `${startDate ? format(new Date(`${startDate}T${startTime}`), "MMM d, yyyy h:mm a") : ""} → ${endDate ? format(new Date(`${endDate}T${endTime}`), "MMM d, yyyy h:mm a") : ""}`,
                  ],
                  [
                    "Recurring",
                    isRecurring
                      ? `Yes, ${recurrencePattern}`
                      : "One-time booking",
                  ],
                  [
                    "Pets",
                    validPets
                      .map((p) => `${p.petName} (${p.petType})`)
                      .join(", "),
                  ],
                  ["Contact", `${clientName} · ${clientEmail}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <span className="text-muted-foreground shrink-0">
                      {label}
                    </span>
                    <span className="font-medium text-right">{value}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-3 flex justify-between text-base">
                  <span className="font-bold">Estimated Total</span>
                  <span className="font-bold text-primary">${totalCost}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Success */}
          {step === 7 && confirmedBooking && (
            <div
              data-ocid="booking.success_state"
              className="text-center space-y-5 py-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <Check size={28} className="text-emerald-600" />
              </div>
              <h2 className="font-display text-2xl font-bold">
                Booking Confirmed!
              </h2>
              <p className="text-muted-foreground">
                Your booking has been submitted. Use your email to track the
                status anytime.
              </p>
              <div className="bg-muted/40 rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Booking ID</p>
                <p className="font-display font-bold text-2xl text-primary mt-0.5">
                  #{confirmedBooking.id.toString()}
                </p>
                <div className="mt-2">
                  <StatusBadge status={confirmedBooking.status as string} />
                </div>
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  data-ocid="confirmation.home.button"
                  onClick={() => navigate("home")}
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Back to Home
                </Button>
                <Button
                  data-ocid="confirmation.lookup.button"
                  variant="outline"
                  onClick={() => navigate("booking-lookup")}
                  className="rounded-full border-primary text-primary"
                >
                  Track Booking
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < 7 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() =>
                  step === 0 ? navigate("home") : setStep((s) => s - 1)
                }
                className="rounded-full border-border hover:bg-muted"
              >
                <ArrowLeft size={16} className="mr-1" />
                {step === 0 ? "Home" : "Back"}
              </Button>
              {step < 6 ? (
                <Button
                  data-ocid="booking.next.button"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canNext()}
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Continue <ArrowRight size={16} className="ml-1" />
                </Button>
              ) : (
                <Button
                  data-ocid="booking.submit_button"
                  onClick={handleSubmit}
                  disabled={createBooking.isPending}
                  className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold"
                >
                  {createBooking.isPending ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <PawPrint size={15} className="mr-1.5" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
