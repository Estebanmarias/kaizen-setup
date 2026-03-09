"use client";

import { useState } from "react";
import { Copy, Check, Users } from "lucide-react";

interface Props {
  referralCode: string | null;
  referralCount: number;
}

export default function ReferralTab({ referralCode, referralCount }: Props) {
  const [copied, setCopied] = useState(false);

  const referralLink = referralCode
    ? `https://www.kaizensetup.name.ng/ref/${referralCode}`
    : null;

  const copy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Stats card */}
      <div className="flex items-center gap-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
          <Users size={18} className="text-blue-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{referralCount}</p>
          <p className="text-sm text-gray-400">
            {referralCount === 1 ? "person" : "people"} signed up via your link
          </p>
        </div>
      </div>

      {/* Referral link */}
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Your Referral Link</p>
        {referralLink ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111] text-sm text-gray-600 dark:text-gray-400 truncate font-mono">
              {referralLink}
            </div>
            <button
              onClick={copy}
              className="flex items-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors shrink-0"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Generating your referral link...</p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Share this link with friends. When they sign up, you'll be credited as their referrer.
        </p>
      </div>

      {/* Share buttons */}
      {referralLink && (
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Share via</p>
          <div className="flex gap-3 flex-wrap">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out KaizenSetup — the best workspace setup store in Nigeria 🔥 Use my link: ${referralLink}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-green-500 hover:text-green-500 transition-colors"
            >
              WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out KaizenSetup — Nigeria's best workspace setup store 🔥 ${referralLink}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:text-blue-400 transition-colors"
            >
              X (Twitter)
            </a>
          </div>
        </div>
      )}

      {/* Coming soon reward note */}
      <div className="flex items-start gap-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <span className="text-lg">🎁</span>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Rewards coming soon</p>
          <p className="text-xs text-gray-400 mt-0.5">
            We're working on rewards for successful referrals. Keep sharing — every referral will count retroactively.
          </p>
        </div>
      </div>

    </div>
  );
}