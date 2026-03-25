"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function NavBar() {
  const { publicKey, disconnect } = useWallet();
  const pathname = usePathname();
  const isInnerPage = pathname !== "/" && pathname !== "/dashboard";
  const truncated = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : "";

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[hsl(264,40%,7%)]/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          {isInnerPage && (
            <button onClick={() => window.history.back()} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors active:scale-95 border-none cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg" />
            <span className="font-mono-brand text-base font-bold tracking-tight text-white">
              simpl<span className="text-[hsl(263,90%,66%)]">Encrypt</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a href="https://faucet.solana.com" target="_blank" rel="noopener noreferrer" className="flex h-8 items-center gap-1.5 rounded-lg bg-[hsl(263,90%,66%)]/15 px-3 py-1.5 text-xs font-medium text-[hsl(263,90%,66%)] hover:bg-[hsl(263,90%,66%)]/25 transition-colors no-underline">
            💧 <span className="hidden sm:inline">Faucet</span>
          </a>
          {publicKey && (
            <>
              <div className="hidden sm:flex items-center rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
                <span className="font-mono-data text-xs text-white/60">{truncated}</span>
              </div>
              <button onClick={() => disconnect()} className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/50 transition-colors hover:text-white hover:bg-white/10 active:scale-95 border-none cursor-pointer">
                Disconnect
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export function ThemeToggle() {
  const toggle = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("simplencrypt_theme", isDark ? "dark" : "light");
  };
  return (
    <button onClick={toggle} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors active:scale-95 border-none cursor-pointer">
      <span className="text-sm">🌙</span>
    </button>
  );
}

export function PoweredFooter() {
  return (
    <div className="border-t border-white/10 mt-12 pt-6 pb-8">
      <div className="flex flex-col items-center gap-4">
        <p className="font-mono-data text-xs text-white/30 tracking-wide">
          Built with <span className="font-semibold text-white/50">Arcium MPC</span> on{" "}
          <span className="font-semibold text-white/50">Solana</span> — Private by default
        </p>
        <div className="flex items-center gap-3">
          <a href="https://x.com/nft_leymz" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/30 hover:text-white/60 hover:border-white/25 transition-colors">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://github.com/Leymz/simplencrypt" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/30 hover:text-white/60 hover:border-white/25 transition-colors">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const cls = status === "Active" ? "status-active" : status === "Computing" ? "status-computing" : status === "Finalized" ? "status-finalized" : "bg-white/10 text-white/40";
  return (
    <span className={`${cls} rounded-full px-2.5 py-0.5 text-[10px] font-medium flex items-center gap-1`}>
      {(status === "Active" || status === "Computing") && <span className={`h-1.5 w-1.5 rounded-full bg-current ${status === "Computing" ? "animate-pulse" : ""}`} />}
      {status}
    </span>
  );
}