require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

const { SEPOLIA_RPC_URL, DEPLOYER_PRIVATE_KEY } = process.env;


module.exports = {
  solidity: "0.8.19",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_RPC_URL || "",
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};

