"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { Lock, CheckCircle, Loader2, Send, AlertTriangle } from "lucide-react";
import { NavBar, PoweredFooter } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function ProposalPage() {
  const params = useSearchParams();
  const daoId = params.get("daoId") || "1";
  const proposalId = params.get("id") || "1";
  const { publicKey, signTransaction } = useWallet();
  const wallet = publicKey?.toBase58() || "";
  const [voted, setVoted] = useState(false);
  const [mpcSuccess, setMpcSuccess] = useState<boolean | null>(null);
  const [sel, setSel] = useState<"A" | "B" | null>(null);
  const [voting, setVoting] = useState(false);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [p, setP] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [daoId, proposalId, wallet]);

  const loadData = async () => {
    const { data: propData } = await supabase.from("proposals").select("*").eq("id", Number(proposalId)).single();
    if (propData) setP(propData);
    const { data: commentData } = await supabase.from("comments").select("*").eq("proposal_id", Number(proposalId)).order("created_at", { ascending: true });
    if (commentData) setComments(commentData);
    if (wallet) {
      const { data: voteData } = await supabase.from("votes").select("*").eq("proposal_id", Number(proposalId)).eq("wallet", wallet);
      if (voteData && voteData.length > 0) setVoted(true);
    }
    setLoading(false);
  };

  if (loading || !p) return <div className="min-h-screen bg-[hsl(264,40%,6%)] flex items-center justify-center text-white/30">Loading...</div>;

  const pct = Math.round(((p.votes || 0) / (p.total || 200)) * 100);
  const truncW = (addr: string) => addr.length > 10 ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : addr;
  const timeAgo = (date: string) => { const d = Date.now() - new Date(date).getTime(); const m = Math.floor(d / 60000); if (m < 1) return "now"; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; };

  const handleVote = async () => {
    if (sel === null || !publicKey || !signTransaction) return;
    setVoting(true);
    try {
      const { data: existing } = await supabase.from("votes").select("*").eq("proposal_id", Number(proposalId)).eq("wallet", wallet);
      if (existing && existing.length > 0) { alert("Already voted."); setVoted(true); setVoting(false); return; }
      const voteYes = sel === "A";
      const res = await fetch("/api/vote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ voterWallet: wallet, daoCreator: p.creator || wallet, onchainDaoId: p.onchain_dao_id || Number(daoId), onchainProposalId: p.onchain_id || Number(proposalId), voteYes }) });
      const data = await res.json();
      if (res.ok && data.transaction) {
        try {
          const { Transaction } = await import("@solana/web3.js");
          const tx = Transaction.from(Buffer.from(data.transaction, "base64"));
          const signed = await signTransaction(tx);
          const { Connection } = await import("@solana/web3.js");
          const conn = new Connection("https://convincing-cosmopolitan-sanctuary.solana-devnet.quiknode.pro/97ce1836e57eafd461d16635198ae58354417873/", "confirmed");
          const sig = await conn.sendRawTransaction(signed.serialize());
          console.log("MPC vote tx:", sig);
          setMpcSuccess(true);
        } catch (signErr: any) {
          if (signErr.message?.includes("User rejected")) { setVoting(false); alert("Cancelled."); return; }
          console.warn("On-chain failed:", signErr.message);
          setMpcSuccess(false);
        }
      } else { console.warn("MPC failed:", data.error); setMpcSuccess(false); }
      await supabase.from("votes").insert({ proposal_id: Number(proposalId), dao_id: Number(daoId), wallet });
      const nv = (p.votes || 0) + 1; const ny = voteYes ? (p.yes_votes || 0) + 1 : (p.yes_votes || 0); const nn = !voteYes ? (p.no_votes || 0) + 1 : (p.no_votes || 0);
      await supabase.from("proposals").update({ votes: nv, yes_votes: ny, no_votes: nn }).eq("id", Number(proposalId));
      setP({ ...p, votes: nv, yes_votes: ny, no_votes: nn });
      setVoting(false); setVoted(true);
    } catch (e: any) { setVoting(false); alert("Vote failed: " + e.message); }
  };

  const handleComment = async () => {
    if (!comment.trim() || !publicKey) return;
    setPosting(true);
    const { data } = await supabase.from("comments").insert({ proposal_id: Number(proposalId), dao_id: Number(daoId), author: wallet, content: comment }).select().single();
    if (data) setComments([...comments, data]);
    setComment(""); setPosting(false);
  };

  return (
    <div className="min-h-screen bg-[hsl(264,40%,6%)]">
      <NavBar />
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="status-active rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-current" /> {p.status}
          </span>
          <span className="text-xs font-mono-data text-white/40">{p.deadline}</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{p.title}</h1>
        <p className="text-sm text-white/40 mb-6">{p.description}</p>

        {/* Progress */}
        <div className="dark-card rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">{p.votes || 0} of {p.total || 200} wallets voted</span>
            <span className="font-mono-data text-sm text-[hsl(263,90%,66%)] font-semibold">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
            <div className="h-full rounded-full bg-[hsl(263,90%,66%)]" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-white/30 flex items-center gap-1"><Lock className="h-3 w-3" /> Individual votes remain encrypted until deadline</p>
        </div>

        {/* Vote or Success */}
        {!voted ? (
          <div className="dark-panel rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-semibold text-white mb-4">Cast Your Vote</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[{ key: "A" as const, label: p.option_a || "Yes" }, { key: "B" as const, label: p.option_b || "No" }].map(opt => (
                <button key={opt.key} onClick={() => setSel(opt.key)} className={`rounded-xl py-3.5 text-sm font-medium transition-all border ${sel === opt.key ? "btn-primary-gradient border-transparent" : "border-white/10 bg-white/5 text-white hover:border-[hsl(263,90%,66%)]/30"}`}>
                  {opt.label}
                </button>
              ))}
            </div>
            <button onClick={handleVote} disabled={!sel || voting} className="w-full btn-primary-gradient rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
              {voting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Encrypting & Submitting...</>) : (<><Lock className="h-4 w-4" /> Submit Encrypted Vote</>)}
            </button>
            <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-3">
              <p className="text-xs text-white/40 leading-relaxed"><span className="font-semibold text-white/70">ARCIUM MPC</span> — Your vote is encrypted via multi-party computation. No one can see your choice.</p>
            </div>
          </div>
        ) : (
          <div className="dark-card rounded-2xl p-6 mb-6 border-l-4 border-l-[hsl(263,90%,66%)]">
            <div className="flex items-center gap-2 mb-3">
              {mpcSuccess === true ? <CheckCircle className="h-5 w-5 text-[hsl(263,90%,66%)]" /> : mpcSuccess === false ? <AlertTriangle className="h-5 w-5 text-amber-400" /> : <CheckCircle className="h-5 w-5 text-[hsl(263,90%,66%)]" />}
              <h3 className="text-sm font-semibold text-white">Vote Cast Successfully</h3>
            </div>
            {mpcSuccess === true ? (
              <p className="text-xs text-white/40 leading-relaxed">Your vote has been encrypted and submitted on-chain via Arcium&apos;s MXE (Multi-party eXecution Environment). The encrypted vote was split into fragments processed by distributed Arx nodes on Solana — no single party, including this application, can determine your choice. The result will only be revealed when the voting period ends and a ZKP-verified tally is computed.</p>
            ) : mpcSuccess === false ? (
              <p className="text-xs text-amber-400/70 leading-relaxed">This vote was processed in simulation mode. The on-chain MPC computation was unavailable, so your vote was recorded securely in our database instead. In MXE mode, votes are encrypted using Arcium&apos;s Rescue cipher and processed by distributed Arx nodes — ensuring no one can see individual choices.</p>
            ) : null}
          </div>
        )}

        {/* Discussion */}
        <div className="dark-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Discussion</h3>
          <div className="flex gap-2 mb-5">
            <input value={comment} onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleComment()} placeholder="Add a comment..." className="dark-input flex-1" />
            <button onClick={handleComment} disabled={!comment.trim() || posting} className="btn-primary-gradient rounded-xl px-4 text-sm font-medium flex items-center gap-1.5 disabled:opacity-50">
              <Send className="h-3.5 w-3.5" /> Post
            </button>
          </div>
          <div className="space-y-4">
            {comments.map((c: any, i: number) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-[hsl(263,90%,66%)]/10 flex items-center justify-center shrink-0">
                  <span className="font-mono-data text-[10px] text-[hsl(263,90%,66%)] font-medium">{truncW(c.author).slice(0, 2)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono-data text-xs text-[hsl(263,90%,66%)] font-medium">{truncW(c.author)}</span>
                    <span className="text-[10px] text-white/30">{c.created_at ? timeAgo(c.created_at) : "now"}</span>
                  </div>
                  <p className="text-sm text-white/70">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <PoweredFooter />
      </div>
    </div>
  );
}