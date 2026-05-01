import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-12 md:pt-24 md:pb-16 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-muted-foreground">NEET PEAK T&C - EXAMWAY EDUTECH PVT LTD</p>
          <p className="text-muted-foreground text-sm mt-2">Last updated: December 21, 2025</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6 md:p-10 space-y-8">
            <section>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This Terms of Use and Privacy Policy document is intended to govern, regulate, define, and condition 
                the access to, browsing of, registration on, purchase through, interaction with, and continued use of 
                the <span className="font-semibold text-foreground">NEET Peak</span> website presently accessible at{" "}
                <a href="https://www.neetpeak.com" className="text-indigo-600 hover:underline">www.neetpeak.com</a>{" "}
                (hereinafter referred to as the <span className="font-semibold text-foreground">"Site"</span>), the{" "}
                <span className="font-semibold text-foreground">NEET Peak</span> mobile application presently made 
                available through the Google Play ecosystem and any successor distribution channel (hereinafter referred 
                to as the <span className="font-semibold text-foreground">"App"</span>), and all content, products, 
                tools, question banks, test series, performance analytics, doubt-resolution interfaces, mentorship 
                programmes, learning modules, communications systems, payment flows, account services, and other related 
                digital facilities, functions, or offerings made available by or on behalf of Examway Edutech Private 
                Limited from time to time (collectively, the <span className="font-semibold text-foreground">"Services"</span>).
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The present document has been updated with regard to the legal framework presently relevant to digital 
                services, intermediary compliance, personal data processing, user grievance redressal, and e-commerce 
                conduct in India, including <span className="font-semibold text-foreground">the Digital Personal Data 
                Protection Act, 2023</span>, <span className="font-semibold text-foreground">the Information Technology 
                Act, 2000</span> and the due diligence architecture reflected in the{" "}
                <span className="font-semibold text-foreground">Information Technology (Intermediary Guidelines and 
                Digital Media Ethics Code) Rules, 2021</span>, together with the disclosure and consumer-facing standards 
                reflected in the <span className="font-semibold text-foreground">Consumer Protection (E-Commerce) Rules, 
                2020</span>.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">About Examway Edutech</h2>
              <p className="text-muted-foreground leading-relaxed">
                Examway Edutech Private Limited, a company duly incorporated under the Companies Act, 2013, and having 
                its registered and principal office at <span className="font-semibold text-foreground">A-266, Triveni 
                Nagar, Gopalpura Bypass, Durgapura, Jaipur, Rajasthan, India – 302018</span> (hereinafter referred to 
                as "Examway Edutech", which expression shall, unless repugnant to the context or meaning thereof, be 
                deemed to include its successors, permitted assigns, affiliates, subsidiaries, group entities, contractors, 
                service providers, delegates, and authorised representatives), owns, controls, administers, licenses, 
                manages, or otherwise operates the Site, the App, and the Services.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                By accessing, browsing, registering upon, subscribing to, transacting through, or otherwise using the 
                Site, the App, or any portion of the Services in any manner whatsoever, any user, visitor, subscriber, 
                purchaser, contributor, instructor, parent, guardian, institution, representative, or other accessing 
                person (collectively, the <span className="font-semibold text-foreground">"User"</span>) shall be deemed 
                to have read, understood, acknowledged, and irrevocably agreed to be bound by this document in its entirety.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For the purposes of interpretation, unless the context otherwise requires, the expressions "we", "us", 
                "our", and "Examway Edutech" shall refer to Examway Edutech Private Limited, and the expressions "you", 
                "your", and "User" shall refer to any natural person, parent or guardian acting on behalf of a minor, 
                institution, educational body, partnership, company, association, trust, or any other legal or juristic 
                entity accessing or using the Site, the App, or the Services, whether directly or indirectly, whether as 
                a casual visitor or a registered account holder, and whether for browsing, purchasing, learning, reviewing, 
                administering, uploading, participating, or any other platform-linked purpose.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Where a User acts on behalf of another person or legal entity, such User represents, warrants, and 
                undertakes, on a continuing basis, that such User is possessed of sufficient legal authority, mandate, 
                power, and competence to bind the represented person or entity to this document and to every obligation, 
                waiver, consent, authorisation, representation, and indemnity contained herein.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">2. Scope and Application</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The User acknowledges and agrees that access to and use of the Site, the App, and the Services is 
                conditional, revocable, limited, non-exclusive, non-transferable, and subject at all times to continued 
                compliance with this document, with any supplemental platform policies, product-specific conditions, and 
                applicable law.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This document shall apply to the Site and the App as an integrated contractual instrument, provided always 
                that certain services, products, examination packages, counselling offerings, community features, or premium 
                functions may be subject to additional or supplemental terms disclosed at the relevant point of interaction, 
                purchase, or activation. To the extent any such supplemental terms are lawfully incorporated, they shall be 
                read harmoniously with this document; however, in the event of inconsistency, the interpretation that 
                preserves Examway Edutech's regulatory position, platform integrity, and contractual intent to the maximum 
                extent permitted by law shall prevail unless Examway Edutech expressly states otherwise in writing.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">3. Amendment of Terms</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Examway Edutech reserves the absolute, unilateral, and continuing right, in its sole discretion and without 
                any obligation to furnish prior notice, explanation, or justification, to amend, modify, vary, supplement, 
                replace, or restate this document, in whole or in part, by publishing the revised version upon the Site, 
                the App, or any other official communication interface maintained by Examway Edutech. Any such amendment, 
                modification, variation, supplement, replacement, or restatement shall become effective upon such publication 
                or upon such later date as may be specified therein.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The User's continued access to or use of the Site, the App, or the Services after such publication shall 
                constitute conclusive and binding evidence of acceptance of the amended version. If the User does not agree 
                to any amendment, the sole and exclusive remedy available to the User shall be the discontinuation of use 
                of the Site, the App, and the Services.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">4. Access and Availability</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Access to certain areas, products, or features of the Site or the App may be made available without charge, 
                while other areas, products, or features may be conditional upon registration, subscription, one-time payment, 
                recurring payment, institutional onboarding, parental verification, or such other access criteria as Examway 
                Edutech may determine from time to time.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Nothing contained on the Site or the App shall be construed as creating any enforceable expectation that any 
                particular feature, price point, subscription plan, scholarship structure, course availability, test interface, 
                educator participation, content library, or technological functionality shall continue, remain unchanged, or be 
                made available for any minimum duration. Examway Edutech may, in its sole discretion, alter the architecture, 
                sequencing, composition, naming, packaging, mode of access, duration, or availability of any Service, and may 
                suspend, discontinue, merge, split, localise, personalise, geo-restrict, or withdraw any part thereof without 
                thereby incurring liability except to the extent such liability cannot be excluded under applicable law.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">5. Permitted Use</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The User shall use the Site, the App, and the Services solely for lawful, bona fide, personal, educational, 
                and non-commercial purposes unless Examway Edutech has expressly authorised a different use in writing.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Without limiting the generality of the foregoing, the User shall not copy, scrape, reproduce, mirror, archive, 
                republish, stream, broadcast, frame, transmit, decompile, reverse engineer, adapt, modify, translate, index, 
                distribute, display, sell, sublicense, commercially exploit, or otherwise deal with any content, interface, 
                data arrangement, workflow, question bank, performance output, course material, explanation video, visual 
                element, analytics layer, software logic, or compilation made available through the Site or the App except 
                strictly as permitted under this document.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Any unauthorised use, including systematic extraction or retrieval of content for the creation of a rival 
                repository, derivative database, tutoring aid, answer archive, AI training set, aggregation engine, ranking 
                product, or competitive learning service, shall constitute a material breach of these Terms of Use and may 
                additionally amount to infringement under applicable intellectual property law.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">6. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All text, software, scripts, graphics, question statements, answer keys, video lectures, solution 
                explanations, diagrams, mock test structures, dashboards, user-interface architecture, metadata, arrangement 
                of compilations, educational sequences, trade dress, logos, trademarks, service marks, brand identifiers, 
                reports, templates, downloadable materials, and all other materials or content made available on or through 
                the Site or the App, whether visible, embedded, downloadable, streamed, cached, generated, or otherwise made 
                perceptible (collectively, <span className="font-semibold text-foreground">"NEET Peak Content"</span>), are 
                and shall remain the exclusive property of Examway Edutech and/or its licensors, as the case may be, and 
                shall be protected by applicable copyright, trademark, database, trade secret, contractual, and other 
                proprietary rights.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                No right, title, or interest in or to any NEET Peak Content is transferred to the User except for the narrow 
                permission to access such content in accordance with these Terms of Use. All rights not expressly granted are 
                reserved.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">7. Third Party Content</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The User acknowledges that certain material made available on or through the Site or the App may be supplied, 
                uploaded, posted, published, transmitted, or otherwise made available by third parties, including but not 
                limited to users, mentors, partner educators, institutional collaborators, integrated service providers, 
                payment processors, app-store operators, logistics providers, or other external contributors{" "}
                (<span className="font-semibold text-foreground">"Third Party Content"</span>).
              </p>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, Examway Edutech shall not be deemed to be the author, originator, 
                publisher, certifier, or guarantor of Third Party Content merely by reason of hosting, displaying, indexing, 
                linking to, caching, or making such content available. Examway Edutech does not warrant the accuracy, legality, 
                fitness, completeness, quality, non-infringement, pedagogical suitability, or outcome-reliability of any Third 
                Party Content, and any reliance placed thereon by the User shall be at the User's sole risk and consequence.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">8. External Links</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Site or the App may contain references or links to external sites, third-party payment pages, app-store 
                pages, social channels, communication gateways, cloud resources, maps, support tools, or embedded services not 
                owned or controlled by Examway Edutech. Such links or integrations are made available merely for convenience, 
                utility, interoperability, or transactional necessity and shall not be construed as constituting endorsement, 
                control, partnership, representation, warranty, certification, or recommendation by Examway Edutech.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The User acknowledges that access to such external services may be governed by separate terms, privacy policies, 
                technology standards, and payment frameworks, and Examway Edutech shall not be liable for any loss, claim, delay, 
                data exposure, transaction dispute, or service failure arising out of or connected with the use of such third-party 
                environments.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">9. Prohibited Conduct</h2>
              <p className="text-muted-foreground leading-relaxed">
                The User shall not, directly or indirectly, undertake, attempt, facilitate, permit, assist, procure, or encourage 
                any act or omission that may undermine, impair, compromise, overload, damage, intercept, expropriate, degrade, or 
                interfere with the security, integrity, reliability, availability, or normal functioning of the Site, the App, the 
                Services, or any server, database, network, endpoint, system, software, API, storage layer, content delivery 
                environment, or associated infrastructure used by Examway Edutech or by any service provider engaged by Examway 
                Edutech.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                This prohibition shall include, without limitation, credential abuse, account sharing designed to circumvent plan 
                restrictions, bot access, denial-of-service activity, malicious code insertion, traffic manipulation, request 
                flooding, unauthorised penetration attempts, privilege escalation, reverse engineering, security scanning without 
                consent, or any attempt to bypass access controls, geo-controls, payment controls, rights management, or exam 
                integrity safeguards.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">10. User Representations</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The User represents, warrants, covenants, and undertakes that all information furnished to Examway Edutech, 
                whether at the time of account creation, enrolment, payment, scholarship application, support interaction, profile 
                completion, referral use, doubt posting, review publication, or at any other time, shall be true, complete, current, 
                lawful, and not misleading in any material respect.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Where the User uploads, posts, submits, shares, transmits, stores, or otherwise makes available any text, image, 
                document, review, profile element, communication, feedback, query, response, comment, rating, doubt, answer, note, 
                or other material through or in connection with the Site or the App{" "}
                (<span className="font-semibold text-foreground">"User Material"</span>), the User shall be solely responsible for 
                such User Material and for the consequences of making the same available.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">11. User Material License</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The User hereby grants to Examway Edutech a non-exclusive, worldwide, transferable, sublicensable, perpetual, 
                irrevocable, royalty-free licence and right to host, store, reproduce, process, adapt, translate, publish, 
                distribute, display, communicate to the public, moderate, analyse, and otherwise use User Material to the extent 
                reasonably necessary or desirable for providing, improving, securing, promoting, auditing, defending, or 
                administering the Site, the App, and the Services, subject always to the privacy commitments and data-processing 
                limitations otherwise applicable under law.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                To the extent any User Material embodies intellectual property, personality attributes, or other protectable subject 
                matter, the User further represents that all rights, permissions, consents, and licences necessary for the grant of 
                the foregoing licence have been validly obtained and shall remain valid for so long as necessary to give effect to 
                these Terms.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">12. User Conduct</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                The User shall not submit, communicate, or make available any User Material or otherwise use the Site or the 
                App in any manner that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Is fraudulent, deceptive, false, unlawful, misleading, or manipulative</li>
                <li>Infringes any copyright, trademark, patent, trade secret, privacy right, publicity right, confidentiality 
                obligation, or other third-party right</li>
                <li>Impersonates any person or entity or falsely states or misrepresents affiliation</li>
                <li>Is defamatory, libellous, threatening, harassing, abusive, hateful, discriminatory, obscene, pornographic, 
                invasive of privacy, harmful to minors, or contrary to public order or morals</li>
                <li>Contains malware, spyware, trojans, worms, harmful code, or hidden mechanisms</li>
                <li>Constitutes unauthorised solicitation, spam, deceptive advertising, or a competing commercial pitch</li>
                <li>Promotes illegal goods, unlawful services, or prohibited transactions</li>
                <li>Otherwise creates or is reasonably likely to create liability, regulatory exposure, technical harm, 
                reputational injury, or consumer confusion for Examway Edutech or any third party</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">13. Enforcement</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Without prejudice to any other right or remedy available at law, in equity, or under this document, Examway 
                Edutech shall have the right, in its sole discretion and without prior notice, to investigate, screen, flag, 
                redact, delist, remove, disable access to, preserve, disclose, report, or otherwise deal with any User Material, 
                account, activity, communication, transaction, or pattern of conduct that Examway Edutech reasonably suspects to 
                be unlawful, non-compliant, harmful, abusive, fraudulent, infringing, objectionable, or otherwise inconsistent 
                with this document, applicable law, platform safety, examination integrity, or consumer protection considerations.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The exercise or non-exercise of any such right by Examway Edutech shall not create any duty to monitor 
                comprehensively, nor any representation that all non-compliant conduct shall necessarily be identified or acted 
                upon in real time.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">14. Grievance Redressal</h2>
              <p className="text-muted-foreground leading-relaxed">
                In keeping with the due diligence framework applicable to intermediaries under Indian law, including the{" "}
                <span className="font-semibold text-foreground">Information Technology (Intermediary Guidelines and Digital 
                Media Ethics Code) Rules, 2021</span>, Examway Edutech may maintain and update rules, privacy notices, grievance 
                channels, notice-and-action workflows, dispute escalation methods, and such internal oversight systems as may be 
                reasonably required for user complaints, content moderation, takedown handling, reinstatement requests, 
                law-enforcement cooperation, and record retention.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To the extent applicable, Examway Edutech may appoint a Grievance Officer or similar designated official and may 
                acknowledge and process complaints within timelines prescribed by law or internal policy. Nothing in this clause 
                shall be interpreted as a waiver of Examway Edutech's legal defences, safe harbour positions, or rights to act 
                proportionately upon actual knowledge, lawful orders, or good-faith safety assessments.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">15. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions, complaints, or grievances regarding these Terms of Service, please contact us:
              </p>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">Email: help.neetpeak@gmail.com</p>
                <p className="font-semibold">Phone: +91 8696873558</p>
                <p className="font-semibold mt-2">Registered Office:</p>
                <p className="text-sm">A-266, Triveni Nagar, Gopalpura Bypass</p>
                <p className="text-sm">Durgapura, Jaipur, Rajasthan, India – 302018</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
