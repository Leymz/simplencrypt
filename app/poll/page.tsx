"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { Zap, Lock, CheckCircle, Loader2, Send, AlertTriangle } from "lucide-react";
import { NavBar, PoweredFooter } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function PollPage() {
  const params = useSearchParams();
  const pollId = params.get("id") || "1";
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

  useEffect(() => { loadData(); }, [pollId, wallet]);

  const loadData = async () => {
    const { data: pollData } = await supabase.from("polls").select("*").eq("id", Number(pollId)).single();
    if (pollData) setP(pollData);
    const { data: commentData } = await supabase.from("poll_comments").select("*").eq("poll_id", Number(pollId)).order("created_at", { ascending: true });
    if (commentData) setComments(commentData);
    if (wallet) {
      const { data: voteData } = await supabase.from("poll_votes").select("*").eq("poll_id", Number(pollId)).eq("wallet", wallet);
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
      const { data: existing } = await supabase.from("poll_votes").select("*").eq("poll_id", Number(pollId)).eq("wallet", wallet);
      if (existing && existing.length > 0) { alert("Already voted."); setVoted(true); setVoting(false); return; }
      const voteYes = sel === "A";
      if (p.onchain_id) {
        const res = await fetch("/api/poll-vote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ voterWallet: wallet, onchainProposalId: p.onchain_id, voteYes }) });
        const data = await res.json();
        if (res.ok && data.transaction) {
          try {
            const { Transaction } = await import("@solana/web3.js");
            const tx = Transaction.from(Buffer.from(data.transaction, "base64"));
            const signed = await signTransaction(tx);
            const { Connection } = await import("@solana/web3.js");
            const conn = new Connection("https://convincing-cosmopolitan-sanctuary.solana-devnet.quiknode.pro/97ce1836e57eafd461d16635198ae58354417873/", "confirmed");
            const sig = await conn.sendRawTransaction(signed.serialize());
            console.log("MPC poll vote tx:", sig);
            setMpcSuccess(true);
          } catch (signErr: any) {
            if (signErr.message?.includes("User rejected")) { setVoting(false); alert("Cancelled."); return; }
            console.warn("On-chain failed:", signErr.message); setMpcSuccess(false);
          }
        } else { console.warn("MPC failed:", data.error); setMpcSuccess(false); }
      }
      await supabase.from("poll_votes").insert({ poll_id: Number(pollId), wallet });
      const nv = (p.votes || 0) + 1; const ny = voteYes ? (p.yes_votes || 0) + 1 : (p.yes_votes || 0); const nn = !voteYes ? (p.no_votes || 0) + 1 : (p.no_votes || 0);
      await supabase.from("polls").update({ votes: nv, yes_votes: ny, no_votes: nn }).eq("id", Number(pollId));
      setP({ ...p, votes: nv, yes_votes: ny, no_votes: nn });
      setVoting(false); setVoted(true);
    } catch (e: any) { setVoting(false); alert("Vote failed: " + e.message); }
  };

  const handleComment = async () => {
    if (!comment.trim() || !publicKey) return;
    setPosting(true);
    const { data } = await supabase.from("poll_comments").insert({ poll_id: Number(pollId), author: wallet, content: comment }).select().single();
    if (data) setComments([...comments, data]);
    setComment(""); setPosting(false);
  };

  return (
    <div className="min-h-screen bg-[hsl(264,40%,6%)]">
      <NavBar />
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="rounded-full bg-[hsl(263,75%,72%)]/15 px-2.5 py-0.5 text-xs font-medium text-[hsl(263,75%,72%)] flex items-center gap-1">
            <Zap className="h-3 w-3" /> Quick Poll
          </span>
          <span className="text-xs font-mono-data text-white/40">{p.deadline}</span>
          {p.onchain_id && <span className="status-active rounded-full px-2 py-0.5 text-[10px] font-medium">On-Chain</span>}
        </div>

        <h1 className="text-2xl font-bold text-white mb-6">{p.question}</h1>

        <div className="dark-card rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">{p.votes || 0} votes cast</span>
            <span className="font-mono-data text-sm text-[hsl(263,90%,66%)] font-semibold">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-[hsl(263,90%,66%)]" style={{ width: `${pct}%` }} />
          </div>
        </div>

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
          </div>
        ) : (
          <div className="dark-card rounded-2xl p-6 mb-6 border-l-4 border-l-[hsl(263,90%,66%)]">
            <div className="flex items-center gap-2 mb-3">
              {mpcSuccess === true ? <CheckCircle className="h-5 w-5 text-[hsl(263,90%,66%)]" /> : mpcSuccess === false ? <AlertTriangle className="h-5 w-5 text-amber-400" /> : <CheckCircle className="h-5 w-5 text-[hsl(263,90%,66%)]" />}
              <h3 className="text-sm font-semibold text-white">Vote Cast Successfully</h3>
            </div>
            {mpcSuccess === true ? (
              <p className="text-xs text-white/40 leading-relaxed">Your vote has been encrypted and submitted on-chain via Arcium&apos;s MXE. The encrypted vote was split into fragments processed by distributed Arx nodes on Solana — no single party can determine your choice.</p>
            ) : mpcSuccess === false ? (
              <p className="text-xs text-amber-400/70 leading-relaxed">This vote was processed in simulation mode. The on-chain MPC computation was unavailable, so your vote was recorded securely in our database instead.</p>
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