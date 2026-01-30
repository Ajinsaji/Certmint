# 🚀 Certmint Setup Guide

## Step-by-Step: Getting Your Environment Variables

### 1️⃣ Get SEPOLIA_RPC_URL

**Option A: Alchemy (Recommended)**
1. Go to https://www.alchemy.com/
2. Sign up / Log in
3. Click "Create App"
4. Name: `Certmint` (or any name)
5. Chain: **Ethereum**
6. Network: **Sepolia**
7. Click "Create App"
8. Click on your app → Copy the **HTTPS** URL
   - It looks like: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

**Option B: Infura**
1. Go to https://www.infura.io/
2. Sign up / Log in
3. Create a new project
4. Select **Ethereum** → **Sepolia**
5. Copy the **HTTPS** endpoint URL

---

### 2️⃣ Get DEPLOYER_PRIVATE_KEY

**Option A: Use an existing MetaMask wallet**
1. Open MetaMask
2. Click the 3 dots → Account details
3. Click "Show private key"
4. Enter your password
5. Copy the private key (64 hex characters, **WITHOUT** the `0x` prefix)
   - Example: `ab12cd34ef56...` (64 characters total)

**Option B: Create a new wallet (for testing)**
1. Open MetaMask
2. Create a new account
3. Export the private key (same steps as above)
4. ⚠️ **Fund this wallet with Sepolia ETH** (get free testnet ETH from faucets)

**⚠️ SECURITY WARNING:**
- Never share your private key
- Never commit `.env` to git
- Use a separate wallet for testing, not your main wallet

---

### 3️⃣ Get CERTIFICATE_NFT_ADDRESS (Deploy Contract)

#### A. Setup Blockchain `.env`

1. Go to: `Certmint-main/blockchain/`
2. Create `.env` file (if it doesn't exist)
3. Add these lines:

```env
SEPOLIA_RPC_URL=YOUR_SEPOLIA_RPC_URL_FROM_STEP_1
DEPLOYER_PRIVATE_KEY=YOUR_PRIVATE_KEY_FROM_STEP_2
```

#### B. Deploy to Sepolia

1. Open terminal in `blockchain` folder:
```bash
cd Certmint-main/blockchain
```

2. Install dependencies (if not done):
```bash
npm install
```

3. Compile contract:
```bash
npm run compile
```

4. Deploy to Sepolia:
```bash
npx hardhat run scripts/deploy.cjs --network sepolia
```

5. **Copy the deployed address** from the output:
   - It will say: `CertificateNFT deployed to: 0x...`
   - This is your `CERTIFICATE_NFT_ADDRESS`

---

### 4️⃣ Update Backend-private `.env`

1. Go to: `Certmint-main/Backend-private/`
2. Open `.env` file
3. Replace with your **real values**:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ACTUAL_API_KEY
DEPLOYER_PRIVATE_KEY=YOUR_ACTUAL_PRIVATE_KEY_WITHOUT_0x
CERTIFICATE_NFT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

4. Save the file

---

### 5️⃣ Test Your Backend

1. Go to `Backend-private` folder:
```bash
cd Certmint-main/Backend-private
```

2. Run the server:
```bash
npm run dev
```

3. ✅ If successful, you'll see:
   - `🚀 Server running on port 5000`
   - No errors about missing environment variables

---

## 🆘 Troubleshooting

**Error: "SEPOLIA_RPC_URL missing"**
- Check `.env` file is in `Backend-private/` folder
- Check there are no extra spaces around `=`
- Restart nodemon after editing `.env`

**Error: "invalid BytesLike value"**
- Make sure `DEPLOYER_PRIVATE_KEY` has **NO** `0x` prefix
- Should be exactly 64 hex characters

**Error: "insufficient funds"**
- Your deployer wallet needs Sepolia ETH
- Get free testnet ETH from: https://sepoliafaucet.com/

**Error: "contract not deployed"**
- Make sure you deployed to Sepolia (not localhost)
- Copy the exact address from deployment output

---

## 📝 Quick Checklist

- [ ] Got Sepolia RPC URL from Alchemy/Infura
- [ ] Got wallet private key (without 0x)
- [ ] Funded wallet with Sepolia ETH
- [ ] Created `.env` in `blockchain/` folder
- [ ] Deployed contract to Sepolia
- [ ] Copied contract address
- [ ] Updated `Backend-private/.env` with all 3 values
- [ ] Backend starts without errors

---

## 🔐 Security Reminders

- ✅ Add `.env` to `.gitignore` (should already be there)
- ✅ Never commit private keys
- ✅ Use test wallets for development
- ✅ Keep production keys secure
