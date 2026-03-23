import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { randomBytes } from "crypto";
import {
  getMXEAccAddress,
  getMempoolAccAddress,
  getCompDefAccAddress,
  getCompDefAccOffset,
  getExecutingPoolAccAddress,
  getComputationAccAddress,
  getClusterAccAddress,
} from "@arcium-hq/client";

const RPC_ENDPOINT = "https://convincing-cosmopolitan-sanctuary.solana-devnet.quiknode.pro/97ce1836e57eafd461d16635198ae58354417873/";
const PROGRAM_ID = new PublicKey("76hfZxh9JagZi1S2EYQrhRPf7FhcCmsV8mM3BAr3e9Zh");

const MASTER_DAO_CREATOR = new PublicKey("CFTi79EeQz5LPfKR3TxVu7CehPRGuosFgQzj64upZ2as");
const MASTER_DAO_ONCHAIN_ID = 7149;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { creatorWallet, proposalId, title, optionA, optionB, deadlineHours } = body;

    if (!creatorWallet || !proposalId || !title) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const connection = new Connection(RPC_ENDPOINT, "confirmed");
    const creatorPubkey = new PublicKey(creatorWallet);

    const idl = require("@/lib/idl.json");

    const dummyWallet = {
      publicKey: creatorPubkey,
      signTransaction: async (tx: any) => tx,
      signAllTransactions: async (txs: any) => txs,
    } as any;

    const provider = new AnchorProvider(connection, dummyWallet, { commitment: "confirmed" });
    const program = new Program(idl, provider);

    const daoPda = PublicKey.findProgramAddressSync(
      [Buffer.from("dao"), MASTER_DAO_CREATOR.toBuffer(), new BN(MASTER_DAO_ONCHAIN_ID).toArrayLike(Buffer, "le", 4)],
      PROGRAM_ID
    )[0];

    const arciumEnv = { arciumClusterOffset: 456 };
    const computationOffset = new BN(randomBytes(4), "hex");
    const mxeAccount = getMXEAccAddress(program.programId);
    const deadline = new BN(Math.floor(Date.now() / 1000) + (deadlineHours || 24) * 3600);

    const tx = await program.methods
      .createProposal(
        computationOffset,
        proposalId,
        title,
        "",
        optionA || "Yes",
        optionB || "No",
        deadline
      )
      .accountsPartial({
        payer: creatorPubkey,
        mxeAccount,
        computationAccount: getComputationAccAddress(arciumEnv.arciumClusterOffset, computationOffset),
        clusterAccount: getClusterAccAddress(arciumEnv.arciumClusterOffset),
        mempoolAccount: getMempoolAccAddress(arciumEnv.arciumClusterOffset),
        executingPool: getExecutingPoolAccAddress(arciumEnv.arciumClusterOffset),
        compDefAccount: getCompDefAccAddress(
          program.programId,
          Buffer.from(getCompDefAccOffset("init_vote_stats")).readUInt32LE()
        ),
        daoAcc: daoPda,
      })
      .transaction();

    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = creatorPubkey;

    const serialized = tx.serialize({ requireAllSignatures: false }).toString("base64");

    return NextResponse.json({
      transaction: serialized,
      computationOffset: computationOffset.toString(),
      onChain: true,
    });
  } catch (error: any) {
    console.error("Create poll API error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}