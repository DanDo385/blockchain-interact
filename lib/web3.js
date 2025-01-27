// Import required dependencies
import Web3Modal from "web3modal"; // For handling wallet connection modal
import { ethers } from "ethers"; // Ethereum library for interacting with the blockchain

/**
 * Connects to a Web3 wallet (like MetaMask) and returns a signer
 * 
 * This function:
 * 1. Creates a Web3Modal instance for wallet selection
 * 2. Prompts user to connect their wallet via a modal
 * 3. Creates an ethers provider from the connection
 * 4. Returns a signer object for signing transactions
 * 
 * @returns {Promise<ethers.Signer>} A signer object that can sign transactions
 * @throws {Error} If user rejects connection or connection fails
 */


export const connectWallet = async () => {
    // Initialize Web3Modal which handles wallet connection flow
    const web3Modal = new Web3Modal();

    // Open modal and wait for user to select a wallet
    // This will typically open MetaMask if installed
    const instance = await web3Modal.connect();

    // Create an ethers provider using the connection instance
    // This provider allows interaction with the Ethereum network
    const provider = new ethers.providers.Web3Provider(instance);

    // Get a signer object which can sign transactions
    // This represents the connected account
    return provider.getSigner();
};
