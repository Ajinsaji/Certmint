const { ethers } = require("ethers");
require("dotenv").config();

// safety checks (Deadpool hates silent failures)
if (!process.env.SEPOLIA_RPC_URL) {
  throw new Error("SEPOLIA_RPC_URL missing");
}
if (!process.env.DEPLOYER_PRIVATE_KEY) {
  throw new Error("DEPLOYER_PRIVATE_KEY missing");
}
if (!process.env.CERTIFICATE_NFT_ADDRESS) {
  throw new Error("CERTIFICATE_NFT_ADDRESS missing");
}

// ABI from Hardhat artifacts (READ ONLY)
const CertificateABI = require(
  "../../../blockchain/artifacts/contracts/CertificateNFT.sol/CertificateNFT.json"
);

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

const wallet = new ethers.Wallet(
  process.env.DEPLOYER_PRIVATE_KEY,
  provider
);

const certificateContract = new ethers.Contract(
  process.env.CERTIFICATE_NFT_ADDRESS,
  CertificateABI.abi,
  wallet
);

module.exports = {
  certificateContract,
  wallet,
};