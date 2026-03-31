import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  LogIn,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Public__2 } from "../backend.d";
import { ServiceStatus } from "../backend.d";
import {
  usePostServiceLog,
  useServiceLogs,
  useUpdateServiceLogStopTime,
} from "../hooks/useQueries";

function formatTs(ts: bigint): string {
  return new Date(Number(ts / 1_000_000n)).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const STATUS_CONFIG: Record<
  string,
  { icon: React.ReactNode; label: string; color: string }
> = {
  checkedIn: {
    icon: <LogIn size={14} />,
    label: "Checked In",
    color: "text-blue-600 bg-blue-50",
  },
  inProgress: {
    icon: <Clock size={14} />,
    label: "In Progress",
    color: "text-amber-600 bg-amber-50",
  },
  completed: {
    icon: <CheckCircle size={14} />,
    label: "Completed",
    color: "text-emerald-600 bg-emerald-50",
  },
  issueReported: {
    icon: <AlertTriangle size={14} />,
    label: "Issue Reported",
    color: "text-red-600 bg-red-50",
  },
};

interface Props {
  bookingId: bigint;
  sitterId: bigint;
  sitterName: string;
  isActive: boolean;
  autoRefresh?: boolean;
}

export default function ServiceLogTimeline({
  bookingId,
  sitterId,
  sitterName,
  isActive,
  autoRefresh,
}: Props) {
  const { data: logs = [] } = useServiceLogs(bookingId, autoRefresh);
  const postLog = usePostServiceLog();
  const updateStopTime = useUpdateServiceLogStopTime();
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>("inProgress");
  const [updateNotes, setUpdateNotes] = useState("");

  const activeLog = (logs as Public__2[]).find(
    (l) =>
      !l.stopTime &&
      (l.status === ServiceStatus.checkedIn ||
        l.status === ServiceStatus.inProgress),
  );
  const hasCheckedIn = (logs as Public__2[]).some(
    (l) =>
      l.status === ServiceStatus.checkedIn ||
      l.status === ServiceStatus.inProgress ||
      l.status === ServiceStatus.completed,
  );

  const handleCheckIn = async () => {
    try {
      await postLog.mutateAsync({
        bookingId,
        sitterId,
        status: ServiceStatus.checkedIn,
        notes: "Service started",
        startTime: BigInt(Date.now()) * 1_000_000n,
      });
      toast.success("Checked in!");
    } catch {
      toast.error("Failed to check in");
    }
  };

  const handleCheckOut = async () => {
    if (!activeLog) return;
    try {
      await updateStopTime.mutateAsync({
        id: activeLog.id,
        stopTime: BigInt(Date.now()) * 1_000_000n,
        bookingId,
      });
      toast.success("Checked out!");
    } catch {
      toast.error("Failed to check out");
    }
  };

  const handlePostUpdate = async () => {
    if (!updateNotes.trim()) return;
    try {
      await postLog.mutateAsync({
        bookingId,
        sitterId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: updateStatus as any,
        notes: updateNotes,
      });
      setShowUpdateForm(false);
      setUpdateNotes("");
      toast.success("Update posted!");
    } catch {
      toast.error("Failed to post update");
    }
  };

  return (
    <div className="mt-3 border-t border-border pt-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        Service Log
      </p>

      {isActive && (
        <div className="flex flex-wrap gap-2 mb-3">
          {!hasCheckedIn && (
            <Button
              size="sm"
              className="rounded-full bg-blue-600 text-white hover:bg-blue-700 h-8 text-xs gap-1"
              onClick={handleCheckIn}
              disabled={postLog.isPending}
            >
              {postLog.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <LogIn size={12} />
              )}
              Check In
            </Button>
          )}
          {activeLog && (
            <Button
              size="sm"
              className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700 h-8 text-xs gap-1"
              onClick={handleCheckOut}
              disabled={updateStopTime.isPending}
            >
              {updateStopTime.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <LogOut size={12} />
              )}
              Check Out
            </Button>
          )}
          {hasCheckedIn && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full h-8 text-xs"
              onClick={() => setShowUpdateForm((v) => !v)}
            >
              Log Update
            </Button>
          )}
        </div>
      )}

      {showUpdateForm && (
        <div className="mb-3 p-3 bg-muted/40 rounded-xl space-y-2">
          <Select value={updateStatus} onValueChange={setUpdateStatus}>
            <SelectTrigger className="h-8 text-xs rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inProgress">In Progress</SelectItem>
              <SelectItem value="issueReported">Issue Reported</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            value={updateNotes}
            onChange={(e) => setUpdateNotes(e.target.value)}
            placeholder={`Notes about ${sitterName}'s visit...`}
            className="text-xs resize-none rounded-lg"
            rows={2}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="rounded-full h-7 text-xs bg-primary text-primary-foreground"
              onClick={handlePostUpdate}
              disabled={postLog.isPending || !updateNotes.trim()}
            >
              {postLog.isPending ? (
                <Loader2 size={12} className="animate-spin mr-1" />
              ) : null}
              Post Update
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full h-7 text-xs"
              onClick={() => setShowUpdateForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {(logs as Public__2[]).length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">
          No activity logged yet.
        </p>
      ) : (
        <div className="space-y-2">
          {[...(logs as Public__2[])].reverse().map((log) => {
            const cfg =
              STATUS_CONFIG[log.status as string] ?? STATUS_CONFIG.inProgress;
            return (
              <div key={log.id.toString()} className="flex gap-2.5 text-xs">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cfg.color}`}
                >
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`font-semibold px-1.5 py-0.5 rounded-full text-xs ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-muted-foreground">
                      {formatTs(log.createdAt)}
                    </span>
                    {log.startTime && log.stopTime && (
                      <span className="text-muted-foreground">
                        ·{" "}
                        {Math.round(
                          Number(
                            (log.stopTime - log.startTime) / 60_000_000_000n,
                          ),
                        )}{" "}
                        min
                      </span>
                    )}
                  </div>
                  {log.notes && (
                    <p className="mt-0.5 text-foreground">{log.notes}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
