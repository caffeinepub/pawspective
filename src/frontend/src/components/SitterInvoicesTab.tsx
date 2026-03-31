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
import { CheckCircle2, DollarSign, FileText, Printer, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Public, Public__3, Public__4 } from "../backend.d";
import { PaymentStatus } from "../backend.d";
import { useAllPayments } from "../hooks/useQueries";
import InvoiceModal from "./InvoiceModal";

function formatDate(ts: bigint): string {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

interface Props {
  bookings: Public__4[];
  allSitters: Public[];
  sitterName: string;
}

export default function SitterInvoicesTab({
  bookings,
  allSitters,
  sitterName,
}: Props) {
  const { data: allPayments = [], isLoading } = useAllPayments();

  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">(
    "all",
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Public__4 | null>(
    null,
  );

  const paymentMap = useMemo(() => {
    const map = new Map<string, Public__3>();
    for (const p of allPayments as Public__3[]) {
      map.set(p.bookingId.toString(), p);
    }
    return map;
  }, [allPayments]);

  const invoiceItems = useMemo(() => {
    return bookings
      .filter((b) => (b.status as string) !== "cancelled")
      .map((b) => {
        const payment = paymentMap.get(b.id.toString()) ?? null;
        const isPaid = payment?.status === PaymentStatus.paid;
        const total = payment
          ? Number(payment.totalAmount) / 100
          : calcSuggestedTotal(b, allSitters);
        const payMethod = payment?.notes ?? null;
        return { booking: b, payment, isPaid, total, payMethod };
      });
  }, [bookings, paymentMap, allSitters]);

  const summary = useMemo(() => {
    const paid = invoiceItems.filter((i) => i.isPaid);
    const unpaid = invoiceItems.filter((i) => !i.isPaid);
    return {
      totalPaid: paid.reduce((sum, i) => sum + i.total, 0),
      totalOutstanding: unpaid.reduce((sum, i) => sum + i.total, 0),
      countTotal: invoiceItems.length,
      countPaid: paid.length,
      countUnpaid: unpaid.length,
    };
  }, [invoiceItems]);

  const filteredItems = useMemo(() => {
    return invoiceItems.filter((item) => {
      if (statusFilter === "paid" && !item.isPaid) return false;
      if (statusFilter === "unpaid" && item.isPaid) return false;
      const bookingDate = new Date(Number(item.booking.startDate / 1_000_000n));
      if (dateFrom && bookingDate < new Date(dateFrom)) return false;
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59);
        if (bookingDate > to) return false;
      }
      return true;
    });
  }, [invoiceItems, statusFilter, dateFrom, dateTo]);

  const hasFilters = statusFilter !== "all" || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
              Total Paid
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">
            ${formatCurrency(summary.totalPaid)}
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            {summary.countPaid} invoice{summary.countPaid !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={15} className="text-amber-600" />
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
              Outstanding
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-700">
            ${formatCurrency(summary.totalOutstanding)}
          </p>
          <p className="text-xs text-amber-600 mt-1">
            {summary.countUnpaid} invoice
            {summary.countUnpaid !== 1 ? "s" : ""} pending
          </p>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={15} className="text-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
              All Invoices
            </span>
          </div>
          <p className="text-2xl font-bold text-indigo-700">
            {summary.countTotal}
          </p>
          <p className="text-xs text-indigo-600 mt-1">Across all bookings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={statusFilter}
            onValueChange={(v) =>
              setStatusFilter(v as "all" | "paid" | "unpaid")
            }
          >
            <SelectTrigger className="rounded-full h-9 text-sm w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-full h-9 text-sm w-40"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-full h-9 text-sm w-40"
          />
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-xs self-end gap-1 text-muted-foreground"
            onClick={() => {
              setStatusFilter("all");
              setDateFrom("");
              setDateTo("");
            }}
          >
            <X size={12} /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {["sk-a", "sk-b", "sk-c"].map((k) => (
            <div
              key={k}
              className="h-14 bg-muted/30 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border">
          <div className="text-3xl mb-2">🧾</div>
          <p className="text-muted-foreground text-sm">
            {invoiceItems.length === 0
              ? "No invoices yet — they'll appear here once you have bookings."
              : "No invoices match your filters."}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
          {/* Desktop header */}
          <div className="hidden sm:grid grid-cols-[1.2fr_1fr_1.2fr_0.8fr_auto_auto_auto] gap-3 px-5 py-3 bg-muted/40 border-b border-border">
            {["Date", "Client", "Service", "Pets", "Total", "Status", ""].map(
              (h) => (
                <span
                  key={h}
                  className="text-xs font-bold text-muted-foreground uppercase tracking-wide"
                >
                  {h}
                </span>
              ),
            )}
          </div>

          <div className="divide-y divide-border">
            {filteredItems.map((item) => (
              <button
                key={item.booking.id.toString()}
                type="button"
                className="w-full text-left grid grid-cols-1 sm:grid-cols-[1.2fr_1fr_1.2fr_0.8fr_auto_auto_auto] gap-2 sm:gap-3 px-5 py-4 hover:bg-muted/20 transition-colors cursor-pointer items-center"
                onClick={() => setSelectedBooking(item.booking)}
              >
                {/* Date */}
                <div>
                  <p className="text-xs text-muted-foreground sm:hidden font-semibold mb-0.5 uppercase tracking-wide">
                    Date
                  </p>
                  <p className="text-sm text-foreground">
                    {formatDate(item.booking.startDate)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    → {formatDate(item.booking.endDate)}
                  </p>
                </div>

                {/* Client */}
                <div>
                  <p className="text-xs text-muted-foreground sm:hidden font-semibold mb-0.5 uppercase tracking-wide">
                    Client
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {item.booking.clientName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.booking.clientEmail}
                  </p>
                </div>

                {/* Service */}
                <div>
                  <p className="text-xs text-muted-foreground sm:hidden font-semibold mb-0.5 uppercase tracking-wide">
                    Service
                  </p>
                  <p className="text-sm text-foreground truncate">
                    {item.booking.services?.length > 0
                      ? item.booking.services.join(", ")
                      : "General Care"}
                  </p>
                </div>

                {/* Pets */}
                <div>
                  <p className="text-xs text-muted-foreground sm:hidden font-semibold mb-0.5 uppercase tracking-wide">
                    Pets
                  </p>
                  <p className="text-sm text-foreground">
                    {item.booking.pets?.length > 0
                      ? item.booking.pets.map((p) => p.petName).join(", ")
                      : "—"}
                  </p>
                </div>

                {/* Total */}
                <div className="text-right">
                  <p className="text-xs text-muted-foreground sm:hidden font-semibold mb-0.5 uppercase tracking-wide">
                    Total
                  </p>
                  <p className="text-sm font-bold text-indigo-600">
                    ${formatCurrency(item.total)}
                  </p>
                  {item.payMethod && (
                    <p className="text-xs text-muted-foreground">
                      {item.payMethod}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  {item.isPaid ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap">
                      <CheckCircle2 size={10} /> Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap">
                      Pending
                    </span>
                  )}
                </div>

                {/* Action */}
                <div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full gap-1 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50 h-8 px-3 whitespace-nowrap"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBooking(item.booking);
                    }}
                  >
                    <Printer size={11} />
                    {item.isPaid ? "View" : "Mark Paid"}
                  </Button>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedBooking && (
        <InvoiceModal
          booking={selectedBooking}
          sitterName={sitterName}
          allSitters={allSitters}
          open={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
