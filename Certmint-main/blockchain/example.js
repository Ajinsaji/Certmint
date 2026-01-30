/**
 * Example Usage - Certificate NFT Minting Flow
 * 
 * Demonstrates the complete flow:
 * 1. Upload certificate PDF and metadata to IPFS
 * 2. Mint NFT on blockchain with IPFS metadata URI
 * 
 * Usage:
 *   node example.js
 * 
 * Prerequisites:
 *   - Set up .env file with required variables
 *   - Have a sample PDF file at ./sample.pdf
 *   - Contract must be deployed and deployer must be approved institution
 */

import { uploadCertificateToIPFS } from './services/ipfsService.js';
import { mintCertificateOnChain } from './services/blockchainService.js';

async function main() {
  console.log('🚀 Starting Certificate NFT Minting Example\n');
  console.log('='.repeat(60));

  try {
    // Hardcoded example values
    const pdfPath = './sample.pdf';
    const metadataFields = {
      studentName: 'Rahul',
      course: 'BCA',
      year: '2024',
      institutionName: 'XYZ College'
    };
    const studentWallet = '0x6cbec8db51ec9c9fc9d6ebad11a4826fce353f9e'; // Example address - replace with actual

    console.log('\n📋 Certificate Details:');
    console.log(`   Student: ${metadataFields.studentName}`);
    console.log(`   Course: ${metadataFields.course}`);
    console.log(`   Year: ${metadataFields.year}`);
    console.log(`   Institution: ${metadataFields.institutionName}`);
    console.log(`   Student Wallet: ${studentWallet}`);
    console.log(`   PDF Path: ${pdfPath}\n`);

    // Step 1: Upload to IPFS
    console.log('='.repeat(60));
    console.log('STEP 1: Uploading Certificate to IPFS');
    console.log('='.repeat(60));
    
    const metadataURI = await uploadCertificateToIPFS(pdfPath, metadataFields);
    
    console.log('\n✅ IPFS Upload Complete!');
    console.log(`📎 Metadata URI: ${metadataURI}\n`);

    // Step 2: Mint on Blockchain
    console.log('='.repeat(60));
    console.log('STEP 2: Minting Certificate NFT on Blockchain');
    console.log('='.repeat(60));

    const result = await mintCertificateOnChain(studentWallet, metadataURI);

    // Step 3: Display Results
    console.log('\n' + '=' .repeat(60));
    console.log('✅ CERTIFICATE NFT MINTED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    console.log('\n📊 Transaction Details:');
    console.log(`   IPFS Metadata URI: ${result.metadataURI}`);
    console.log(`   Blockchain TX Hash: ${result.txHash}`);
    console.log(`   Token ID: ${result.tokenId}`);
    console.log(`   Block Number: ${result.blockNumber}`);
    console.log(`   Gas Used: ${result.gasUsed}`);
    console.log('\n🔗 View on Etherscan:');
    console.log(`   https://sepolia.etherscan.io/tx/${result.txHash}`);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error in certificate minting flow:');
    console.error(`   ${error.message}\n`);
    process.exit(1);
  }
}

// Run the example
main();

