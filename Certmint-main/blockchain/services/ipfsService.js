/**
 * IPFS Service - Pinata Integration
 * 
 * Standalone module for uploading certificate PDFs and metadata to IPFS via Pinata
 * Uses Pinata SDK with API Key and API Secret authentication
 * 
 * Usage:
 *   import { uploadCertificateToIPFS } from './services/ipfsService.js';
 *   const metadataURI = await uploadCertificateToIPFS(pdfPath, metadataFields);
 */

import pinataSDK from '@pinata/sdk';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

/**
 * Uploads a certificate PDF and its metadata to IPFS via Pinata
 * 
 * @param {string} pdfPath - Path to the certificate PDF file
 * @param {Object} metadataFields - Certificate metadata fields
 * @param {string} metadataFields.studentName - Name of the student
 * @param {string} metadataFields.course - Course name
 * @param {string} metadataFields.year - Year of completion
 * @param {string} metadataFields.institutionName - Name of the institution
 * @returns {Promise<string>} IPFS metadata URI (ipfs://CID)
 * @throws {Error} If API credentials are missing, file doesn't exist, or upload fails
 */
export async function uploadCertificateToIPFS(pdfPath, metadataFields) {
  const { studentName, course, year, institutionName } = metadataFields;

  // Validate API credentials
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataApiSecret = process.env.PINATA_API_SECRET;

  if (!pinataApiKey) {
    throw new Error('PINATA_API_KEY is not set in .env file');
  }
  if (!pinataApiSecret) {
    throw new Error('PINATA_API_SECRET is not set in .env file');
  }

  const trimmedApiKey = pinataApiKey.trim();
  const trimmedApiSecret = pinataApiSecret.trim();

  if (!trimmedApiKey || !trimmedApiSecret) {
    throw new Error('PINATA_API_KEY or PINATA_API_SECRET is empty or contains only whitespace');
  }

  // Validate required fields
  if (!studentName || !course || !year || !institutionName) {
    throw new Error('All metadata fields (studentName, course, year, institutionName) are required');
  }

  // Check if PDF file exists
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF file not found at path: ${pdfPath}`);
  }

  try {
    // Initialize Pinata SDK
    const pinata = new pinataSDK(trimmedApiKey, trimmedApiSecret);

    const pdfFileName = path.basename(pdfPath);
    console.log(`📄 Starting upload of PDF: ${pdfFileName}...`);

    // Step 1: Upload PDF file to Pinata
    console.log(`📤 Uploading PDF to Pinata IPFS...`);

    const readableStreamForFile = fs.createReadStream(pdfPath);
    
    const pdfUploadOptions = {
      pinataMetadata: {
        name: `Certificate PDF - ${studentName}`,
        keyvalues: {
          studentName,
          course,
          year,
          institutionName
        }
      },
      pinataOptions: {
        cidVersion: 1
      }
    };

    const pdfUploadResult = await pinata.pinFileToIPFS(readableStreamForFile, pdfUploadOptions);
    const pdfCid = pdfUploadResult.IpfsHash;

    if (!pdfCid) {
      throw new Error('Pinata response missing IpfsHash for PDF upload');
    }

    console.log(`✅ PDF uploaded successfully! CID: ${pdfCid}`);

    // Step 2: Create metadata JSON
    const metadata = {
      name: `Certificate for ${studentName}`,
      description: `Course: ${course}, Year: ${year}, Institution: ${institutionName}`,
      studentName,
      course,
      year,
      institutionName,
      image: `ipfs://${pdfCid}`
    };

    console.log(`📝 Uploading metadata JSON to Pinata IPFS...`);

    // Step 3: Upload metadata JSON to Pinata
    const metadataUploadOptions = {
      pinataMetadata: {
        name: `Certificate Metadata - ${studentName}`,
        keyvalues: {
          studentName,
          course,
          year,
          institutionName
        }
      },
      pinataOptions: {
        cidVersion: 1
      }
    };

    const metadataUploadResult = await pinata.pinJSONToIPFS(metadata, metadataUploadOptions);
    const metadataCid = metadataUploadResult.IpfsHash;

    if (!metadataCid) {
      throw new Error('Pinata response missing IpfsHash for metadata upload');
    }

    const metadataURI = `ipfs://${metadataCid}`;

    console.log(`✅ Metadata uploaded successfully! CID: ${metadataCid}`);
    console.log(`🔗 Metadata URI: ${metadataURI}`);

    return metadataURI;
  } catch (error) {
    console.error('❌ Error uploading to IPFS:', error.message);
    
    // Provide helpful error messages for common issues
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      throw new Error(
        'Pinata authentication failed. Please verify:\n' +
        '  1. Your PINATA_API_KEY is correct\n' +
        '  2. Your PINATA_API_SECRET is correct\n' +
        '  3. Your API keys are active in your Pinata account\n' +
        '  4. Generate new API keys from https://app.pinata.cloud if needed'
      );
    }
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      throw new Error(
        'Pinata access forbidden. Please check:\n' +
        '  1. Your account has sufficient credits/quota\n' +
        '  2. Your API keys have the required permissions\n' +
        '  3. Your Pinata account is active and in good standing'
      );
    }
    if (error.message.includes('ENOENT') || error.message.includes('not found')) {
      throw new Error(
        `PDF file not found: ${pdfPath}\n` +
        'Please ensure the file exists at the specified path.'
      );
    }
    
    throw error;
  }
}
