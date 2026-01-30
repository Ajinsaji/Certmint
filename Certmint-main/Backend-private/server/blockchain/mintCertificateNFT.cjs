const { certificateContract, wallet } = require("./certificateContract.cjs");

module.exports = async function mintCertificateNFT({
  subject,
  studentName,
  studentEmail,
  certificateId,
}) {
  const metadata = {
    subject,
    studentName,
    studentEmail,
    certificateId,
    issuedAt: new Date().toISOString(),
  };

  const metadataURI = `data:application/json;base64,${Buffer.from(
    JSON.stringify(metadata)
  ).toString("base64")}`;

  const to = await wallet.getAddress();

  console.log("⏳ Minting NFT…");

  // ✅ DO NOT force gas price on Sepolia
  const tx = await certificateContract.mintCertificate(
    to,
    metadataURI,
    {
      gasLimit: 1_000_000, // safe upper bound
    }
  );

  console.log("📨 TX sent:", tx.hash);

  const receipt = await tx.wait();

  // 🔒 HARD CHECK
  if (receipt.status !== 1) {
    throw new Error("NFT mint transaction failed");
  }

  const event = receipt.logs.find(
    (log) => log.fragment && log.fragment.name === "CertificateMinted"
  );

  if (!event) {
    throw new Error("CertificateMinted event not found");
  }

  console.log("✅ NFT Minted. Token ID:", event.args.tokenId.toString());

  return event.args.tokenId.toString();
};
