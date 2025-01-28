import Web3Modal from "web3modal";
import { ethers } from "ethers";

/**
 * Configuration options for Web3Modal
 * Customize which wallets are supported
 */
const providerOptions = {
    // Add wallet providers here if needed
    // Example: WalletConnect, Coinbase Wallet, etc.
};

/**
 * Handles wallet connection using Web3Modal
 * @returns {Promise<{provider: ethers.BrowserProvider, signer: ethers.Signer}>}
 * @throws {Error} If connection fails or is rejected
 */
export const connectWallet = async () => {
    try {
        // Initialize Web3Modal with options
        const web3Modal = new Web3Modal({
            cacheProvider: true, // Remembers previous connections
            providerOptions
        });

        // Prompt user to connect wallet
        const instance = await web3Modal.connect();
        
        // Create ethers provider and signer
        const provider = new ethers.BrowserProvider(instance);
        const signer = await provider.getSigner();

        return {
            provider,
            signer
        };
    } catch (error) {
        // Rethrow error for handling in UI
        throw error;
    }
};

/**
 * Disconnects the current wallet connection
 * @param {ethers.BrowserProvider} provider - The current provider instance
 */
export const disconnectWallet = async (provider) => {
    try {
        if (provider?.provider?.close) {
            await provider.provider.close();
        }
        
        // Clear Web3Modal's cached provider
        Web3Modal.clearCachedProvider();
    } catch (error) {
        console.error("Error disconnecting wallet:", error);
    }
}; 