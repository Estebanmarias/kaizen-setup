import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | KaizenSetup",
  description: "Terms and conditions for using KaizenSetup's website and services.",
};

const SECTIONS = [
  {
    title: "1. About These Terms",
    content: `These Terms of Service ("Terms") govern your use of the KaizenSetup website at kaizensetup.name.ng and any services, products, or content we provide (collectively, the "Services").

By accessing our website or placing an order, you agree to be bound by these Terms. If you do not agree, please do not use our Services.

KaizenSetup is a Nigerian workspace solutions business. For any queries regarding these Terms, contact us at kaizensetup.ng@gmail.com.`,
  },
  {
    title: "2. Use of Our Website",
    content: `You agree to use our website only for lawful purposes and in a manner that does not infringe the rights of others or restrict their use of the website.

You must not:
- Use the website in any way that violates applicable Nigerian or international laws.
- Attempt to gain unauthorised access to any part of our systems or data.
- Transmit any unsolicited commercial communications or spam.
- Introduce viruses, malware, or any other harmful material.
- Use automated tools to scrape, crawl, or extract data from our website without permission.

We reserve the right to suspend or terminate access for any user who violates these Terms.`,
  },
  {
    title: "3. Products & Availability",
    content: `All products displayed on KaizenSetup are subject to availability. We make every effort to keep product listings accurate, including descriptions, images, and pricing.

We reserve the right to:
- Discontinue any product at any time without notice.
- Limit the quantity of any product available for purchase.
- Correct any errors in product descriptions or pricing.

Product images are for illustrative purposes. While we ensure they accurately represent the item, minor variations in colour or appearance may occur due to screen settings or manufacturer updates.`,
  },
  {
    title: "4. Pricing",
    content: `All prices on KaizenSetup are displayed in Nigerian Naira (₦) and are inclusive of applicable taxes unless stated otherwise.

We reserve the right to change prices at any time. The price applicable to your order is the price displayed at the time you complete your purchase. In the event of a pricing error, we will contact you before processing your order and you will have the option to proceed at the correct price or cancel.

For products with variable pricing (based on specifications or configurations), the final price will be confirmed before payment is processed.`,
  },
  {
    title: "5. Orders & Payment",
    content: `By placing an order on KaizenSetup, you are making an offer to purchase the selected product(s) at the stated price. Your order is confirmed only once payment has been successfully processed and you receive an order confirmation email.

We currently accept payment via:
- **Paystack** — debit/credit cards and online banking.
- **Bank transfer** — details provided upon request via kaizensetup.ng@gmail.com.

Payment must be made in full before an order is processed. We do not offer credit or instalment payment unless explicitly agreed in writing.

We reserve the right to refuse or cancel any order at our discretion, including where we suspect fraudulent activity or where a product has been mispriced.`,
  },
  {
    title: "6. Delivery",
    content: `KaizenSetup delivers primarily within Nigeria. International delivery is available on a case-by-case basis — contact us at kaizensetup.ng@gmail.com to discuss.

Estimated delivery windows:
- **Standard items:** 2–3 weeks from order confirmation.
- **Fast-track items:** 7 days or less, where specified.

Delivery timelines are estimates and may be affected by factors outside our control, including supplier availability, logistics delays, or public holidays. We will communicate any significant delays as soon as possible.

Delivery costs, where applicable, will be communicated before order confirmation. Risk of loss or damage passes to you upon delivery.`,
  },
  {
    title: "7. Returns & Refunds",
    content: `We want you to be satisfied with every purchase. We accept returns under the following conditions:

**Eligibility for return:**
- The item arrived damaged or physically defective upon delivery.
- The item does not function as described — specific features or functionalities are missing or broken.

**Process:**
1. Contact us within 48 hours of delivery at kaizensetup.ng@gmail.com with your order ID and a description of the issue.
2. We may request photos or video evidence of the defect.
3. Where necessary, we will arrange for the item to be inspected or tested.
4. Based on inspection, we will offer a replacement or refund at our discretion.

**Exclusions — we do not accept returns where:**
- The item has been damaged through misuse, improper handling, or accidental damage after delivery.
- The item is returned without prior authorisation.
- The return request is made more than 48 hours after delivery.
- The item shows signs of use inconsistent with inspection purposes.

Refunds, where approved, will be processed to the original payment method within 7–14 business days.`,
  },
  {
    title: "8. Intellectual Property",
    content: `All content on the KaizenSetup website — including text, images, logos, product descriptions, blog posts, and design — is the intellectual property of KaizenSetup or its licensors and is protected under Nigerian and international copyright law.

You may not reproduce, distribute, modify, or use our content for commercial purposes without prior written permission. Personal, non-commercial use is permitted provided you attribute KaizenSetup appropriately.`,
  },
  {
    title: "9. User Accounts",
    content: `When you create an account on KaizenSetup, you are responsible for:
- Maintaining the confidentiality of your login credentials.
- All activity that occurs under your account.
- Ensuring your account information is accurate and up to date.

You must notify us immediately at kaizensetup.ng@gmail.com if you suspect unauthorised access to your account. We reserve the right to suspend or terminate accounts that violate these Terms or are used fraudulently.`,
  },
  {
    title: "10. Reviews & User Content",
    content: `By submitting a product review or any other content on KaizenSetup, you grant us a non-exclusive, royalty-free licence to display and use that content on our website and marketing materials.

You agree that your reviews are honest, based on genuine experience, and do not contain:
- False or misleading statements.
- Content that is defamatory, offensive, or violates the rights of others.
- Spam or promotional content unrelated to the product.

We reserve the right to remove any content that violates these guidelines without notice.`,
  },
  {
    title: "11. Limitation of Liability",
    content: `To the fullest extent permitted by Nigerian law, KaizenSetup shall not be liable for:
- Indirect, incidental, or consequential losses arising from your use of our Services.
- Loss of data, revenue, or business opportunities.
- Delays or failures in delivery caused by circumstances beyond our reasonable control (force majeure), including natural disasters, strikes, government actions, or third-party logistics failures.

Our total liability to you in respect of any claim arising from your use of our Services shall not exceed the amount you paid for the order giving rise to the claim.`,
  },
  {
    title: "12. Third-Party Links",
    content: `Our website may contain links to third-party websites, including our Medium blog and social media profiles. These links are provided for convenience only. We have no control over third-party content and accept no responsibility for it. Accessing third-party sites is at your own risk.`,
  },
  {
    title: "13. Governing Law",
    content: `These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from these Terms or your use of our Services shall be subject to the exclusive jurisdiction of the Nigerian courts.`,
  },
  {
    title: "14. Changes to These Terms",
    content: `We reserve the right to update these Terms at any time. Changes will be posted on this page with a revised effective date. Continued use of our Services after changes are posted constitutes acceptance of the updated Terms. We encourage you to review these Terms periodically.`,
  },
  {
    title: "15. Contact",
    content: `For any questions about these Terms, contact us at:

**Email:** kaizensetup.ng@gmail.com
**Website:** kaizensetup.name.ng`,
  },
];

export default function TermsPage() {
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

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: {lastUpdated}</p>

        <p className="text-gray-600 leading-relaxed mb-12 text-base border-l-4 border-blue-500 pl-5">
          Please read these Terms carefully before using KaizenSetup. By placing an order or creating an account, you agree to be bound by these Terms.
        </p>

        <div className="flex flex-col gap-10">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{section.title}</h2>
              <div className="text-sm text-gray-600 leading-relaxed">
                {section.content.split("\n").map((line, i) => {
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return <p key={i} className="font-semibold text-gray-800 mt-4 mb-1">{line.replace(/\*\*/g, "")}</p>;
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
                  if (line.match(/^\d+\./)) {
                    return <p key={i} className="flex gap-2 mt-2"><span className="text-blue-500 font-semibold flex-shrink-0">{line.match(/^\d+\./)?.[0]}</span><span>{line.replace(/^\d+\./, "").trim()}</span></p>;
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
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-blue-500 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </main>
  );
}