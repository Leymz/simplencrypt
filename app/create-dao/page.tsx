"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@coral-xyz/anchor";
import { PoweredFooter } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { createDaoOnChain } from "@/lib/actions";

export default function CreateDaoPage() {
  const router = useRouter();
  const wallet = useWallet();
  const { connection } = useConnection();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [pic, setPic] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState("");

  const handlePic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPic(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    if (!name || !wallet.publicKey || !wallet.signTransaction) return;
    setCreating(true);
    setStatus("Waiting for wallet approval...");
    try {
      const provider = new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
      const daoId = Math.floor(Date.now() / 1000) % 100000;
      setStatus("Confirming transaction...");
      const sig = await createDaoOnChain(provider, daoId, name, desc || "No description");
      console.log("DAO created on-chain:", sig);

      setStatus("Saving to database...");
      await supabase.from("daos").insert({
        name,
        description: desc,
        creator: wallet.publicKey.toBase58(),
        onchain_id: daoId,
      });

      setStatus("DAO created!");
      await new Promise((r) => setTimeout(r, 800));
      router.push("/dashboard");
    } catch (e: any) {
      console.error("Create DAO failed:", e);
      setStatus("");
      setCreating(false);
      if (e.message?.includes("User rejected")) {
        alert("Transaction cancelled by user");
      } else {
        alert("Failed to create DAO: " + (e.message || "Unknown error"));
      }
    }
  };

  const inputClass = "w-full px-3.5 py-3 rounded-xl border border-[#E5E1EE] dark:border-[#2A2445] bg-white dark:bg-[#1A1530] text-sm text-[#1A1625] dark:text-[#EEEAF6] outline-none focus:border-brand-purple-light transition";

  return (
    <div className="min-h-screen bg-[#F7F5FB] dark:bg-[#110D20]">
      <div className="bg-white dark:bg-[#140F25] border-b border-[#E5E1EE] dark:border-[#2A2445] px-8 py-3 flex items-center gap-3">
        <a href="/dashboard" className="text-[17px] text-[#4A4555] dark:text-[#A09BB0] no-underline px-1 py-0.5 rounded hover:bg-[#F0EDF6] transition">←</a>
        <a href="/dashboard" className="flex items-center gap-2 no-underline">
          <img src="/logo.png" alt="" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-brand text-[17px] text-[#1A1625] dark:text-[#EEEAF6]">simpl<span className="font-bold text-brand-purple">Encrypt</span></span>
        </a>
      </div>
      <div className="max-w-[600px] mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-[#1A1625] dark:text-[#EEEAF6] mb-1.5">Create a DAO</h1>
        <p className="text-[13px] text-[#8A8494] mb-8">Set up your organization for private governance</p>
        <div className="p-7 rounded-2xl bg-white dark:bg-[#1A1530] border border-[#E5E1EE] dark:border-[#2A2445]">
          <div className="mb-6">
            <label className="text-[13px] font-semibold text-[#1A1625] dark:text-[#EEEAF6] mb-2 block">DAO Picture</label>
            <div className="flex items-center gap-5">
              <label htmlFor="dao-pic" className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#E5E1EE] dark:border-[#2A2445] hover:border-brand-purple-light bg-[#F0EDF6] dark:bg-[#1A1530] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all flex-shrink-0">
                {pic ? (<img src={pic} alt="" className="w-full h-full object-cover" />) : (<><span className="text-2xl">📷</span><span className="text-[10px] text-[#8A8494] mt-1">Upload</span></>)}
              </label>
              <input id="dao-pic" type="file" accept="image/*" onChange={handlePic} className="hidden" />
              <div>
                <div className="text-[13px] text-[#4A4555] dark:text-[#A09BB0] font-medium mb-1">{pic ? "Image uploaded" : "Add a logo or image"}</div>
                <div className="text-[11px] text-[#9C96AA]">JPG, PNG, GIF. Max 2MB</div>
                {pic && (<button onClick={() => setPic(null)} className="text-[11px] text-brand-purple mt-1 bg-transparent border-none cursor-pointer font-semibold p-0">Remove</button>)}
              </div>
            </div>
          </div>
          <div className="mb-5">
            <label className="text-[13px] font-semibold text-[#1A1625] dark:text-[#EEEAF6] mb-1.5 block">DAO Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. DevDAO" className={inputClass} />
          </div>
          <div className="mb-6">
            <label className="text-[13px] font-semibold text-[#1A1625] dark:text-[#EEEAF6] mb-1.5 block">Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What is this DAO about?" rows={3} className={`${inputClass} resize-y leading-relaxed`} />
          </div>
          <div className="p-3.5 rounded-xl bg-[#F3F0FA] dark:bg-[rgba(139,92,246,0.08)] mb-5">
            <div className="text-xs text-[#6B6580] dark:text-[#A09BB0] leading-relaxed">🧪 <strong>Devnet Mode:</strong> No token gating — any wallet can participate. Votes encrypted via Arcium MPC.</div>
          </div>
          <button onClick={handleCreate} disabled={!name || creating} className={`w-full py-3.5 rounded-[13px] text-sm font-bold border-none cursor-pointer transition ${name && !creating ? "bg-gradient-to-r from-brand-purple to-brand-purple-light text-white shadow-[0_4px_18px_rgba(139,92,246,0.2)]" : "bg-[#E5E1EE] dark:bg-[#2A2445] text-[#8A8494] cursor-default"}`}>
            {creating ? (<span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{status || "Creating..."}</span>) : "Create DAO →"}
          </button>
        </div>
      </div>
      <PoweredFooter />
    </div>
  );
}