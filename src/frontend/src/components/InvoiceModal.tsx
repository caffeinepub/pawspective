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
import { CheckCircle2, Loader2, Printer } from "lucide-react";
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

function formatDate(ts: bigint): string {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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
    const avgRate = (r1 + r2) / 2;
    return (avgRate + 10) * days;
  }

  const s = allSitters.find((s) => ids.length > 0 && s.id === ids[0]);
  const rate = s ? Number(s.hourlyRate) : 0;
  return rate * days;
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

  // Sync amount when payment loads or modal opens
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

  const handlePrint = () => {
    window.print();
  };

  const invoiceDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <style>{`
        @media print {
          body > *:not(#invoice-print-root) { display: none !important; }
          #invoice-print-root { display: block !important; }
          [data-radix-popper-content-wrapper] { position: static !important; }
          .no-print { display: none !important; }
          #invoice-content {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent
          id="invoice-print-root"
          className="max-w-2xl max-h-[90vh] overflow-y-auto p-0"
        >
          <DialogHeader className="no-print sr-only">
            <DialogTitle>Invoice #{booking.id.toString()}</DialogTitle>
          </DialogHeader>

          {/* Invoice Content */}
          <div id="invoice-content" className="bg-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 text-white px-8 py-7">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🐾</span>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Pawspective
                    </h1>
                    <p className="text-indigo-200 text-sm">
                      Professional Pet Care Services
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-indigo-200 text-xs uppercase tracking-widest mb-1">
                    Invoice
                  </p>
                  <p className="text-white font-bold text-lg">
                    #{booking.id.toString()}
                  </p>
                  {isPaid && (
                    <span className="inline-flex items-center gap-1 mt-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 rounded-full px-2 py-0.5 text-xs font-semibold">
                      <CheckCircle2 size={11} /> PAID
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Meta row */}
            <div className="px-8 py-5 grid grid-cols-3 gap-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  Date Issued
                </p>
                <p className="text-gray-800 font-medium text-sm">
                  {invoiceDate}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  Service Period
                </p>
                <p className="text-gray-800 font-medium text-sm">
                  {formatDate(booking.startDate)} –{" "}
                  {formatDate(booking.endDate)}
                </p>
                <p className="text-gray-400 text-xs">
                  {days} day{days !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  Status
                </p>
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
            </div>

            {/* Bill To / Provided By */}
            <div className="px-8 py-5 grid grid-cols-2 gap-6 border-b border-gray-100">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  Bill To
                </p>
                <p className="font-semibold text-gray-800">
                  {booking.clientName}
                </p>
                <p className="text-gray-500 text-sm">{booking.clientEmail}</p>
                {booking.clientPhone && (
                  <p className="text-gray-500 text-sm">{booking.clientPhone}</p>
                )}
              </div>
              <div className="bg-indigo-50 rounded-xl p-4">
                <p className="text-xs text-indigo-400 uppercase tracking-wide mb-2">
                  Services Provided By
                </p>
                <p className="font-semibold text-indigo-800">{sitterName}</p>
                {twoSitters && (
                  <p className="text-indigo-400 text-xs mt-1">
                    2-sitter booking
                  </p>
                )}
              </div>
            </div>

            {/* Services Table */}
            <div className="px-8 py-5 border-b border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
                Services
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-gray-400 font-medium pb-2 text-xs uppercase tracking-wide">
                      Service
                    </th>
                    <th className="text-left text-gray-400 font-medium pb-2 text-xs uppercase tracking-wide">
                      Pets
                    </th>
                    <th className="text-right text-gray-400 font-medium pb-2 text-xs uppercase tracking-wide">
                      Days
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(booking.services?.length > 0
                    ? booking.services
                    : ["General Care"]
                  ).map((svc) => (
                    <tr key={svc} className="border-b border-gray-50">
                      <td className="py-2.5 text-gray-700 font-medium">
                        {svc}
                      </td>
                      <td className="py-2.5 text-gray-500">
                        {booking.pets?.length > 0
                          ? booking.pets.map((p) => p.petName).join(", ")
                          : "—"}
                      </td>
                      <td className="py-2.5 text-right text-gray-600">
                        {days}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {twoSitters && (
                <p className="text-xs text-indigo-500 mt-3 italic">
                  2-sitter rate: average of both sitters' daily rates + $10/day
                </p>
              )}
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="px-8 py-4 border-b border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">
                  Notes
                </p>
                <p className="text-gray-600 text-sm bg-amber-50 border border-amber-100 rounded-lg p-3">
                  {booking.notes}
                </p>
              </div>
            )}

            {/* Total + Payment Method */}
            <div className="px-8 py-6">
              <div className="flex items-end justify-between gap-8">
                <div className="flex-1 no-print">
                  {!isPaid && (
                    <div className="space-y-3">
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
                            className="rounded-lg max-w-xs"
                          />
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">
                          Payment Method
                        </Label>
                        <Select value={payMethod} onValueChange={setPayMethod}>
                          <SelectTrigger className="rounded-lg max-w-xs">
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
                    </div>
                  )}
                  {isPaid && payment?.notes && (
                    <p className="text-sm text-gray-500">
                      Paid via{" "}
                      <span className="font-medium text-gray-700">
                        {payment.notes}
                      </span>
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Total Due
                  </p>
                  <p className="text-3xl font-bold text-indigo-700">
                    $
                    {displayAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 mt-6 no-print">
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
                  onClick={handlePrint}
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

            {/* Footer */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-gray-400 text-xs">
                Thank you for choosing Pawspective · pawspective.com
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
