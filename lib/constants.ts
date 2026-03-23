import { PublicKey } from "@solana/web3.js";

// Program deployed on devnet
export const PROGRAM_ID = new PublicKey("76hfZxh9JagZi1S2EYQrhRPf7FhcCmsV8mM3BAr3e9Zh");

// Arcium cluster
export const CLUSTER_OFFSET = 456;

// RPC endpoint
export const RPC_ENDPOINT = "https://convincing-cosmopolitan-sanctuary.solana-devnet.quiknode.pro/97ce1836e57eafd461d16635198ae58354417873/";

// IDL will be imported from the build
export { default as IDL } from "./idl.json";
