"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@coral-xyz/anchor";
import { Upload, X, ArrowRight, Loader2 } from "lucide-react";
import { NavBar, PoweredFooter } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { createDaoOnChain } from "@/lib/actions";

export default function CreateDaoPage() {
  const router = useRouter();
  const wallet = useWallet();
  const { connection } = useConnection();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onload = () => setImage(reader.result as string); reader.readAsDataURL(file); }
  };

  const handleCreate = async () => {
    if (!name || !wallet.publicKey || !wallet.signTransaction) return;
    setCreating(true); setStatus("Waiting for wallet approval...");
    try {
      const provider = new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
      const daoId = Math.floor(Date.now() / 1000) % 100000;
      setStatus("Confirming transaction...");
      const sig = await createDaoOnChain(provider, daoId, name, desc || "No description");
      console.log("DAO created on-chain:", sig);
      setStatus("Saving...");
      await supabase.from("daos").insert({ name, description: desc, creator: wallet.publicKey.toBase58(), onchain_id: daoId });
      setStatus("DAO created!"); await new Promise(r => setTimeout(r, 800));
      router.push("/dashboard");
    } catch (e: any) {
      console.error(e); setStatus(""); setCreating(false);
      if (e.message?.includes("User rejected")) alert("Cancelled."); else alert("Failed: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(264,40%,6%)]">
      <NavBar />
      <div className="container mx-auto px-6 py-10 max-w-lg">
        <div className="dark-panel rounded-3xl p-8">
          <h1 className="text-xl font-bold text-white mb-6">Create DAO</h1>
          <div className="space-y-5">
            <div className="flex justify-center">
              {image ? (
                <div className="relative">
                  <img src={image} alt="" className="h-20 w-20 rounded-2xl object-cover border-2 border-white/10" />
                  <button type="button" onClick={() => setImage(null)} className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center border-none cursor-pointer"><X className="h-3 w-3" /></button>
                </div>
              ) : (
                <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-white/15 hover:border-[hsl(263,90%,66%)]/40 transition-colors">
                  <Upload className="h-5 w-5 text-white/30" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">DAO Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. DevDAO" className="dark-input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Description</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Describe your DAO's purpose..." className="dark-input resize-none" />
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs text-white/40 leading-relaxed">🧪 <span className="font-medium text-white/70">Devnet Mode:</span> No token gating — any wallet can participate. Votes encrypted via Arcium MPC.</p>
            </div>
            <button onClick={handleCreate} disabled={!name || creating} className="group w-full btn-primary-gradient rounded-xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
              {creating ? (<><Loader2 className="h-4 w-4 animate-spin" />{status}</>) : (<>Create DAO<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>)}
            </button>
          </div>
        </div>
        <PoweredFooter />
      </div>
    </div>
  );
}