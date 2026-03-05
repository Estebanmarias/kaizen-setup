"use client";

import { useState } from "react";
import { MapPin, MessageCircle, Instagram } from "lucide-react";
import { supabase } from "@/lib/supabase";

const SETUP_TYPES = [
  "Home Office",
  "Gaming Setup",
  "Business Workspace",
  "Desk Setup",
  "Other",
];

const BUDGET_RANGES = [
  "Under ₦50,000",
  "₦50,000 – ₦150,000",
  "₦150,000 – ₦300,000",
  "₦300,000 – ₦500,000",
  "Above ₦500,000",
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    setup_type: "",
    budget_range: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in name, email and message.");
      return;
    }
    setLoading(true);
    setError("");
    if (!supabase) {
      setLoading(false);
      setSuccess(true);
      setForm({ name: "", email: "", setup_type: "", budget_range: "", message: "" });
      return;
    }
    const { error: sbError } = await supabase.from("contact_submissions").insert([form]);
    setLoading(false);
    if (sbError) {
      setError("Something went wrong. Please try again.");
    } else {
      setSuccess(true);
      setForm({ name: "", email: "", setup_type: "", budget_range: "", message: "" });
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition-colors";

  return (
    <section id="contact" className="py-20 px-6 bg-gray-50 dark:bg-[#141414]">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3">
          Get In Touch
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Contact
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-xl">
          Tell us about your setup goals and we'll get back to you with a plan.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="flex flex-col gap-4">
            {success ? (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-blue-700 dark:text-blue-400 font-medium">
                ✓ Message received! We'll be in touch shortly.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input name="name" value={form.name} onChange={handle} placeholder="Your Name" className={inputClass} />
                  <input name="email" value={form.email} onChange={handle} placeholder="Email Address" type="email" className={inputClass} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select name="setup_type" value={form.setup_type} onChange={handle} className={inputClass}>
                    <option value="">Setup Type</option>
                    {SETUP_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <select name="budget_range" value={form.budget_range} onChange={handle} className={inputClass}>
                    <option value="">Budget Range</option>
                    {BUDGET_RANGES.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <textarea name="message" value={form.message} onChange={handle}
                  placeholder="Tell us about your setup goals..." rows={5} className={inputClass} />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button onClick={submit} disabled={loading}
                  className="bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors w-fit">
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">Location</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ibadan, Oyo State, Nigeria</p>
              </div>
            </div>

            <a href="https://wa.me/2347035378462" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-200 text-white dark:text-gray-900 px-5 py-3 rounded-lg font-semibold text-sm transition-colors w-fit">
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>

            <a href="https://www.instagram.com/kaizensetup/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:text-blue-500 text-gray-700 dark:text-gray-300 px-5 py-3 rounded-lg font-semibold text-sm transition-colors w-fit">
              <Instagram size={18} />
              Follow on Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}