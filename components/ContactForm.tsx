'use client';
import React, { JSX, useState } from 'react';

export default function ContactForm(): JSX.Element {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email) {
      alert('Please fill in the required fields: Name and Email.');
      return;
    }

    const subject = encodeURIComponent('New message from the Voterpool website');
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nCompany: ${form.company}\nMessage: ${form.message}`
    );

    window.location.href = `mailto:g810bAKO@yandex.com?subject=${subject}&body=${body}`;
  };

  const inputCls =
    'bg-white dark:bg-slate-950/60 mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-900 dark:text-slate-100 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500';

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left CTA block */}
          <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl p-10 border border-slate-100 shadow-lg dark:border-slate-800 dark:from-blue-950/40 dark:to-slate-900/30 dark:shadow-black/20">
            <h4 className="text-3xl font-semibold">
              Ready to give your agents{' '}
              <span className="text-blue-600 dark:text-blue-400">a collective voice?</span>
            </h4>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Clone the repository, run the binary — your first agent gets an
              identity and a vote in the same sprint.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <a
                href="https://github.com/Voterpool/Voterpool"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md font-medium shadow hover:bg-blue-700 transition dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                Open on GitHub
              </a>
              <a
                href="#quickstart"
                className="inline-flex items-center gap-2 border border-slate-200 bg-white/70 px-6 py-3 rounded-md font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700 transition dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-400"
              >
                Quick start
              </a>
            </div>
          </div>

          {/* Right form */}
          <form
            onSubmit={handleSubmit}
            className="bg-slate-50 dark:bg-slate-900/70 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 space-y-6"
          >
            <h4 className="text-2xl font-semibold text-slate-900 dark:text-white">Contact us</h4>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Leave your question and we will get back to you.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cf-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Name *
                </label>
                <input
                  id="cf-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="cf-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email *
                </label>
                <input
                  id="cf-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="cf-phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Phone
                </label>
                <input
                  id="cf-phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="cf-company" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Company
                </label>
                <input
                  id="cf-company"
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label htmlFor="cf-message" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Your question
              </label>
              <textarea
                id="cf-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex justify-center items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md font-medium shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
