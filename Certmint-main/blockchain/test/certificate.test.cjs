const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateNFT", function () {
  let owner;
  let institution;
  let institution2;
  let recipient;
  let stranger;
  let certificate;

  const sampleUri = "ipfs://sample-cert-1";
  const anotherUri = "ipfs://sample-cert-2";

  async function expectRevert(promise, message) {
    try {
      await promise;
      expect.fail("Expected transaction to revert");
    } catch (error) {
      expect(error.message).to.include(message);
    }
  }

  async function deployFixture() {
    [owner, institution, institution2, recipient, stranger] = await ethers.getSigners();
    const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
    const contract = await CertificateNFT.deploy();
    await contract.deployed();
    return contract;
  }

  beforeEach(async function () {
    certificate = await deployFixture();
  });

  it("deploys successfully", async function () {
    expect(ethers.utils.isAddress(certificate.address)).to.be.true;
    expect(await certificate.name()).to.equal("CertificateNFT");
    expect(await certificate.symbol()).to.equal("CERT");
  });

  it("sets deployer as owner", async function () {
    expect(await certificate.owner()).to.equal(owner.address);
  });

  it("allows owner to approve institutions", async function () {
    const tx = await certificate.approveInstitution(institution.address, true);
    const receipt = await tx.wait();
    const event = receipt.events.find((e) => e.event === "InstitutionApprovalUpdated");
    expect(event.args[0]).to.equal(institution.address);
    expect(event.args[1]).to.equal(true);
    expect(await certificate.isInstitutionApproved(institution.address)).to.be.true;
  });

  it("mints certificate when called by an approved institution", async function () {
    await certificate.approveInstitution(institution.address, true);
    const connected = certificate.connect(institution);
    const tx = await connected.mintCertificate(recipient.address, sampleUri);
    const receipt = await tx.wait();
    const tokenId = receipt.events.find((e) => e.event === "Transfer").args.tokenId;

    expect(await certificate.ownerOf(tokenId)).to.equal(recipient.address);
    expect(await certificate.tokenURI(tokenId)).to.equal(sampleUri);
    const cert = await certificate.getCertificate(tokenId);
    expect(cert.owner_).to.equal(recipient.address);
    expect(cert.issuer).to.equal(institution.address);
    expect(cert.uri).to.equal(sampleUri);
    expect(cert.revoked).to.be.false;
  });

  it("prevents minting by non-approved institutions", async function () {
    const connected = certificate.connect(institution);
    await expectRevert(connected.mintCertificate(recipient.address, sampleUri), "Not an approved institution");
  });

  it("prevents duplicate metadata URI", async function () {
    await certificate.approveInstitution(institution.address, true);
    const inst = certificate.connect(institution);
    await inst.mintCertificate(recipient.address, sampleUri);

    await expectRevert(inst.mintCertificate(recipient.address, sampleUri), "Metadata already used");
  });

  it("stores correct certificate data", async function () {
    await certificate.approveInstitution(institution.address, true);
    const inst = certificate.connect(institution);
    await inst.mintCertificate(recipient.address, sampleUri);
    const cert = await certificate.getCertificate(1);

    expect(cert.owner_).to.equal(recipient.address);
    expect(cert.issuer).to.equal(institution.address);
    expect(cert.uri).to.equal(sampleUri);
    expect(cert.revoked).to.be.false;
  });

  it("only issuer or contract owner can revoke", async function () {
    await certificate.approveInstitution(institution.address, true);
    const inst = certificate.connect(institution);
    await inst.mintCertificate(recipient.address, sampleUri);

    await expectRevert(certificate.connect(stranger).revokeCertificate(1), "Not authorized");

    // Issuer can revoke
    const revokeByIssuer = await inst.revokeCertificate(1);
    const issuerReceipt = await revokeByIssuer.wait();
    const issuerEvent = issuerReceipt.events.find((e) => e.event === "CertificateRevoked");
    expect(issuerEvent.args[0].toNumber()).to.equal(1);
    expect(issuerEvent.args[1]).to.equal(institution.address);
    const certAfterIssuer = await certificate.getCertificate(1);
    expect(certAfterIssuer.revoked).to.be.true;

    // Mint again to test owner revoke
    const inst2 = certificate.connect(institution);
    await inst2.mintCertificate(recipient.address, anotherUri);
    const revokeByOwner = await certificate.revokeCertificate(2);
    const ownerReceipt = await revokeByOwner.wait();
    const ownerEvent = ownerReceipt.events.find((e) => e.event === "CertificateRevoked");
    expect(ownerEvent.args[0].toNumber()).to.equal(2);
    expect(ownerEvent.args[1]).to.equal(owner.address);
    const certAfterOwner = await certificate.getCertificate(2);
    expect(certAfterOwner.revoked).to.be.true;
  });

  it("reports validity correctly with isValid()", async function () {
    await certificate.approveInstitution(institution.address, true);
    const inst = certificate.connect(institution);
    await inst.mintCertificate(recipient.address, sampleUri);

    expect(await certificate.isValid(1)).to.be.true;
    await inst.revokeCertificate(1);
    expect(await certificate.isValid(1)).to.be.false;
  });

  it("getCertificate returns accurate details", async function () {
    await certificate.approveInstitution(institution.address, true);
    const inst = certificate.connect(institution);
    await inst.mintCertificate(recipient.address, sampleUri);

    const cert = await certificate.getCertificate(1);
    expect(cert.owner_).to.equal(recipient.address);
    expect(cert.issuer).to.equal(institution.address);
    expect(cert.uri).to.equal(sampleUri);
    expect(cert.revoked).to.equal(false);
  });
});

