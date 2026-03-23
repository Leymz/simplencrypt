"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

export function NavBar() {
  const { publicKey, disconnect } = useWallet();
  const truncated = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : "";

  return (
    <div className="bg-white dark:bg-[#140F25] border-b border-[#E5E1EE] dark:border-[#2A2445] px-8 py-3 flex justify-between items-center">
      <Link href="/dashboard" className="flex items-center gap-2 no-underline">
        <img src="/logo.png" alt="simplEncrypt" className="w-8 h-8 rounded-lg object-cover" />
        <span className="font-brand text-[17px] text-[#1A1625] dark:text-[#EEEAF6]">
          simpl<span className="font-bold text-brand-purple">Encrypt</span>
        </span>
      </Link>
      <div className="flex items-center gap-3">
        <a href="https://faucet.solana.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#9945FF]/8 via-[#14F195]/8 to-[#00D1FF]/8 border border-[#9945FF]/15 no-underline hover:border-[#9945FF]/30 transition">
          <svg width="12" height="12" viewBox="0 0 128 128"><defs><linearGradient id="sfn" x1="0" y1="128" x2="128" y2="0"><stop stopColor="#9945FF"/><stop offset="0.5" stopColor="#14F195"/><stop offset="1" stopColor="#00D1FF"/></linearGradient></defs><circle cx="64" cy="64" r="64" fill="url(#sfn)" opacity="0.8"/></svg>
          <span className="text-[11px] font-semibold text-[#8B5CF6]">Faucet</span>
        </a>
        <ThemeToggle />
        {publicKey && (
          <>
            <div className="px-3 py-1.5 rounded-lg bg-[#F0EDF6] dark:bg-[#1A1530] text-xs font-medium text-[#4A4555] dark:text-[#A09BB0] font-mono">
              {truncated}
            </div>
            <button
              onClick={() => disconnect()}
              className="px-3 py-1.5 rounded-lg border border-[#E5E1EE] dark:border-[#2A2445] text-xs text-[#8A8494] hover:text-[#4A4555] transition bg-transparent cursor-pointer"
            >
              Disconnect
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function ThemeToggle() {
  const toggle = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("simplencrypt_theme", isDark ? "dark" : "light");
  };
  return (
    <button
      onClick={toggle}
      className="w-10 h-[22px] rounded-full bg-[#E5E1EE] dark:bg-[rgba(167,139,250,0.3)] relative transition-colors flex-shrink-0"
    >
      <div className="w-4 h-4 rounded-full bg-white dark:bg-[#A78BFA] absolute top-[3px] left-[3px] dark:left-[21px] transition-all shadow-sm text-[8px] flex items-center justify-center">
        <span className="dark:hidden">☀️</span>
        <span className="hidden dark:inline">🌙</span>
      </div>
    </button>
  );
}

export function PoweredFooter() {
  return (
    <div className="border-t border-[#E5E1EE] dark:border-[#2A2445] mt-10 py-5 px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-[#9C96AA] font-mono">
          <svg width="14" height="14" viewBox="0 0 128 128"><defs><linearGradient id="sg2" x1="0" y1="128" x2="128" y2="0"><stop stopColor="#9945FF"/><stop offset="0.5" stopColor="#14F195"/><stop offset="1" stopColor="#00D1FF"/></linearGradient></defs><circle cx="64" cy="64" r="64" fill="url(#sg2)" opacity="0.8"/></svg>
          Built with <span className="text-brand-purple font-semibold">Arcium MPC</span> on <span className="text-brand-purple font-semibold">Solana</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://x.com/nft_leymz" target="_blank" rel="noopener noreferrer" className="text-[#8A8494] hover:text-[#4A4555] dark:hover:text-[#EEEAF6] transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="#" className="text-[#8A8494] hover:text-[#4A4555] dark:hover:text-[#EEEAF6] transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
          <a href="https://faucet.solana.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] text-[#8A8494] hover:text-brand-purple transition no-underline font-mono">
            <svg width="12" height="12" viewBox="0 0 128 128"><defs><linearGradient id="sfg3" x1="0" y1="128" x2="128" y2="0"><stop stopColor="#9945FF"/><stop offset="0.5" stopColor="#14F195"/><stop offset="1" stopColor="#00D1FF"/></linearGradient></defs><circle cx="64" cy="64" r="64" fill="url(#sfg3)" opacity="0.8"/></svg>
            Faucet
          </a>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    Computing: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    Finalized: "bg-brand-purple-bg dark:bg-purple-500/10 text-brand-purple-dark dark:text-purple-300",
  };
  const dot = status !== "Finalized";
  return (
    <span className={`px-3 py-1 rounded-lg text-[11px] font-semibold font-mono inline-flex items-center gap-1 ${styles[status] || ""}`}>
      {dot && "●"} {status}
    </span>
  );
}

export function BackButton({ href }: { href: string }) {
  return (
    <Link href={href} className="text-[17px] text-[#4A4555] dark:text-[#A09BB0] no-underline px-1 py-0.5 rounded hover:bg-[#F0EDF6] dark:hover:bg-[#1A1530] transition">
      ←
    </Link>
  );
}

export function PlatformStats() {
  const stats = [
    { v: "179", l: "Total Encrypted Votes" },
    { v: "2", l: "Active DAOs" },
    { v: "60", l: "Total Members" },
  ];
  return (
    <div className="mt-12 pt-8 border-t border-[#E5E1EE] dark:border-[#2A2445]">
      <div className="grid grid-cols-3">
        {stats.map((s, i) => (
          <div key={i} className="text-center py-7">
            <div className="text-4xl font-bold text-brand-purple font-mono tracking-tight">
              {s.v}
            </div>
            <div className="text-[11px] text-[#8A8494] mt-2 uppercase tracking-[1.5px] font-semibold">
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
