"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const router = useRouter();
  const [howOpen, setHowOpen] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      router.push("/dashboard");
    }
  }, [connected, publicKey, router]);

  return (
    <div className="min-h-screen bg-[#F8F6FC] relative overflow-hidden">
      <div className="absolute -top-52 -right-24 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.07)_0%,transparent_60%)] blur-[60px] pointer-events-none" />
      <div className="absolute -bottom-36 -left-24 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.05)_0%,transparent_55%)] blur-[50px] pointer-events-none" />

      {/* Hero */}
      <div className="flex max-w-[1240px] mx-auto px-14 gap-12 items-center pt-8 pb-6">
        <div className="flex-1 pb-8">
          <div className="flex items-center gap-3 mb-11">
            <img src="/logo.png" alt="" className="w-10 h-10 rounded-xl object-cover" />
            <span className="font-brand text-[19px] font-bold text-[#1A1625]">
              simpl<span className="text-[#8B5CF6]">Encrypt</span>
            </span>
          </div>
          <h1 className="text-[42px] font-bold leading-[1.08] mb-4 tracking-[-1.5px] text-[#1A1625]">
            Private votes.<br />
            <span className="bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent">Public trust.</span>
          </h1>
          <p className="text-[15px] text-[#6B6580] leading-[1.7] mb-6 max-w-[420px]">
            Cast encrypted votes on DAO proposals or quick community polls — your choice stays hidden. Arcium&apos;s multi-party computation ensures ballot secrecy with full on-chain verifiability on Solana.
          </p>
          <div className="max-w-[300px] ml-3 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(139,92,246,0.2)]">
            <img src="/ballot.png" alt="Encrypted ballot box" className="w-full block" />
          </div>
        </div>

        <div className="w-[380px] flex-shrink-0">
          <a href="https://faucet.solana.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 mb-4 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#9945FF]/10 via-[#14F195]/10 to-[#00D1FF]/10 border border-[#9945FF]/20 no-underline hover:border-[#9945FF]/40 transition">
            <svg width="16" height="16" viewBox="0 0 128 128"><defs><linearGradient id="sfg" x1="0" y1="128" x2="128" y2="0"><stop stopColor="#9945FF"/><stop offset="0.5" stopColor="#14F195"/><stop offset="1" stopColor="#00D1FF"/></linearGradient></defs><circle cx="64" cy="64" r="64" fill="url(#sfg)" opacity="0.8"/></svg>
            <span className="text-[12px] font-semibold text-[#6B6580]">Need Devnet SOL?</span>
            <span className="text-[12px] font-bold text-[#8B5CF6]">Get from Faucet →</span>
          </a>

          <div className="bg-white rounded-2xl border border-[#EDEBF4] p-7 shadow-[0_4px_40px_rgba(139,92,246,0.05)]">
            <h2 className="text-[22px] font-bold text-[#1A1625] mb-1.5">Connect Wallet</h2>
            <p className="text-[13px] text-[#9C96AA] mb-5 leading-relaxed">Select a wallet to sign in and start voting privately.</p>
            <button onClick={() => setVisible(true)} className="w-full py-3.5 px-5 rounded-[14px] border border-[#A78BFA]/30 bg-[#8B5CF6]/5 text-[#1A1625] text-sm font-semibold cursor-pointer flex items-center justify-center gap-3 transition-all hover:bg-[#8B5CF6]/10 hover:border-[#A78BFA]/50 mb-6">
              🔗 Select Wallet
            </button>
            <div className="p-4 rounded-[14px] bg-[#F3F0FA] mb-5">
              <div className="text-xs font-bold text-[#6D28D9] mb-1.5">Why do I need a wallet?</div>
              <div className="text-xs text-[#6B6580] leading-relaxed">Your wallet signs encrypted votes on-chain via Arcium MPC. No private keys are shared — only transaction approvals.</div>
            </div>
            <div className="flex items-center justify-center gap-2 text-[11px] text-[#9C96AA]">
              <svg width="14" height="14" viewBox="0 0 128 128"><defs><linearGradient id="sg" x1="0" y1="128" x2="128" y2="0"><stop stopColor="#9945FF"/><stop offset="0.5" stopColor="#14F195"/><stop offset="1" stopColor="#00D1FF"/></linearGradient></defs><circle cx="64" cy="64" r="64" fill="url(#sg)" opacity="0.8"/></svg>
              Powered by Solana Wallet Adapter
            </div>
          </div>
        </div>
      </div>

      {/* How It Works — Collapsible */}
      <div className="max-w-[900px] mx-auto px-14 pb-4">
        <button onClick={() => setHowOpen(!howOpen)} className="w-full p-5 rounded-2xl bg-white border border-[#EDEBF4] flex justify-between items-center cursor-pointer hover:border-[#A78BFA]/40 transition text-left">
          <div>
            <h2 className="text-[18px] font-bold text-[#1A1625] m-0">How Private Voting Works</h2>
            <p className="text-[13px] text-[#8A8494] mt-1 m-0">Learn how Arcium&apos;s MXE keeps your vote secret</p>
          </div>
          <span className={`text-[#8A8494] text-xl transition-transform ${howOpen ? "rotate-180" : ""}`}>▼</span>
        </button>

        {howOpen && (
          <div className="mt-4 p-8 rounded-2xl bg-white border border-[#EDEBF4]">
            <p className="text-[15px] text-[#6B6580] leading-[1.8] mb-10 max-w-[700px]">
              simplEncrypt is a Solana-based voting platform that eliminates voter herd mentality. Using Arcium&apos;s MXE (Multi-party eXecution Environment), it ensures that while the process is fully verifiable on-chain, individual choices remain invisible to everyone — including the poll creator.
            </p>

            {/* Section 1 */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-white text-sm font-bold">1</div>
                <h3 className="text-[20px] font-bold text-[#1A1625]">Blind Counting</h3>
              </div>
              <p className="text-[14px] text-[#6B6580] leading-[1.8] mb-4">Standard blockchain voting is a glass box — every move is tracked. simplEncrypt operates as a black box.</p>
              <div className="grid gap-3">
                <div className="p-4 rounded-xl bg-[#F8F6FC] border border-[#EDEBF4]">
                  <span className="text-[13px] font-bold text-[#1A1625]">Encryption at Source:</span>
                  <span className="text-[13px] text-[#6B6580] ml-1">Your vote is encrypted the moment you click Submit.</span>
                </div>
                <div className="p-4 rounded-xl bg-[#F8F6FC] border border-[#EDEBF4]">
                  <span className="text-[13px] font-bold text-[#1A1625]">Arcium&apos;s MXE:</span>
                  <span className="text-[13px] text-[#6B6580] ml-1">Acts as a secure vault. It processes encrypted votes and tallies them without ever decrypting individual choices.</span>
                </div>
                <div className="p-4 rounded-xl bg-[#F8F6FC] border border-[#EDEBF4]">
                  <span className="text-[13px] font-bold text-[#1A1625]">Zero-Knowledge Totals:</span>
                  <span className="text-[13px] text-[#6B6580] ml-1">No intermediate scores are leaked. The public knows people are voting, but not what they&apos;re choosing.</span>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-white text-sm font-bold">2</div>
                <h3 className="text-[20px] font-bold text-[#1A1625]">The Lifecycle of a Vote</h3>
              </div>
              <div className="grid gap-3">
                <div className="p-4 rounded-xl bg-[#F8F6FC] border border-[#EDEBF4] flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#8B5CF6] text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                  <div><span className="text-[13px] font-bold text-[#1A1625]">Deployment:</span><span className="text-[13px] text-[#6B6580] ml-1">A user creates a poll or DAO proposal on Solana. Polls can be open to anyone with a wallet.</span></div>
                </div>
                <div className="p-4 rounded-xl bg-[#F8F6FC] border border-[#EDEBF4] flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#8B5CF6] text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                  <div><span className="text-[13px] font-bold text-[#1A1625]">Submission:</span><span className="text-[13px] text-[#6B6580] ml-1">Voters connect via Phantom or Solflare. One vote per wallet is enforced by the Solana program. The vote is encrypted by Arcium before it touches the ledger.</span></div>
                </div>
                <div className="p-4 rounded-xl bg-[#F8F6FC] border border-[#EDEBF4] flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#8B5CF6] text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                  <div><span className="text-[13px] font-bold text-[#1A1625]">The Reveal:</span><span className="text-[13px] text-[#6B6580] ml-1">When the deadline hits, the creator triggers a reveal. Arcium&apos;s MXE calculates the aggregate result and pushes a proof of correctness back to Solana.</span></div>
                </div>
                <div className="p-4 rounded-xl bg-[#F8F6FC] border border-[#EDEBF4] flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#8B5CF6] text-xs font-bold flex-shrink-0 mt-0.5">4</div>
                  <div><span className="text-[13px] font-bold text-[#1A1625]">Finality:</span><span className="text-[13px] text-[#6B6580] ml-1">The winning option is published on-chain. Individual vote breakdowns remain hidden to prevent data harvesting.</span></div>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-white text-sm font-bold">3</div>
                <h3 className="text-[20px] font-bold text-[#1A1625]">Why This Matters</h3>
              </div>
              <div className="grid gap-3">
                <div className="p-5 rounded-xl bg-[#F8F6FC] border border-[#EDEBF4]">
                  <div className="text-[14px] font-bold text-[#1A1625] mb-1">Anti-Coercion</div>
                  <div className="text-[13px] text-[#6B6580] leading-relaxed">No one — not even the admin — can see your vote. Zero risk of retribution or vote buying.</div>
                </div>
                <div className="p-5 rounded-xl bg-[#F8F6FC] border border-[#EDEBF4]">
                  <div className="text-[14px] font-bold text-[#1A1625] mb-1">Unbiased Outcomes</div>
                  <div className="text-[13px] text-[#6B6580] leading-relaxed">In open systems, early results trigger bandwagon effects. simplEncrypt ensures every voter acts on their own conviction because there is no &quot;current lead&quot; to follow.</div>
                </div>
                <div className="p-5 rounded-xl bg-[#F8F6FC] border border-[#EDEBF4]">
                  <div className="text-[14px] font-bold text-[#1A1625] mb-1">Verifiable Integrity</div>
                  <div className="text-[13px] text-[#6B6580] leading-relaxed">You don&apos;t have to trust the app. Solana stores the encrypted proofs, and Arcium&apos;s MXE guarantees the computation behind the curtain is mathematically sound.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#E5E1EE] py-5 px-14">
        <div className="max-w-[900px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-brand text-[15px] text-[#1A1625]">simpl<span className="font-bold text-[#8B5CF6]">Encrypt</span></span>
            </div>
            <div className="flex items-center gap-5">
              <a href="https://x.com/nft_leymz" target="_blank" rel="noopener noreferrer" className="text-[#8A8494] hover:text-[#1A1625] transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="text-[#8A8494] hover:text-[#1A1625] transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="https://faucet.solana.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] text-[#8A8494] hover:text-[#8B5CF6] transition no-underline">
                <svg width="14" height="14" viewBox="0 0 128 128"><defs><linearGradient id="sfg2" x1="0" y1="128" x2="128" y2="0"><stop stopColor="#9945FF"/><stop offset="0.5" stopColor="#14F195"/><stop offset="1" stopColor="#00D1FF"/></linearGradient></defs><circle cx="64" cy="64" r="64" fill="url(#sfg2)" opacity="0.8"/></svg>
                Faucet
              </a>
            </div>
          </div>
          <p className="text-[11px] text-[#9C96AA] leading-relaxed text-center">
            simplEncrypt is a Devnet-based application on Solana designed to test private voting using Arcium&apos;s encrypted computation. It is an independent project and not officially affiliated with Arcium.
          </p>
        </div>
      </div>
    </div>
  );
}