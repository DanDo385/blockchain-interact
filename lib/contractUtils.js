import { ethers } from 'ethers';
import { SimpleStorageABI } from './SimpleStorageABI';

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

export const formatBlock = (block, metadata = {}) => {
    // Convert BigInt values to numbers and ensure proper ID handling
    const blockId = block.id ? Number(block.id) : 0;
    const blockSum = block.sum ? Number(block.sum) : 0;
    
    return {
        id: blockId,
        name: block.name || '',
        sum: blockSum,
        creator: block.creator,
        ethBlockNumber: metadata.ethBlockNumber || 0,
        timestamp: metadata.timestamp || new Date().toISOString()
    };
};

