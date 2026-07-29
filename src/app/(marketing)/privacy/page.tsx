import React from 'react';
import { pageMetadata } from '@/lib/metadata';
import Link from 'next/link';
import { PageHeader } from '@/components/marketing/page-header';
import { LegalDoc, type LegalSection } from '@/components/marketing/legal-doc';

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'How Inverge collects, uses, and protects your personal information, and the rights you have over it.',
  path: '/privacy',
});

const UPDATED = '29 July 2026';

const sections: LegalSection[] = [
  {
    id: 'intro',
    heading: 'Introduction',
    body: (
      <>
        <p>
          This Privacy Policy explains how Inverge collects, uses, shares, and protects your
          personal information when you use our website, applications, and services (the “Platform”).
          It applies to backers, builders, and visitors.
        </p>
        <p>
          We aim to collect only what we need to run a trustworthy platform, to be clear about why,
          and to give you real control. If anything here is unclear, please{' '}
          <Link href="/contact">contact us</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'collect',
    heading: 'Information we collect',
    body: (
      <>
        <ul>
          <li>
            <strong>Account information</strong>:your name, email address, and the details you add
            to your profile.
          </li>
          <li>
            <strong>Identity and business verification</strong>:where you raise funds as a builder,
            information needed to confirm your identity and business, collected through our
            verification partners (for example, a government ID and a selfie check).
          </li>
          <li>
            <strong>Activity on the Platform</strong>:the ideas you publish, back, or follow, the
            feedback you leave, and your contribution and milestone history.
          </li>
          <li>
            <strong>Payment information</strong>:the details needed to collect, hold, and return
            funds, handled through our payment and escrow partners.
          </li>
          <li>
            <strong>Technical information</strong>:device and browser data, approximate location,
            and how you interact with the Platform, collected to keep it secure and working well.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'use',
    heading: 'How we use your information',
    body: (
      <>
        <p>We use your information to:</p>
        <ul>
          <li>Operate the Platform: accounts, publishing, backing, escrow, and milestones;</li>
          <li>Verify identity and prevent fraud, money laundering, and abuse;</li>
          <li>Personalise your discovery feed and show you relevant ideas;</li>
          <li>Communicate with you about your account, campaigns you back, and important changes;</li>
          <li>Meet our legal, tax, and regulatory obligations;</li>
          <li>Improve the Platform and develop new features.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'verification',
    heading: 'Identity verification',
    body: (
      <p>
        To keep the Platform safe and to meet our obligations, builders raising funds go through
        identity verification, and business verification where relevant, handled by trusted verification
        partners. These partners process the documents and biometric checks you provide, and share
        the result with us so we can decide whether to enable fund-raising. They handle that data
        under their own privacy terms and their agreements with us, and only for verification.
      </p>
    ),
  },
  {
    id: 'share',
    heading: 'How we share information',
    body: (
      <>
        <p>We do not sell your personal information. We share it only:</p>
        <ul>
          <li>
            <strong>With service providers</strong>:verification, payment, escrow, hosting, and
            analytics partners who process data on our behalf under contract;
          </li>
          <li>
            <strong>Between backers and builders</strong>:limited information needed for a campaign
            to work, such as a builder’s public profile and a backer’s support of a campaign;
          </li>
          <li>
            <strong>For legal reasons</strong>:where we must comply with the law, respond to a
            valid legal request, or protect the rights and safety of our users and the Platform;
          </li>
          <li>
            <strong>In a business transfer</strong>:if Inverge is involved in a merger or
            acquisition, with continued protection under this Policy.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'retention',
    heading: 'How long we keep it',
    body: (
      <p>
        We keep your information for as long as your account is active and as long as we need it for
        the purposes in this Policy, including to honour milestone and refund obligations and to
        meet legal, tax, and anti-fraud requirements. When we no longer need it, we delete or
        anonymise it.
      </p>
    ),
  },
  {
    id: 'rights',
    heading: 'Your rights',
    body: (
      <>
        <p>
          Subject to the applicable law, including the Nigeria Data Protection Act, you
          may:
        </p>
        <ul>
          <li>Access the personal information we hold about you;</li>
          <li>Ask us to correct information that is wrong or incomplete;</li>
          <li>Ask us to delete information, where we are not required to keep it;</li>
          <li>Object to or restrict certain uses, and withdraw consent where we rely on it;</li>
          <li>Ask for a copy of certain information in a portable format.</li>
        </ul>
        <p>
          To exercise any of these, contact us using the details below. We will respond within the
          time the law requires.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    heading: 'How we protect your information',
    body: (
      <p>
        We use technical and organisational measures like encryption in transit, access controls, and
        regular review to protect your information. No system is perfectly secure, so we also ask
        you to protect your own account by keeping your sign-in details private and telling us
        promptly if something looks wrong.
      </p>
    ),
  },
  {
    id: 'cookies',
    heading: 'Cookies and similar technologies',
    body: (
      <p>
        We use cookies and similar technologies to keep you signed in, remember your preferences,
        keep the Platform secure, and understand how it is used so we can improve it. You can control
        cookies through your browser settings; turning some off may affect how parts of the Platform
        work.
      </p>
    ),
  },
  {
    id: 'children',
    heading: 'Children',
    body: (
      <p>
        Inverge is not intended for anyone under 18, and we do not knowingly collect information from
        children. If you believe a child has given us personal information, please contact us and we
        will remove it.
      </p>
    ),
  },
  {
    id: 'changes',
    heading: 'Changes to this policy',
    body: (
      <p>
        We may update this Policy as the Platform and the law evolve. If we make a material change,
        we will give reasonable notice, for example by posting the updated Policy here and updating
        the date above.
      </p>
    ),
  },
  {
    id: 'contact',
    heading: 'Contact us',
    body: (
      <p>
        For any privacy question, or to exercise your rights, email{' '}
        <a href="mailto:privacy@inverge.africa">privacy@inverge.africa</a> or use our{' '}
        <Link href="/contact">contact page</Link>. We take every request seriously.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        lede="What we collect, why we collect it, who we share it with, and the control you have over your information."
        meta={`Last updated ${UPDATED}`}
      />
      <LegalDoc sections={sections} />
    </>
  );
}
