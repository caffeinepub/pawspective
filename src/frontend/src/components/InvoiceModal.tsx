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
import { CheckCircle2, Loader2, PawPrint, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Public, Public__3 } from "../backend.d";
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

function calcSuggestedTotal(booking: Public__3, allSitters: Public[]): number {
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

function InvoiceRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 pr-4 text-gray-700 font-medium text-sm align-top w-1/3 break-words">
        {label}
      </td>
      <td className="py-3 text-gray-500 text-sm align-top break-words">
        {value}
      </td>
    </tr>
  );
}

interface Props {
  booking: Public__3;
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
      setAmountStr(suggestedTotal.toFixed(2));
    }
  }, [payment, open, suggestedTotal]);

  const displayAmount = amountStr ? Number.parseFloat(amountStr) || 0 : 0;
  const days = getDays(booking.startDate, booking.endDate);
  const twoSitters = (booking.sitterIds ?? []).length >= 2;
  const invoiceNum = `PAW-${booking.id.toString().padStart(4, "0")}`;

  const invoiceDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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

  const petsList =
    booking.pets?.length > 0
      ? booking.pets
          .map((p) => `${p.petName}${p.petType ? ` (${p.petType})` : ""}`)
          .join(", ")
      : "—";

  const servicesList =
    booking.services?.length > 0 ? booking.services.join(", ") : "General Care";

  return (
    <>
      <style>{`
        @media print {
          body > *:not(#invoice-print-root) { display: none !important; }
          #invoice-print-root { display: block !important; }
          .no-print { display: none !important; }
          #invoice-content { box-shadow: none !important; border: none !important; }
          @page { margin: 0.75in; }
        }
      `}</style>

      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent
          id="invoice-print-root"
          className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl"
        >
          <DialogHeader className="no-print sr-only">
            <DialogTitle>Invoice {invoiceNum}</DialogTitle>
          </DialogHeader>

          <div
            id="invoice-content"
            className="bg-white rounded-2xl overflow-hidden"
          >
            {/* ── Header band ── */}
            <div className="relative bg-indigo-700 px-8 py-8 text-white">
              {/* Decorative circle */}
              <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-600/40 rounded-full translate-x-16 -translate-y-16 pointer-events-none" />
              <div className="absolute right-12 bottom-0 w-24 h-24 bg-indigo-500/30 rounded-full translate-y-8 pointer-events-none" />

              <div className="relative flex items-start justify-between gap-4">
                {/* Brand */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                    <PawPrint size={20} className="text-white" />
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

                {/* Invoice label */}
                <div className="text-right shrink-0">
                  <p className="text-indigo-300 text-xs uppercase tracking-widest">
                    Invoice
                  </p>
                  <p className="text-white font-bold text-xl leading-tight">
                    {invoiceNum}
                  </p>
                  <p className="text-indigo-200 text-xs mt-1">{invoiceDate}</p>
                  {isPaid && (
                    <span className="inline-flex items-center gap-1 mt-2 bg-emerald-400/20 border border-emerald-300/40 text-emerald-100 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                      <CheckCircle2 size={11} /> PAID
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Bill-to / Provider row ── */}
            <div className="grid grid-cols-2 gap-0 border-b border-gray-100">
              <div className="px-8 py-5 border-r border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  Bill To
                </p>
                <p className="font-semibold text-gray-900 text-sm leading-snug break-words">
                  {booking.clientName}
                </p>
                <p className="text-gray-500 text-sm break-all mt-0.5">
                  {booking.clientEmail}
                </p>
                {booking.clientPhone && (
                  <p className="text-gray-500 text-sm mt-0.5">
                    {booking.clientPhone}
                  </p>
                )}
              </div>
              <div className="px-8 py-5 bg-indigo-50/50">
                <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mb-2">
                  Provided By
                </p>
                <p className="font-semibold text-indigo-900 text-sm leading-snug break-words">
                  {sitterName}
                </p>
                {twoSitters && (
                  <p className="text-indigo-400 text-xs mt-1">
                    2-sitter booking
                  </p>
                )}
              </div>
            </div>

            {/* ── Service details table ── */}
            <div className="px-8 py-5 border-b border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Service Details
              </p>
              <table className="w-full">
                <tbody>
                  <InvoiceRow
                    label="Drop-off"
                    value={formatDateTime(booking.startDate)}
                  />
                  <InvoiceRow
                    label="Pick-up"
                    value={formatDateTime(booking.endDate)}
                  />
                  <InvoiceRow
                    label="Duration"
                    value={`${days} day${days !== 1 ? "s" : ""}`}
                  />
                  <InvoiceRow label="Services" value={servicesList} />
                  <InvoiceRow label="Pets" value={petsList} />
                  {booking.notes ? (
                    <InvoiceRow label="Notes" value={booking.notes} />
                  ) : null}
                  {twoSitters && (
                    <tr>
                      <td colSpan={2} className="pt-3 pb-1">
                        <p className="text-xs text-indigo-500 italic">
                          2-sitter rate: average of both sitters' daily rates +
                          $10/day
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Total + payment ── */}
            <div className="px-8 py-6">
              {/* Amount & method (editable when unpaid) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 justify-between">
                <div className="no-print space-y-3 w-full sm:max-w-xs">
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
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-7 py-5 text-right shrink-0">
                  <p className="text-xs text-indigo-400 uppercase tracking-widest mb-1">
                    Total Due
                  </p>
                  <p className="text-4xl font-bold text-indigo-700 leading-none">
                    $
                    {displayAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  {isPaid && (
                    <p className="text-xs text-emerald-600 font-medium mt-2">
                      Payment received
                    </p>
                  )}
                  {!isPaid && (
                    <p className="text-xs text-amber-500 font-medium mt-2">
                      Awaiting payment
                    </p>
                  )}
                </div>
              </div>

              {/* Status badge strip */}
              <div className="mt-5 flex items-center gap-2">
                <p className="text-xs text-gray-400">Status:</p>
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

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 mt-5 no-print">
                {!isPaid && (
                  <Button
                    onClick={handleMarkPaid}
                    disabled={isSaving || paymentLoading || displayAmount <= 0}
                    className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
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
                  onClick={() => window.print()}
                  className="rounded-full"
                >
                  <Printer size={14} className="mr-2" /> Print Invoice
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="rounded-full text-gray-400 no-print"
                >
                  Close
                </Button>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between gap-4">
                <p className="text-gray-400 text-xs">
                  Thank you for choosing Pawspective
                </p>
                <p className="text-gray-300 text-xs">{invoiceNum}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
