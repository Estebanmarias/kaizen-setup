"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Instagram } from "lucide-react";
import { supabase } from "@/lib/supabase";

const SETUP_TYPES = ["Home Office", "Gaming Setup", "Business Workspace", "Desk Setup", "Other"];
const BUDGET_RANGES = [
  "Under ₦500,000",
  "₦500,000 – ₦800,000",
  "₦800,000 – ₦1,000,000",
  "₦1,000,000 – ₦5,000,000",
  "Above ₦5,000,000",
];

const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-colors";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", setup_type: "", budget_range: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in name, email and message.");
      return;
    }
    setLoading(true);
    setError("");
    if (!supabase) { setLoading(false); setSuccess(true); return; }
    const { error: sbError } = await supabase.from("contact_submissions").insert([form]);
    setLoading(false);
    if (sbError) setError("Something went wrong. Please try again.");
    else { setSuccess(true); setForm({ name: "", email: "", setup_type: "", budget_range: "", message: "" }); }
  };

  return (
    <section id="contact" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-500">Get In Touch</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Contact</h2>
          <p className="text-gray-500 max-w-xl">
            Tell us about your setup goals and we'll get back to you with a plan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4"
          >
            {success ? (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-blue-700 font-medium">
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
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors w-fit">
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-5"
          >
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <MapPin size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">Location</p>
                <p className="text-sm text-gray-500 mt-0.5">Ibadan, Oyo State, Nigeria</p>
              </div>
            </div>

            <a href="https://wa.me/2349064811857" target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-3 bg-gray-900 hover:bg-[#25D366] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-[#25D366]/25 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"
                className="transition-transform duration-300 group-hover:scale-110 flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>

            <a href="https://www.instagram.com/kaizensetup/" target="_blank" rel="noopener noreferrer"
              className="group relative flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 overflow-hidden transition-all duration-300 hover:border-transparent hover:text-white hover:shadow-lg hover:shadow-pink-500/25 w-fit">
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]" />
              <Instagram size={18} className="relative z-10 transition-transform duration-300 group-hover:scale-110" />
              <span className="relative z-10">Follow on Instagram</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}