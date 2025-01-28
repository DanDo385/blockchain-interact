import { ethers } from 'ethers';
import { SimpleStorageABI } from './SimpleStorageABI';

/**
 * Creates and returns an instance of the smart contract
 * @param {ethers.Signer} signer - The signer object for transaction authentication
 * @returns {ethers.Contract} Contract instance
 * @throws {Error} If contract address is not configured in environment variables
 */
export const getContract = async (signer) => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error('Contract address not found');
    }

    return new ethers.Contract(
        contractAddress,
        SimpleStorageABI,
        signer
    );
};

/** 
 * Formats blockchain data into a standardized block object
 * 
 * @param {Object} block Raw block data from the smart contract
 * @param {Object} metadata Additional metadata for the block
 * @param {number} metadata.ethBlockNumber Ethereum block number 
 * @param {string} metadata.timestamp Timestamp of the block
 * @returns {Object} Formatted block with standardized properties
 */

export const formatBlock = (block, metadata = {}) => {
    // Convert BigInt values to numbers and ensure proper ID handling
    const blockId = block.id ? Number(block.id) : 0;
    const blockSum = block.sum ? Number(block.sum) : 0;
    
    return {
        id: blockId,          // Unique identifier for the block
        name: block.name || '', // Name or description of the block
        sum: blockSum,        // Numerical sum value stored in the block
        creator: block.creator, // Address of the account that created the block
        ethBlockNumber: metadata.ethBlockNumber || 0, // Ethereum block number when this was created
        timestamp: metadata.timestamp || new Date().toISOString() // Creation timestamp
    };
};

