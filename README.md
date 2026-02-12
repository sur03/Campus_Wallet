# 🎓 CampusPay: Blockchain-Powered Campus Funding Platform

![Algorand](https://img.shields.io/badge/Blockchain-Algorand-black) ![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue) ![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue) ![Status](https://img.shields.io/badge/Status-TestNet%20Live-green)

A decentralized, transparent, and secure crowdfunding platform for university clubs and student initiatives, built on the **Algorand Blockchain**.

---

## 🚀 Project Overview

**CampusPay** revolutionizes how student clubs raise funds. Instead of relying on opaque cash collections or centralized payment apps, CampusPay uses **Smart Contracts** to create trustless escrow accounts for every campaign. 

### Why Blockchain?
- **Transparency:** Every contribution is verifiable on-chain.
- **Security:** Funds are locked in a smart contract, not held by an individual.
- **Trust:** Rules (Goal & Deadline) are immutable. Funds are only released if the goal is met.
- **Refunds:** Automatic refunds if the campaign fails to meet its goal by the deadline.

---

## 🏗️ System Architecture

The application connects directly to the Algorand Blockchain. There is **no backend server** controlling the funds. The frontend interacts with smart contracts via the user's wallet.

```
[ Student / User ]
       │
       ▼
+---------------------+          +----------------------+
|  React Components   |<-------->|    Wallet Manager    |
| (StudentDashboard)  |          | (Pera / Defly Wallet)|
+---------------------+          +----------+-----------+
       │                                    │
       │ (Read State)                       | (Sign Txns)
       ▼                                    │
+---------------------+          +----------▼-----------+
|    Indexer Node     |          |      Algod Node      |
|  (Query Campaign)   |          | (Deploy / Calls)     |
+---------------------+          +----------+-----------+
                                            │
                                            ▼
                                 +----------------------+
                                 |   Smart Contract     |
                                 |   (Escrow Logic)     |
                                 +----------------------+
```

---

## ✨ Key Features

### 1. 🔐 Wallet-Based Identity
- No username/password required.
- Login securely using **Pera Wallet** or **Defly Wallet**.
- Your wallet address is your identity.

### 2. 🏛️ Club Funding Contracts (The Core)
- **Create Campaign:** Organizers deploy a dedicated **Smart Contract** for their event.
- **Set Rules:** Define a strict **Goal Amount** (ALGO) and **Deadline**.
- **Escrow Logic:**
    - Funds are held in the contract account.
    - **Goal Met:** Organizer can withdraw funds after the deadline.
    - **Goal Missed:** Contributors can claim a 100% refund.

### 3. 🔍 Real-Time Transparency
- View all active campaigns and their progress.
- Track total funds raised and number of contributors.
- Verify every transaction on **AlgoExplorer**.

### 4. 📱 Student Dashboard
- Manage your campaigns.
- Track your contributions.
- Quick navigation to funding features.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | React 18 + Vite | High-performance UI framework |
| **Styling** | Tailwind CSS + Radix UI | Modern, accessible design system |
| **Blockchain** | Algorand (TestNet) | Layer-1 Proof-of-Stake blockchain |
| **Smart Contracts** | PyTeal | Python binding for TEAL (Transaction Execution Approval Language) |
| **SDK** | AlgoSDK v3 | TypeScript SDK for blockchain interaction |
| **Wallet** | @txnlab/use-wallet-react | Unified wallet connection provider |

---

## 📜 Smart Contract Logic

Every campaign deploys a unique instance of the `CampaignEscrow` smart contract.

**State Variables:**
- `goal`: Target amount in microALGOs.
- `deadline`: Unix timestamp expiration.
- `organizer`: Address of the campaign creator.
- `total`: Current total funds collected.

**Logic Flow:**
1.  **Deployment:** Contract is created, rules are locked.
2.  **Contribution:** Users send ALGO. Contract accepts ONLY if `ApplicationCall` accompanies the `Payment`.
3.  **Withdrawal (Success):** If `now > deadline` AND `total >= goal`, funds move to `organizer`.
4.  **Refund (Failure):** If `now > deadline` AND `total < goal`, contributors can withdraw their share.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.10+ (for compiling contracts)
- Algorand Wallet (Pera/Defly) configured for **TestNet**
- TestNet ALGOs (Dispenser available at [bank.testnet.algorand.network](https://bank.testnet.algorand.network/))

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/blockchain-campus-payment.git
    cd blockchain-campus-payment
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment:**
    Create a `.env` file (optional, defaults provided for TestNet):
    ```env
    VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
    VITE_INDEXER_SERVER=https://testnet-idx.algonode.cloud
    ```

4.  **Run Locally:**
    ```bash
    npm run dev
    ```

---

## 📖 User Guide

### 1. Connect Wallet
- Click "Connect Wallet" in the top right.
- Scan the QR code with Pera/Defly app.
- Ensure your wallet is on **TestNet**.

### 2. Create a Campaign
- Go to **"Club Funding"** -> **"Create Campaign"**.
- Enter Title, Description, Goal, and Deadline.
- Click **"Deploy Campaign"**.
- Approve the transaction in your wallet.
- *Wait ~10s for the indexer to register the new contract.*

### 3. Contribute
- Browse active campaigns.
- Click **"Contribute"**.
- Enter amount (ALGO) and confirm.
- Approve transaction.
- See the progress bar update in real-time!

---

## 🔮 Future Roadmap

- [ ] **Mainnet Launch:** Audit contracts and deploy to Algorand Mainnet.
- [ ] **NFT Rewards:** Issue commemorative NFTs to contributors.
- [ ] **DAO Governance:** Allow students to vote on club funding proposals.
- [ ] **Mobile App:** Native mobile experience using React Native.

---

#### ⚖️ License
MIT License - Open Source for Educational Use.