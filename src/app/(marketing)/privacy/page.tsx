import type { Metadata } from "next";

import {
  LegalDocument,
  type LegalSection,
} from "@/features/marketing/components/legal-document";
import { PageHeader } from "@/features/marketing/components/page-header";

export const metadata: Metadata = {
  title: "Privacy notice — Inverge",
  description: "The pre-launch draft privacy notice for Inverge.",
};

const sections: LegalSection[] = [
  {
    heading: "Status and scope",
    paragraphs: [
      "This page is a pre-launch working draft, provided so prospective users can see the intended privacy posture while Inverge is being built. It is not the final privacy notice and must be reviewed by Nigerian counsel before accounts or live financial services launch.",
      "The final notice will identify the legal entity responsible for personal data, its registered contact details, launch jurisdictions, service providers, lawful bases, and effective date.",
    ],
  },
  {
    heading: "Information we expect to process",
    paragraphs: [
      "The information needed will depend on how a person uses Inverge. Planned categories include:",
    ],
    bullets: [
      "Account and contact details such as name, email address, and authentication identifiers.",
      "Profile, idea, campaign, reward, feedback, discussion, and support content a user chooses to submit.",
      "Payment, contribution, refund, and payout references needed to provide receipts and reconcile records.",
      "Wallet addresses, transaction signatures, and public network activity connected with Inverge transactions.",
      "Identity-verification provider references, status changes, and timestamps. Inverge must not store raw identity documents on its infrastructure.",
      "Security, device, diagnostic, consent, and support records needed to operate and protect the service.",
    ],
  },
  {
    heading: "Why information is used",
    paragraphs: [
      "The final product is expected to use personal data only for stated, necessary purposes, including:",
    ],
    bullets: [
      "Providing accounts, idea validation, campaigns, contributions, milestone review, refunds, and support.",
      "Meeting identity, fraud-prevention, sanctions, financial-crime, tax, accounting, and other legal obligations that apply at launch.",
      "Protecting users and the platform, investigating abuse, enforcing platform rules, and preserving audit records.",
      "Sending service messages and, only with an appropriate choice or lawful basis, optional product or marketing updates.",
      "Understanding product reliability and usage with data-minimising analytics selected before launch.",
    ],
  },
  {
    heading: "Identity verification",
    paragraphs: [
      "A selected verification provider will collect and assess identity information under its own privacy notice. Inverge will receive only the provider reference, decision or status, and audit timestamps needed for platform workflows.",
      "The verification screen will identify the provider and link its terms before a user submits information. Provider selection remains an open implementation decision.",
    ],
  },
  {
    heading: "Public and on-chain information",
    paragraphs: [
      "Idea and campaign content deliberately published to a public page can be seen, copied, or indexed by others. Users should not include private identity, financial, or contact information in public content.",
      "Supported contribution, escrow, release, and refund activity will create records on a public blockchain. Blockchain records can be permanent and may not be erasable by Inverge. The product will explain this before a wallet-linked action and keep unnecessary personal data off-chain.",
    ],
  },
  {
    heading: "Sharing and service providers",
    paragraphs: [
      "Inverge expects to use selected providers for hosting, authentication, identity checks, communications, payments, fiat conversion, wallet infrastructure, security, analytics, and support. The final notice will name or clearly categorise active providers and explain relevant international transfers.",
      "Personal data will not be sold. Information may be disclosed when required by law, to protect rights and safety, in a properly governed corporate transaction, or to processors acting under contract and instruction.",
    ],
  },
  {
    heading: "Retention and security",
    paragraphs: [
      "Retention periods will be based on the purpose of processing, user choices, financial and compliance obligations, disputes, security needs, and applicable law. The final schedule will distinguish account content, support records, KYC status records, payment records, and backups.",
      "Inverge will use proportionate technical and organisational safeguards, including access controls, encryption where appropriate, secret management, monitoring, and incident response. No service can promise absolute security.",
    ],
  },
  {
    heading: "Your choices and rights",
    paragraphs: [
      "Subject to applicable law, people may have rights to be informed, access personal data, correct it, object to or restrict processing, request deletion, receive portable data, withdraw consent, seek human review of relevant automated decisions, and complain to the Nigeria Data Protection Commission or another competent authority.",
      "Some requests may be limited by legal retention duties, the rights of others, fraud prevention, or the permanent nature of public blockchain records. The final notice will provide a verified request process and expected response times.",
    ],
  },
  {
    heading: "Children",
    paragraphs: [
      "The launch service is intended for people aged 18 or older. Inverge does not intend to knowingly open accounts for children. The final policy will document the deletion and escalation process if child data is identified.",
    ],
  },
  {
    heading: "Questions and changes",
    paragraphs: [
      "Material changes will be dated and communicated appropriately before they take effect. The final notice will not apply retroactively in a way that removes rights without a lawful basis.",
      "For questions about this draft, email hello@inverge.africa. Do not send identity documents, passwords, private keys, or wallet recovery phrases by email.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Legal"
        title="Privacy notice"
        description="A transparent preview of how Inverge intends to handle personal information, public content, provider checks, and on-chain records."
        note="Pre-launch draft · Not yet in force · Nigerian legal review required"
      />
      <LegalDocument sections={sections} />
    </main>
  );
}
