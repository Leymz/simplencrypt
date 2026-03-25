# simplEncrypt

**Private votes. Public trust.**

Private DAO governance and community polling powered by **Arcium MPC** on **Solana**. Cast encrypted votes on DAO proposals or quick community polls — your choice stays hidden. Arcium's multi-party computation ensures ballot secrecy with full on-chain verifiability.

🌐 **Live:** [simplencrypt.vercel.app](https://simplencrypt.vercel.app)

---

## Features

- **Create DAOs** — Set up decentralized organizations for private governance
- **Private Proposals** — Create on-chain proposals with encrypted Yes/No voting
- **Quick Polls** — One-click encrypted community polls, no DAO needed
- **Real MPC Voting** — Every vote is encrypted via Arcium's MXE (Multi-party eXecution Environment) before touching the blockchain
- **On-Chain Verification** — All DAOs, proposals, polls, and votes live on Solana Devnet
- **Simulation Fallback** — If MPC is unavailable, votes are recorded in the database with clear user notification
- **Discussion Threads** — Comment threads attached to every proposal and poll
- **Double Vote Prevention** — One vote per wallet enforced at both database and UI level
- **Dark Theme** — Cinematic dark UI with code rain animations
- **Solana Wallet Adapter** — Connect with Phantom or Solflare

## Architecture

```
┌──────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│  Next.js 14       │────▶│  Solana Program    │────▶│  Arcium MPC     │
│  Frontend + API   │     │  (Anchor/Rust)     │     │  (Arx Nodes)    │
│                   │     │                    │     │                 │
│  - Landing Page   │     │  - Create DAO      │     │  - Encrypt vote │
│  - Dashboard      │     │  - Create Proposal │     │  - MPC tally    │
│  - DAO Pages      │     │  - Cast Vote       │     │  - ZKP verify   │
│  - Poll Pages     │     │  - Post Comment    │     │  - Callback     │
│  - API Routes     │     │                    │     │                 │
│    /api/vote      │     └───────────────────┘     └─────────────────┘
│    /api/create-   │
│     proposal      │     ┌───────────────────┐
│    /api/create-   │────▶│  Supabase         │
│     poll          │     │  (PostgreSQL)      │
│    /api/poll-vote │     │                    │
│                   │     │  - DAOs            │
└──────────────────┘     │  - Proposals       │
                          │  - Polls           │
                          │  - Votes           │
                          │  - Comments        │
                          │  - Members         │
                          └───────────────────┘
```

## How Private Voting Works

### 1. Blind Counting
Standard blockchain voting is a glass box — every move is tracked. simplEncrypt operates as a black box.

- **Encryption at Source:** Your vote is encrypted the moment you click Submit
- **Arcium's MXE:** Acts as a secure vault. It processes encrypted votes and tallies them without ever decrypting individual choices
- **Zero-Knowledge Totals:** No intermediate scores are leaked. The public knows people are voting, but not what they're choosing

### 2. The Lifecycle of a Vote
1. **Deployment:** A user creates a poll or DAO proposal on Solana
2. **Submission:** Voters connect via Phantom or Solflare. One vote per wallet is enforced by the Solana program. The vote is encrypted by Arcium before it touches the ledger
3. **The Reveal:** When the deadline hits, the creator triggers a reveal. Arcium's MXE calculates the aggregate result and pushes a proof of correctness back to Solana
4. **Finality:** The winning option is published on-chain. Individual vote breakdowns remain hidden to prevent data harvesting

### 3. Why This Matters
- **Anti-Coercion:** No one — not even the admin — can see your vote. Zero risk of retribution or vote buying
- **Unbiased Outcomes:** In open systems, early results trigger bandwagon effects. simplEncrypt ensures every voter acts on their own conviction because there is no "current lead" to follow
- **Verifiable Integrity:** You don't have to trust the app. Solana stores the encrypted proofs, and Arcium's MXE guarantees the computation behind the curtain is mathematically sound

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Lucide Icons
- **Blockchain**: Solana Devnet, Anchor Framework
- **Privacy**: Arcium MPC — Rescue Cipher, x25519 key exchange
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Wallet**: Solana Wallet Adapter (Phantom, Solflare)
- **Deployment**: Vercel

## Program Details

- **Program ID**: `76hfZxh9JagZi1S2EYQrhRPf7FhcCmsV8mM3BAr3e9Zh`
- **Network**: Solana Devnet
- **RPC**: QuickNode
- **Cluster Offset**: 456
- **Circuits**: `init_vote_stats`, `vote`, `reveal_result`
- **Circuit Repo**: [github.com/Leymz/arcium-vote-build](https://github.com/Leymz/arcium-vote-build)

## API Routes

| Route | Description |
|-------|-------------|
| `POST /api/vote` | Encrypts vote via Arcium MPC, returns unsigned transaction for wallet signing |
| `POST /api/create-proposal` | Builds on-chain proposal with MPC init, returns unsigned transaction |
| `POST /api/create-poll` | Creates poll as on-chain proposal under master DAO |
| `POST /api/poll-vote` | Encrypts poll vote via Arcium MPC, returns unsigned transaction |

All API routes run server-side (Node.js) to access Arcium's encryption libraries. Transactions are returned unsigned — the user's wallet signs them client-side.

## Database Schema

| Table | Description |
|-------|-------------|
| `daos` | DAO metadata, creator wallet, on-chain ID |
| `proposals` | Proposals with vote counts, on-chain IDs |
| `polls` | Quick polls with vote counts, on-chain IDs |
| `votes` | Vote tracking (unique per wallet + proposal) |
| `poll_votes` | Poll vote tracking (unique per wallet + poll) |
| `comments` | Proposal discussion threads |
| `poll_comments` | Poll discussion threads |
| `members` | Wallet registry for platform stats |

## Setup

### Prerequisites
- Node.js 18+
- A Solana wallet (Phantom recommended)
- Devnet SOL — get from [faucet.solana.com](https://faucet.solana.com)

### Run Locally
```bash
git clone https://github.com/Leymz/simplencrypt.git
cd simplencrypt
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and connect your wallet.

### Smart Contract (already deployed)
The Solana program is deployed on Devnet. Source code and circuits are in a separate repo:
- [github.com/Leymz/arcium-vote-build](https://github.com/Leymz/arcium-vote-build)

## MPC vs Simulation Mode

simplEncrypt attempts real on-chain MPC encryption for every vote. When MPC succeeds:
> Your vote has been encrypted and submitted on-chain via Arcium's MXE. The encrypted vote was split into fragments processed by distributed Arx nodes on Solana — no single party can determine your choice.

When MPC is unavailable, the app falls back to simulation mode:
> This vote was processed in simulation mode. The on-chain MPC computation was unavailable, so your vote was recorded securely in our database instead.

The UI clearly indicates which mode was used after each vote.

## Disclaimer

simplEncrypt is a Devnet-based application on Solana designed to test private voting using Arcium's encrypted computation. It is an independent project and not officially affiliated with Arcium.

## Links

- 🌐 Live: [simplencrypt.vercel.app](https://simplencrypt.vercel.app)
- 🐦 Twitter: [@nft_leymz](https://x.com/nft_leymz)
- 💻 GitHub: [github.com/Leymz/simplencrypt](https://github.com/Leymz/simplencrypt)
- 🔧 Circuit Repo: [github.com/Leymz/arcium-vote-build](https://github.com/Leymz/arcium-vote-build)

## License

MIT
