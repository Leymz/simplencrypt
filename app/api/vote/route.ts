import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { randomBytes } from "crypto";
import {
  RescueCipher,
  deserializeLE,
  getMXEPublicKey,
  getMXEAccAddress,
  getMempoolAccAddress,
  getCompDefAccAddress,
  getCompDefAccOffset,
  getExecutingPoolAccAddress,
  getComputationAccAddress,
  getClusterAccAddress,
  getArciumEnv,
  x25519,
} from "@arcium-hq/client";

const RPC_ENDPOINT = "https://convincing-cosmopolitan-sanctuary.solana-devnet.quiknode.pro/97ce1836e57eafd461d16635198ae58354417873/";
const PROGRAM_ID = new PublicKey("76hfZxh9JagZi1S2EYQrhRPf7FhcCmsV8mM3BAr3e9Zh");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { voterWallet, daoCreator, onchainDaoId, onchainProposalId, voteYes } = body;

    if (!voterWallet || !daoCreator || onchainDaoId === undefined || onchainProposalId === undefined || voteYes === undefined) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const connection = new Connection(RPC_ENDPOINT, "confirmed");
    const voterPubkey = new PublicKey(voterWallet);
    const creatorPubkey = new PublicKey(daoCreator);

    const idl = require("@/lib/idl.json");

    const dummyWallet = {
      publicKey: voterPubkey,
      signTransaction: async (tx: any) => tx,
      signAllTransactions: async (txs: any) => txs,
    } as any;

    const provider = new AnchorProvider(connection, dummyWallet, { commitment: "confirmed" });
    const program = new Program(idl, provider);

    // Derive PDAs using the DAO CREATOR's wallet
   const daoPda = PublicKey.findProgramAddressSync(
      [Buffer.from("dao"), creatorPubkey.toBuffer(), new BN(onchainDaoId).toArrayLike(Buffer, "le", 4)],
      PROGRAM_ID
    )[0];

    const proposalPda = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), new BN(onchainProposalId).toArrayLike(Buffer, "le", 4)],
      PROGRAM_ID
    )[0];

    // Verify accounts exist
    const proposalInfo = await connection.getAccountInfo(proposalPda);
    if (!proposalInfo) {
      return NextResponse.json({ error: "Proposal not found on-chain. This proposal may only exist in the database.", onChain: false }, { status: 404 });
    }

    // Arcium encryption
    const arciumEnv = { arciumClusterOffset: 456 };
    const computationOffset = new BN(randomBytes(4), "hex");
    const mxeAccount = getMXEAccAddress(program.programId);

    const mxePublicKey = await getMXEPublicKey(provider, program.programId);
    const votePrivateKey = x25519.utils.randomSecretKey();
    const votePublicKey = x25519.getPublicKey(votePrivateKey);
    const sharedSecret = x25519.getSharedSecret(votePrivateKey, mxePublicKey);
    const cipher = new RescueCipher(sharedSecret);

    const voteNonce = randomBytes(16);
    const votePlaintext = [BigInt(voteYes ? 1 : 0)];
    const voteCiphertext = cipher.encrypt(votePlaintext, voteNonce);

    const tx = await program.methods
      .vote(
        computationOffset,
        onchainProposalId,
        Array.from(voteCiphertext[0]),
        Array.from(votePublicKey),
        new BN(deserializeLE(voteNonce).toString())
      )
      .accountsPartial({
        payer: voterPubkey,
        mxeAccount,
        computationAccount: getComputationAccAddress(arciumEnv.arciumClusterOffset, computationOffset),
        clusterAccount: getClusterAccAddress(arciumEnv.arciumClusterOffset),
        mempoolAccount: getMempoolAccAddress(arciumEnv.arciumClusterOffset),
        executingPool: getExecutingPoolAccAddress(arciumEnv.arciumClusterOffset),
        compDefAccount: getCompDefAccAddress(
          program.programId,
          Buffer.from(getCompDefAccOffset("vote")).readUInt32LE()
        ),
        proposalAcc: proposalPda,
      })
      .transaction();

    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = voterPubkey;

    const serialized = tx.serialize({ requireAllSignatures: false }).toString("base64");

    return NextResponse.json({
      transaction: serialized,
      computationOffset: computationOffset.toString(),
      onChain: true,
      message: "MPC encrypted vote ready for signing",
    });
  } catch (error: any) {
    console.error("Vote API error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}