import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | KaizenSetup",
  description: "How KaizenSetup collects, uses, and protects your personal data.",
};

const SECTIONS = [
  {
    title: "1. Who We Are",
    content: `KaizenSetup is a Nigerian technology and workspace solutions business operating at kaizensetup.name.ng. We help individuals and organisations build efficient, affordable workspaces through product sales, consultations, and content.

For any privacy-related enquiries, contact us at kaizensetup.ng@gmail.com.`,
  },
  {
    title: "2. What Data We Collect",
    content: `We collect the following categories of personal data:

**Identity & Contact Data** — your full name, email address, and phone number when you place an order, submit a contact form, or create an account.

**Transaction Data** — details of products you purchase, order amounts, payment references, and delivery information.

**Technical Data** — your IP address, browser type, device information, and pages visited. This is collected automatically via Google Analytics 4 (GA4).

**Usage Data** — how you interact with our website, including products viewed, search queries, and cart activity.

**Communications Data** — messages you send us via contact forms or WhatsApp, and newsletter subscription status.

**Account Data** — your profile information if you create an account, including your name, avatar, and order history.`,
  },
  {
    title: "3. How We Collect Your Data",
    content: `We collect data through the following means:

- **Direct interactions** — when you place an order, fill in a contact form, create an account, or subscribe to our newsletter.
- **Automated technologies** — cookies and similar tracking technologies via Google Analytics 4.
- **Third-party services** — Paystack (payment processing), Supabase (data storage and authentication), and Brevo (email delivery).`,
  },
  {
    title: "4. How We Use Your Data",
    content: `We use your personal data for the following purposes:

- To process and fulfil your orders, including sending confirmation and delivery emails.
- To manage your account and provide customer support.
- To send transactional emails related to your orders (confirmation, updates, cancellations).
- To send our newsletter if you have opted in — you may unsubscribe at any time.
- To improve our website and understand how visitors use it (via GA4 analytics).
- To prevent fraud and ensure the security of our platform.
- To comply with legal obligations.

We will never sell your personal data to third parties. We do not use your data for automated decision-making or profiling.`,
  },
  {
    title: "5. Legal Basis for Processing",
    content: `We process your personal data on the following legal bases under the Nigeria Data Protection Regulation (NDPR) and, where applicable, the General Data Protection Regulation (GDPR):

- **Contract performance** — processing necessary to fulfil your order or provide a service you have requested.
- **Legitimate interests** — analytics, fraud prevention, and improving our services, where these interests are not overridden by your rights.
- **Consent** — for newsletter communications and non-essential cookies. You may withdraw consent at any time.
- **Legal obligation** — where we are required to retain data by Nigerian law.`,
  },
  {
    title: "6. Data Sharing & Third Parties",
    content: `We share your data only with trusted third parties necessary to operate our business:

- **Paystack** — payment processing. Your card details are handled entirely by Paystack and never stored on our servers. Paystack is PCI-DSS compliant.
- **Supabase** — our database and authentication provider. Data is stored on Supabase servers (hosted on AWS infrastructure).
- **Brevo (Sendinblue)** — email delivery for order confirmations and newsletters.
- **Google Analytics 4** — anonymous website usage analytics.
- **Vercel** — our website hosting provider.

All third parties are contractually required to handle your data securely and in compliance with applicable data protection laws.`,
  },
  {
    title: "7. Data Retention",
    content: `We retain your personal data for as long as necessary to fulfil the purposes described in this policy:

- **Order data** — retained for 7 years for accounting and legal compliance purposes.
- **Account data** — retained for as long as your account is active. You may delete your account at any time by contacting us.
- **Newsletter data** — retained until you unsubscribe.
- **Analytics data** — retained for 14 months by Google Analytics.
- **Contact form submissions** — retained for up to 2 years.`,
  },
  {
    title: "8. Cookies",
    content: `We use cookies and similar tracking technologies on our website:

- **Essential cookies** — required for the website to function correctly, including authentication and cart functionality.
- **Analytics cookies** — Google Analytics 4 uses cookies to collect anonymous usage data to help us understand how visitors use our site.

You may control cookie preferences through your browser settings. Disabling certain cookies may affect website functionality. We will implement a cookie consent mechanism to give you full control over non-essential cookies.`,
  },
  {
    title: "9. Your Rights",
    content: `Under the NDPR and GDPR (where applicable), you have the following rights regarding your personal data:

- **Right to access** — request a copy of the personal data we hold about you.
- **Right to rectification** — request correction of inaccurate or incomplete data.
- **Right to erasure** — request deletion of your personal data, subject to legal retention obligations.
- **Right to restrict processing** — request that we limit how we use your data.
- **Right to data portability** — request your data in a structured, machine-readable format.
- **Right to object** — object to processing based on legitimate interests, including direct marketing.
- **Right to withdraw consent** — where processing is based on consent, withdraw it at any time without affecting prior processing.

To exercise any of these rights, email us at kaizensetup.ng@gmail.com. We will respond within 30 days.`,
  },
  {
    title: "10. Data Security",
    content: `We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, or disclosure. These include:

- Encrypted data storage via Supabase (AES-256 encryption at rest).
- HTTPS encryption for all data in transit.
- Role-based access controls — only authorised personnel can access customer data.
- Secure payment processing via Paystack — we never store payment card details.

No method of transmission over the internet is 100% secure. If you believe your data has been compromised, contact us immediately at kaizensetup.ng@gmail.com.`,
  },
  {
    title: "11. Children's Privacy",
    content: `Our services are not directed at individuals under the age of 18. We do not knowingly collect personal data from minors. If you believe a minor has provided us with personal data, please contact us and we will delete it promptly.`,
  },
  {
    title: "12. International Transfers",
    content: `Your data may be transferred to and processed in countries outside Nigeria, including by our service providers (Supabase on AWS, Vercel, Google, Brevo). We ensure that appropriate safeguards are in place for such transfers in compliance with NDPR requirements.`,
  },
  {
    title: "13. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on this page with a revised effective date. Continued use of our website after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "14. Contact & Complaints",
    content: `For any questions, concerns, or requests regarding this Privacy Policy or your personal data, contact us at:

**Email:** kaizensetup.ng@gmail.com
**Website:** kaizensetup.name.ng

If you are unsatisfied with our response, you have the right to lodge a complaint with the Nigeria Data Protection Bureau (NDPB) at ndpb.gov.ng.`,
  },
];

export default function PrivacyPage() {
  const lastUpdated = "August 2026";

  return (
    <main className="min-h-screen bg-white pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:underline mb-10">
          <ArrowLeft size={13} /> Back to Home
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-500">Legal</p>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: {lastUpdated}</p>

        <p className="text-gray-600 leading-relaxed mb-12 text-base border-l-4 border-blue-500 pl-5">
          KaizenSetup is committed to protecting your privacy. This policy explains what data we collect, why we collect it, and how we use it. Please read it carefully.
        </p>

        <div className="flex flex-col gap-10">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{section.title}</h2>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {section.content.split("\n").map((line, i) => {
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return <p key={i} className="font-semibold text-gray-800 mt-3 mb-1">{line.replace(/\*\*/g, "")}</p>;
                  }
                  if (line.startsWith("- **")) {
                    const parts = line.slice(2).split("** — ");
                    return (
                      <p key={i} className="flex gap-2 mt-2">
                        <span className="text-blue-500 flex-shrink-0">—</span>
                        <span><strong className="text-gray-800">{parts[0].replace(/\*\*/g, "")}</strong>{parts[1] ? ` — ${parts[1]}` : ""}</span>
                      </p>
                    );
                  }
                  if (line.startsWith("- ")) {
                    return <p key={i} className="flex gap-2 mt-2"><span className="text-blue-500 flex-shrink-0">—</span><span>{line.slice(2)}</span></p>;
                  }
                  if (line.trim() === "") return <br key={i} />;
                  return <p key={i} className="mt-2">{line}</p>;
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-gray-100 pt-8 text-center">
          <p className="text-sm text-gray-400">Questions? Email us at{" "}
            <a href="mailto:kaizensetup.ng@gmail.com" className="text-blue-500 hover:underline">
              kaizensetup.ng@gmail.com
            </a>
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/terms" className="text-sm text-gray-400 hover:text-blue-500 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </main>
  );
}