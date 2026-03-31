import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";

module {
  type OldSitterProfile = {
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
  };

  type NewSitterServiceRate = {
    service : Text;
    ratePerHour : Nat;
  };

  type NewSitterProfile = {
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
    serviceRates : [NewSitterServiceRate];
  };

  type BookingStatus = {
    #pending;
    #confirmed;
    #completed;
    #cancelled;
  };

  type OldBooking = {
    id : Nat;
    clientName : Text;
    clientEmail : Text;
    clientPhone : Text;
    pets : [OldPet];
    services : [Text];
    sitterIds : [Nat];
    startDate : Time.Time;
    endDate : Time.Time;
    notes : Text;
    status : BookingStatus;
    createdAt : Time.Time;
    isRecurring : Bool;
    recurrencePattern : ?OldRecurrencePattern;
    recurrenceEndDate : ?Time.Time;
    paymentSessionId : ?Text;
    stripePaymentIntentId : ?Text;
    tip : ?Nat;
  };

  type OldPet = {
    petName : Text;
    petType : Text;
    breed : ?Text;
    petNotes : ?Text;
  };

  type OldRecurrencePattern = {
    #weekly;
    #biweekly;
    #monthly;
  };

  type OldUserProfile = {
    name : Text;
    email : ?Text;
    role : Text;
  };

  type OldActor = {
    sitters : Map.Map<Nat, OldSitterProfile>;
    bookings : Map.Map<Nat, OldBooking>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewBookingPet = {
    petName : Text;
    petType : Text;
    breed : ?Text;
    petNotes : ?Text;
  };

  type NewBookingRecurrencePattern = {
    #weekly;
    #biweekly;
    #monthly;
  };

  type NewBookingTimeSlot = {
    startTime : Time.Time;
    endTime : Time.Time;
  };

  type NewBookingDaySchedule = {
    date : Time.Time;
    slots : [NewBookingTimeSlot];
  };

  type NewBookingServiceSlot = {
    service : Text;
    sitterId : Nat;
    startTime : Text;
    endTime : Text;
    ratePerHour : Nat;
    durationMinutes : Nat;
  };

  type NewBookingDayServiceSchedule = {
    date : Text;
    slots : [NewBookingServiceSlot];
  };

  type NewBooking = {
    id : Nat;
    clientName : Text;
    clientEmail : Text;
    clientPhone : Text;
    pets : [NewBookingPet];
    services : [Text];
    sitterIds : [Nat];
    startDate : Time.Time;
    endDate : Time.Time;
    notes : Text;
    status : BookingStatus;
    createdAt : Time.Time;
    isRecurring : Bool;
    recurrencePattern : ?NewBookingRecurrencePattern;
    recurrenceEndDate : ?Time.Time;
    paymentSessionId : ?Text;
    stripePaymentIntentId : ?Text;
    tip : ?Nat;
    schedule : ?[NewBookingDaySchedule];
    serviceSchedule : ?[NewBookingDayServiceSchedule];
  };

  type NewUserProfile = {
    name : Text;
    email : ?Text;
    role : Text;
  };

  type NewActor = {
    sitters : Map.Map<Nat, NewSitterProfile>;
    bookings : Map.Map<Nat, NewBooking>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newSitters = old.sitters.map<Nat, OldSitterProfile, NewSitterProfile>(
      func(_id, oldSitter) {
        { oldSitter with serviceRates = [] };
      }
    );

    let newBookings = old.bookings.map<Nat, OldBooking, NewBooking>(
      func(_id, oldBooking) {
        {
          oldBooking with
          schedule = null;
          serviceSchedule = null;
        };
      }
    );

    {
      old with
      sitters = newSitters;
      bookings = newBookings;
    };
  };
};
