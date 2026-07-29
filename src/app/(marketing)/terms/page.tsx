import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/marketing/page-header';
import { LegalDoc, type LegalSection } from '@/components/marketing/legal-doc';

export const metadata: Metadata = {
  title: 'Terms of Service — Inverge',
  description:
    'The terms that govern your use of Inverge: how backing, milestone funding, refunds, and builder obligations work.',
};

const UPDATED = '29 July 2026';

const sections: LegalSection[] = [
  {
    id: 'agreement',
    heading: 'Agreement to these terms',
    body: (
      <>
        <p>
          These Terms of Service (the “Terms”) govern your access to and use of Inverge: our
          website, applications, and services (together, the “Platform”). Inverge is a platform for
          validating ideas and backing early-stage builders across Africa, where funds are held and
          released against verified milestones.
        </p>
        <p>
          By creating an account, backing an idea, or otherwise using the Platform, you agree to be
          bound by these Terms and by our{' '}
          <Link href="/privacy">Privacy Policy</Link>. If you do not agree, please do not use the
          Platform.
        </p>
      </>
    ),
  },
  {
    id: 'who',
    heading: 'Who can use Inverge',
    body: (
      <>
        <p>To use Inverge, you must:</p>
        <ul>
          <li>Be at least 18 years old and able to enter a binding contract;</li>
          <li>
            Provide accurate, current, and complete information, and keep it up to date;
          </li>
          <li>
            Use the Platform only where you are legally permitted to do so, and not in breach of any
            law that applies to you.
          </li>
        </ul>
        <p>
          If you use Inverge on behalf of an organisation, you confirm that you are authorised to
          accept these Terms for that organisation, and “you” refers to both you and it.
        </p>
      </>
    ),
  },
  {
    id: 'accounts',
    heading: 'Your account and verification',
    body: (
      <>
        <p>
          You are responsible for the activity on your account and for keeping your sign-in details
          secure. Tell us promptly if you believe your account has been accessed without your
          permission.
        </p>
        <p>
          Certain activities, in particular raising funds as a builder, require identity
          verification. We use trusted verification partners to confirm your identity and, where
          relevant, your business details. You agree to provide the information they reasonably
          request, and you confirm it is truthful. We may limit, pause, or decline access where
          verification cannot be completed.
        </p>
      </>
    ),
  },
  {
    id: 'how',
    heading: 'How Inverge works',
    body: (
      <>
        <p>Inverge supports two connected activities:</p>
        <ul>
          <li>
            <strong>Idea validation.</strong> Builders publish an idea; the community can follow it,
            leave feedback, and signal support or pre-pledge interest before any campaign goes live.
          </li>
          <li>
            <strong>Milestone funding.</strong> When a campaign runs, the amounts you contribute are
            held in escrow and released to the builder in stages, as each milestone is delivered and
            verified, not all at once up front.
          </li>
        </ul>
        <p>
          Inverge provides the Platform that connects backers and builders and administers the
          escrow and milestone process. Inverge is not the builder, does not create the projects,
          and does not guarantee that any idea will succeed.
        </p>
      </>
    ),
  },
  {
    id: 'backers',
    heading: 'Backing an idea or campaign',
    body: (
      <>
        <p>
          When you back a campaign, you authorise the amount you choose to be collected and held in
          escrow. Funds are released to the builder only as milestones are met and verified.
        </p>
        <p>
          <strong>Refunds.</strong> If a builder fails to deliver a funded milestone within the
          terms of their campaign, the portion of your contribution tied to undelivered milestones is
          eligible to be returned to you. Amounts already released against milestones that were
          delivered are not refundable simply because a later milestone fails.
        </p>
        <p>
          Backing a builder carries risk. A returned contribution is not a guaranteed investment
          return, and Inverge does not promise any profit, equity, or reward beyond what a campaign
          expressly states.
        </p>
      </>
    ),
  },
  {
    id: 'builders',
    heading: 'Publishing and raising as a builder',
    body: (
      <>
        <p>If you publish an idea or run a campaign, you agree that:</p>
        <ul>
          <li>
            Everything you present (your identity, your team, your milestones, and your progress)
            is honest and not misleading;
          </li>
          <li>
            You will use funds released to you for the purpose described in your campaign, and make a
            genuine, good-faith effort to deliver each milestone;
          </li>
          <li>
            You will provide the proof of delivery your campaign requires, and respond reasonably to
            questions from your backers and from Inverge;
          </li>
          <li>
            You have the rights to everything you publish, and it does not infringe anyone else’s
            rights.
          </li>
        </ul>
        <p>
          Failing to deliver milestones, or misrepresenting your project, may result in refunds to
          backers, suspension of your campaign, and removal from the Platform.
        </p>
      </>
    ),
  },
  {
    id: 'fees',
    heading: 'Fees',
    body: (
      <>
        <p>
          Backing an idea is free. When a campaign successfully raises and releases funds, Inverge
          charges a platform fee, which is disclosed before you commit. Any applicable fee is shown
          to you clearly at the point it applies, and we do not add hidden charges.
        </p>
        <p>
          We may change our fees from time to time. Changes apply to campaigns that start after the
          change takes effect, not to funds already committed.
        </p>
      </>
    ),
  },
  {
    id: 'conduct',
    heading: 'Acceptable use',
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>Use Inverge for fraud, money laundering, or any unlawful purpose;</li>
          <li>
            Misrepresent yourself, impersonate others, or create accounts to manipulate funding,
            feedback, or rankings;
          </li>
          <li>
            Upload content that is illegal, deceptive, hateful, or that infringes others’ rights;
          </li>
          <li>
            Interfere with, probe, or attempt to gain unauthorised access to the Platform or its
            security;
          </li>
          <li>Scrape or harvest data from the Platform except as we expressly permit.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'content',
    heading: 'Your content and intellectual property',
    body: (
      <>
        <p>
          You keep ownership of the content you publish: your idea descriptions, updates, images,
          and comments. By publishing it on Inverge, you grant us a non-exclusive, worldwide,
          royalty-free licence to host, display, and share that content for the purpose of operating
          and promoting the Platform.
        </p>
        <p>
          The Inverge name, logo, and the Platform itself remain our property. These Terms do not
          give you any right to use our brand without our written permission.
        </p>
      </>
    ),
  },
  {
    id: 'disclaimers',
    heading: 'Disclaimers and limitation of liability',
    body: (
      <>
        <p>
          The Platform is provided “as is”. We work hard to keep it accurate and available, but we do
          not warrant that it will be uninterrupted, error-free, or that any project you back will
          succeed. Verification and milestone review reduce risk; they do not remove it.
        </p>
        <p>
          To the fullest extent permitted by law, Inverge is not liable for indirect or consequential
          losses, or for loss of profit or opportunity. Nothing in these Terms limits any liability
          that cannot lawfully be limited, including for fraud.
        </p>
      </>
    ),
  },
  {
    id: 'termination',
    heading: 'Suspension and termination',
    body: (
      <p>
        You may stop using Inverge at any time. We may suspend or close an account that breaches
        these Terms, poses a risk to backers or builders, or that we are required to act on by law.
        Where funds are held in escrow when an account is suspended, we will resolve them in line
        with the refund and milestone rules above.
      </p>
    ),
  },
  {
    id: 'changes',
    heading: 'Changes to these terms',
    body: (
      <p>
        We may update these Terms as the Platform evolves. If we make a material change, we will give
        reasonable notice, for example by posting the updated Terms here and updating the date
        above. Continuing to use Inverge after a change means you accept the updated Terms.
      </p>
    ),
  },
  {
    id: 'law',
    heading: 'Governing law and disputes',
    body: (
      <p>
        These Terms are governed by the laws of the Federal Republic of Nigeria. We would always
        rather resolve a concern with you directly, so please contact us first. Any dispute that
        cannot be resolved that way will be subject to the courts of Lagos State, Nigeria, unless a
        law that protects you requires otherwise.
      </p>
    ),
  },
  {
    id: 'contact',
    heading: 'Contact us',
    body: (
      <p>
        Questions about these Terms? Reach us at{' '}
        <a href="mailto:legal@inverge.africa">legal@inverge.africa</a> or through our{' '}
        <Link href="/contact">contact page</Link>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        lede="The agreement between you and Inverge: how backing, milestone funding, refunds, and builder obligations work."
        meta={`Last updated ${UPDATED}`}
      />
      <LegalDoc sections={sections} />
    </>
  );
}
