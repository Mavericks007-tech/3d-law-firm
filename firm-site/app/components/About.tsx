import Image from "next/image";

const POINTS = [
  {
    title: "One named solicitor",
    body: "The person you meet at the first appointment stays on the file to the end. No handover to a paralegal once the retainer is signed.",
  },
  {
    title: "Costs agreed in writing",
    body: "Fixed fee where the work can be scoped, a capped hourly rate where it cannot. You approve any figure before it is incurred.",
  },
  {
    title: "Replies within one working day",
    body: "Every email and call gets an answer inside 24 hours, even when the answer is that we are still waiting on the other side.",
  },
];

export default function About() {
  return (
    <section id="cases" className="py-28 md:py-36">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 px-4 md:grid-cols-[1fr_0.85fr] md:gap-20 md:px-8">
        <div>
          <h2 className="max-w-[16ch]">How the firm works</h2>

          <dl className="mt-14 divide-y divide-ink/10 border-t border-ink/10">
            {POINTS.map((point) => (
              <div key={point.title} className="py-8">
                <dt className="font-display text-[1.35rem] font-medium tracking-tight">
                  {point.title}
                </dt>
                <dd className="mt-3 max-w-[52ch] text-ink/80">{point.body}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex items-center justify-center md:items-start md:justify-end">
          <div className="w-full">
            <Image
              src="/statue-still.avif"
              alt="Bronze sculpture of Lady Justice holding the scales"
              width={1600}
              height={900}
              loading="lazy"
              sizes="(max-width: 768px) 90vw, 46vw"
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
