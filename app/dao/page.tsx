"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { PoweredFooter, StatusBadge } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DaoPage() {
  const params = useSearchParams();
  const daoId = params.get("id") || "1";
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() || "";

  const [proposals, setProposals] = useState<any[]>([]);
  const [dao, setDao] = useState<any>({ name: "DAO", description: "", creator: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [daoId]);

  const loadData = async () => {
    const { data: daoData } = await supabase.from("daos").select("*").eq("id", Number(daoId)).single();
    if (daoData) setDao(daoData);
    const { data: propData } = await supabase.from("proposals").select("*").eq("dao_id", Number(daoId)).order("created_at", { ascending: false });
    if (propData) setProposals(propData);
    setLoading(false);
  };

  const isDaoCreator = dao.creator === wallet;

  const deleteProposal = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this proposal permanently?")) return;
    await supabase.from("proposals").delete().eq("id", id);
    setProposals(proposals.filter(p => p.id !== id));
  };

  const archiveProposal = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await supabase.from("proposals").update({ status: "Archived" }).eq("id", id);
    setProposals(proposals.map(p => p.id === id ? { ...p, status: "Archived" } : p));
  };

  const restoreProposal = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await supabase.from("proposals").update({ status: "Active" }).eq("id", id);
    setProposals(proposals.map(p => p.id === id ? { ...p, status: "Active" } : p));
  };

  const active = proposals.filter((p) => p.status === "Active");
  const computing = proposals.filter((p) => p.status === "Computing");
  const finalized = proposals.filter((p) => p.status === "Finalized");
  const archived = proposals.filter((p) => p.status === "Archived");
  const other = [...computing, ...finalized];
  const totalVotes = proposals.reduce((a: number, p: any) => a + (p.votes || 0), 0);

  return (
    <div className="min-h-screen bg-[#F7F5FB] dark:bg-[#110D20]">
      <div className="bg-white dark:bg-[#140F25] border-b border-[#E5E1EE] dark:border-[#2A2445] px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-[17px] text-[#4A4555] dark:text-[#A09BB0] no-underline px-1 py-0.5 rounded hover:bg-[#F0EDF6] dark:hover:bg-[#1A1530] transition">←</Link>
          <Link href="/dashboard" className="flex items-center gap-2 no-underline">
            <img src="/logo.png" alt="" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-brand text-[17px] text-[#1A1625] dark:text-[#EEEAF6]">simpl<span className="font-bold text-brand-purple">Encrypt</span></span>
          </Link>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-[#F0EDF6] dark:bg-[#1A1530] text-xs font-medium text-[#4A4555] dark:text-[#A09BB0] font-mono">
          {wallet ? `${wallet.slice(0,4)}...${wallet.slice(-4)}` : ""}
        </div>
      </div>

      <div className="px-10 py-10">
        <div className="rounded-2xl overflow-hidden mb-7 relative h-40">
          <img src="/banner.jpg" alt="" className="w-full h-full object-cover brightness-[0.85]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(26,22,37,0.7)] via-[rgba(26,22,37,0.3)] to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-7 py-5 flex justify-between items-end">
            <div className="flex gap-4 items-end">
              <img src="/banner.jpg" alt="" className="w-14 h-14 rounded-xl object-cover border-[3px] border-white shadow-lg" />
              <div>
                <h1 className="text-[22px] font-bold text-white mb-0.5 drop-shadow">{dao.name}</h1>
                <p className="text-xs text-white/70">{dao.description}</p>
              </div>
            </div>
            <Link href={`/create-proposal?daoId=${daoId}`} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-purple-light text-white text-xs font-semibold no-underline shadow-[0_3px_14px_rgba(139,92,246,0.3)]">
              + New Proposal
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { v: proposals.filter(p => p.status !== "Archived").length, l: "Proposals" },
            { v: totalVotes, l: "Encrypted Votes" },
            { v: "MPC", l: "Arcium" },
          ].map((s, i) => (
            <div key={i} className="text-center py-4 bg-white dark:bg-[#1A1530] border border-[#E5E1EE] dark:border-[#2A2445] rounded-xl">
              <div className="text-lg font-bold text-brand-purple font-mono">{s.v}</div>
              <div className="text-[10px] text-[#8A8494] uppercase tracking-wide font-mono mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#8A8494]">Loading...</div>
        ) : proposals.filter(p => p.status !== "Archived").length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1A1530] rounded-2xl border border-[#E5E1EE] dark:border-[#2A2445]">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-bold text-[#1A1625] dark:text-[#EEEAF6] mb-2">No Proposals Yet</h3>
            <p className="text-sm text-[#8A8494] mb-6">Create the first proposal for this DAO</p>
            <Link href={`/create-proposal?daoId=${daoId}`} className="px-6 py-2.5 rounded-xl bg-brand-purple text-white text-sm font-semibold no-underline">Create First Proposal</Link>
          </div>
        ) : null}

        {active.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3.5">
              <h2 className="text-[16px] font-bold text-[#1A1625] dark:text-[#EEEAF6]">Active Proposals</h2>
              <span className="text-[11px] font-semibold text-brand-purple px-2.5 py-0.5 rounded-md bg-brand-purple-bg dark:bg-purple-500/10">{active.length}</span>
            </div>
            <div className="grid gap-2.5 mb-8">
              {active.map((p: any) => {
                const isProposalCreator = p.creator === wallet;
                return (
                  <Link key={p.id} href={`/proposal?daoId=${daoId}&id=${p.id}`} className="no-underline p-5 rounded-[14px] bg-white dark:bg-[#1A1530] border border-[#E5E1EE] dark:border-[#2A2445] transition hover:border-brand-purple-light block group">
                    <div className="flex justify-between items-start mb-2.5">
                      <h3 className="text-[15px] font-bold text-[#1A1625] dark:text-[#EEEAF6] flex-1">{p.title}</h3>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={p.status} />
                        {(isDaoCreator || isProposalCreator) && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => archiveProposal(p.id, e)} className="text-[#D0CCD8] hover:text-amber-400 bg-transparent border-none cursor-pointer text-sm p-1" title="Archive">📦</button>
                            <button onClick={(e) => deleteProposal(p.id, e)} className="text-[#D0CCD8] hover:text-red-400 bg-transparent border-none cursor-pointer text-sm p-1" title="Delete">🗑</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-[12.5px] text-[#8A8494] mb-3.5 leading-relaxed">{p.description}</p>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-semibold text-[#4A4555] dark:text-[#A09BB0]">{p.votes || 0} of {p.total || 200} wallets voted</span>
                        <span className="text-xs font-bold text-brand-purple">{Math.round(((p.votes || 0) / (p.total || 200)) * 100)}%</span>
                      </div>
                      <div className="h-2 rounded bg-[#F0EDF6] dark:bg-[#2A2445] overflow-hidden">
                        <div className="h-full rounded bg-gradient-to-r from-brand-purple to-brand-purple-light" style={{ width: `${Math.round(((p.votes || 0) / (p.total || 200)) * 100)}%` }} />
                      </div>
                      <div className="text-[11px] text-[#9C96AA] mt-1.5">🔒 Individual votes encrypted until deadline</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {other.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3.5">
              <h2 className="text-[16px] font-bold text-[#1A1625] dark:text-[#EEEAF6]">Past & Computing</h2>
              <span className="text-[11px] font-semibold text-[#8A8494] px-2.5 py-0.5 rounded-md bg-[#F0EDF6] dark:bg-[#1A1530]">{other.length}</span>
            </div>
            <div className="grid gap-2.5 mb-8">
              {other.map((p: any) => {
                const isProposalCreator = p.creator === wallet;
                return (
                  <Link key={p.id} href={`/proposal?daoId=${daoId}&id=${p.id}`} className={`no-underline p-5 rounded-[14px] bg-white dark:bg-[#1A1530] border border-[#E5E1EE] dark:border-[#2A2445] transition hover:border-brand-purple-light block group ${p.status === "Computing" ? "opacity-[0.85]" : ""}`}>
                    <div className="flex justify-between items-start mb-2.5">
                      <h3 className="text-[15px] font-bold text-[#1A1625] dark:text-[#EEEAF6] flex-1">{p.title}</h3>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={p.status} />
                        {(isDaoCreator || isProposalCreator) && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => archiveProposal(p.id, e)} className="text-[#D0CCD8] hover:text-amber-400 bg-transparent border-none cursor-pointer text-sm p-1" title="Archive">📦</button>
                            <button onClick={(e) => deleteProposal(p.id, e)} className="text-[#D0CCD8] hover:text-red-400 bg-transparent border-none cursor-pointer text-sm p-1" title="Delete">🗑</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-[12.5px] text-[#8A8494] mb-3.5 leading-relaxed">{p.description}</p>
                    {p.status === "Finalized" && (
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-xs font-semibold text-[#4A4555] dark:text-[#A09BB0]">Final — {p.votes} votes</span>
                          <span className="text-xs font-bold text-emerald-600">✅ ZKP Verified</span>
                        </div>
                        <div className="flex h-7 rounded-lg overflow-hidden">
                          <div className="bg-gradient-to-r from-brand-purple to-brand-purple-light flex items-center justify-center text-[11px] font-bold text-white min-w-[40px]" style={{ width: `${Math.round(((p.yes_votes || 0) / (p.votes || 1)) * 100)}%` }}>Yes {Math.round(((p.yes_votes || 0) / (p.votes || 1)) * 100)}%</div>
                          <div className="flex-1 bg-[#E5E1EE] dark:bg-[#2A2445] flex items-center justify-center text-[11px] font-bold text-[#4A4555] dark:text-[#A09BB0] min-w-[40px]">No {Math.round(((p.no_votes || 0) / (p.votes || 1)) * 100)}%</div>
                        </div>
                      </div>
                    )}
                    {p.status === "Computing" && (
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-amber-600">
                        <div className="w-2.5 h-2.5 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
                        MPC Computing...
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {archived.length > 0 && (
          <div className="mt-4">
            <h2 className="text-[14px] font-semibold text-[#8A8494] mb-3 uppercase tracking-wide">Archived</h2>
            <div className="grid gap-2">
              {archived.map((p: any) => {
                const isProposalCreator = p.creator === wallet;
                return (
                  <div key={p.id} className="p-4 rounded-xl bg-[#F0EDF6] dark:bg-[#1A1530] border border-[#E5E1EE] dark:border-[#2A2445] flex justify-between items-center opacity-60 group">
                    <div>
                      <h3 className="text-[14px] font-bold text-[#4A4555] dark:text-[#A09BB0]">{p.title}</h3>
                      <p className="text-[11px] text-[#8A8494] mt-0.5">{p.description}</p>
                    </div>
                    {(isDaoCreator || isProposalCreator) && (
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => restoreProposal(p.id, e)} className="text-xs text-brand-purple bg-transparent border-none cursor-pointer font-semibold">Restore</button>
                        <button onClick={(e) => deleteProposal(p.id, e)} className="text-xs text-red-400 bg-transparent border-none cursor-pointer font-semibold">Delete</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-10 pt-7 border-t border-[#E5E1EE] dark:border-[#2A2445]">
          <div className="grid grid-cols-4">
            {[
              { v: proposals.filter(p => p.status !== "Archived").length, l: "Total Proposals" },
              { v: active.length, l: "Active Now" },
              { v: totalVotes, l: "Encrypted Votes" },
              { v: finalized.length, l: "Finalized" },
            ].map((s, i) => (
              <div key={i} className="text-center py-6">
                <div className="text-3xl font-bold text-brand-purple font-mono tracking-tight">{s.v}</div>
                <div className="text-[10px] text-[#8A8494] mt-1.5 uppercase tracking-[1.5px] font-semibold">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PoweredFooter />
    </div>
  );
}