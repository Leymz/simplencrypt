"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
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
    if (wallet) {
      await supabase.from("members").upsert({ wallet }, { onConflict: "wallet" });
    }
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

  const restoreDao = async (id: number) => {
    await supabase.from("daos").update({ archived: false }).eq("id", id);
    setDaos(daos.map(d => d.id === id ? { ...d, archived: false } : d));
  };

  const deletePoll = async (id: number, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm("Delete this poll?")) return;
    await supabase.from("polls").delete().eq("id", id);
    setPolls(polls.filter(p => p.id !== id));
  };

  const activeDaos = daos.filter((d: any) => !d.archived);
  const archivedDaos = daos.filter((d: any) => d.archived);
  const myDaos = activeDaos.filter(d => d.creator === wallet);
  const exploreDaos = activeDaos.filter(d => d.creator !== wallet);
  const activePolls = polls.filter((p: any) => p.status === "Active");
  const myPolls = activePolls.filter(p => p.creator === wallet);
  const trendingPolls = activePolls.filter(p => p.creator !== wallet);

  return (
    <div className="min-h-screen bg-[#F7F5FB] dark:bg-[#110D20]">
      <NavBar />
      <div className="px-10 py-10">
        <div className="mb-8 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(139,92,246,0.12)]">
          <img src="/promo.png" alt="simplEncrypt" className="w-full block rounded-2xl h-44 object-cover object-center" />
        </div>

        {/* Tab switcher */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex bg-white dark:bg-[#1A1530] rounded-xl border border-[#E5E1EE] dark:border-[#2A2445] p-1">
            <button onClick={() => setTab("daos")} className={`px-6 py-2.5 rounded-lg text-[14px] font-semibold transition-all border-none cursor-pointer ${tab === "daos" ? "bg-gradient-to-r from-brand-purple to-brand-purple-light text-white shadow-[0_2px_10px_rgba(139,92,246,0.2)]" : "bg-transparent text-[#8A8494] hover:text-[#4A4555] dark:hover:text-[#A09BB0]"}`}>
              🏛️ DAOs
            </button>
            <button onClick={() => setTab("polls")} className={`px-6 py-2.5 rounded-lg text-[14px] font-semibold transition-all border-none cursor-pointer ${tab === "polls" ? "bg-gradient-to-r from-brand-purple to-brand-purple-light text-white shadow-[0_2px_10px_rgba(139,92,246,0.2)]" : "bg-transparent text-[#8A8494] hover:text-[#4A4555] dark:hover:text-[#A09BB0]"}`}>
              ⚡ Polls
            </button>
          </div>
          <Link href={tab === "daos" ? "/create-dao" : "/create-poll"} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-purple-light text-white text-[13px] font-semibold no-underline shadow-[0_3px_14px_rgba(139,92,246,0.18)]">
            {tab === "daos" ? "+ Create DAO" : "+ New Poll"}
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#8A8494]">Loading...</div>
        ) : tab === "daos" ? (
          <>
            {/* Your DAOs */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-[18px] font-bold text-[#1A1625] dark:text-[#EEEAF6]">Your DAOs</h2>
                {myDaos.length > 0 && <span className="text-[11px] font-semibold text-brand-purple px-2.5 py-0.5 rounded-md bg-brand-purple-bg dark:bg-purple-500/10">{myDaos.length}</span>}
              </div>
              {myDaos.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-[#1A1530] rounded-2xl border border-[#E5E1EE] dark:border-[#2A2445]">
                  <div className="text-4xl mb-3">🏛️</div>
                  <h3 className="text-base font-bold text-[#1A1625] dark:text-[#EEEAF6] mb-1">No DAOs Yet</h3>
                  <p className="text-sm text-[#8A8494] mb-4">Create your first DAO to start private governance</p>
                  <Link href="/create-dao" className="px-5 py-2 rounded-xl bg-brand-purple text-white text-sm font-semibold no-underline">Create Your First DAO</Link>
                </div>
              ) : (
                <div className="grid gap-3">
                  {myDaos.map((d) => (
                    <Link key={d.id} href={`/dao?id=${d.id}`} className="no-underline p-5 rounded-2xl bg-white dark:bg-[#1A1530] border border-[#E5E1EE] dark:border-[#2A2445] cursor-pointer transition-all hover:border-brand-purple-light hover:shadow-[0_3px_18px_rgba(139,92,246,0.06)] flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <img src="/banner.jpg" alt="" className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <h3 className="text-[16px] font-bold text-[#1A1625] dark:text-[#EEEAF6]">{d.name}</h3>
                          <p className="text-xs text-[#8A8494] mt-0.5">{d.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="text-center">
                          <div className="text-[17px] font-bold text-brand-purple">{d.proposalCount || 0}</div>
                          <div className="text-[10px] text-[#8A8494] uppercase tracking-wide font-mono">Proposals</div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => archiveDao(d.id, e)} className="text-[#D0CCD8] hover:text-amber-400 bg-transparent border-none cursor-pointer text-sm p-1">📦</button>
                          <button onClick={(e) => deleteDao(d.id, e)} className="text-[#D0CCD8] hover:text-red-400 bg-transparent border-none cursor-pointer text-sm p-1">🗑</button>
                        </div>
                        <span className="text-[#D0CCD8] text-lg">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Explore DAOs */}
            {exploreDaos.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-[18px] font-bold text-[#1A1625] dark:text-[#EEEAF6]">Explore DAOs</h2>
                  <span className="text-[11px] font-semibold text-[#8A8494] px-2.5 py-0.5 rounded-md bg-[#F0EDF6] dark:bg-[#1A1530]">{exploreDaos.length}</span>
                </div>
                <div className="grid gap-3">
                  {exploreDaos.map((d) => (
                    <Link key={d.id} href={`/dao?id=${d.id}`} className="no-underline p-5 rounded-2xl bg-white dark:bg-[#1A1530] border border-[#E5E1EE] dark:border-[#2A2445] cursor-pointer transition-all hover:border-brand-purple-light hover:shadow-[0_3px_18px_rgba(139,92,246,0.06)] flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <img src="/banner.jpg" alt="" className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <h3 className="text-[16px] font-bold text-[#1A1625] dark:text-[#EEEAF6]">{d.name}</h3>
                          <p className="text-xs text-[#8A8494] mt-0.5">{d.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="text-center">
                          <div className="text-[17px] font-bold text-brand-purple">{d.proposalCount || 0}</div>
                          <div className="text-[10px] text-[#8A8494] uppercase tracking-wide font-mono">Proposals</div>
                        </div>
                        <span className="text-[#D0CCD8] text-lg">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Archived */}
            {archivedDaos.length > 0 && (
              <div className="mb-8">
                <h2 className="text-[14px] font-semibold text-[#8A8494] mb-3 uppercase tracking-wide">Archived</h2>
                <div className="grid gap-2">
                  {archivedDaos.map((d) => {
                    const isCreator = d.creator === wallet;
                    return (
                      <div key={d.id} className="p-4 rounded-xl bg-[#F0EDF6] dark:bg-[#1A1530] border border-[#E5E1EE] dark:border-[#2A2445] flex justify-between items-center opacity-60 group">
                        <div className="flex items-center gap-4">
                          <img src="/banner.jpg" alt="" className="w-10 h-10 rounded-lg object-cover grayscale" />
                          <div>
                            <h3 className="text-[14px] font-bold text-[#4A4555] dark:text-[#A09BB0]">{d.name}</h3>
                            <p className="text-[11px] text-[#8A8494]">{d.description}</p>
                          </div>
                        </div>
                        {isCreator && (
                          <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => restoreDao(d.id)} className="text-xs text-brand-purple bg-transparent border-none cursor-pointer font-semibold">Restore</button>
                            <button onClick={(e) => deleteDao(d.id, e)} className="text-xs text-red-400 bg-transparent border-none cursor-pointer font-semibold">Delete</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Your Polls */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-[18px] font-bold text-[#1A1625] dark:text-[#EEEAF6]">Your Polls</h2>
                {myPolls.length > 0 && <span className="text-[11px] font-semibold text-brand-purple px-2.5 py-0.5 rounded-md bg-brand-purple-bg dark:bg-purple-500/10">{myPolls.length}</span>}
              </div>
              {myPolls.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-[#1A1530] rounded-2xl border border-[#E5E1EE] dark:border-[#2A2445]">
                  <div className="text-4xl mb-3">⚡</div>
                  <h3 className="text-base font-bold text-[#1A1625] dark:text-[#EEEAF6] mb-1">No Polls Yet</h3>
                  <p className="text-sm text-[#8A8494] mb-4">Create a quick encrypted poll</p>
                  <Link href="/create-poll" className="px-5 py-2 rounded-xl bg-brand-purple text-white text-sm font-semibold no-underline">Create Your First Poll</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {myPolls.map((p: any) => (
                    <Link key={p.id} href={`/poll?id=${p.id}`} className="no-underline p-5 rounded-2xl bg-white dark:bg-[#1A1530] border border-[#E5E1EE] dark:border-[#2A2445] hover:border-brand-purple-light transition block group">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-[14px] font-bold text-[#1A1625] dark:text-[#EEEAF6] flex-1 leading-snug">{p.question}</h3>
                        <button onClick={(e) => deletePoll(p.id, e)} className="opacity-0 group-hover:opacity-100 text-[#D0CCD8] hover:text-red-400 bg-transparent border-none cursor-pointer text-sm p-1 ml-2">🗑</button>
                      </div>
                      <div className="flex justify-between text-[11px] text-[#8A8494] mb-2">
                        <span>{p.option_a} vs {p.option_b}</span>
                        <span>{p.votes || 0} votes</span>
                      </div>
                      <div className="h-1.5 rounded bg-[#F0EDF6] dark:bg-[#2A2445] overflow-hidden">
                        <div className="h-full rounded bg-gradient-to-r from-brand-purple to-brand-purple-light" style={{ width: `${Math.round(((p.votes || 0) / (p.total || 200)) * 100)}%` }} />
                      </div>
                      {p.onchain_id && <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-2">On-Chain</div>}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Trending Polls */}
            {trendingPolls.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-[18px] font-bold text-[#1A1625] dark:text-[#EEEAF6]">Trending Polls</h2>
                  <span className="text-[11px] font-semibold text-[#8A8494] px-2.5 py-0.5 rounded-md bg-[#F0EDF6] dark:bg-[#1A1530]">{trendingPolls.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {trendingPolls.map((p: any) => (
                    <Link key={p.id} href={`/poll?id=${p.id}`} className="no-underline p-5 rounded-2xl bg-white dark:bg-[#1A1530] border border-[#E5E1EE] dark:border-[#2A2445] hover:border-brand-purple-light transition block">
                      <h3 className="text-[14px] font-bold text-[#1A1625] dark:text-[#EEEAF6] mb-2 leading-snug">{p.question}</h3>
                      <div className="flex justify-between text-[11px] text-[#8A8494] mb-2">
                        <span>{p.option_a} vs {p.option_b}</span>
                        <span>{p.votes || 0} votes</span>
                      </div>
                      <div className="h-1.5 rounded bg-[#F0EDF6] dark:bg-[#2A2445] overflow-hidden">
                        <div className="h-full rounded bg-gradient-to-r from-brand-purple to-brand-purple-light" style={{ width: `${Math.round(((p.votes || 0) / (p.total || 200)) * 100)}%` }} />
                      </div>
                      {p.onchain_id && <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-2">On-Chain</div>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Stats */}
        <div className="mt-8 pt-8 border-t border-[#E5E1EE] dark:border-[#2A2445]">
          <div className="grid grid-cols-4">
            {[
              { v: String(totalVotes), l: "Encrypted Votes" },
              { v: String(activeDaos.length), l: "Active DAOs" },
              { v: String(activePolls.length), l: "Quick Polls" },
              { v: String(totalMembers), l: "Members" },
            ].map((s, i) => (
              <div key={i} className="text-center py-7">
                <div className="text-4xl font-bold text-brand-purple font-mono tracking-tight">{s.v}</div>
                <div className="text-[11px] text-[#8A8494] mt-2 uppercase tracking-[1.5px] font-semibold">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PoweredFooter />
    </div>
  );
}