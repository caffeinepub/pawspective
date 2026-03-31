import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  Heart,
  Loader2,
  PawPrint,
  Printer,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  DayServiceSchedule,
  Public,
  Public__4,
  ServiceSlot,
} from "../backend.d";
import { PaymentMethod, PaymentStatus } from "../backend.d";
import {
  useConfirmManualPayment,
  useCreatePayment,
  usePayment,
} from "../hooks/useQueries";

const PAYMENT_METHODS = [
  "Venmo",
  "Cash",
  "Apple Pay",
  "Zelle",
  "Check",
  "Other",
];

function formatDateTime(ts: bigint): string {
  return new Date(Number(ts / 1_000_000n)).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getDays(start: bigint, end: bigint): number {
  const ms = Number((end - start) / 1_000_000n);
  return Math.max(1, Math.ceil(ms / 86_400_000));
}

function calcSuggestedTotal(booking: Public__4, allSitters: Public[]): number {
  const days = getDays(booking.startDate, booking.endDate);
  const ids = booking.sitterIds ?? [];
  if (ids.length >= 2) {
    const s1 = allSitters.find((s) => s.id === ids[0]);
    const s2 = allSitters.find((s) => s.id === ids[1]);
    const r1 = s1 ? Number(s1.hourlyRate) : 0;
    const r2 = s2 ? Number(s2.hourlyRate) : 0;
    return ((r1 + r2) / 2 + 10) * days;
  }
  const s = allSitters.find((s) => ids.length > 0 && s.id === ids[0]);
  return (s ? Number(s.hourlyRate) : 0) * days;
}

function calcScheduleTotal(schedule: DayServiceSchedule[]): {
  subtotal: number;
  discount: number;
  total: number;
} {
  const allSlots: ServiceSlot[] = schedule.flatMap((d) => d.slots);
  const subtotal = allSlots.reduce((sum, slot) => {
    const hours = Number(slot.durationMinutes) / 60;
    return sum + hours * Number(slot.ratePerHour);
  }, 0);
  const discount = allSlots.length >= 3 ? subtotal * 0.1 : 0;
  return { subtotal, discount, total: subtotal - discount };
}

interface Props {
  booking: Public__4;
  sitterName: string;
  allSitters: Public[];
  open: boolean;
  onClose: () => void;
}

export default function InvoiceModal({
  booking,
  sitterName,
  allSitters,
  open,
  onClose,
}: Props) {
  const { data: payment, isLoading: paymentLoading } = usePayment(
    open ? booking.id : null,
  );
  const createPayment = useCreatePayment();
  const confirmPayment = useConfirmManualPayment();

  const isPaid = payment?.status === PaymentStatus.paid;
  const suggestedTotal = calcSuggestedTotal(booking, allSitters);
  const [amountStr, setAmountStr] = useState("");
  const [payMethod, setPayMethod] = useState("Venmo");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (payment) {
      setAmountStr((Number(payment.totalAmount) / 100).toFixed(2));
      const noteMethod = payment.notes ?? "";
      if (PAYMENT_METHODS.includes(noteMethod)) setPayMethod(noteMethod);
    } else if (open) {
      const schedule = (booking as any).serviceSchedule as
        | DayServiceSchedule[]
        | undefined;
      if (schedule && schedule.length > 0) {
        setAmountStr(calcScheduleTotal(schedule).total.toFixed(2));
      } else {
        setAmountStr(suggestedTotal.toFixed(2));
      }
    }
  }, [payment, open, suggestedTotal, booking]);

  const displayAmount = amountStr ? Number.parseFloat(amountStr) || 0 : 0;
  const days = getDays(booking.startDate, booking.endDate);
  const twoSitters = (booking.sitterIds ?? []).length >= 2;
  const invoiceNum = `PAW-${booking.id.toString().padStart(4, "0")}`;

  const invoiceDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const petsList =
    booking.pets?.length > 0
      ? booking.pets
          .map((p) => `${p.petName}${p.petType ? ` (${p.petType})` : ""}`)
          .join(", ")
      : "—";

  const servicesList =
    booking.services?.length > 0 ? booking.services.join(", ") : "General Care";

  const handleMarkPaid = async () => {
    setIsSaving(true);
    try {
      const amountCents = BigInt(Math.round(displayAmount * 100));
      if (!payment) {
        await createPayment.mutateAsync({
          bookingId: booking.id,
          method: PaymentMethod.manual,
          totalAmount: amountCents,
          notes: payMethod,
          splits: [],
        });
      }
      await confirmPayment.mutateAsync(booking.id);
      toast.success("Invoice marked as paid!");
    } catch {
      toast.error("Failed to mark as paid.");
    } finally {
      setIsSaving(false);
    }
  };

  // Build schedule HTML for print
  const buildScheduleHtml = () => {
    const schedule = (booking as any).serviceSchedule as
      | DayServiceSchedule[]
      | undefined;
    if (schedule && schedule.length > 0) {
      const { subtotal, discount } = calcScheduleTotal(schedule);
      const rows = schedule
        .map((day) => {
          const d = new Date(`${day.date}T12:00:00`);
          const dayLabel = d.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          });
          const slotRows = day.slots
            .map((slot: ServiceSlot) => {
              const hours = Number(slot.durationMinutes) / 60;
              const cost = hours * Number(slot.ratePerHour);
              const sitterObj = allSitters.find((s) => s.id === slot.sitterId);
              return `
            <tr>
              <td style="padding:10px 12px;font-size:13px;color:#1e1b4b;font-weight:500;">${slot.service}</td>
              <td style="padding:10px 12px;font-size:12px;color:#6b7280;">${sitterObj?.name ?? "Sitter"}</td>
              <td style="padding:10px 12px;font-size:12px;color:#6b7280;white-space:nowrap;">${slot.startTime}&ndash;${slot.endTime}</td>
              <td style="padding:10px 12px;font-size:13px;color:#1e1b4b;font-weight:600;text-align:right;">$${cost.toFixed(2)}</td>
            </tr>`;
            })
            .join("");
          return `
          <div style="margin-bottom:20px;">
            <div style="font-size:11px;font-weight:700;color:#4338ca;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #e0e7ff;">${dayLabel}</div>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#f5f3ff;">
                  <th style="padding:7px 12px;font-size:10px;color:#7c3aed;text-transform:uppercase;letter-spacing:0.06em;text-align:left;">Service</th>
                  <th style="padding:7px 12px;font-size:10px;color:#7c3aed;text-transform:uppercase;letter-spacing:0.06em;text-align:left;">Sitter</th>
                  <th style="padding:7px 12px;font-size:10px;color:#7c3aed;text-transform:uppercase;letter-spacing:0.06em;text-align:left;">Time</th>
                  <th style="padding:7px 12px;font-size:10px;color:#7c3aed;text-transform:uppercase;letter-spacing:0.06em;text-align:right;">Amount</th>
                </tr>
              </thead>
              <tbody>${slotRows}</tbody>
            </table>
          </div>`;
        })
        .join("");
      const discountRow =
        discount > 0
          ? `
        <tr>
          <td colspan="3" style="padding:6px 12px;font-size:12px;color:#059669;">Bundle Discount (10% off)</td>
          <td style="padding:6px 12px;font-size:12px;color:#059669;text-align:right;">-$${discount.toFixed(2)}</td>
        </tr>`
          : "";
      return `
        ${rows}
        <table style="width:100%;border-collapse:collapse;border-top:2px solid #e0e7ff;margin-top:8px;">
          <tbody>
            <tr style="background:#fafafa;">
              <td colspan="3" style="padding:8px 12px;font-size:12px;color:#6b7280;">Subtotal</td>
              <td style="padding:8px 12px;font-size:12px;color:#1e1b4b;text-align:right;">$${subtotal.toFixed(2)}</td>
            </tr>
            ${discountRow}
          </tbody>
        </table>`;
    }
    // Fallback simple table
    return `
      <table style="width:100%;border-collapse:collapse;">
        <tbody>
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:10px 0;font-size:13px;color:#6b7280;font-weight:500;">Service Period</td>
            <td style="padding:10px 0;font-size:13px;color:#1e1b4b;text-align:right;">${formatDateTime(booking.startDate)} &ndash; ${formatDateTime(booking.endDate)}</td>
          </tr>
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:10px 0;font-size:13px;color:#6b7280;font-weight:500;">Duration</td>
            <td style="padding:10px 0;font-size:13px;color:#1e1b4b;text-align:right;">${days} day${days !== 1 ? "s" : ""}</td>
          </tr>
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:10px 0;font-size:13px;color:#6b7280;font-weight:500;">Services</td>
            <td style="padding:10px 0;font-size:13px;color:#1e1b4b;text-align:right;">${servicesList}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;font-size:13px;color:#6b7280;font-weight:500;">Pets</td>
            <td style="padding:10px 0;font-size:13px;color:#1e1b4b;text-align:right;">${petsList}</td>
          </tr>
          ${twoSitters ? `<tr><td colspan="2" style="padding:8px 0 0;font-size:11px;color:#7c3aed;font-style:italic;">* 2-sitter rate: average of both sitters&rsquo; rates + $10/day</td></tr>` : ""}
        </tbody>
      </table>`;
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=850,height=1100");
    if (!printWindow) return;

    const paidBadgeHtml = isPaid
      ? `
      <div style="position:absolute;top:28px;right:28px;transform:rotate(8deg);">
        <div style="border:3px solid #059669;border-radius:8px;padding:6px 16px;color:#059669;font-size:20px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;opacity:0.85;">PAID ✓</div>
      </div>`
      : "";

    const paymentConfirmHtml =
      isPaid && payment?.notes
        ? `
      <div style="margin-top:12px;display:flex;align-items:center;gap:8px;">
        <span style="width:18px;height:18px;background:#059669;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:white;font-size:11px;flex-shrink:0;">✓</span>
        <span style="font-size:13px;color:#374151;">Payment received via <strong>${payment.notes}</strong></span>
      </div>`
        : "";

    const scheduleHtml = buildScheduleHtml();

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoiceNum} — Pawspective</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: white; color: #111; }
    @page { size: A4 portrait; margin: 0; }
  </style>
</head>
<body>
<div style="width:100%;min-height:100vh;background:white;font-family:'Inter',-apple-system,sans-serif;">

  <!-- HEADER -->
  <div style="background:linear-gradient(135deg,#4338ca 0%,#6d28d9 60%,#7c3aed 100%);padding:44px 48px 40px;position:relative;overflow:hidden;">
    <!-- decorative circles -->
    <div style="position:absolute;right:-40px;top:-40px;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,0.07);"></div>
    <div style="position:absolute;right:80px;bottom:-50px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.05);"></div>
    <div style="display:flex;align-items:flex-start;justify-content:space-between;position:relative;">
      <!-- brand -->
      <div style="display:flex;align-items:center;gap:14px;">
        <div style="width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;">🐾</div>
        <div>
          <div style="font-size:24px;font-weight:800;color:white;letter-spacing:-0.5px;">Pawspective</div>
          <div style="font-size:12px;color:rgba(199,210,254,0.9);margin-top:3px;letter-spacing:0.02em;">Professional Pet Care Services</div>
        </div>
      </div>
      <!-- invoice info -->
      <div style="text-align:right;position:relative;">
        ${paidBadgeHtml}
        <div style="font-size:11px;font-weight:600;color:rgba(199,210,254,0.8);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:4px;">Invoice</div>
        <div style="font-size:26px;font-weight:900;color:white;letter-spacing:-0.5px;">${invoiceNum}</div>
        <div style="font-size:12px;color:rgba(199,210,254,0.8);margin-top:4px;">${invoiceDate}</div>
      </div>
    </div>
  </div>

  <!-- BODY -->
  <div style="padding:0 48px 40px;">

    <!-- BILL TO / PROVIDED BY -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;overflow:hidden;margin-bottom:32px;">
      <div style="padding:22px 24px;border-right:1px solid #e5e7eb;">
        <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;">Bill To</div>
        <div style="font-size:15px;font-weight:700;color:#1e1b4b;margin-bottom:4px;">${booking.clientName}</div>
        <div style="font-size:13px;color:#6b7280;word-break:break-all;">${booking.clientEmail}</div>
        ${booking.clientPhone ? `<div style="font-size:13px;color:#6b7280;margin-top:3px;">${booking.clientPhone}</div>` : ""}
      </div>
      <div style="padding:22px 24px;background:#faf5ff;">
        <div style="font-size:10px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;">Provided By</div>
        <div style="font-size:15px;font-weight:700;color:#3730a3;margin-bottom:4px;">${sitterName}</div>
        ${twoSitters ? `<div style="font-size:12px;color:#7c3aed;margin-top:4px;">★ 2-sitter premium booking</div>` : ""}
        <div style="font-size:12px;color:#6b7280;margin-top:4px;">Pets: ${petsList}</div>
      </div>
    </div>

    <!-- SERVICES -->
    <div style="margin-bottom:28px;">
      <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:16px;">Services Provided</div>
      ${scheduleHtml}
    </div>

    <!-- TOTAL BOX -->
    <div style="background:linear-gradient(135deg,#eef2ff 0%,#f5f3ff 100%);border:1px solid #c7d2fe;border-radius:16px;padding:24px 28px;display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;">
      <div>
        <div style="font-size:11px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Total Due</div>
        <div style="font-size:38px;font-weight:900;color:#3730a3;letter-spacing:-1px;">$${displayAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        ${isPaid ? `<div style="font-size:13px;color:#059669;font-weight:600;margin-top:6px;">✓ Payment received</div>` : `<div style="font-size:12px;color:#d97706;font-weight:500;margin-top:6px;">Awaiting payment</div>`}
        ${paymentConfirmHtml}
      </div>
      ${isPaid ? `<div style="transform:rotate(8deg);"><div style="border:3px solid #059669;border-radius:10px;padding:8px 20px;color:#059669;font-size:22px;font-weight:900;letter-spacing:0.12em;opacity:0.8;">PAID ✓</div></div>` : ""}
    </div>

    <!-- THANK YOU -->
    <div style="background:linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%);border:1px solid #fde68a;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
      <div style="font-size:22px;font-weight:800;color:#92400e;margin-bottom:8px;">Thank you, ${booking.clientName}! 🐾</div>
      <div style="font-size:14px;color:#78350f;line-height:1.6;margin-bottom:12px;">Your pets are in the best hands — and we're so grateful for your trust.<br>We'd love to welcome you back and make every visit even better.</div>
      <div style="font-size:12px;color:#b45309;font-weight:500;">❤️ &nbsp;With love from your Pawspective team &nbsp;❤️</div>
    </div>

    <!-- BOOK AGAIN CTA -->
    <div style="border:2px dashed #c7d2fe;border-radius:12px;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;">
      <div>
        <div style="font-size:13px;font-weight:700;color:#3730a3;">Ready for your next visit?</div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px;">Book your next appointment with your trusted sitters</div>
      </div>
      <div style="background:#4338ca;color:white;border-radius:8px;padding:8px 18px;font-size:12px;font-weight:700;letter-spacing:0.02em;">pawspective.com</div>
    </div>

  </div>

  <!-- FOOTER -->
  <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 48px;display:flex;align-items:center;justify-content:space-between;">
    <div style="display:flex;align-items:center;gap:8px;">
      <span style="font-size:14px;">🐾</span>
      <span style="font-size:12px;font-weight:700;color:#4338ca;">Pawspective</span>
      <span style="font-size:12px;color:#9ca3af;">· Professional Pet Care</span>
    </div>
    <div style="font-size:11px;color:#9ca3af;">${invoiceNum} · Pet Care made easy</div>
  </div>

</div>
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Invoice {invoiceNum}</DialogTitle>
        </DialogHeader>

        <div className="bg-white rounded-2xl overflow-hidden">
          {/* ── Header ── */}
          <div className="relative bg-gradient-to-br from-indigo-700 via-indigo-700 to-violet-700 px-8 py-8 text-white overflow-hidden">
            <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full translate-x-16 -translate-y-16 pointer-events-none" />
            <div className="absolute right-12 bottom-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 pointer-events-none" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                  <PawPrint size={21} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight leading-tight">
                    Pawspective
                  </h1>
                  <p className="text-indigo-200 text-xs mt-0.5">
                    Professional Pet Care Services
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-indigo-300 text-[10px] uppercase tracking-widest">
                  Invoice
                </p>
                <p className="text-white font-extrabold text-2xl leading-tight">
                  {invoiceNum}
                </p>
                <p className="text-indigo-200 text-xs mt-1">{invoiceDate}</p>
                {isPaid && (
                  <span className="inline-flex items-center gap-1 mt-2 bg-emerald-400/20 border border-emerald-300/40 text-emerald-100 rounded-full px-3 py-1 text-xs font-bold">
                    <CheckCircle2 size={11} /> PAID
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Bill To / Provider ── */}
          <div className="grid grid-cols-2 gap-0 border-b border-gray-100">
            <div className="px-7 py-5 border-r border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Bill To
              </p>
              <p className="font-bold text-gray-900 text-sm leading-snug break-words">
                {booking.clientName}
              </p>
              <p className="text-gray-500 text-xs break-all mt-1">
                {booking.clientEmail}
              </p>
              {booking.clientPhone && (
                <p className="text-gray-500 text-xs mt-0.5">
                  {booking.clientPhone}
                </p>
              )}
            </div>
            <div className="px-7 py-5 bg-violet-50/60">
              <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-widest mb-2">
                Provided By
              </p>
              <p className="font-bold text-violet-900 text-sm leading-snug break-words">
                {sitterName}
              </p>
              {twoSitters && (
                <p className="text-violet-400 text-xs mt-1">
                  ★ 2-sitter premium booking
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">Pets: {petsList}</p>
            </div>
          </div>

          {/* ── Services ── */}
          <div className="px-7 py-5 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Services Provided
            </p>
            {(booking as any).serviceSchedule &&
            (booking as any).serviceSchedule.length > 0 ? (
              <div className="space-y-4">
                {((booking as any).serviceSchedule as DayServiceSchedule[]).map(
                  (day) => {
                    const d = new Date(`${day.date}T12:00:00`);
                    const dayLabel = d.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    return (
                      <div key={day.date}>
                        <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide mb-2 pb-1 border-b border-indigo-100">
                          {dayLabel}
                        </p>
                        <table className="w-full">
                          <thead>
                            <tr className="bg-violet-50/50">
                              <th className="py-1.5 px-2 text-[10px] text-violet-500 uppercase tracking-wide font-semibold text-left">
                                Service
                              </th>
                              <th className="py-1.5 px-2 text-[10px] text-violet-500 uppercase tracking-wide font-semibold text-left">
                                Sitter
                              </th>
                              <th className="py-1.5 px-2 text-[10px] text-violet-500 uppercase tracking-wide font-semibold text-left">
                                Time
                              </th>
                              <th className="py-1.5 px-2 text-[10px] text-violet-500 uppercase tracking-wide font-semibold text-right">
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {day.slots.map((slot: ServiceSlot, i: number) => {
                              const hours = Number(slot.durationMinutes) / 60;
                              const cost = hours * Number(slot.ratePerHour);
                              const sitterObj = allSitters.find(
                                (s) => s.id === slot.sitterId,
                              );
                              return (
                                <tr
                                  key={`${slot.service}-${slot.sitterId}-${i}`}
                                  className="border-b border-gray-50 last:border-0"
                                >
                                  <td className="py-2.5 px-2 text-sm text-gray-800 font-medium">
                                    {slot.service}
                                  </td>
                                  <td className="py-2.5 px-2 text-xs text-gray-500">
                                    {sitterObj?.name ?? "Sitter"}
                                  </td>
                                  <td className="py-2.5 px-2 text-xs text-gray-500 whitespace-nowrap">
                                    {slot.startTime}–{slot.endTime}
                                  </td>
                                  <td className="py-2.5 px-2 text-sm text-indigo-700 font-bold text-right">
                                    ${cost.toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  },
                )}
                {(() => {
                  const { subtotal, discount } = calcScheduleTotal(
                    (booking as any).serviceSchedule,
                  );
                  return (
                    <div className="border-t border-gray-200 pt-3 space-y-1">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600">
                          <span>Bundle discount (10%)</span>
                          <span>-${discount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-2">
                {[
                  [
                    "Service Period",
                    `${formatDateTime(booking.startDate)} – ${formatDateTime(booking.endDate)}`,
                  ],
                  ["Duration", `${days} day${days !== 1 ? "s" : ""}`],
                  ["Services", servicesList],
                  ["Pets", petsList],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-sm text-gray-500 font-medium">
                      {label}
                    </span>
                    <span className="text-sm text-gray-800 text-right max-w-[60%] break-words">
                      {value}
                    </span>
                  </div>
                ))}
                {twoSitters && (
                  <p className="text-xs text-violet-500 italic pt-1">
                    ★ 2-sitter rate: average of both sitters' rates + $10/day
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Total + Controls ── */}
          <div className="px-7 py-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 justify-between">
              {/* Editable controls */}
              <div className="space-y-3 w-full sm:max-w-xs">
                {!isPaid ? (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">
                        Invoice Total ($)
                      </Label>
                      {paymentLoading ? (
                        <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={amountStr}
                          onChange={(e) => setAmountStr(e.target.value)}
                          className="rounded-lg"
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">
                        Payment Method
                      </Label>
                      <Select value={payMethod} onValueChange={setPayMethod}>
                        <SelectTrigger className="rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  payment?.notes && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        size={16}
                        className="text-emerald-500 shrink-0"
                      />
                      <p className="text-sm text-gray-600">
                        Paid via{" "}
                        <span className="font-semibold text-gray-800">
                          {payment.notes}
                        </span>
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* Total box */}
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl px-7 py-5 text-right shrink-0">
                <p className="text-[10px] text-indigo-400 uppercase tracking-widest mb-1">
                  Total Due
                </p>
                <p className="text-4xl font-black text-indigo-700 leading-none">
                  $
                  {displayAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                {isPaid ? (
                  <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center justify-end gap-1">
                    <CheckCircle2 size={11} /> Payment received
                  </p>
                ) : (
                  <p className="text-xs text-amber-500 font-medium mt-2">
                    Awaiting payment
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-gray-400">Status:</span>
              {isPaid ? (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  <CheckCircle2 size={11} /> Paid
                </span>
              ) : (
                <Badge
                  variant="outline"
                  className="text-amber-600 border-amber-300 bg-amber-50 text-xs"
                >
                  Pending
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              {!isPaid && (
                <Button
                  onClick={handleMarkPaid}
                  disabled={isSaving || paymentLoading || displayAmount <= 0}
                  className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
                  data-ocid="invoice.submit_button"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} className="mr-2" />
                      Mark as Paid
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handlePrint}
                className="rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                data-ocid="invoice.print_button"
              >
                <Printer size={14} className="mr-2" /> Print Invoice
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="rounded-full text-gray-400"
                data-ocid="invoice.close_button"
              >
                Close
              </Button>
            </div>
          </div>

          {/* ── Thank You ── */}
          <div className="px-7 py-5 bg-gradient-to-br from-amber-50 to-yellow-50 border-b border-amber-100">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-900 text-sm">
                  Thank you, {booking.clientName}! 🐾
                </p>
                <p className="text-amber-800/80 text-xs mt-1 leading-relaxed">
                  Your pets are in great hands — and so are your bookings. We'd
                  love to see you again.
                </p>
                <p className="text-amber-600 text-xs mt-2 flex items-center gap-1">
                  <Heart size={10} className="fill-amber-400 text-amber-400" />
                  With love from your Pawspective team
                  <Heart size={10} className="fill-amber-400 text-amber-400" />
                </p>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="px-7 py-3 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PawPrint size={13} className="text-indigo-400" />
              <span className="text-xs font-bold text-indigo-600">
                Pawspective
              </span>
              <span className="text-xs text-gray-400">
                · Professional Pet Care
              </span>
            </div>
            <span className="text-xs text-gray-300">{invoiceNum}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
