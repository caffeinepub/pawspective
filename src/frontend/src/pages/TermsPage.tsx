import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, PawPrint } from "lucide-react";
import type { View } from "../App";

interface Props {
  navigate: (view: View) => void;
}

const LAST_UPDATED = "April 8, 2026";

export default function TermsPage({ navigate }: Props) {
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
            <FileText size={14} />
            Legal Document
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">
            Terms &amp; Conditions
          </h1>
          <p className="text-muted-foreground text-base">
            Last updated: {LAST_UPDATED} · Effective immediately upon account
            creation or booking
          </p>
        </div>

        <div className="prose-container space-y-10 text-foreground">
          {/* Intro */}
          <section>
            <p className="text-base leading-relaxed text-muted-foreground">
              These Terms &amp; Conditions ("Terms") govern your use of the
              Pawspective platform (the "Service"), whether you are a pet owner
              ("Client") or a pet care provider ("Sitter"). By creating an
              account, submitting a booking, or applying to become a Sitter, you
              agree to be bound by these Terms. Please read them carefully.
            </p>
          </section>

          {/* Section 1 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              1. About Pawspective
            </h2>
            <div className="space-y-3 text-base leading-relaxed text-muted-foreground">
              <p>
                Pawspective is an independent marketplace platform that connects
                pet owners with independent pet care providers. We are not a pet
                care agency. Pawspective does not employ Sitters and is not
                responsible for the acts or omissions of any Sitter or Client.
              </p>
              <p>
                <strong className="text-foreground">Important:</strong>{" "}
                Pawspective does not currently conduct background checks on
                Sitters. We do not guarantee, warrant, or represent the
                suitability, fitness, or reliability of any Sitter listed on the
                platform. Clients are responsible for independently vetting
                Sitters before booking.
              </p>
              <p>
                Pawspective is not currently licensed, insured, or bonded on
                behalf of any Sitter or Client. Any insurance arrangements are
                the sole responsibility of the individual Sitter.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              2. Eligibility
            </h2>
            <div className="space-y-3 text-base leading-relaxed text-muted-foreground">
              <p>
                You must be at least 18 years of age to use the Service. By
                using Pawspective, you represent and warrant that you have the
                legal capacity to enter into a binding agreement.
              </p>
              <p>
                Sitters must apply through the official Sitter Application
                process and receive written approval from a Pawspective
                administrator before offering services. Approval may be revoked
                at any time at Pawspective's discretion.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              3. Client Responsibilities
            </h2>
            <ul className="space-y-2 text-base leading-relaxed text-muted-foreground list-disc list-inside">
              <li>
                Provide accurate information about your pets, including medical
                conditions, behavioral issues, dietary requirements, and
                emergency contacts.
              </li>
              <li>
                Ensure your pet(s) are current on all required vaccinations and
                are free from contagious diseases at the time of service.
              </li>
              <li>
                Notify the Sitter and Pawspective immediately of any changes to
                your pet's health status.
              </li>
              <li>
                Pay the agreed-upon service fees in a timely manner as specified
                in the booking confirmation.
              </li>
              <li>
                Understand that Pawspective does not guarantee outcomes and is
                not liable for injury, illness, death, loss, or property damage
                arising from any service.
              </li>
              <li>
                Independently verify each Sitter's credentials, experience, and
                references before engaging their services.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              4. Sitter Responsibilities
            </h2>
            <ul className="space-y-2 text-base leading-relaxed text-muted-foreground list-disc list-inside">
              <li>
                Provide all services with reasonable skill, care, and diligence.
              </li>
              <li>
                Accurately represent your experience, qualifications, and the
                services you offer. Misrepresentation may result in immediate
                account termination.
              </li>
              <li>
                Notify Clients promptly of any inability to fulfill a booked
                service.
              </li>
              <li>
                Comply with all applicable local, state, and federal laws
                related to the care of animals.
              </li>
              <li>
                Maintain adequate personal liability insurance coverage for your
                pet care activities. Pawspective does not provide insurance to
                Sitters.
              </li>
              <li>
                Keep Client and pet information confidential. Do not share
                personal data of Clients with third parties.
              </li>
              <li>
                Accurately log service activities and updates in the platform's
                service tracking system.
              </li>
              <li>
                You are an independent contractor, not an employee or agent of
                Pawspective. You are solely responsible for your own taxes,
                insurance, and compliance with any applicable regulations.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              5. Bookings &amp; Payments
            </h2>
            <div className="space-y-3 text-base leading-relaxed text-muted-foreground">
              <p>
                All service agreements are directly between the Client and the
                Sitter. Pawspective facilitates the connection but is not a
                party to any service agreement.
              </p>
              <p>
                Pricing is set by individual Sitters. Pawspective displays rates
                as provided by Sitters and does not warrant the accuracy of
                pricing information.
              </p>
              <p>
                Cancellations and refunds are subject to the individual Sitter's
                cancellation policy, which should be confirmed directly with the
                Sitter before booking.
              </p>
              <p>
                Any payment disputes must be resolved directly between the
                Client and the Sitter. Pawspective has no obligation to mediate
                payment disputes.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              6. Limitation of Liability
            </h2>
            <div className="space-y-3 text-base leading-relaxed text-muted-foreground">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, PAWSPECTIVE
                AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
                INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, GOODWILL, OR
                OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO YOUR USE
                OF THE SERVICE.
              </p>
              <p>
                PAWSPECTIVE DOES NOT CONDUCT BACKGROUND CHECKS AND MAKES NO
                REPRESENTATIONS REGARDING THE CHARACTER, QUALITY, OR
                QUALIFICATIONS OF ANY SITTER. YOU ASSUME ALL RISK ASSOCIATED
                WITH USING THE SERVICE AND ENGAGING ANY SITTER THROUGH THE
                PLATFORM.
              </p>
              <p>
                In jurisdictions that do not allow the exclusion of certain
                warranties or the limitation of liability for certain damages,
                Pawspective's liability is limited to the fullest extent
                permitted by law.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              7. Prohibited Conduct
            </h2>
            <ul className="space-y-2 text-base leading-relaxed text-muted-foreground list-disc list-inside">
              <li>
                Creating fake profiles or submitting false information on any
                application or booking form.
              </li>
              <li>
                Circumventing the platform to transact directly with Sitters
                discovered through Pawspective in order to avoid platform terms.
              </li>
              <li>
                Harassing, threatening, or abusing other users of the platform.
              </li>
              <li>
                Using the platform to facilitate any illegal activity, including
                animal abuse or neglect.
              </li>
              <li>
                Attempting to gain unauthorized access to the platform, backend,
                or other users' data.
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              8. Account Suspension &amp; Termination
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Pawspective reserves the right to suspend or permanently
              deactivate any Sitter or Client account at any time, for any
              reason, including but not limited to violations of these Terms,
              complaints from other users, or behavior that Pawspective
              determines to be harmful to the community. Deactivated Sitter
              profiles will no longer appear in search results.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              9. Changes to These Terms
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Pawspective may update these Terms at any time. Continued use of
              the Service after changes are posted constitutes your acceptance
              of the revised Terms. We will update the "Last updated" date at
              the top of this document when changes are made.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              10. Governing Law
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              These Terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which Pawspective operates,
              without regard to its conflict of law provisions. Any disputes
              arising under these Terms shall be resolved through good-faith
              negotiation before any formal legal action is initiated.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
              11. Contact
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              If you have questions about these Terms, please contact us through
              the Pawspective platform. We aim to respond to all inquiries
              within 5 business days.
            </p>
          </section>

          {/* Privacy link */}
          <section className="border-t border-border pt-8">
            <p className="text-muted-foreground text-sm">
              Please also read our{" "}
              <button
                type="button"
                onClick={() => navigate("privacy")}
                className="text-primary underline hover:text-primary/80 transition-colors"
              >
                Privacy Policy
              </button>{" "}
              to understand how we collect and use your personal information.
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
