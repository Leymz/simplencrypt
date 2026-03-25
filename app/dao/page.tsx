"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { Plus, Lock, ChevronRight, Trash2, Archive, ArchiveRestore } from "lucide-react";
import { NavBar, PoweredFooter } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DaoPage() {
  const params = useSearchParams();
  const router = useRouter();
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
  const deleteProposal = async (id: number, e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); if (!confirm("Delete?")) return; await supabase.from("proposals").delete().eq("id", id); setProposals(proposals.filter(p => p.id !== id)); };
  const archiveProposal = async (id: number, e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); await supabase.from("proposals").update({ status: "Archived" }).eq("id", id); setProposals(proposals.map(p => p.id === id ? { ...p, status: "Archived" } : p)); };
  const restoreProposal = async (id: number, e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); await supabase.from("proposals").update({ status: "Active" }).eq("id", id); setProposals(proposals.map(p => p.id === id ? { ...p, status: "Active" } : p)); };

  const active = proposals.filter(p => p.status === "Active");
  const computing = proposals.filter(p => p.status === "Computing");
  const finalized = proposals.filter(p => p.status === "Finalized");
  const archived = proposals.filter(p => p.status === "Archived");
  const other = [...computing, ...finalized];
  const totalVotes = proposals.reduce((a: number, p: any) => a + (p.votes || 0), 0);

  const StatusBadge = ({ status }: { status: string }) => {
    const cls = status === "Active" ? "status-active" : status === "Computing" ? "status-computing" : status === "Finalized" ? "status-finalized" : "bg-white/10 text-white/40";
    return (
      <span className={`${cls} rounded-full px-2.5 py-0.5 text-[10px] font-medium flex items-center gap-1 shrink-0`}>
        {(status === "Active" || status === "Computing") && <span className={`h-1.5 w-1.5 rounded-full bg-current ${status === "Computing" ? "animate-pulse" : ""}`} />}
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[hsl(264,40%,6%)]">
      <NavBar />
      {/* Banner */}
      <div className="relative h-40 overflow-hidden">
        <img src="/banner.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(264,40%,6%)] via-[hsl(264,40%,6%)]/60 to-transparent" />
        <div className="absolute bottom-4 left-0 right-0 container mx-auto px-6 max-w-5xl flex items-end justify-between">
          <div className="flex items-center gap-3">
            <img src="/banner.jpg" alt="" className="h-12 w-12 rounded-xl border-2 border-white/20 object-cover" />
            <div>
              <h1 className="text-white text-xl font-bold">{dao.name}</h1>
              <p className="text-white/50 text-xs">{dao.description}</p>
            </div>
          </div>
          <Link href={`/create-proposal?daoId=${daoId}`} className="btn-primary-gradient rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 no-underline">
            <Plus className="h-3.5 w-3.5" /> New Proposal
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Proposals", value: String(proposals.filter(p => p.status !== "Archived").length) },
            { label: "Encrypted Votes", value: String(totalVotes) },
            { label: "Arcium", value: "MPC", isBadge: true },
          ].map(s => (
            <div key={s.label} className="dark-card rounded-2xl p-4 text-center">
              <div className={`font-mono-data text-lg font-semibold ${s.isBadge ? "text-[hsl(263,75%,72%)]" : "text-[hsl(263,90%,66%)]"} mb-0.5`}>{s.value}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-white/30">Loading...</div>
        ) : proposals.filter(p => p.status !== "Archived").length === 0 ? (
          <div className="dark-card rounded-2xl p-10 text-center">
            <Lock className="h-10 w-10 text-white/15 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">No Proposals Yet</h3>
            <p className="text-xs text-white/30 mb-4">Create the first proposal for this DAO</p>
            <Link href={`/create-proposal?daoId=${daoId}`} className="btn-primary-gradient rounded-xl px-5 py-2 text-xs font-semibold no-underline inline-block">Create First Proposal</Link>
          </div>
        ) : null}

        {/* Active */}
        {active.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-white mb-4">Active Proposals</h2>
            <div className="space-y-3">
              {active.map(p => {
                const isCreator = p.creator === wallet || isDaoCreator;
                return (
                  <Link key={p.id} href={`/proposal?daoId=${daoId}&id=${p.id}`} className="no-underline w-full dark-card rounded-2xl p-5 text-left group active:scale-[0.98] block">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-white">{p.title}</h3>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <StatusBadge status={p.status} />
                        {isCreator && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button onClick={(e) => archiveProposal(p.id, e)} className="p-1 rounded-lg hover:bg-white/5 text-white/30 bg-transparent border-none cursor-pointer"><Archive className="h-3.5 w-3.5" /></button>
                            <button onClick={(e) => deleteProposal(p.id, e)} className="p-1 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 bg-transparent border-none cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-white/40 mb-3">{p.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-[hsl(263,90%,66%)]" style={{ width: `${Math.round(((p.votes || 0) / (p.total || 200)) * 100)}%` }} />
                      </div>
                      <span className="text-xs font-mono-data text-white/40">{p.votes || 0}/{p.total || 200}</span>
                      <Lock className="h-3 w-3 text-white/20" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Past & Computing */}
        {other.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-white mb-4">Past & Computing</h2>
            <div className="space-y-3">
              {other.map(p => {
                const isCreator = p.creator === wallet || isDaoCreator;
                return (
                  <div key={p.id} className="dark-card rounded-2xl p-5 group">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-white">{p.title}</h3>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <StatusBadge status={p.status} />
                        {isCreator && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button onClick={(e) => archiveProposal(p.id, e)} className="p-1 rounded-lg hover:bg-white/5 text-white/30 bg-transparent border-none cursor-pointer"><Archive className="h-3.5 w-3.5" /></button>
                            <button onClick={(e) => deleteProposal(p.id, e)} className="p-1 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 bg-transparent border-none cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-white/40 mb-3">{p.description}</p>
                    {p.status === "Finalized" && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden flex">
                          <div className="h-full bg-[hsl(263,90%,66%)] rounded-l-full" style={{ width: `${Math.round(((p.yes_votes || 0) / (p.votes || 1)) * 100)}%` }} />
                          <div className="h-full bg-white/20 rounded-r-full" style={{ width: `${Math.round(((p.no_votes || 0) / (p.votes || 1)) * 100)}%` }} />
                        </div>
                        <span className="text-xs font-mono-data text-[hsl(263,90%,66%)]">{Math.round(((p.yes_votes || 0) / (p.votes || 1)) * 100)}%</span>
                        <span className="text-xs font-mono-data text-white/40">{Math.round(((p.no_votes || 0) / (p.votes || 1)) * 100)}%</span>
                      </div>
                    )}
                    {p.status === "Computing" && (
                      <div className="flex items-center gap-2 text-xs font-mono-data text-amber-400">
                        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" /> MPC Computing...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Archived */}
        {archived.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-white mb-4">Archived</h2>
            <div className="space-y-3 opacity-50">
              {archived.map(p => {
                const isCreator = p.creator === wallet || isDaoCreator;
                return (
                  <div key={p.id} className="dark-card rounded-2xl p-4 flex items-center justify-between group">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{p.title}</h3>
                      <p className="text-xs text-white/40">{p.description}</p>
                    </div>
                    {isCreator && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button onClick={(e) => restoreProposal(p.id, e)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 bg-transparent border-none cursor-pointer"><ArchiveRestore className="h-3.5 w-3.5" /></button>
                        <button onClick={(e) => deleteProposal(p.id, e)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 bg-transparent border-none cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <PoweredFooter />
      </div>
    </div>
  );
}