const axios = require("axios");

async function uploadMetadata(metadata) {
  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    metadata,
    {
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_API_SECRET,
      },
    }
  );

  return `ipfs://${res.data.IpfsHash}`;
}

module.exports = uploadMetadata;
