"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { PoweredFooter } from "@/components/ui";
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
    setCreating(true);
    setStatus("Preparing on-chain proposal...");

    try {
      // Get DAO info to find creator and on-chain daoId
      const { data: daoData } = await supabase.from("daos").select("*").eq("id", Number(daoId)).single();
      const daoCreator = daoData?.creator || publicKey.toBase58();
      const onChainDaoId = daoData?.onchain_id || daoData?.id || Number(daoId);

      // Generate proposal ID
      const proposalId = Math.floor(Date.now() / 1000) % 100000;

      // Try on-chain creation via API route
      setStatus("Building MPC transaction...");
      const res = await fetch("/api/create-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorWallet: publicKey.toBase58(),
          daoId: onChainDaoId,
          proposalId,
          title,
          description: desc,
          optionA: optA,
          optionB: optB,
          deadlineHours: Number(hours),
        }),
      });

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
          console.log("Proposal created on-chain:", sig);
          onChain = true;
        } catch (signErr: any) {
          if (signErr.message?.includes("User rejected")) {
            setCreating(false);
            setStatus("");
            alert("Transaction cancelled.");
            return;
          }
          console.warn("On-chain failed, saving to database only:", signErr.message);
        }
      } else {
        console.warn("API route failed:", data.error, "— saving to database only");
      }

      // Save to Supabase regardless
      setStatus("Saving...");
      await supabase.from("proposals").insert({
        dao_id: Number(daoId),
        title,
        description: desc,
        option_a: optA,
        option_b: optB,
        deadline: `${hours}h left`,
        creator: publicKey.toBase58(),
        onchain_id: proposalId,
        onchain_dao_id: daoData?.onchain_id,
      });

      setStatus(onChain ? "Proposal created on-chain!" : "Proposal created!");
      await new Promise((r) => setTimeout(r, 800));
      router.push(`/dao?id=${daoId}`);
    } catch (e: any) {
      console.error("Create proposal failed:", e);
      setStatus("");
      setCreating(false);
      alert("Failed: " + e.message);
    }
  };

  const inputClass = "w-full px-3.5 py-3 rounded-xl border border-[#E5E1EE] dark:border-[#2A2445] bg-white dark:bg-[#1A1530] text-sm text-[#1A1625] dark:text-[#EEEAF6] outline-none focus:border-brand-purple-light transition";

  return (
    <div className="min-h-screen bg-[#F7F5FB] dark:bg-[#110D20]">
      <div className="bg-white dark:bg-[#140F25] border-b border-[#E5E1EE] dark:border-[#2A2445] px-8 py-3 flex items-center gap-3">
        <a href={`/dao?id=${daoId}`} className="text-[17px] text-[#4A4555] dark:text-[#A09BB0] no-underline px-1 py-0.5 rounded hover:bg-[#F0EDF6] transition">←</a>
        <a href="/dashboard" className="flex items-center gap-2 no-underline">
          <img src="/logo.png" alt="" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-brand text-[17px] text-[#1A1625] dark:text-[#EEEAF6]">simpl<span className="font-bold text-brand-purple">Encrypt</span></span>
        </a>
      </div>
      <div className="max-w-[600px] mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-[#1A1625] dark:text-[#EEEAF6] mb-1.5">New Proposal</h1>
        <p className="text-[13px] text-[#8A8494] mb-8">Create an encrypted vote for your DAO</p>
        <div className="p-7 rounded-2xl bg-white dark:bg-[#1A1530] border border-[#E5E1EE] dark:border-[#2A2445]">
          <div className="mb-5">
            <label className="text-[13px] font-semibold text-[#1A1625] dark:text-[#EEEAF6] mb-1.5 block">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Should we fund the treasury?" className={inputClass} />
          </div>
          <div className="mb-5">
            <label className="text-[13px] font-semibold text-[#1A1625] dark:text-[#EEEAF6] mb-1.5 block">Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Provide context for voters..." rows={3} className={`${inputClass} resize-y leading-relaxed`} />
          </div>
          <div className="flex gap-3 mb-5">
            <div className="flex-1">
              <label className="text-[13px] font-semibold text-[#1A1625] dark:text-[#EEEAF6] mb-1.5 block">Option A</label>
              <input value={optA} onChange={(e) => setOptA(e.target.value)} className={inputClass} />
            </div>
            <div className="flex-1">
              <label className="text-[13px] font-semibold text-[#1A1625] dark:text-[#EEEAF6] mb-1.5 block">Option B</label>
              <input value={optB} onChange={(e) => setOptB(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="mb-6">
            <label className="text-[13px] font-semibold text-[#1A1625] dark:text-[#EEEAF6] mb-1.5 block">Duration <span className="font-normal text-[#8A8494]">(hours)</span></label>
            <input value={hours} onChange={(e) => setHours(e.target.value)} type="number" className={`${inputClass} w-[120px]`} />
          </div>
          <div className="p-3.5 rounded-xl bg-brand-purple-bg/30 dark:bg-purple-500/10 border border-brand-purple-bg dark:border-purple-500/20 mb-5">
            <div className="text-[11px] font-bold text-brand-purple-dark dark:text-purple-300 mb-1 font-mono">🔐 Encrypted Voting</div>
            <div className="text-xs text-[#6B6580] dark:text-[#A09BB0] leading-relaxed">All votes encrypted via Arcium MPC. Results revealed after deadline via ZKP.</div>
          </div>
          <button onClick={handleCreate} disabled={!title || creating} className={`w-full py-3.5 rounded-[13px] text-sm font-bold border-none cursor-pointer transition ${title && !creating ? "bg-gradient-to-r from-brand-purple to-brand-purple-light text-white shadow-[0_4px_18px_rgba(139,92,246,0.2)]" : "bg-[#E5E1EE] dark:bg-[#2A2445] text-[#8A8494] cursor-default"}`}>
            {creating ? (<span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{status || "Creating..."}</span>) : "Create Proposal →"}
          </button>
        </div>
      </div>
      <PoweredFooter />
    </div>
  );
}