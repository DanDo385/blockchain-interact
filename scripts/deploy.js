// Import the Hardhat Runtime Environment
const hre = require("hardhat");

/**
 * Main deployment function that handles the deployment of the SimpleStorage contract
 * This script will:
 * 1. Get the contract factory for SimpleStorage
 * 2. Deploy a new instance of the contract
 * 3. Wait for deployment to complete
 * 4. Log the deployed contract address
 */
async function main() {
    // Get the ContractFactory for our SimpleStorage contract
    // This abstraction is used to deploy new instances of the contract
    const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");

    // Deploy the contract
    // This creates a deployment transaction that gets broadcast to the network
    const simpleStorage = await SimpleStorage.deploy();

    // Wait for the deployment transaction to be mined
    // This ensures the contract is deployed and ready for interaction
    await simpleStorage.deployed();

    // Log the deployed contract address
    // This address is important to save as it's needed to interact with the contract
    console.log("SimpleStorage deployed to:", simpleStorage.address);
}

// Execute the deployment script
// We use a try-catch pattern to handle any errors during deployment
main().catch((error) => {
    // Log any errors that occur during deployment
    console.error(error);
    // Set a non-zero exit code to indicate failure
    process.exitCode = 1;
});
