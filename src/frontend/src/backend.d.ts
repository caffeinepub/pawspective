import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
  __kind__: "Some";
  value: T;
}
export interface None {
  __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
  status: bigint;
  body: Uint8Array;
  headers: Array<http_header>;
}
export type Time = bigint;
export interface Update {
  id: Id;
  bio: string;
  name: string;
  hourlyRate: bigint;
  photoUrl: string;
  isActive: boolean;
  location: string;
  services: Array<string>;
}
export interface Public__3 {
  status: PaymentStatus;
  method: PaymentMethod;
  bookingId: Id;
  confirmedAt?: Time;
  manualConfirmedBy?: Principal;
  totalAmount: bigint;
  notes?: string;
  stripePaymentIntentId?: string;
  splits: Array<PaymentSplit>;
}
export interface Creation {
  startTime?: Time;
  status: ServiceStatus;
  bookingId: Id;
  sitterId: Id;
  notes: string;
}
export interface Public__4 {
  id: Id;
  tip?: bigint;
  status: BookingStatus;
  paymentSessionId?: string;
  endDate: Time;
  serviceSchedule?: Array<DayServiceSchedule>;
  isRecurring: boolean;
  clientName: string;
  createdAt: Time;
  pets: Array<Pet>;
  clientEmail: string;
  recurrencePattern?: RecurrencePattern;
  recurrenceEndDate?: Time;
  notes: string;
  clientPhone: string;
  stripePaymentIntentId?: string;
  schedule?: Array<DaySchedule>;
  sitterIds: Array<bigint>;
  services: Array<string>;
  startDate: Time;
}
export interface Creation__1 {
  bio: string;
  name: string;
  hourlyRate: bigint;
  photoUrl: string;
  location: string;
  services: Array<string>;
}
export interface UpdateSplits {
  bookingId: Id;
  splits: Array<PaymentSplit>;
}
export interface Pet {
  petNotes?: string;
  petName: string;
  petType: string;
  breed?: string;
}
export interface Public__1 {
  service: string;
  ratePerHour: bigint;
}
export interface TransformationInput {
  context: Uint8Array;
  response: http_request_result;
}
export interface PaymentSplit {
  sitterId: Id;
  paid: boolean;
  amount: bigint;
}
export interface DayServiceSchedule {
  date: string;
  slots: Array<ServiceSlot>;
}
export interface Creation__2 {
  method: PaymentMethod;
  bookingId: Id;
  totalAmount: bigint;
  notes?: string;
  splits: Array<PaymentSplit>;
}
export type StripeSessionStatus =
  | {
      __kind__: "completed";
      completed: {
        userPrincipal?: string;
        response: string;
      };
    }
  | {
      __kind__: "failed";
      failed: {
        error: string;
      };
    };
export interface StripeConfiguration {
  allowedCountries: Array<string>;
  secretKey: string;
}
export interface Public__2 {
  id: Id;
  startTime?: Time;
  status: ServiceStatus;
  bookingId: Id;
  sitterId: Id;
  createdAt: Time;
  stopTime?: Time;
  notes: string;
}
export interface TimeSlot {
  startTime: Time;
  endTime: Time;
}
export interface Creation__3 {
  tip?: bigint;
  endDate: Time;
  serviceSchedule?: Array<DayServiceSchedule>;
  isRecurring: boolean;
  clientName: string;
  pets: Array<Pet>;
  clientEmail: string;
  recurrencePattern?: RecurrencePattern;
  recurrenceEndDate?: Time;
  notes: string;
  clientPhone: string;
  schedule?: Array<DaySchedule>;
  sitterIds: Array<bigint>;
  services: Array<string>;
  startDate: Time;
}
export interface Public {
  id: bigint;
  bio: string;
  owner?: Principal;
  name: string;
  hourlyRate: bigint;
  photoUrl: string;
  isActive: boolean;
  serviceRates: Array<Public__1>;
  rating: number;
  reviewCount: bigint;
  location: string;
  services: Array<string>;
}
export interface DaySchedule {
  date: Time;
  slots: Array<TimeSlot>;
}
export interface http_header {
  value: string;
  name: string;
}
export interface http_request_result {
  status: bigint;
  body: Uint8Array;
  headers: Array<http_header>;
}
export interface AvailabilityEntry {
  startTime: bigint;
  endTime: bigint;
  dayOfWeek: bigint;
}
export interface ShoppingItem {
  productName: string;
  currency: string;
  quantity: bigint;
  priceInCents: bigint;
  productDescription: string;
}
export type Id = bigint;
export interface ServiceSlot {
  service: string;
  startTime: string;
  sitterId: bigint;
  endTime: string;
  durationMinutes: bigint;
  ratePerHour: bigint;
}
export interface UpdateStopTime {
  id: Id;
  stopTime: Time;
}
export interface Message {
  content: string;
  timestamp: Time;
  senderName: string;
  senderId?: Principal;
}
export interface UserProfile {
  name: string;
  role: string;
  email?: string;
}
export enum BookingStatus {
  cancelled = "cancelled",
  pending = "pending",
  completed = "completed",
  confirmed = "confirmed",
}
export enum PaymentMethod {
  stripe = "stripe",
  manual = "manual",
}
export enum PaymentStatus {
  pending = "pending",
  paid = "paid",
  refunded = "refunded",
}
export enum RecurrencePattern {
  monthly = "monthly",
  biweekly = "biweekly",
  weekly = "weekly",
}
export enum ServiceStatus {
  completed = "completed",
  checkedIn = "checkedIn",
  issueReported = "issueReported",
  inProgress = "inProgress",
}
export enum UserRole {
  admin = "admin",
  user = "user",
  guest = "guest",
}
export enum Variant_cancelled_completed_confirmed {
  cancelled = "cancelled",
  completed = "completed",
  confirmed = "confirmed",
}
export interface backendInterface {
  addMessage(bookingId: Id, senderName: string, content: string): Promise<void>;
  assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
  claimFirstAdmin(): Promise<boolean>;
  confirmManualPayment(bookingId: Id): Promise<void>;
  createBooking(input: Creation__3): Promise<Public__4>;
  createCheckoutSession(
    items: Array<ShoppingItem>,
    successUrl: string,
    cancelUrl: string,
  ): Promise<string>;
  createPayment(input: Creation__2): Promise<Public__3>;
  createSitterProfile(input: Creation__1): Promise<Public>;
  deleteSitterProfile(id: Id): Promise<void>;
  getActiveSitters(): Promise<Array<Public>>;
  getAllBookings(): Promise<Array<Public__4>>;
  getAllPayments(): Promise<Array<Public__3>>;
  getAllSitters(): Promise<Array<Public>>;
  getBookingsByClientEmail(clientEmail: string): Promise<Array<Public__4>>;
  getBookingsBySitter(sitterId: Id): Promise<Array<Public__4>>;
  getCallerUserProfile(): Promise<UserProfile | null>;
  getCallerUserRole(): Promise<UserRole>;
  getMessages(bookingId: Id): Promise<Array<Message>>;
  getPayment(bookingId: Id): Promise<Public__3 | null>;
  getServiceLogsByBooking(bookingId: Id): Promise<Array<Public__2>>;
  getSitterAvailability(sitterId: Id): Promise<Array<AvailabilityEntry>>;
  getSitterProfile(id: Id): Promise<Public>;
  getSitterServiceRates(sitterId: Id): Promise<Array<Public__1>>;
  getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
  getUserProfile(user: Principal): Promise<UserProfile | null>;
  isAdminAssigned(): Promise<boolean>;
  isCallerAdmin(): Promise<boolean>;
  isStripeConfigured(): Promise<boolean>;
  postServiceLog(input: Creation): Promise<Public__2>;
  saveCallerUserProfile(profile: UserProfile): Promise<void>;
  setSitterAvailability(
    sitterId: Id,
    entries: Array<AvailabilityEntry>,
  ): Promise<void>;
  setSitterServiceRates(sitterId: Id, rates: Array<Public__1>): Promise<void>;
  setStripeConfiguration(config: StripeConfiguration): Promise<void>;
  submitReview(sitterId: Id, rating: number): Promise<void>;
  transform(input: TransformationInput): Promise<TransformationOutput>;
  updateBookingStatus(
    bookingId: Id,
    newStatus: Variant_cancelled_completed_confirmed,
  ): Promise<void>;
  updatePaymentSplits(input: UpdateSplits): Promise<void>;
  updateServiceLogStopTime(input: UpdateStopTime): Promise<void>;
  updateSitterProfile(input: Update): Promise<Public>;
}
