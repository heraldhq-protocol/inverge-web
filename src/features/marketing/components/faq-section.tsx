"use client";

import { useState } from "react";

import { Container } from "@/features/marketing/components/container";

const faqItems = [
  {
    question: "Is this investing?",
    answer:
      "No. Inverge is strictly rewards and donation crowdfunding. You back ideas out of community support or to receive project rewards. There are no shares, dividends, interest, or financial returns of any kind.",
  },
  {
    question: "What happens if a milestone fails?",
    answer:
      "If milestone evidence fails review or an objection is upheld, remaining funds in escrow can be claimed back by backers pro rata. The initial working-capital tranche released at funding close is not refundable.",
  },
  {
    question: "Do I need a crypto wallet?",
    answer:
      "No. You do not need crypto experience or an external wallet to back an idea. You can participate using familiar payment methods. Behind the scenes, milestone escrow runs on smart contracts, with technical details held behind public receipts.",
  },
  {
    question: "Can I get all my money back?",
    answer:
      "No. Refunds apply only to eligible funds still held in escrow. The working-capital tranche, released at funding close so the builder can start work, is not refundable. Milestone amounts and release schedules are disclosed upfront before you fund.",
  },
  {
    question: "Who can launch a campaign?",
    answer:
      "Any builder in Nigeria and West Africa with a clear problem, roadmap, and milestone plan can publish an idea for validation. Campaigns that advance to crowdfunding undergo identity verification and curation before public backing opens.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-canvas py-16 md:py-24">
      <Container>
        <h2
          data-reveal
          className="text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl"
        >
          Frequently asked questions
        </h2>

        <div
          data-reveal-stagger="0.06"
          className="mt-8 divide-y divide-border/80 border-y border-border/80"
        >
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question} className="py-1">
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex min-h-14 w-full items-center justify-between gap-4 py-3.5 text-left transition-colors hover:text-brand"
                >
                  <span className="text-base font-semibold text-ink sm:text-lg">
                    {item.question}
                  </span>
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center text-muted transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-ink" : ""
                    }`}
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>

                {isOpen && (
                  <div className="pb-5 pt-1">
                    <p className="max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
