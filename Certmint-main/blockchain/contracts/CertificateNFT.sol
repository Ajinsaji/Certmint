// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CertificateNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    struct Certificate {
        address issuer;
        string uri;
        bool revoked;
    }

    Counters.Counter private _tokenIdCounter;

    mapping(uint256 => Certificate) private _certificates;
    mapping(bytes32 => bool) private _usedMetadataHashes;

    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed to,
        address indexed issuer,
        string uri
    );

    event CertificateRevoked(
        uint256 indexed tokenId,
        address indexed revokedBy
    );

    constructor() ERC721("CertificateNFT", "CERT") {}

    function mintCertificate(address to, string calldata uri)
        external
        returns (uint256)
    {
        require(to != address(0), "Invalid recipient");

        bytes32 uriHash = keccak256(abi.encodePacked(uri));
        require(!_usedMetadataHashes[uriHash], "Metadata already used");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        _certificates[tokenId] = Certificate({
            issuer: msg.sender,
            uri: uri,
            revoked: false
        });

        _usedMetadataHashes[uriHash] = true;

        emit CertificateMinted(tokenId, to, msg.sender, uri);
        return tokenId;
    }

    function revokeCertificate(uint256 tokenId) external {
        _requireMinted(tokenId);

        Certificate storage cert = _certificates[tokenId];
        require(!cert.revoked, "Already revoked");
        require(
            msg.sender == cert.issuer || msg.sender == owner(),
            "Not authorized"
        );

        cert.revoked = true;
        emit CertificateRevoked(tokenId, msg.sender);
    }

    function isValid(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId) && !_certificates[tokenId].revoked;
    }

    function getCertificate(uint256 tokenId)
        external
        view
        returns (
            address owner_,
            address issuer,
            string memory uri,
            bool revoked
        )
    {
        _requireMinted(tokenId);
        Certificate memory cert = _certificates[tokenId];
        return (ownerOf(tokenId), cert.issuer, cert.uri, cert.revoked);
    }

    function _burn(uint256 tokenId) internal override {
        super._burn(tokenId);
        delete _certificates[tokenId];
    }
}
