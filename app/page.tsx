"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";

function useCodeRain(count: number) {
  return useMemo(() => {
    const chars = "01αβγΔΣΩ∞∂∑∏⊕⊗⟨⟩{}[]<>≡≈";
    return Array.from({ length: count }, (_, i) => {
      const col: string[] = [];
      const len = 8 + Math.floor(Math.random() * 14);
      for (let j = 0; j < len; j++) col.push(chars[Math.floor(Math.random() * chars.length)]);
      return {
        left: `${4 + (i / count) * 92}%`,
        text: col.join("\n"),
        duration: 6 + Math.random() * 10,
        delay: Math.random() * 8,
        opacity: 0.12 + Math.random() * 0.18,
      };
    });
  }, [count]);
}

export default function LandingPage() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const router = useRouter();
  const rainCols = useCodeRain(18);
  const [howOpen, setHowOpen] = useState(false);

  useEffect(() => {
    if (connected && publicKey) router.push("/dashboard");
  }, [connected, publicKey, router]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[hsl(264,40%,6%)]">
      {/* Hero background */}
      <div className="absolute inset-0 animate-hero-zoom">
        <img src="/hero-guardian.jpg" alt="" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(264,40%,4%)] via-[hsl(264,40%,6%)]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(264,40%,4%)]/80 via-transparent to-[hsl(264,40%,4%)]/80" />
        <div className="absolute inset-0 bg-[hsl(264,40%,6%)]/30" />
      </div>

      {/* Code rain */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {rainCols.map((col, i) => (
          <div key={i} className="code-rain-col" style={{ left: col.left, animationDuration: `${col.duration}s`, animationDelay: `${col.delay}s`, opacity: col.opacity }}>
            {col.text}
          </div>
        ))}
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-9 w-9 rounded-lg" />
          <span className="font-mono-brand text-lg font-bold tracking-tight text-white">
            simpl<span className="text-[hsl(263,90%,66%)]">Encrypt</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://x.com/nft_leymz" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-colors">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://github.com/Leymz/simplencrypt" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-colors">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="animate-fade-in-up mb-4">
          <span className="inline-block rounded-full border border-[hsl(263,90%,66%)]/40 bg-[hsl(263,90%,66%)]/10 px-4 py-1.5 text-xs font-medium text-[hsl(263,90%,66%)] tracking-wider uppercase font-mono-data">
            DAO Voting · Devnet · Community Polls
          </span>
        </div>

        <h1 className="animate-fade-in-up text-center text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-2" style={{ animationDelay: "100ms" }}>
          Private votes.
        </h1>
        <h2 className="animate-fade-in-up text-center text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-8" style={{ animationDelay: "200ms" }}>
          <span className="text-gradient-purple">Public trust.</span>
        </h2>

        <p className="animate-fade-in-up text-center text-white/50 text-sm sm:text-base max-w-xl mb-12 font-mono-data leading-relaxed" style={{ animationDelay: "300ms" }}>
          Cast encrypted votes on DAO proposals or quick community polls — your choice stays hidden. Arcium&apos;s multi-party computation ensures ballot secrecy with full on-chain verifiability on Solana.
        </p>

        {/* Wallet connect */}
        <div className="animate-fade-in-up w-full max-w-sm mb-8" style={{ animationDelay: "400ms" }}>
          <button onClick={() => setVisible(true)} className="neon-btn w-full rounded-xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2.5">
            🔗 Select Wallet
          </button>
        </div>

        {/* How it works */}
        <div className="animate-fade-in-up mb-8" style={{ animationDelay: "500ms" }}>
          <button onClick={() => setHowOpen(!howOpen)} className="neon-btn rounded-xl px-8 py-3 text-sm font-semibold tracking-wide">
            {howOpen ? "Close" : "How it works"}
          </button>
        </div>

        {/* Collapsible content */}
        {howOpen && (
          <div className="animate-fade-in-up w-full max-w-2xl mb-10">
            <div className="dark-panel rounded-2xl p-8">
              <p className="text-sm text-white/50 leading-relaxed mb-8 font-mono-data">
                simplEncrypt is a Solana-based voting platform that eliminates voter herd mentality. Using Arcium&apos;s MXE (Multi-party eXecution Environment), it ensures that while the process is fully verifiable on-chain, individual choices remain invisible to everyone — including the poll creator.
              </p>

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 rounded-lg btn-primary-gradient flex items-center justify-center text-white text-xs font-bold">1</div>
                  <h3 className="text-base font-bold text-white">Blind Counting</h3>
                </div>
                <p className="text-xs text-white/40 mb-3">Standard blockchain voting is a glass box — every move is tracked. simplEncrypt operates as a black box.</p>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg dark-card"><span className="text-xs font-bold text-white/70">Encryption at Source:</span><span className="text-xs text-white/40 ml-1">Your vote is encrypted the moment you click Submit.</span></div>
                  <div className="p-3 rounded-lg dark-card"><span className="text-xs font-bold text-white/70">Arcium&apos;s MXE:</span><span className="text-xs text-white/40 ml-1">Acts as a secure vault. It processes encrypted votes and tallies them without ever decrypting individual choices.</span></div>
                  <div className="p-3 rounded-lg dark-card"><span className="text-xs font-bold text-white/70">Zero-Knowledge Totals:</span><span className="text-xs text-white/40 ml-1">No intermediate scores are leaked. The public knows people are voting, but not what they&apos;re choosing.</span></div>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 rounded-lg btn-primary-gradient flex items-center justify-center text-white text-xs font-bold">2</div>
                  <h3 className="text-base font-bold text-white">The Lifecycle of a Vote</h3>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg dark-card flex gap-3"><div className="w-6 h-6 rounded-full bg-[hsl(263,90%,66%)]/15 flex items-center justify-center text-[hsl(263,90%,66%)] text-[10px] font-bold flex-shrink-0">1</div><div><span className="text-xs font-bold text-white/70">Deployment:</span><span className="text-xs text-white/40 ml-1">A user creates a poll or DAO proposal on Solana. Polls can be open to anyone with a wallet.</span></div></div>
                  <div className="p-3 rounded-lg dark-card flex gap-3"><div className="w-6 h-6 rounded-full bg-[hsl(263,90%,66%)]/15 flex items-center justify-center text-[hsl(263,90%,66%)] text-[10px] font-bold flex-shrink-0">2</div><div><span className="text-xs font-bold text-white/70">Submission:</span><span className="text-xs text-white/40 ml-1">Voters connect via Phantom or Solflare. One vote per wallet is enforced by the Solana program. The vote is encrypted by Arcium before it touches the ledger.</span></div></div>
                  <div className="p-3 rounded-lg dark-card flex gap-3"><div className="w-6 h-6 rounded-full bg-[hsl(263,90%,66%)]/15 flex items-center justify-center text-[hsl(263,90%,66%)] text-[10px] font-bold flex-shrink-0">3</div><div><span className="text-xs font-bold text-white/70">The Reveal:</span><span className="text-xs text-white/40 ml-1">When the deadline hits, the creator triggers a reveal. Arcium&apos;s MXE calculates the aggregate result and pushes a proof of correctness back to Solana.</span></div></div>
                  <div className="p-3 rounded-lg dark-card flex gap-3"><div className="w-6 h-6 rounded-full bg-[hsl(263,90%,66%)]/15 flex items-center justify-center text-[hsl(263,90%,66%)] text-[10px] font-bold flex-shrink-0">4</div><div><span className="text-xs font-bold text-white/70">Finality:</span><span className="text-xs text-white/40 ml-1">The winning option is published on-chain. Individual vote breakdowns remain hidden to prevent data harvesting.</span></div></div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 rounded-lg btn-primary-gradient flex items-center justify-center text-white text-xs font-bold">3</div>
                  <h3 className="text-base font-bold text-white">Why This Matters</h3>
                </div>
                <div className="space-y-2">
                  <div className="p-4 rounded-lg dark-card"><div className="text-xs font-bold text-white/70 mb-1">Anti-Coercion</div><div className="text-xs text-white/40 leading-relaxed">No one — not even the admin — can see your vote. Zero risk of retribution or vote buying.</div></div>
                  <div className="p-4 rounded-lg dark-card"><div className="text-xs font-bold text-white/70 mb-1">Unbiased Outcomes</div><div className="text-xs text-white/40 leading-relaxed">In open systems, early results trigger bandwagon effects. simplEncrypt ensures every voter acts on their own conviction because there is no &quot;current lead&quot; to follow.</div></div>
                  <div className="p-4 rounded-lg dark-card"><div className="text-xs font-bold text-white/70 mb-1">Verifiable Integrity</div><div className="text-xs text-white/40 leading-relaxed">You don&apos;t have to trust the app. Solana stores the encrypted proofs, and Arcium&apos;s MXE guarantees the computation behind the curtain is mathematically sound.</div></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer disclaimer */}
        <p className="animate-fade-in-up text-center text-white/40 text-sm font-mono-data max-w-lg mb-6" style={{ animationDelay: "600ms" }}>
          simplEncrypt is a Devnet-based application on Solana designed to test private voting using Arcium&apos;s encrypted computation. It is an independent project and not officially affiliated with Arcium.
        </p>
      </div>
    </div>
  );
}