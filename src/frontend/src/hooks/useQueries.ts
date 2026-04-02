import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AvailabilityEntry,
  Creation,
  Creation__2,
  DayServiceSchedule,
  Pet,
  RecurrencePattern,
  UpdateSplits,
  UpdateStopTime,
  backendInterface,
} from "../backend.d";
import { useActor } from "./useActor";

type SitterCreation = Parameters<backendInterface["createSitterProfile"]>[0];
type SitterUpdate = Parameters<backendInterface["updateSitterProfile"]>[0];

export interface BookingCreation {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  pets: Pet[];
  services: string[];
  sitterIds: bigint[];
  startDate: bigint;
  endDate: bigint;
  notes: string;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceEndDate?: bigint;
  tip?: bigint;
  serviceSchedule?: DayServiceSchedule[];
}

export function useActiveSitters() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["active-sitters"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveSitters();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllSitters() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["all-sitters"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSitters();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSitterProfile(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["sitter", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getSitterProfile(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useBookingsByEmail(email: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["bookings-email", email],
    queryFn: async () => {
      if (!actor || !email) return [];
      return actor.getBookingsByClientEmail(email);
    },
    enabled: !!actor && !isFetching && !!email,
  });
}

export function useBookingsBySitter(sitterId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["bookings-sitter", sitterId?.toString()],
    queryFn: async () => {
      if (!actor || sitterId === null) return [];
      return actor.getBookingsBySitter(sitterId);
    },
    enabled: !!actor && !isFetching && sitterId !== null,
  });
}

export function useAllBookings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["all-bookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMessages(bookingId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["messages", bookingId?.toString()],
    queryFn: async () => {
      if (!actor || bookingId === null) return [];
      return actor.getMessages(bookingId);
    },
    enabled: !!actor && !isFetching && bookingId !== null,
    refetchInterval: 5000,
  });
}

export function usePayment(bookingId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["payment", bookingId?.toString()],
    queryFn: async () => {
      if (!actor || bookingId === null) return null;
      return actor.getPayment(bookingId);
    },
    enabled: !!actor && !isFetching && bookingId !== null,
  });
}

export function useAllPayments() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["all-payments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["caller-profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useServiceLogs(bookingId: bigint | null, autoRefresh = false) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["service-logs", bookingId?.toString()],
    queryFn: async () => {
      if (!actor || bookingId === null) return [];
      return actor.getServiceLogsByBooking(bookingId);
    },
    enabled: !!actor && !isFetching && bookingId !== null,
    refetchInterval: autoRefresh ? 10000 : false,
  });
}

export function usePostServiceLog() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Creation) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.postServiceLog(input);
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({
        queryKey: ["service-logs", vars.bookingId.toString()],
      }),
  });
}

export function useUpdateServiceLogStopTime() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateStopTime & { bookingId: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateServiceLogStopTime({
        id: input.id,
        stopTime: input.stopTime,
      });
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({
        queryKey: ["service-logs", vars.bookingId.toString()],
      }),
  });
}

export function useSitterAvailability(sitterId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["sitter-availability", sitterId?.toString()],
    queryFn: async () => {
      if (!actor || sitterId === null) return [];
      return actor.getSitterAvailability(sitterId);
    },
    enabled: !!actor && !isFetching && sitterId !== null,
  });
}

export function useSetSitterAvailability() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sitterId,
      entries,
    }: {
      sitterId: bigint;
      entries: AvailabilityEntry[];
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.setSitterAvailability(sitterId, entries);
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({
        queryKey: ["sitter-availability", vars.sitterId.toString()],
      }),
  });
}

export function useCreateBooking() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: BookingCreation) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createBooking({
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone,
        pets: input.pets,
        services: input.services,
        sitterIds: input.sitterIds,
        startDate: input.startDate,
        endDate: input.endDate,
        notes: input.notes,
        isRecurring: input.isRecurring,
        recurrencePattern: input.recurrencePattern,
        recurrenceEndDate: input.recurrenceEndDate,
        tip: input.tip,
        serviceSchedule: input.serviceSchedule,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-bookings"] }),
  });
}

export function useCreatePayment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Creation__2) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createPayment(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-payments"] }),
  });
}

export function useUpdatePaymentSplits() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateSplits) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updatePaymentSplits(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-payments"] }),
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: {
      bookingId: bigint;
      status: "cancelled" | "completed" | "confirmed";
    }) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return actor.updateBookingStatus(bookingId, status as any);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-bookings"] });
      qc.invalidateQueries({ queryKey: ["bookings-sitter"] });
    },
  });
}

export function useAddMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
      senderName,
      content,
    }: {
      bookingId: bigint;
      senderName: string;
      content: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addMessage(bookingId, senderName, content);
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({
        queryKey: ["messages", vars.bookingId.toString()],
      }),
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: {
      name: string;
      role: string;
      email?: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["caller-profile"] }),
  });
}

export function useCreateSitter() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SitterCreation) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createSitterProfile(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-sitters"] });
      qc.invalidateQueries({ queryKey: ["active-sitters"] });
    },
  });
}

export function useUpdateSitter() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SitterUpdate) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateSitterProfile(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-sitters"] });
      qc.invalidateQueries({ queryKey: ["active-sitters"] });
    },
  });
}

export function useDeleteSitter() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteSitterProfile(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-sitters"] });
      qc.invalidateQueries({ queryKey: ["active-sitters"] });
    },
  });
}

export function useApproveSitter() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sitter: SitterUpdate) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateSitterProfile({
        id: sitter.id,
        name: sitter.name,
        bio: sitter.bio,
        services: sitter.services,
        hourlyRate: sitter.hourlyRate,
        location: sitter.location,
        photoUrl: sitter.photoUrl,
        isActive: true,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-sitters"] });
      qc.invalidateQueries({ queryKey: ["active-sitters"] });
    },
  });
}

export function useConfirmManualPayment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.confirmManualPayment(bookingId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payment"] });
      qc.invalidateQueries({ queryKey: ["all-payments"] });
    },
  });
}

// Item 2: invalidate sitter queries on review success so ratings update live
export function useSubmitReview() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sitterId,
      rating,
    }: {
      sitterId: bigint;
      rating: number;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.submitReview(sitterId, rating);
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["active-sitters"] });
      qc.invalidateQueries({
        queryKey: ["sitter", vars.sitterId.toString()],
      });
    },
  });
}

export function useAssignRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      principal,
      role,
    }: {
      principal: string;
      role: "admin" | "user";
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const { Principal } = await import("@icp-sdk/core/principal");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return actor.assignCallerUserRole(
        Principal.fromText(principal),
        role as any,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["is-admin"] }),
  });
}

export function useIsAdminAssigned() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["is-admin-assigned"],
    queryFn: async () => {
      if (!actor) return true; // default to true (safe fallback)
      return actor.isAdminAssigned();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClaimFirstAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.claimFirstAdmin();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["is-admin"] });
      qc.invalidateQueries({ queryKey: ["is-admin-assigned"] });
    },
  });
}

export function useSitterServiceRates(sitterId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["sitter-service-rates", sitterId?.toString()],
    queryFn: async () => {
      if (!actor || sitterId === null) return [];
      return actor.getSitterServiceRates(sitterId);
    },
    enabled: !!actor && !isFetching && sitterId !== null,
  });
}

export function useSetSitterServiceRates() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sitterId,
      rates,
    }: {
      sitterId: bigint;
      rates: Array<{ service: string; ratePerHour: bigint }>;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setSitterServiceRates(sitterId, rates);
    },
    onSuccess: (_, { sitterId }) => {
      queryClient.invalidateQueries({
        queryKey: ["sitter-service-rates", sitterId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["all-sitters"] });
      queryClient.invalidateQueries({ queryKey: ["active-sitters"] });
    },
  });
}
