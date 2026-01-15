# 🕵️‍♀️ Ping

> **Ping lets you speak without being seen.**  
> A decentralized signalling platform where users can broadcast **verifiable messages anonymously** using **zero-knowledge proofs** on **Mantle Sepolia**.  

---

## [Live Link](https://ping-nextjs.vercel.app/)

## [Video Demo](https://www.loom.com/share/e4362aee446941ad94871244b1c7d5d1)

## [Presentation](https://www.canva.com/design/DAG21Lsrmjs/CVtZxm08W8F0WT5qCVbMng/edit)

## 🌐 TL;DR

Ping is a **privacy-first social signalling protocol** where verified individuals can send **trustworthy signals like feedbacks/votes without revealing their identity**.  

It uses **Semaphore** for anonymous group proofs, **Mantle Sepolia** for censorship-resistant verification, and **Buidl Guidl** tooling for seamless development and smart contract deployment.

> 💡 Think “verified whispers” — truthful, anonymous, and onchain.

---

## 🎯 Problem

Online spaces force a binary choice:
- **Anonymous = untrustworthy**  
- **Verified = exposed**

Communities, DAOs, and whistleblowers need a way to **prove they belong** without revealing **who they are**.

Traditional platforms rely on centralized trust — admins, servers, or moderators — introducing bias, risk, and censorship.

---

## 💡 Solution — *Ping*

Ping enables **verifiable anonymity** through zero-knowledge proofs.  
It allows anyone to post a **signal** (vote, opinion, alert) verified by math — not by trust.

- 🧠 **Zero-Knowledge Proofs** — users prove they’re group members without revealing their identity  
- 🔗 **Onchain Verification** — proofs verified by smart contracts on **Mantle Sepolia**  
- 🔒 **Anonymous but Accountable** — one signal per identity, no duplicates or Sybil attacks  

---

## 🧩 How It Works

1. **Create a Ping Identity**
   - User generates a **Semaphore identity** (private key never leaves device).  

2. **Join a Group**
   - Group = community, company, or verified list.
   - Each group has an onchain group ID.

3. **Send a Ping**
   - User creates a **ZK proof** showing:
     - Membership in group ✅  
     - Unique signal nullifier 🆔  
   - Proof sent to the Ping smart contract.

4. **Verify & Broadcast**
   - Smart contract verifies the proof.  
   - Emits an event on Mantle Sepolia → Ping frontend fetches it → signal displayed anonymously.

---

## 🏗️ Architecture


| Layer | Technology |
|-------|-------------|
| ZK Layer | Semaphore Protocol |
| Smart Contract | Solidity + Foundry + Buidl Guidl Stack |
| Blockchain | Mantle Sepolia |
| Frontend | Next.js + TailwindCSS + Viem |
| Deployment | Vercel (Frontend) + Mantle Explorer (Contracts) |

---

## ⚙️ Tech Stack

| Category | Tools / Frameworks |
|-----------|--------------------|
| 🧱 Smart Contracts | Solidity, Hardhat |
| 🔐 Zero-Knowledge | Semaphore, SnarkJS |
| 🌐 Blockchain | Mantle Sepolia |
| 💻 Frontend | Next.js, TailwindCSS |
| 🧰 Tooling | Buidl Guidl, Viem, Ethers.js |
| ☁️ Hosting | Vercel |

---

## 🧠 Example Use Cases
 
- 🕵️ **Whistleblower Portal:** prove affiliation, stay safe  
- 💬 **Private Group Chats:** anonymous verified discussions  
- 🔔 **Signal Feed:** send onchain proofed messages for coordination  



## 🔭 Future Roadmap

- 🧩 **Self Protocol Integration** — nationality/age/gender based group entry  
- 💬 **Onchain Group Messaging** — zk-based chatrooms  
- 🪙 **Reputation Points** — build trust without identity  

---

## 🛡️ Why Mantle Network?

We chose **Mantle Network** because it aligns with Whisp’s mission —  
> “Privacy, freedom, and trustless communication.”

- ⚡ Gas-efficient zk verification  
- 🔐 Native privacy tooling  
- 🌐 Decentralized communication layer  
- 💬 Vibrant developer community  

---

## Contracts Deployed and Verified on Mantle Sepolia

[Semaphore](https://sepolia.mantlescan.xyz/address/0x501F1ABBFae1f7382cfA54871685eB1E8A845fb6)

[SemaphoreVerifier](https://sepolia.mantlescan.xyz/address/0x4309Eb90A37cfD0ecE450305B24a2DE68b73f312)

[PoseidonT3](https://sepolia.mantlescan.xyz/address/0x3822F3A99940D9A0401c093D734a149Cf8b109a9)

[Ping](https://sepolia.mantlescan.xyz/address/0x6c0f0B87cD3178B4b21fE77775e628daB94eD15D)

[Transactions on Mantle Sepolia](https://sepolia.mantlescan.xyz/address/0x6c0f0B87cD3178B4b21fE77775e628daB94eD15D)

## 👥 Team

**Built by:**

- 🧑‍💻 **Akhil** — Full Stack + ZK Dev   


