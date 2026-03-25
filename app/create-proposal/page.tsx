"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowRight, Loader2 } from "lucide-react";
import { NavBar, PoweredFooter } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function CreateProposalPage() {
  const router = useRouter();
  const params = useSearchParams();
  const daoId = params.get("daoId") || "1";
  const { publicKey, signTransaction } = useWallet();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [optA, setOptA] = useState("Yes");
  const [optB, setOptB] = useState("No");
  const [hours, setHours] = useState("24");
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState("");

  const handleCreate = async () => {
    if (!title || !publicKey || !signTransaction) return;
    setCreating(true); setStatus("Preparing on-chain proposal...");
    try {
      const { data: daoData } = await supabase.from("daos").select("*").eq("id", Number(daoId)).single();
      const onChainDaoId = daoData?.onchain_id || daoData?.id || Number(daoId);
      const proposalId = Math.floor(Date.now() / 1000) % 100000;
      setStatus("Building MPC transaction...");
      const res = await fetch("/api/create-proposal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ creatorWallet: publicKey.toBase58(), daoId: onChainDaoId, proposalId, title, description: desc, optionA: optA, optionB: optB, deadlineHours: Number(hours) }) });
      const data = await res.json();
      let onChain = false;
      if (res.ok && data.transaction) {
        try {
          setStatus("Waiting for wallet approval...");
          const { Transaction } = await import("@solana/web3.js");
          const tx = Transaction.from(Buffer.from(data.transaction, "base64"));
          const signed = await signTransaction(tx);
          const { Connection } = await import("@solana/web3.js");
          const conn = new Connection("https://convincing-cosmopolitan-sanctuary.solana-devnet.quiknode.pro/97ce1836e57eafd461d16635198ae58354417873/", "confirmed");
          setStatus("Confirming on-chain...");
          const sig = await conn.sendRawTransaction(signed.serialize());
          console.log("Proposal created on-chain:", sig); onChain = true;
        } catch (signErr: any) {
          if (signErr.message?.includes("User rejected")) { setCreating(false); setStatus(""); alert("Cancelled."); return; }
          console.warn("On-chain failed:", signErr.message);
        }
      }
      setStatus("Saving...");
      await supabase.from("proposals").insert({ dao_id: Number(daoId), title, description: desc, option_a: optA, option_b: optB, deadline: `${hours}h left`, creator: publicKey.toBase58(), onchain_id: proposalId, onchain_dao_id: daoData?.onchain_id });
      setStatus(onChain ? "Created on-chain!" : "Created!"); await new Promise(r => setTimeout(r, 800));
      router.push(`/dao?id=${daoId}`);
    } catch (e: any) { console.error(e); setStatus(""); setCreating(false); alert("Failed: " + e.message); }
  };

  return (
    <div className="min-h-screen bg-[hsl(264,40%,6%)]">
      <NavBar />
      <div className="container mx-auto px-6 py-10 max-w-lg">
        <div className="dark-panel rounded-3xl p-8">
          <h1 className="text-xl font-bold text-white mb-6">Create Proposal</h1>
          <div className="space-y-5">
            <div><label className="block text-xs font-medium text-white/50 mb-1.5">Title</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Proposal title" className="dark-input" /></div>
            <div><label className="block text-xs font-medium text-white/50 mb-1.5">Description</label><textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Describe the proposal..." className="dark-input resize-none" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-white/50 mb-1.5">Option A</label><input value={optA} onChange={e => setOptA(e.target.value)} className="dark-input" /></div>
              <div><label className="block text-xs font-medium text-white/50 mb-1.5">Option B</label><input value={optB} onChange={e => setOptB(e.target.value)} className="dark-input" /></div>
            </div>
            <div><label className="block text-xs font-medium text-white/50 mb-1.5">Duration (hours)</label><input type="number" value={hours} onChange={e => setHours(e.target.value)} min="1" className="dark-input" /></div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs text-white/40 leading-relaxed">🔐 <span className="font-medium text-white/70">Encrypted Voting</span> — All votes encrypted via Arcium MPC. Results revealed after deadline via ZKP.</p>
            </div>
            <button onClick={handleCreate} disabled={!title || creating} className="group w-full btn-primary-gradient rounded-xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
              {creating ? (<><Loader2 className="h-4 w-4 animate-spin" />{status}</>) : (<>Create Proposal<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>)}
            </button>
          </div>
        </div>
        <PoweredFooter />
      </div>
    </div>
  );
}