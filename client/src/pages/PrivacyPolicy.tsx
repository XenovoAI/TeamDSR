import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-12 md:pt-24 md:pb-16 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: December 21, 2025</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6 md:p-10 space-y-8">
            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to NEETPeak. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy explains how we collect, use, and safeguard your information when you use our 
                educational platform.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">2. Privacy Commitment</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Examway Edutech recognises that personal data processed through a digital education platform requires 
                a structured legal basis, an informed notice architecture, purpose limitation, secure processing practices, 
                and a responsive rights-handling mechanism. Accordingly, Examway Edutech states that personal data collected 
                through the Site, the App, and the Services shall be processed in a manner intended to align with the 
                Digital Personal Data Protection Act, 2023 and the standards of notice, consent, withdrawal, rights 
                communication, grievance routing, and purpose specificity that flow therefrom.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Where Examway Edutech determines the purpose and means of processing personal data collected from Users, 
                Examway Edutech shall ordinarily act as a data fiduciary; where limited processing is undertaken strictly 
                on behalf of a partner or under confined technical instruction, Examway Edutech may in an appropriate case 
                function in a processor-like or service-provider capacity, without derogating from any mandatory statutory 
                responsibility that may nevertheless attach to it.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">3. Personal Data We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For the avoidance of doubt, personal data may include, without limitation:
              </p>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-2">Account Registration Details:</p>
                  <p className="leading-relaxed">
                    Name, mobile number, email address, password credentials in protected form, city, state, 
                    NEET preparation stage or target year, exam preference indicators, parental information where 
                    relevant, and such additional profile information as may be voluntarily furnished by the User.
                  </p>
                </div>
                
                <div>
                  <p className="font-semibold text-foreground mb-2">Transaction and Subscription Information:</p>
                  <p className="leading-relaxed">
                    Order identifiers, payment status, billing references, plan details, coupons, refunds, 
                    cancellations, and support-linked purchase history.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-foreground mb-2">Academic and Service-Use Information:</p>
                  <p className="leading-relaxed">
                    Course access history, module completion, quiz attempts, answer behaviour, progress markers, 
                    rank indicators, bookmarks, preference settings, doubts posted, mentor interactions, and usage patterns.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-foreground mb-2">Device, Log, and Technical Information:</p>
                  <p className="leading-relaxed">
                    IP address, browser type, operating system, app build, device identifier, session traces, 
                    timestamps, crash diagnostics, and other metadata reasonably required for security, service 
                    continuity, analytics, troubleshooting, and fraud prevention.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">4. Lawful Purposes for Processing</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Examway Edutech may process personal data for purposes including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Creation and maintenance of user accounts</li>
                <li>Authentication of login credentials</li>
                <li>Enabling purchase, provisioning, and renewal of courses or subscriptions</li>
                <li>Linking educational content and progress history to a single account across devices</li>
                <li>Rendering recommendations, performance summaries, reminders, and personalised learning experiences</li>
                <li>Responding to doubts, support requests, complaints, and grievances</li>
                <li>Maintaining audit trails, fraud checks, abuse prevention, platform analytics, and quality monitoring</li>
                <li>Enforcing contractual rights and platform rules</li>
                <li>Complying with tax, accounting, legal, regulatory, or law-enforcement requirements</li>
                <li>Such other connected, incidental, or reasonably expected purposes as may be disclosed in the relevant notice or otherwise permitted under law</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Where consent is the legal basis relied upon, such consent shall be intended to be specific, informed, 
                unambiguous, and communicated through a clear affirmative act rather than passive acquiescence or 
                pre-selected boxes.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">5. Legitimate Processing</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Examway Edutech may also process personal data in circumstances that fall within recognised legitimate 
                uses or analogous legally permitted grounds, including situations where the User has voluntarily provided 
                personal data for a specified purpose and has not indicated non-consent, or where processing becomes 
                reasonably necessary for compliance, fraud prevention, security, or other legally cognisable grounds 
                recognised by applicable law.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                However, the existence of such a legally permitted ground shall not diminish Examway Edutech's commitment 
                to provide an intelligible notice, maintain purpose discipline, and permit rights exercise to the extent 
                available under law. Examway Edutech shall endeavour that notices made available at or prior to data 
                collection identify the categories of personal data intended for processing, the specific or reasonably 
                connected purposes of such processing, the manner in which Users may exercise available rights, the means 
                for grievance redressal, and the contact particulars of the officer or contact point designated to respond 
                to such requests or complaints.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">6. Account-Dependent Services</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The User acknowledges that certain portions of the Services are inherently account-dependent and cannot 
                be meaningfully rendered without processing such personal data as is necessary for identification, 
                authentication, purchase linkage, progress retention, content entitlement, anti-fraud control, or 
                continuity of learning experience across sessions and devices.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                To that extent, if the User declines to provide mandatory personal data or withdraws consent in respect 
                of processing essential to a requested Service, Examway Edutech may be unable to create, maintain, or 
                continue the relevant account, purchase, entitlement, or feature. Such inability shall not, by itself, 
                constitute deficiency of service where the refused or withdrawn data was reasonably necessary for the 
                relevant digital educational function.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">7. Data Sharing</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Examway Edutech may disclose or permit access to personal data, on a need-to-know and purpose-bound basis, 
                to payment processors, cloud-hosting providers, communications vendors, analytics service providers, 
                customer support platforms, anti-fraud vendors, infrastructure providers, app-store ecosystems, compliance 
                consultants, auditors, legal advisors, and other service providers engaged for the operation, security, 
                improvement, or lawful administration of the Services.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Such disclosures shall, to the extent reasonably practicable, be governed by contractual controls, 
                confidentiality obligations, access restrictions, and use limitations appropriate to the role of the 
                recipient. Personal data shall not be sold as a standalone data commodity; however, disclosure may occur 
                where required to comply with law, court order, government requisition, regulatory direction, legal process, 
                merger or restructuring activity, fraud investigation, or the protection of rights, property, safety, 
                platform integrity, or the public interest.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">8. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Examway Edutech shall maintain reasonable security safeguards commensurate with the volume, nature, 
                sensitivity, and risk profile of personal data processed through the Site and the App, which safeguards 
                may include access controls, need-based permissions, encryption or equivalent protection where appropriate, 
                secure development and deployment practices, logging, vendor assessment, incident handling procedures, 
                and internal governance mechanisms.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Notwithstanding the foregoing, no digital network, storage environment, or method of transmission can be 
                rendered absolutely immune from unauthorised access, compromise, interception, misuse, or technological 
                failure, and therefore Examway Edutech does not warrant absolute security. The User acknowledges and 
                accepts that residual risk is an inherent incident of all digital interaction.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">9. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Personal data shall be retained only for such period as may be reasonably necessary to fulfil the purpose 
                for which it was collected or processed, to continue account-linked educational functionality, to meet 
                contractual obligations, to address complaints and disputes, to preserve evidence, to comply with tax or 
                legal obligations, or otherwise as required or permitted under applicable law.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Upon expiry of such necessity, Examway Edutech may delete, anonymise, aggregate, archive, suppress, or 
                otherwise render the data incapable of practical identification, subject always to legal hold, 
                fraud-monitoring needs, payment reconciliation, audit preservation, or other lawful retention grounds. 
                Deletion requests shall be assessed and acted upon subject to identity verification, legal permissibility, 
                technical feasibility, and overriding retention obligations.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">10. User Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Subject to applicable law and reasonable identity verification, the User may have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Seek access to personal data</li>
                <li>Request correction or completion of inaccurate or incomplete data</li>
                <li>Withdraw consent where consent constitutes the lawful basis of processing</li>
                <li>Request erasure of data that is no longer necessary or lawfully retainable</li>
                <li>Seek grievance redressal in relation to data processing</li>
                <li>Receive communication regarding the means of approaching the competent adjudicatory or regulatory body where such recourse is recognised by law</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Examway Edutech shall endeavour to provide reasonable channels, whether through account settings, support 
                workflows, deletion pages, or other means, to enable the submission and handling of such requests in 
                accordance with statutory requirements, internal controls, and legitimate verification standards.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">11. Children's Data</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Where the User is a child or where the NEET Peak platform is used for the benefit of a minor, Examway 
                Edutech may require such parental or lawful guardian involvement, declarations, confirmations, or consent 
                artefacts as it deems appropriate or as may be required under law. Examway Edutech reserves the right to 
                restrict account creation, suspend features, seek additional verification, or decline service where 
                age-related compliance cannot be satisfactorily established.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Any educational usage by minors shall remain subject to the overarching responsibility of the parent or 
                lawful guardian to supervise and evaluate the suitability of digital interactions, purchases, and communications.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">12. Payments</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Site and the App may permit purchase of courses, subscriptions, test series, books, counselling 
                packages, mentorship programmes, or other educational goods or services through one or more authorised 
                payment channels, including but not limited to credit cards, debit cards, UPI instruments, net banking 
                rails, wallet systems, app-store managed in-app purchase systems, or such other payment methods as may 
                be supported from time to time.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The User acknowledges that payment processing may be routed through regulated payment aggregators, 
                gateways, banking partners, app-store billing frameworks, or intermediary payment systems, and that such 
                payment flows may additionally be subject to terms, authentication requirements, chargeback processes, 
                security protocols, and regulatory standards imposed by card networks, issuing banks, acquiring institutions, 
                payment service providers, platform operators, or competent authorities.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                No purchase shall be deemed validly consented to by the User unless the relevant act of purchase, 
                subscription confirmation, payment authorisation, or checkout acceptance is expressed through an explicit 
                and affirmative action of the User or the User's authorised representative. Examway Edutech shall not be 
                obliged to honour any claim founded upon alleged accidental purchase where the transaction records 
                reasonably demonstrate affirmative completion of the purchase flow, subject however to any non-waivable 
                statutory rights or platform-mandated refund obligations.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">13. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of significant changes 
                via email or platform notification. Continued use of our platform after changes constitutes 
                acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">14. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this privacy policy or how we handle your data, please contact us at:
              </p>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">Email: help.neetpeak@gmail.com</p>
                <p className="font-semibold">Phone: +91 8696873558</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
