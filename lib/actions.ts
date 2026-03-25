import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey("76hfZxh9JagZi1S2EYQrhRPf7FhcCmsV8mM3BAr3e9Zh");

// PDA helpers
export function getDaoPda(authority: PublicKey, daoId: number): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("dao"), authority.toBuffer(), new BN(daoId).toArrayLike(Buffer, "le", 4)],
    PROGRAM_ID
  )[0];
}

export function getProposalPda(daoPda: PublicKey, proposalId: number): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("proposal"), daoPda.toBuffer(), new BN(proposalId).toArrayLike(Buffer, "le", 4)],
    PROGRAM_ID
  )[0];
}

export function getCommentPda(proposalPda: PublicKey, commentId: number): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("comment"), proposalPda.toBuffer(), new BN(commentId).toArrayLike(Buffer, "le", 4)],
    PROGRAM_ID
  )[0];
}

function getProgram(provider: AnchorProvider) {
  // Dynamic import of IDL
  const idl = require("./idl.json");
  return new Program(idl as any, provider);
}

/**
 * CREATE DAO — Real on-chain transaction
 * Triggers wallet popup for approval
 */
export async function createDaoOnChain(
  provider: AnchorProvider,
  daoId: number,
  name: string,
  description: string
): Promise<string> {
  const program = getProgram(provider);
  const daoPda = getDaoPda(provider.wallet.publicKey, daoId);

  const sig = await program.methods
    .createDao(
      daoId,
      name,
      description,
      provider.wallet.publicKey // governance_token (using wallet pubkey for devnet)
    )
    .accounts({
      payer: provider.wallet.publicKey,
      daoAcc: daoPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc({ commitment: "confirmed" });

  return sig;
}

/**
 * POST COMMENT — Real on-chain transaction
 * Triggers wallet popup for approval
 */
export async function postCommentOnChain(
  provider: AnchorProvider,
  proposalPda: PublicKey,
  commentId: number,
  content: string
): Promise<string> {
  const program = getProgram(provider);
  const commentPda = getCommentPda(proposalPda, commentId);

  const sig = await program.methods
    .postComment(commentId, content)
    .accounts({
      payer: provider.wallet.publicKey,
      commentAcc: commentPda,
      proposalAcc: proposalPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc({ commitment: "confirmed" });

  return sig;
}

/**
 * FETCH DAO — Read from chain
 */
export async function fetchDao(
  provider: AnchorProvider,
  daoPda: PublicKey
): Promise<any> {
  const program = getProgram(provider);
  try {
    // @ts-ignore
    return await program.account.daoAccount.fetch(daoPda);
  } catch {
    return null;
  }
}

/**
 * FETCH PROPOSAL — Read from chain
 */
export async function fetchProposal(
  provider: AnchorProvider,
  proposalPda: PublicKey
): Promise<any> {
  const program = getProgram(provider);
  try {
    // @ts-ignore
      return await program.account.proposalAccount.fetch(proposalPda);
  } catch {
    return null;
  }
}
