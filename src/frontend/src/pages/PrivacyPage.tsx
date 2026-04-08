import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, PawPrint } from "lucide-react";
import type { View } from "../App";

interface Props {
  navigate: (view: View) => void;
}

const LAST_UPDATED = "April 8, 2026";

export default function PrivacyPage({ navigate }: Props) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("home")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Back to Home</span>
          </button>
          <div className="flex items-center gap-2 font-display font-bold text-lg text-foreground">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <PawPrint size={15} className="text-primary-foreground" />
            </div>
            Pawspective
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 pb-20">
        {/* Page title */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Lock size={14} />
            Legal Document
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-base">
            Last updated: {LAST_UPDATED} · Applies to all Clients and Sitters
          </p>
        </div>

        <div className="space-y-10 text-foreground">
          {/* Intro */}
          <section>
            <p className="text-base leading-relaxed text-muted-foreground">
              This Privacy Policy describes how Pawspective ("we," "our," or
              "us") collects, uses, stores, and shares your personal information
              when you use our platform, whether as a Client booking pet care
              services or as a Sitter applying to offer services. We are
              committed to protecting your privacy and handling your data with
              transparency and care.
            </p>
          </section>

          {/* Section 1 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              1. Information We Collect
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Information you provide directly
                </h3>
                <ul className="list-disc list-inside space-y-1.5">
                  <li>
                    <strong className="text-foreground">Clients:</strong> Name,
                    email address, phone number, pet names and types, service
                    notes, and booking details.
                  </li>
                  <li>
                    <strong className="text-foreground">Sitters:</strong> Name,
                    location, biography, profile photo URL, services offered,
                    hourly rates, years of experience, references, and answers
                    to application questions.
                  </li>
                  <li>
                    <strong className="text-foreground">All users:</strong>{" "}
                    Internet Identity principal (a cryptographic identifier used
                    to authenticate your account — no password is stored).
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Information collected automatically
                </h3>
                <ul className="list-disc list-inside space-y-1.5">
                  <li>
                    Usage data including pages visited, features used, and
                    booking interactions.
                  </li>
                  <li>
                    Device and browser information for security and
                    compatibility purposes.
                  </li>
                  <li>
                    Service logs submitted by Sitters, including clock-in/out
                    times, notes, and status updates.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              2. How We Use Your Information
            </h2>
            <ul className="space-y-2 text-base leading-relaxed text-muted-foreground list-disc list-inside">
              <li>
                To facilitate bookings between Clients and Sitters, including
                displaying relevant Sitter profiles and contact information.
              </li>
              <li>
                To allow Clients to look up and track their bookings using their
                email address or phone number.
              </li>
              <li>
                To allow Sitters to manage their profiles, availability, service
                logs, and payment records.
              </li>
              <li>
                To allow administrators to review Sitter applications, manage
                platform users, and generate analytics.
              </li>
              <li>
                To generate invoices that include Client name, contact
                information, service details, and payment status.
              </li>
              <li>
                To improve the platform based on aggregated, anonymized usage
                patterns.
              </li>
              <li>
                To ensure the security and integrity of the platform and prevent
                fraudulent activity.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              3. Data Sharing &amp; Disclosure
            </h2>
            <div className="space-y-3 text-base leading-relaxed text-muted-foreground">
              <p>
                <strong className="text-foreground">
                  With Sitters (when you book):
                </strong>{" "}
                When a Client submits a booking, their name, email, phone
                number, pet details, and service notes are shared with the
                assigned Sitter(s) to facilitate the service.
              </p>
              <p>
                <strong className="text-foreground">
                  With Clients (Sitter profiles):
                </strong>{" "}
                Sitter profiles including name, location, bio, photo, services,
                rates, reviews, and availability are visible to all visitors of
                the platform.
              </p>
              <p>
                <strong className="text-foreground">
                  With administrators:
                </strong>{" "}
                Platform administrators have access to all booking, Sitter, and
                Client data for the purpose of managing the platform and
                resolving disputes.
              </p>
              <p>
                <strong className="text-foreground">
                  We do not sell your data.
                </strong>{" "}
                We do not sell, rent, or trade your personal information to
                third parties for marketing purposes.
              </p>
              <p>
                <strong className="text-foreground">Legal requirements:</strong>{" "}
                We may disclose your information if required by law, court
                order, or government authority.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              4. Data Storage &amp; Security
            </h2>
            <div className="space-y-3 text-base leading-relaxed text-muted-foreground">
              <p>
                Pawspective is built on the Internet Computer Protocol (ICP), a
                decentralized computing platform. Your data is stored in
                canister smart contracts on the ICP network, which provides
                strong cryptographic security and data integrity guarantees.
              </p>
              <p>
                Authentication is handled via Internet Identity, a passkey-based
                system. We never store passwords. Your identity is tied to a
                cryptographic key pair that only you control.
              </p>
              <p>
                While we take reasonable technical measures to protect your
                data, no system is completely secure. We cannot guarantee
                absolute security of information transmitted over the internet.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              5. Data Retention
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              We retain your personal information for as long as your account is
              active or as needed to provide services. Booking records are
              retained indefinitely to support payment reconciliation and
              dispute resolution. Deactivated Sitter profiles are retained in
              our system but are not visible to the public. Clients may request
              deletion of their booking data by contacting us.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              6. Your Rights
            </h2>
            <ul className="space-y-2 text-base leading-relaxed text-muted-foreground list-disc list-inside">
              <li>
                <strong className="text-foreground">Access:</strong> You may
                request a summary of the personal information we hold about you.
              </li>
              <li>
                <strong className="text-foreground">Correction:</strong> You may
                update your Sitter profile information through your dashboard at
                any time.
              </li>
              <li>
                <strong className="text-foreground">Deletion:</strong> You may
                request deletion of your data by contacting platform
                administrators. Note that certain records may be retained for
                legal or operational reasons.
              </li>
              <li>
                <strong className="text-foreground">Portability:</strong> You
                may request a copy of your data in a structured,
                machine-readable format.
              </li>
              <li>
                <strong className="text-foreground">Objection:</strong> You may
                object to certain uses of your data, subject to legitimate
                platform operation requirements.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              7. Cookies &amp; Tracking
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Pawspective uses minimal browser-based storage (such as session
              state) to maintain your experience. We do not use third-party
              advertising cookies or tracking pixels. We may use anonymized
              analytics to understand how the platform is used in aggregate.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              8. Children's Privacy
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              The Pawspective platform is not intended for use by individuals
              under the age of 18. We do not knowingly collect personal
              information from minors. If you believe we have inadvertently
              collected such information, please contact us and we will take
              steps to delete it promptly.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              9. Changes to This Policy
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              We may update this Privacy Policy periodically to reflect changes
              in our practices or legal requirements. We will update the "Last
              updated" date when we make material changes. Continued use of the
              platform after changes are posted constitutes acceptance of the
              revised policy.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              10. Contact Us
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              If you have questions or concerns about this Privacy Policy or how
              your personal data is handled, please contact us through the
              Pawspective platform. We aim to respond to all privacy-related
              inquiries within 5 business days.
            </p>
          </section>

          {/* Terms link */}
          <section className="border-t border-border pt-8">
            <p className="text-muted-foreground text-sm">
              Please also review our{" "}
              <button
                type="button"
                onClick={() => navigate("terms")}
                className="text-primary underline hover:text-primary/80 transition-colors"
              >
                Terms &amp; Conditions
              </button>{" "}
              which govern your use of the platform.
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Button
            onClick={() => navigate("home")}
            className="rounded-full bg-primary text-primary-foreground px-8"
          >
            <ArrowLeft size={15} className="mr-2" />
            Back to Home
          </Button>
        </div>
      </main>
    </div>
  );
}
