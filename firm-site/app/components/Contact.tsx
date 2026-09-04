"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "error" | "sent";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const matter = String(data.get("matter") ?? "").trim();

    const next: Record<string, string> = {};
    if (!name) next.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Please enter an email address we can reply to.";
    if (matter.length < 10)
      next.matter = "A sentence or two about the matter helps us route it.";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      setStatus("error");
      return;
    }

    // Frontend only — wire this to the firm's intake endpoint before launch.
    setStatus("submitting");
    await new Promise((resolve) => setTimeout(resolve, 900));
    setStatus("sent");
  }

  return (
    <section id="contact" className="border-t border-ink/10 py-28 md:py-36">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 px-4 md:grid-cols-[1fr_0.9fr] md:px-8">
        <div>
          <h2 className="max-w-[14ch]">Tell us what happened</h2>
          <p className="mt-5 max-w-[48ch] text-ink/80">
            The first conversation is thirty minutes and costs nothing. You will
            leave it knowing whether you have a case and what pursuing it would
            cost.
          </p>

          <dl className="mt-12 space-y-6 text-[0.95rem]">
            <div>
              <dt className="text-muted">Telephone</dt>
              <dd className="mt-1">+44 20 7946 0417</dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="mt-1">enquiries@wildanlegal.co.uk</dd>
            </div>
            <div>
              <dt className="text-muted">Office</dt>
              <dd className="mt-1">
                4th Floor, 118 Aldersgate Street
                <br />
                London EC1A 4JQ
              </dd>
            </div>
          </dl>
        </div>

        {status === "sent" ? (
          <div className="flex flex-col justify-center border-t border-ink/10 pt-10 md:border-t-0 md:pt-0">
            <h3 className="font-display text-[1.5rem] font-medium tracking-tight">
              Enquiry received
            </h3>
            <p className="mt-3 max-w-[46ch] text-ink/80">
              A solicitor will read it and reply within one working day. If the
              matter is urgent, call the number on the left and ask for the duty
              solicitor.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setErrors({});
              }}
              className="mt-8 self-start rounded-pill border border-ink/20 px-6 py-3 text-[0.9rem] transition-colors duration-300 hover:border-ink/40 active:translate-y-px"
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-[0.9rem]">
                Your name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                className="rounded-pill border border-ink/20 bg-transparent px-5 py-3 transition-colors duration-300 focus:border-accent focus:outline-none"
              />
              {errors.name && (
                <p className="text-[0.85rem] text-deep">{errors.name}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-[0.9rem]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                className="rounded-pill border border-ink/20 bg-transparent px-5 py-3 transition-colors duration-300 focus:border-accent focus:outline-none"
              />
              {errors.email && (
                <p className="text-[0.85rem] text-deep">{errors.email}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="matter" className="text-[0.9rem]">
                What is the matter about
              </label>
              <textarea
                id="matter"
                name="matter"
                rows={5}
                aria-invalid={Boolean(errors.matter)}
                aria-describedby="matter-help"
                className="border border-ink/20 bg-transparent px-5 py-4 transition-colors duration-300 focus:border-accent focus:outline-none"
              />
              <p id="matter-help" className="text-[0.85rem] text-muted">
                Do not send documents or anything confidential through this
                form.
              </p>
              {errors.matter && (
                <p className="text-[0.85rem] text-deep">{errors.matter}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="self-start rounded-pill bg-ink px-7 py-3.5 text-base text-[0.95rem] transition-all duration-300 hover:bg-deep active:translate-y-px disabled:opacity-60"
            >
              {status === "submitting" ? "Sending" : "Request a consultation"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
