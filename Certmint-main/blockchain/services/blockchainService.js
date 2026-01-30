/**
 * Blockchain Service - CertificateNFT Minting Integration
 * 
 * Standalone module for minting certificate NFTs on Ethereum Sepolia testnet
 * Uses ethers v5 for blockchain interactions
 * 
 * Usage:
 *   import { mintCertificateOnChain } from './services/blockchainService.js';
 *   const result = await mintCertificateOnChain(studentWallet, metadataURI);
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads the CertificateNFT ABI from Hardhat artifacts
 * 
 * @returns {Array} Contract ABI
 */
function loadContractABI() {
  const artifactPath = path.join(
    __dirname,
    '..',
    'artifacts',
    'contracts',
    'CertificateNFT.sol',
    'CertificateNFT.json'
  );

  if (!fs.existsSync(artifactPath)) {
    throw new Error(
      `Contract artifact not found at ${artifactPath}. Please run 'npx hardhat compile' first.`
    );
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  return artifact.abi;
}

/**
 * Mints a certificate NFT on the blockchain
 * 
 * @param {string} studentWallet - Ethereum address of the student receiving the certificate
 * @param {string} metadataURI - IPFS URI of the certificate metadata (ipfs://CID)
 * @returns {Promise<Object>} Transaction result with txHash, tokenId, and metadataURI
 * @throws {Error} If environment variables are missing, contract call fails, or transaction reverts
 */
export async function mintCertificateOnChain(studentWallet, metadataURI) {
  // Validate environment variables
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const contractAddress = process.env.CERTIFICATE_NFT_ADDRESS;

  if (!rpcUrl) {
    throw new Error('SEPOLIA_RPC_URL is not set in .env file');
  }
  if (!privateKey) {
    throw new Error('DEPLOYER_PRIVATE_KEY is not set in .env file');
  }
  if (!contractAddress) {
    throw new Error('CERTIFICATE_NFT_ADDRESS is not set in .env file');
  }

  // Normalize and validate wallet address
  const cleanedWallet = studentWallet.trim();
  if (!ethers.utils.isAddress(cleanedWallet)) {
    throw new Error(`Invalid student wallet address: ${studentWallet}`);
  }

  // Validate metadata URI format
  if (!metadataURI.startsWith('ipfs://')) {
    throw new Error(`Invalid metadata URI format. Expected ipfs://CID, got: ${metadataURI}`);
  }

  try {
    console.log(`🔗 Connecting to blockchain network...`);
    
    // Connect to provider (RPC)
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    
    // Connect signer (deployer account)
    const signer = new ethers.Wallet(privateKey, provider);
    
    console.log(`👤 Signer address: ${signer.address}`);

    // Load contract ABI
    const abi = loadContractABI();
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    console.log(`📜 Contract address: ${contractAddress}`);
    console.log(`🎓 Minting certificate for student: ${cleanedWallet}`);
    console.log(`📝 Metadata URI: ${metadataURI}`);

    // Check if the signer is an approved institution
    const isApproved = await contract.isInstitutionApproved(signer.address);
    if (!isApproved) {
      throw new Error(
        `Signer address ${signer.address} is not an approved institution. ` +
        `Please call approveInstitution() from the contract owner first.`
      );
    }

    console.log(`✅ Signer is an approved institution`);

    // Call mintCertificate function
    console.log(`⏳ Sending transaction...`);
    const tx = await contract.mintCertificate(cleanedWallet, metadataURI);
    
    console.log(`📤 Transaction sent! Hash: ${tx.hash}`);
    console.log(`⏳ Waiting for confirmation...`);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);

    // Parse CertificateMinted event to get tokenId
    const certificateMintedEvent = receipt.logs.find(log => {
      try {
        const parsedLog = contract.interface.parseLog(log);
        return parsedLog && parsedLog.name === 'CertificateMinted';
      } catch {
        return false;
      }
    });

    if (!certificateMintedEvent) {
      throw new Error('CertificateMinted event not found in transaction receipt');
    }

    const parsedEvent = contract.interface.parseLog(certificateMintedEvent);
    const tokenId = parsedEvent.args.tokenId.toString();

    console.log(`🎉 Certificate minted successfully!`);
    console.log(`🆔 Token ID: ${tokenId}`);

    return {
      txHash: tx.hash,
      tokenId,
      metadataURI,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('❌ Error minting certificate:', error.message);
    
    // Provide helpful error messages for common issues
    if (error.message.includes('Not an approved institution')) {
      throw new Error(
        'Transaction failed: The deployer address is not an approved institution. ' +
        'Please call approveInstitution() from the contract owner first.'
      );
    }
    if (error.message.includes('Metadata already used')) {
      throw new Error(
        'Transaction failed: This metadata URI has already been used. ' +
        'Each certificate must have a unique metadata URI.'
      );
    }
    if (error.message.includes('insufficient funds')) {
      throw new Error(
        'Transaction failed: Insufficient funds for gas. ' +
        'Please ensure the deployer wallet has enough ETH on Sepolia.'
      );
    }
    
    throw error;
  }
}

