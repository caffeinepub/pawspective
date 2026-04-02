import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

import Nat "mo:core/Nat";
import Text "mo:core/Text";

// Apply migration with `with` clause

actor {
  module SitterProfile {
    public type Id = Nat;

    public type Public = {
      id : Nat;
      name : Text;
      bio : Text;
      services : [Text];
      hourlyRate : Nat;
      location : Text;
      photoUrl : Text;
      rating : Float;
      reviewCount : Nat;
      isActive : Bool;
      owner : ?Principal;
      serviceRates : [SitterServiceRate.Public];
    };

    public type Update = {
      id : Id;
      name : Text;
      bio : Text;
      services : [Text];
      hourlyRate : Nat;
      location : Text;
      photoUrl : Text;
      isActive : Bool;
    };

    public type Creation = {
      name : Text;
      bio : Text;
      services : [Text];
      hourlyRate : Nat;
      location : Text;
      photoUrl : Text;
    };
  };

  module SitterServiceRate {
    public type Public = {
      service : Text;
      ratePerHour : Nat;
    };
  };

  module Booking {
    public type Id = Nat;

    public type Pet = {
      petName : Text;
      petType : Text;
      breed : ?Text;
      petNotes : ?Text;
    };

    public type BookingStatus = {
      #pending;
      #confirmed;
      #completed;
      #cancelled;
    };

    public type RecurrencePattern = {
      #weekly;
      #biweekly;
      #monthly;
    };

    public type TimeSlot = {
      startTime : Time.Time;
      endTime : Time.Time;
    };

    public type DaySchedule = {
      date : Time.Time;
      slots : [TimeSlot];
    };

    public type ServiceSlot = {
      service : Text;
      sitterId : Nat;
      startTime : Text;
      endTime : Text;
      ratePerHour : Nat;
      durationMinutes : Nat;
    };

    public type DayServiceSchedule = {
      date : Text;
      slots : [ServiceSlot];
    };

    public type Public = {
      id : Id;
      clientName : Text;
      clientEmail : Text;
      clientPhone : Text;
      pets : [Pet];
      services : [Text];
      sitterIds : [Nat];
      startDate : Time.Time;
      endDate : Time.Time;
      notes : Text;
      status : BookingStatus;
      createdAt : Time.Time;
      isRecurring : Bool;
      recurrencePattern : ?RecurrencePattern;
      recurrenceEndDate : ?Time.Time;
      paymentSessionId : ?Text;
      stripePaymentIntentId : ?Text;
      tip : ?Nat;
      schedule : ?[DaySchedule];
      serviceSchedule : ?[DayServiceSchedule];
    };

    public type Creation = {
      clientName : Text;
      clientEmail : Text;
      clientPhone : Text;
      pets : [Pet];
      services : [Text];
      sitterIds : [Nat];
      startDate : Time.Time;
      endDate : Time.Time;
      notes : Text;
      isRecurring : Bool;
      recurrencePattern : ?RecurrencePattern;
      recurrenceEndDate : ?Time.Time;
      tip : ?Nat;
      schedule : ?[DaySchedule];
      serviceSchedule : ?[DayServiceSchedule];
    };
  };

  module SitterAvailability {
    public type AvailabilityEntry = {
      dayOfWeek : Nat;
      startTime : Nat;
      endTime : Nat;
    };

    public type Availability = {
      entries : [AvailabilityEntry];
    };
  };

  module ServiceLog {
    public type Id = Nat;

    public type ServiceStatus = {
      #checkedIn;
      #inProgress;
      #completed;
      #issueReported;
    };

    public type Public = {
      id : Id;
      bookingId : Booking.Id;
      sitterId : SitterProfile.Id;
      status : ServiceStatus;
      notes : Text;
      startTime : ?Time.Time;
      stopTime : ?Time.Time;
      createdAt : Time.Time;
    };

    public type Creation = {
      bookingId : Booking.Id;
      sitterId : SitterProfile.Id;
      status : ServiceStatus;
      notes : Text;
      startTime : ?Time.Time;
    };

    public type UpdateStopTime = {
      id : Id;
      stopTime : Time.Time;
    };
  };

  module PaymentRecord {
    public type PaymentStatus = {
      #pending;
      #paid;
      #refunded;
    };

    public type PaymentMethod = {
      #stripe;
      #manual;
    };

    public type PaymentSplit = {
      sitterId : SitterProfile.Id;
      amount : Nat;
      paid : Bool;
    };

    public type Public = {
      bookingId : Booking.Id;
      totalAmount : Nat;
      method : PaymentMethod;
      status : PaymentStatus;
      notes : ?Text;
      stripePaymentIntentId : ?Text;
      manualConfirmedBy : ?Principal;
      confirmedAt : ?Time.Time;
      splits : [PaymentSplit];
    };

    public type Creation = {
      bookingId : Booking.Id;
      totalAmount : Nat;
      method : PaymentMethod;
      notes : ?Text;
      splits : [PaymentSplit];
    };

    public type UpdateSplits = {
      bookingId : Booking.Id;
      splits : [PaymentSplit];
    };
  };

  module Message {
    public type Message = {
      senderId : ?Principal;
      senderName : Text;
      content : Text;
      timestamp : Time.Time;
    };
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
    role : Text;
  };

  // ---------------------------------------------------------------------------
  // Stable storage – survives canister upgrades/redeployments
  // ---------------------------------------------------------------------------
  stable var stableSitters        : [(SitterProfile.Id, SitterProfile.Public)]          = [];
  stable var stableBookings       : [(Booking.Id, Booking.Public)]                      = [];
  stable var stableAvailabilities : [(SitterProfile.Id, SitterAvailability.Availability)] = [];
  stable var stableServiceLogs    : [(ServiceLog.Id, ServiceLog.Public)]                = [];
  stable var stablePayments       : [(Booking.Id, PaymentRecord.Public)]                = [];
  stable var stableUserProfiles   : [(Principal, UserProfile)]                          = [];
  // messages stores List internally; we flatten to arrays for stability
  stable var stableMessages       : [(Booking.Id, [Message.Message])]                   = [];
  // admin state
  stable var stableAdminAssigned  : Bool                                                = false;
  stable var stableUserRoles      : [(Principal, AccessControl.UserRole)]               = [];
  // counters & config
  stable var stableNextSitterId      : Nat                              = 1;
  stable var stableNextBookingId     : Nat                              = 1;
  stable var stableNextServiceLogId  : Nat                              = 1;
  stable var stableStripeConfig      : ?Stripe.StripeConfiguration     = null;

  // ---------------------------------------------------------------------------
  // In-memory working maps (rebuilt from stable vars on every upgrade)
  // ---------------------------------------------------------------------------
  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let sitters        = Map.empty<SitterProfile.Id, SitterProfile.Public>();
  let bookings       = Map.empty<Booking.Id, Booking.Public>();
  let availabilities = Map.empty<SitterProfile.Id, SitterAvailability.Availability>();
  let serviceLogs    = Map.empty<ServiceLog.Id, ServiceLog.Public>();
  let messages       = Map.empty<Booking.Id, List.List<Message.Message>>();
  let payments       = Map.empty<Booking.Id, PaymentRecord.Public>();
  let userProfiles   = Map.empty<Principal, UserProfile>();

  // New rate state (not persisted separately – embedded in SitterProfile.serviceRates)
  let serviceRates = Map.empty<Nat, Map.Map<Text, Nat>>();

  var nextSitterId     = stableNextSitterId;
  var nextBookingId    = stableNextBookingId;
  var nextServiceLogId = stableNextServiceLogId;

  var stripeConfig : ?Stripe.StripeConfiguration = stableStripeConfig;

  // Restore in-memory maps from stable arrays on (re)deploy
  for ((k, v) in stableSitters.values())        { sitters.add(k, v)        };
  for ((k, v) in stableBookings.values())       { bookings.add(k, v)       };
  for ((k, v) in stableAvailabilities.values()) { availabilities.add(k, v) };
  for ((k, v) in stableServiceLogs.values())    { serviceLogs.add(k, v)    };
  for ((k, v) in stablePayments.values())       { payments.add(k, v)       };
  for ((k, v) in stableUserProfiles.values())   { userProfiles.add(k, v)   };
  for ((k, arr) in stableMessages.values()) {
    let lst = List.empty<Message.Message>();
    for (m in arr.values()) { lst.add(m) };
    messages.add(k, lst);
  };
  // Restore access control
  accessControlState.adminAssigned := stableAdminAssigned;
  for ((p, r) in stableUserRoles.values()) { accessControlState.userRoles.add(p, r) };

  // Helper: safe admin check that never traps on unregistered principals
  func callerIsAdmin(caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) { true };
      case (_) { false };
    };
  };

  // Helper function to check if caller is a sitter assigned to a booking
  // Helper: normalize phone to digits only (strips dashes, spaces, parens, etc.)
  func normalizePhone(phone : Text) : Text {
    let chars = phone.chars();
    let digits = chars.filter(func(c : Char) : Bool { c.isDigit() });
    Text.fromIter(digits);
  };

  func isCallerAssignedSitter(caller : Principal, booking : Booking.Public) : Bool {
    if (caller.isAnonymous()) { return false };
    
    for (sitterId in booking.sitterIds.values()) {
      switch (sitters.get(sitterId)) {
        case (null) { /* skip */ };
        case (?profile) {
          if (profile.owner == ?caller) {
            return true;
          };
        };
      };
    };
    false;
  };

  // Admin setup: allows the first logged-in user to claim admin role.
  // Also overwrites any existing #user role — so logging in first and then
  // claiming admin works correctly even after _initializeAccessControlWithSecret
  // pre-registered the caller as #user.
  // Claim admin access.
  // Succeeds if:
  //   (a) no admin has ever been set up, OR
  //   (b) the caller is not currently an admin (allows re-claim after switching devices/anchors)
  // This lets the app owner recover admin on mobile or after Internet Identity anchor change.
  public shared ({ caller }) func claimFirstAdmin() : async Bool {
    if (caller.isAnonymous()) { return false };
    // Allow claim if no admin has been assigned yet
    if (not accessControlState.adminAssigned) {
      accessControlState.userRoles.add(caller, #admin);
      accessControlState.adminAssigned := true;
      return true;
    };
    // Also allow re-claim if caller is NOT currently an admin
    // (app owner switched device/anchor and lost access)
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) { return false }; // already admin, no-op
      case (_) {
        // Caller is not admin — grant them admin (recovers from lost anchor)
        accessControlState.userRoles.add(caller, #admin);
        accessControlState.adminAssigned := true;
        return true;
      };
    };
  };

  // Returns true if at least one admin has been set up
  public query func isAdminAssigned() : async Bool {
    accessControlState.adminAssigned;
  };

  // User Profile Functions (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) { return null };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not callerIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in to save profile");
    };
    // Auto-assign #user role on first profile save if not already assigned
    switch (accessControlState.userRoles.get(caller)) {
      case (null) { accessControlState.userRoles.add(caller, #user) };
      case (?_) { /* already has role */ };
    };
    userProfiles.add(caller, profile);
  };

  // Sitter Profile CRUD
  public shared ({ caller }) func createSitterProfile(input : SitterProfile.Creation) : async SitterProfile.Public {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in to create a sitter profile");
    };
    // Auto-assign #user role if not already assigned
    switch (accessControlState.userRoles.get(caller)) {
      case (null) { accessControlState.userRoles.add(caller, #user) };
      case (?_) { /* already has role */ };
    };

    // Admins create active sitters directly; self-registered sitters are pending approval
    let isAdmin = callerIsAdmin(caller);

    let newProfile : SitterProfile.Public = {
      input with
      id = nextSitterId;
      rating = 0.0;
      reviewCount = 0;
      isActive = isAdmin;
      owner = ?caller;
      serviceRates = [];
    };

    sitters.add(nextSitterId, newProfile);
    nextSitterId += 1;
    newProfile;
  };

  public query ({ caller }) func getSitterProfile(id : SitterProfile.Id) : async SitterProfile.Public {
    switch (sitters.get(id)) {
      case (null) { Runtime.trap("Sitter not found") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getAllSitters() : async [SitterProfile.Public] {
    sitters.values().toArray();
  };

  public query ({ caller }) func getActiveSitters() : async [SitterProfile.Public] {
    sitters.values().toArray().filter(func(s : SitterProfile.Public) : Bool { s.isActive });
  };

  public shared ({ caller }) func updateSitterProfile(input : SitterProfile.Update) : async SitterProfile.Public {
    switch (sitters.get(input.id)) {
      case (null) { Runtime.trap("Sitter not found") };
      case (?profile) {
        if (not callerIsAdmin(caller) and profile.owner != ?caller) {
          Runtime.trap("Unauthorized: Only the sitter or admin can update this profile");
        };

        let updated : SitterProfile.Public = {
          id = input.id;
          name = input.name;
          bio = input.bio;
          services = input.services;
          hourlyRate = input.hourlyRate;
          location = input.location;
          photoUrl = input.photoUrl;
          rating = profile.rating;
          reviewCount = profile.reviewCount;
          isActive = input.isActive;
          owner = profile.owner;
          serviceRates = profile.serviceRates;
        };

        sitters.add(input.id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteSitterProfile(id : SitterProfile.Id) : async () {
    switch (sitters.get(id)) {
      case (null) { Runtime.trap("Sitter not found") };
      case (?profile) {
        if (not callerIsAdmin(caller) and profile.owner != ?caller) {
          Runtime.trap("Unauthorized: Only the sitter or admin can delete this profile");
        };
        sitters.remove(id);
      };
    };
  };

  public shared ({ caller }) func submitReview(sitterId : SitterProfile.Id, rating : Float) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in to submit a review");
    };

    if (rating < 1.0 or rating > 5.0) {
      Runtime.trap("Invalid rating: Must be 1.0 - 5.0");
    };

    switch (sitters.get(sitterId)) {
      case (null) { Runtime.trap("Sitter not found") };
      case (?profile) {
        let newReviewCount = profile.reviewCount + 1;
        let totalRating = profile.rating * profile.reviewCount.toFloat() + rating;
        let newRating = totalRating / newReviewCount.toFloat();

        let updated = {
          profile with
          rating = newRating;
          reviewCount = newReviewCount;
        };

        sitters.add(sitterId, updated);
      };
    };
  };

  // SitterServiceRate CRUD
  public query ({ caller }) func getSitterServiceRates(sitterId : SitterProfile.Id) : async [SitterServiceRate.Public] {
    switch (sitters.get(sitterId)) {
      case (null) { Runtime.trap("Sitter not found") };
      case (?profile) { profile.serviceRates };
    };
  };

  public shared ({ caller }) func setSitterServiceRates(sitterId : SitterProfile.Id, rates : [SitterServiceRate.Public]) : async () {
    switch (sitters.get(sitterId)) {
      case (null) { Runtime.trap("Sitter not found") };
      case (?profile) {
        if (not callerIsAdmin(caller) and (profile.owner != ?caller)) {
          Runtime.trap("Unauthorized: Only the sitter or admin can update rates");
        };
        let updated = { profile with serviceRates = rates };
        sitters.add(sitterId, updated);
      };
    };
  };

  // Sitter Availability Functions
  public shared ({ caller }) func setSitterAvailability(sitterId : SitterProfile.Id, entries : [SitterAvailability.AvailabilityEntry]) : async () {
    switch (sitters.get(sitterId)) {
      case (null) { Runtime.trap("Sitter not found") };
      case (?profile) {
        if (not callerIsAdmin(caller) and profile.owner != ?caller) {
          Runtime.trap("Unauthorized: Only the sitter or admin can update availability");
        };
        let availability : SitterAvailability.Availability = {
          entries;
        };
        availabilities.add(sitterId, availability);
      };
    };
  };

  public query func getSitterAvailability(sitterId : SitterProfile.Id) : async [SitterAvailability.AvailabilityEntry] {
    switch (availabilities.get(sitterId)) {
      case (null) { [] };
      case (?availability) { availability.entries };
    };
  };

  // Booking Functions
  public shared ({ caller }) func createBooking(input : Booking.Creation) : async Booking.Public {
    // No authentication required - clients don't need to log in

    // Validate Sitter IDs
    for (sitterId in input.sitterIds.values()) {
      if (sitters.get(sitterId) == null) {
        Runtime.trap("Sitter with ID " # sitterId.toText() # " not found");
      };
    };

    let newBooking : Booking.Public = {
      id = nextBookingId;
      clientName = input.clientName;
      clientEmail = input.clientEmail;
      clientPhone = normalizePhone(input.clientPhone);
      pets = input.pets;
      services = input.services;
      sitterIds = input.sitterIds;
      startDate = input.startDate;
      endDate = input.endDate;
      notes = input.notes;
      status = #pending;
      createdAt = Time.now();
      isRecurring = input.isRecurring;
      recurrencePattern = input.recurrencePattern;
      recurrenceEndDate = input.recurrenceEndDate;
      paymentSessionId = null;
      stripePaymentIntentId = null;
      tip = input.tip;
      schedule = input.schedule;
      serviceSchedule = input.serviceSchedule;
    };

    bookings.add(nextBookingId, newBooking);
    nextBookingId += 1;
    newBooking;
  };

  public shared ({ caller }) func updateBookingStatus(bookingId : Booking.Id, newStatus : { #confirmed; #completed; #cancelled }) : async () {
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        if (callerIsAdmin(caller)) {
          let updated = { booking with status = newStatus };
          bookings.add(bookingId, updated);
          return;
        };

        var isOwner = false;
        for (sitterId in booking.sitterIds.values()) {
          switch (sitters.get(sitterId)) {
            case (null) { /* skip */ };
            case (?profile) {
              if (profile.owner == ?caller) {
                isOwner := true;
              };
            };
          };
        };

        if (not isOwner) {
          Runtime.trap("Unauthorized: Only an assigned sitter or admin can update the booking status");
        };

        let updated = { booking with status = newStatus };
        bookings.add(bookingId, updated);
      };
    };
  };

  public query ({ caller }) func getBookingsBySitter(sitterId : SitterProfile.Id) : async [Booking.Public] {
    switch (sitters.get(sitterId)) {
      case (null) { Runtime.trap("Sitter not found") };
      case (?profile) {
        if (not callerIsAdmin(caller) and profile.owner != ?caller) {
          Runtime.trap("Unauthorized: Only the sitter or admin can view their bookings");
        };
      };
    };

    bookings.values().toArray().filter(func(b : Booking.Public) : Bool { b.sitterIds.any(func(id) { id == sitterId }) });
  };

  public query ({ caller }) func getBookingsByClientEmail(clientEmail : Text) : async [Booking.Public] {
    // Open for client self-lookup - no auth required
    bookings.values().toArray().filter(func(b : Booking.Public) : Bool { b.clientEmail == clientEmail });
  };


  public query ({ caller }) func getBookingsByClientPhone(clientPhone : Text) : async [Booking.Public] {
    // Open for client self-lookup - no auth required
    let normalized = normalizePhone(clientPhone);
    bookings.values().toArray().filter(func(b : Booking.Public) : Bool { normalizePhone(b.clientPhone) == normalized });
  };
  public query ({ caller }) func getAllBookings() : async [Booking.Public] {
    if (not callerIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    bookings.values().toArray();
  };

  // Service Log Functions
  public shared ({ caller }) func postServiceLog(input : ServiceLog.Creation) : async ServiceLog.Public {
    switch (sitters.get(input.sitterId)) {
      case (null) { Runtime.trap("Sitter not found") };
      case (?profile) {
        if (not callerIsAdmin(caller) and profile.owner != ?caller) {
          Runtime.trap("Unauthorized: Only the sitter or admin can post service logs");
        };
        let newLog : ServiceLog.Public = {
          id = nextServiceLogId;
          bookingId = input.bookingId;
          sitterId = input.sitterId;
          status = input.status;
          notes = input.notes;
          startTime = input.startTime;
          stopTime = null;
          createdAt = Time.now();
        };
        serviceLogs.add(nextServiceLogId, newLog);
        nextServiceLogId += 1;
        newLog;
      };
    };
  };

  public shared ({ caller }) func updateServiceLogStopTime(input : ServiceLog.UpdateStopTime) : async () {
    switch (serviceLogs.get(input.id)) {
      case (null) { Runtime.trap("Service log not found") };
      case (?log) {
        switch (sitters.get(log.sitterId)) {
          case (null) { Runtime.trap("Sitter not found") };
          case (?profile) {
            if (not callerIsAdmin(caller) and profile.owner != ?caller) {
              Runtime.trap("Unauthorized: Only the sitter or admin can update service logs");
            };
            let updated = { log with stopTime = ?input.stopTime };
            serviceLogs.add(input.id, updated);
          };
        };
      };
    };
  };

  public query ({ caller }) func getServiceLogsByBooking(bookingId : Booking.Id) : async [ServiceLog.Public] {
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        // Authorization: Admin or assigned sitter can view service logs
        if (not callerIsAdmin(caller) and not isCallerAssignedSitter(caller, booking)) {
          Runtime.trap("Unauthorized: Only assigned sitters or admin can view service logs");
        };
        
        serviceLogs.values().toArray().filter(func(log : ServiceLog.Public) : Bool { log.bookingId == bookingId });
      };
    };
  };

  // Payment Functions
  public shared ({ caller }) func createPayment(input : PaymentRecord.Creation) : async PaymentRecord.Public {
    if (not callerIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can create payment records");
    };

    if (bookings.get(input.bookingId) == null) { Runtime.trap("Booking not found") };

    let payment : PaymentRecord.Public = {
      bookingId = input.bookingId;
      totalAmount = input.totalAmount;
      method = input.method;
      status = #pending;
      notes = input.notes;
      stripePaymentIntentId = null;
      manualConfirmedBy = null;
      confirmedAt = null;
      splits = input.splits;
    };

    payments.add(input.bookingId, payment);
    payment;
  };

  public shared ({ caller }) func confirmManualPayment(bookingId : Booking.Id) : async () {
    if (not callerIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can confirm manual payments");
    };

    switch (payments.get(bookingId)) {
      case (null) { Runtime.trap("Payment not found") };
      case (?payment) {
        let updated = {
          payment with
          status = #paid;
          manualConfirmedBy = ?caller;
          confirmedAt = ?Time.now();
        };
        payments.add(bookingId, updated);
      };
    };
  };

  public shared ({ caller }) func updatePaymentSplits(input : PaymentRecord.UpdateSplits) : async () {
    if (not callerIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update payment splits");
    };
    switch (payments.get(input.bookingId)) {
      case (null) { Runtime.trap("Payment not found") };
      case (?payment) {
        let updated = { payment with splits = input.splits };
        payments.add(input.bookingId, updated);
      };
    };
  };

  public query ({ caller }) func getPayment(bookingId : Booking.Id) : async ?PaymentRecord.Public {
    if (not callerIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view payment records");
    };
    payments.get(bookingId);
  };

  public query ({ caller }) func getAllPayments() : async [PaymentRecord.Public] {
    if (not callerIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view payment records");
    };
    payments.values().toArray();
  };

  // Message Functions
  public shared ({ caller }) func addMessage(bookingId : Booking.Id, senderName : Text, content : Text) : async () {
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        // Authorization: Admin, assigned sitter, or anonymous (for clients)
        if (not caller.isAnonymous() and not callerIsAdmin(caller) and not isCallerAssignedSitter(caller, booking)) {
          Runtime.trap("Unauthorized: Only assigned sitters, admin, or clients can add messages");
        };

        let newMessage : Message.Message = {
          senderId = if (caller.isAnonymous()) { null } else { ?caller };
          senderName;
          content;
          timestamp = Time.now();
        };

        let messageList = switch (messages.get(bookingId)) {
          case (null) { List.empty<Message.Message>() };
          case (?existing) { existing };
        };

        messageList.add(newMessage);
        messages.add(bookingId, messageList);
      };
    };
  };

  public query ({ caller }) func getMessages(bookingId : Booking.Id) : async [Message.Message] {
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        // Authorization: Admin or assigned sitter can view messages
        if (not callerIsAdmin(caller) and not isCallerAssignedSitter(caller, booking)) {
          Runtime.trap("Unauthorized: Only assigned sitters or admin can view messages");
        };

        switch (messages.get(bookingId)) {
          case (null) { [] };
          case (?msgList) { msgList.values().toArray() };
        };
      };
    };
  };

  // Stripe Integration
  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not callerIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe is not configured, please contact support.") };
      case (?config) { config };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
  // ---------------------------------------------------------------------------
  // Upgrade hooks – serialize in-memory maps back to stable arrays
  // ---------------------------------------------------------------------------
  system func preupgrade() {
    stableSitters        := sitters.entries().toArray();
    stableBookings       := bookings.entries().toArray();
    stableAvailabilities := availabilities.entries().toArray();
    stableServiceLogs    := serviceLogs.entries().toArray();
    stablePayments       := payments.entries().toArray();
    stableUserProfiles   := userProfiles.entries().toArray();
    let msgBuf = List.empty<(Booking.Id, [Message.Message])>();
    for ((k, lst) in messages.entries()) {
      msgBuf.add((k, lst.values().toArray()));
    };
    stableMessages := msgBuf.values().toArray();
    stableAdminAssigned := accessControlState.adminAssigned;
    stableUserRoles     := accessControlState.userRoles.entries().toArray();
    stableNextSitterId      := nextSitterId;
    stableNextBookingId     := nextBookingId;
    stableNextServiceLogId  := nextServiceLogId;
    stableStripeConfig      := stripeConfig;
  };

  system func postupgrade() {
    // in-memory maps were already rebuilt from stable vars in the actor body above
  };


};
