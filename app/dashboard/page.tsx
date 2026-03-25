"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { BarChart3, Zap, Plus, ChevronRight, Trash2, Archive, ArchiveRestore, Lock } from "lucide-react";
import { NavBar, PoweredFooter } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [daos, setDaos] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [tab, setTab] = useState<"daos" | "polls">("daos");

  const wallet = publicKey?.toBase58() || "";

  useEffect(() => {
    if (!connected) { router.push("/"); return; }
    loadData();
  }, [connected, router, wallet]);

  const loadData = async () => {
    if (wallet) await supabase.from("members").upsert({ wallet }, { onConflict: "wallet" });
    const { data: daoData } = await supabase.from("daos").select("*").order("created_at", { ascending: false });
    if (daoData) {
      for (const d of daoData) {
        const { count } = await supabase.from("proposals").select("*", { count: "exact", head: true }).eq("dao_id", d.id);
        d.proposalCount = count || 0;
      }
      setDaos(daoData);
    }
    const { data: pollData } = await supabase.from("polls").select("*").order("created_at", { ascending: false });
    if (pollData) setPolls(pollData);
    const { count: voteCount } = await supabase.from("votes").select("*", { count: "exact", head: true });
    const { count: pollVoteCount } = await supabase.from("poll_votes").select("*", { count: "exact", head: true });
    setTotalVotes((voteCount || 0) + (pollVoteCount || 0));
    const { count: memberCount } = await supabase.from("members").select("*", { count: "exact", head: true });
    setTotalMembers(memberCount || 0);
    setLoading(false);
  };

  const deleteDao = async (id: number, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm("Delete this DAO permanently?")) return;
    await supabase.from("daos").delete().eq("id", id);
    setDaos(daos.filter(d => d.id !== id));
  };
  const archiveDao = async (id: number, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    await supabase.from("daos").update({ archived: true }).eq("id", id);
    setDaos(daos.map(d => d.id === id ? { ...d, archived: true } : d));
  };
  const restoreDao = async (id: number, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    await supabase.from("daos").update({ archived: false }).eq("id", id);
    setDaos(daos.map(d => d.id === id ? { ...d, archived: false } : d));
  };
  const deletePoll = async (id: number, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm("Delete this poll?")) return;
    await supabase.from("polls").delete().eq("id", id);
    setPolls(polls.filter(p => p.id !== id));
  };

  const activeDaos = daos.filter(d => !d.archived);
  const archivedDaos = daos.filter(d => d.archived);
  const myDaos = activeDaos.filter(d => d.creator === wallet);
  const exploreDaos = activeDaos.filter(d => d.creator !== wallet);
  const activePolls = polls.filter(p => p.status === "Active");
  const myPolls = activePolls.filter(p => p.creator === wallet);
  const trendingPolls = activePolls.filter(p => p.creator !== wallet);

  return (
    <div className="min-h-screen bg-[hsl(264,40%,6%)]">
      <NavBar />
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Action cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <Link href="/create-dao" className="no-underline dark-card rounded-2xl p-6 text-left group transition-all active:scale-[0.98]">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(263,90%,66%)]/10">
                <BarChart3 className="h-5 w-5 text-[hsl(263,90%,66%)]" />
              </div>
              <ChevronRight className="h-4 w-4 text-white/30 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Create DAO</h3>
            <p className="text-xs text-white/40">Full governance with proposals & encrypted voting</p>
          </Link>
          <Link href="/create-poll" className="no-underline dark-card rounded-2xl p-6 text-left group transition-all active:scale-[0.98]">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(263,75%,72%)]/15">
                <Zap className="h-5 w-5 text-[hsl(263,75%,72%)]" />
              </div>
              <ChevronRight className="h-4 w-4 text-white/30 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Quick Poll</h3>
            <p className="text-xs text-white/40">One-click encrypted vote — no DAO needed</p>
          </Link>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex rounded-xl dark-panel p-1 gap-1">
            <button onClick={() => setTab("daos")} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all border-none cursor-pointer ${tab === "daos" ? "btn-primary-gradient" : "bg-transparent text-white/40 hover:text-white/60"}`}>
              DAOs
            </button>
            <button onClick={() => setTab("polls")} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all border-none cursor-pointer ${tab === "polls" ? "btn-primary-gradient" : "bg-transparent text-white/40 hover:text-white/60"}`}>
              Polls
            </button>
          </div>
          <Link href={tab === "daos" ? "/create-dao" : "/create-poll"} className="text-xs text-[hsl(263,90%,66%)] hover:underline flex items-center gap-0.5 no-underline">
            <Plus className="h-3 w-3" /> {tab === "daos" ? "New DAO" : "New Poll"}
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-white/30">Loading...</div>
        ) : tab === "daos" ? (
          <>
            {/* Your DAOs */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-white">Your DAOs</h2>
                {myDaos.length > 0 && <span className="rounded-full bg-[hsl(263,90%,66%)]/10 px-2 py-0.5 text-xs font-medium text-[hsl(263,90%,66%)]">{myDaos.length}</span>}
              </div>
              {myDaos.length === 0 ? (
                <div className="dark-card rounded-2xl p-10 text-center">
                  <BarChart3 className="h-10 w-10 text-white/15 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-white mb-1">No DAOs Yet</h3>
                  <p className="text-xs text-white/30 mb-4">Create your first DAO to start private governance</p>
                  <Link href="/create-dao" className="btn-primary-gradient rounded-xl px-5 py-2 text-xs font-semibold no-underline inline-block">Create Your First DAO</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myDaos.map(d => (
                    <Link key={d.id} href={`/dao?id=${d.id}`} className="no-underline w-full dark-card rounded-2xl p-4 flex items-center gap-4 text-left group active:scale-[0.98] block">
                      <img src="/banner.jpg" alt="" className="h-12 w-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{d.name}</p>
                        <p className="text-xs text-white/40 truncate">{d.description}</p>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-3">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button onClick={(e) => archiveDao(d.id, e)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 transition-colors bg-transparent border-none cursor-pointer">
                            <Archive className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={(e) => deleteDao(d.id, e)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-xs font-mono-data text-white/40">{d.proposalCount} proposals</span>
                        <ChevronRight className="h-4 w-4 text-white/30" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Explore DAOs */}
            {exploreDaos.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-white">Explore DAOs</h2>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white/40">{exploreDaos.length}</span>
                </div>
                <div className="space-y-3">
                  {exploreDaos.map(d => (
                    <Link key={d.id} href={`/dao?id=${d.id}`} className="no-underline w-full dark-card rounded-2xl p-4 flex items-center gap-4 text-left group active:scale-[0.98] block">
                      <img src="/banner.jpg" alt="" className="h-12 w-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{d.name}</p>
                        <p className="text-xs text-white/40 truncate">{d.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono-data text-white/40">{d.proposalCount} proposals</span>
                        <ChevronRight className="h-4 w-4 text-white/30" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Archived */}
            {archivedDaos.length > 0 && (
              <section className="mb-10">
                <h2 className="text-lg font-semibold text-white mb-4">Archived</h2>
                <div className="space-y-3 opacity-50">
                  {archivedDaos.map(d => (
                    <div key={d.id} className="dark-card rounded-2xl p-4 flex items-center gap-4 grayscale group">
                      <img src="/banner.jpg" alt="" className="h-12 w-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{d.name}</p>
                        <p className="text-xs text-white/40 truncate">{d.description}</p>
                      </div>
                      {d.creator === wallet && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <button onClick={(e) => restoreDao(d.id, e)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 transition-colors bg-transparent border-none cursor-pointer"><ArchiveRestore className="h-3.5 w-3.5" /></button>
                          <button onClick={(e) => deleteDao(d.id, e)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <>
            {/* Your Polls */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-white">Your Polls</h2>
                {myPolls.length > 0 && <span className="rounded-full bg-[hsl(263,90%,66%)]/10 px-2 py-0.5 text-xs font-medium text-[hsl(263,90%,66%)]">{myPolls.length}</span>}
              </div>
              {myPolls.length === 0 ? (
                <div className="dark-card rounded-2xl p-10 text-center">
                  <Zap className="h-10 w-10 text-white/15 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-white mb-1">No Polls Yet</h3>
                  <p className="text-xs text-white/30 mb-4">Create a quick encrypted poll</p>
                  <Link href="/create-poll" className="btn-primary-gradient rounded-xl px-5 py-2 text-xs font-semibold no-underline inline-block">Create Your First Poll</Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {myPolls.map(p => (
                    <Link key={p.id} href={`/poll?id=${p.id}`} className="no-underline dark-card rounded-2xl p-5 text-left group active:scale-[0.98] block">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-white line-clamp-2 flex-1">{p.question}</p>
                        <button onClick={(e) => deletePoll(p.id, e)} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition bg-transparent border-none cursor-pointer ml-2"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                      <p className="text-xs text-white/40 mb-3">{p.option_a || "Yes"} vs {p.option_b || "No"}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-[hsl(263,90%,66%)]" style={{ width: `${Math.round(((p.votes || 0) / (p.total || 200)) * 100)}%` }} />
                        </div>
                        <span className="text-xs font-mono-data text-white/40">{p.votes || 0}</span>
                      </div>
                      {p.onchain_id && <div className="text-[10px] text-emerald-400 font-mono-data mt-2">On-Chain</div>}
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Trending Polls */}
            {trendingPolls.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-white">Trending Polls</h2>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white/40">{trendingPolls.length}</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {trendingPolls.map(p => (
                    <Link key={p.id} href={`/poll?id=${p.id}`} className="no-underline dark-card rounded-2xl p-5 text-left group active:scale-[0.98] block">
                      <p className="text-sm font-medium text-white mb-2 line-clamp-2">{p.question}</p>
                      <p className="text-xs text-white/40 mb-3">{p.option_a || "Yes"} vs {p.option_b || "No"}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-[hsl(263,90%,66%)]" style={{ width: `${Math.round(((p.votes || 0) / (p.total || 200)) * 100)}%` }} />
                        </div>
                        <span className="text-xs font-mono-data text-white/40">{p.votes || 0}</span>
                      </div>
                      {p.onchain_id && <div className="text-[10px] text-emerald-400 font-mono-data mt-2">On-Chain</div>}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-white/10 pt-8 mb-4">
          {[
            { label: "ENCRYPTED VOTES", value: String(totalVotes) },
            { label: "ACTIVE DAOS", value: String(activeDaos.length) },
            { label: "QUICK POLLS", value: String(activePolls.length) },
            { label: "MEMBERS", value: String(totalMembers) },
          ].map(s => (
            <div key={s.label} className="text-center py-4">
              <div className="font-mono-data text-2xl font-semibold text-[hsl(263,90%,66%)] mb-1">{s.value}</div>
              <div className="text-[10px] text-white/30 tracking-[0.15em] uppercase">{s.label}</div>
            </div>
          ))}
        </div>

        <PoweredFooter />
      </div>
    </div>
  );
}