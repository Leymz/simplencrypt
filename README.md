# simplEncrypt

Private DAO governance powered by **Arcium MPC** on **Solana**.

Cast your vote without revealing your choice. Arcium's multi-party computation ensures ballot secrecy with full on-chain verifiability.

## Features

- **Create DAOs** — Set up decentralized organizations for private governance
- **Private Proposals** — Create proposals with encrypted Yes/No voting
- **Encrypted Voting** — Every vote is encrypted via Arcium MPC before touching the blockchain
- **ZKP Verification** — Results are revealed with zero-knowledge proof verification
- **On-chain Discussion** — Comment threads attached to each proposal
- **Dark/Light Mode** — Toggle between themes
- **Solana Wallet Adapter** — Connect with Phantom, Solflare, or Backpack

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Next.js     │────▶│  Solana Program   │────▶│  Arcium MPC     │
│  Frontend    │     │  (Anchor/Rust)    │     │  (Arx Nodes)    │
│              │     │                   │     │                 │
│  - Wallet    │     │  - Create DAO     │     │  - Encrypt vote │
│  - Vote UI   │     │  - Create Prop    │     │  - MPC tally    │
│  - Results   │     │  - Queue Vote     │     │  - ZKP verify   │
│  - Comments  │     │  - Post Comment   │     │  - Callback     │
└─────────────┘     └──────────────────┘     └─────────────────┘
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Blockchain**: Solana (Devnet), Anchor Framework
- **Privacy**: Arcium MPC (Multi-Party Computation)
- **Wallet**: Solana Wallet Adapter (Phantom, Solflare, Backpack)
- **Encryption**: Arcium Rescue Cipher, x25519 key exchange

## Program Details

- **Program ID**: `76hfZxh9JagZi1S2EYQrhRPf7FhcCmsV8mM3BAr3e9Zh`
- **Network**: Solana Devnet
- **Cluster Offset**: 456
- **Circuits**: `init_vote_stats`, `vote`, `reveal_result`

## Setup

### Prerequisites

- Node.js 18+
- Solana CLI
- A Solana wallet (Phantom recommended)
- Devnet SOL (get from [faucet](https://faucet.solana.com))

### Frontend

```bash
cd simplencrypt
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and connect your wallet.

### Smart Contract (already deployed)

```bash
cd private_vote
arcium build
arcium deploy --cluster-offset 456 --recovery-set-size 4 \
  --keypair-path ~/.config/solana/id.json \
  --rpc-url "https://api.devnet.solana.com"
arcium test --cluster devnet
```

## How It Works

1. **Create a DAO** — Any wallet can create a DAO on devnet
2. **Create a Proposal** — Set a title, description, options (Yes/No), and deadline
3. **Cast Your Vote** — Your vote is encrypted using Arcium's Rescue cipher with x25519 key exchange. The encrypted vote is split into fragments via MPC — no single party can see your choice.
4. **MPC Computation** — Arcium's Arx nodes compute the tally on encrypted data without reconstructing individual votes
5. **Results Revealed** — After the deadline, the result is published on-chain with a ZKP proof that anyone can verify

## Privacy Guarantees

- **No one sees your vote** — Not validators, not the app, not even Arcium's nodes individually
- **Verifiable results** — ZKP proves the tally is correct without revealing individual votes
- **On-chain transparency** — Vote counts are visible, individual choices are hidden
- **No whale influence** — Votes are hidden during the voting period

## License

MIT
