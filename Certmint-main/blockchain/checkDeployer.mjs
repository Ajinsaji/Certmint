import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const rpcUrl = process.env.MUMBAI_RPC_URL;
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

if (!rpcUrl || !privateKey) {
  console.error("Missing MUMBAI_RPC_URL or DEPLOYER_PRIVATE_KEY in .env");
  process.exit(1);
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deployer address:", wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log("Balance (wei):", balance.toString());
  console.log("Balance (MATIC):", ethers.utils.formatEther(balance));
}

main().catch(console.error);
