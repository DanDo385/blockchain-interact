import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

export default function BlockchainStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBlockchainData = async () => {
        try {
            // Validate environment variables
            const infuraUrl = process.env.NEXT_PUBLIC_INFURA_SEPOLIA_URL;
            if (!infuraUrl) {
                throw new Error("Infura URL not configured. Please check your environment variables.");
            }
    
            // Initialize provider with error handling
            let provider;
            try {
                provider = new ethers.JsonRpcProvider(infuraUrl);
            } catch (providerError) {
                throw new Error(`Failed to initialize provider: ${providerError.message}`);
            }
            
            // Fetch latest block with timeout and error handling
            let latestBlock;
            try {
                latestBlock = await Promise.race([
                    provider.getBlock('latest'),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout fetching latest block')), 10000)
                    )
                ]);
                if (!latestBlock) {
                    throw new Error('Failed to fetch latest block - received null');
                }
            } catch (blockError) {
                throw new Error(`Error fetching latest block: ${blockError.message}`);
            }
            
            // Fetch network details with error handling
            let network;
            try {
                network = await provider.getNetwork();
            } catch (networkError) {
                throw new Error(`Error fetching network details: ${networkError.message}`);
            }
            
            // Get fee data with error handling
            let feeData;
            try {
                feeData = await provider.getFeeData();
            } catch (feeError) {
                throw new Error(`Error fetching fee data: ${feeError.message}`);
            }
    
            // Validate critical data before setting state
            if (!network?.chainId || !latestBlock?.number) {
                throw new Error('Invalid blockchain data received');
            }

            setStats({
                network: {
                    name: network.name || 'Unknown Network',
                    chainId: network.chainId.toString(),
                    blockNumber: latestBlock.number,
                },
                latestBlock: {
                    number: latestBlock.number,
                    hash: latestBlock.hash || 'N/A',
                    timestamp: latestBlock.timestamp ? 
                        new Date(latestBlock.timestamp * 1000).toLocaleString() : 'N/A',
                    gasLimit: latestBlock.gasLimit?.toString() || 'N/A',
                    gasUsed: latestBlock.gasUsed?.toString() || 'N/A',
                    miner: latestBlock.miner || 'N/A',
                    transactions: latestBlock.transactions?.length || 0,
                    baseFeePerGas: latestBlock.baseFeePerGas ? 
                        ethers.formatUnits(latestBlock.baseFeePerGas, 'gwei') : 'N/A',
                },
                fees: {
                    gasPrice: feeData?.gasPrice ? 
                        ethers.formatUnits(feeData.gasPrice, 'gwei') : 'N/A',
                    maxFeePerGas: feeData?.maxFeePerGas ? 
                        ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : 'N/A',
                    maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas ? 
                        ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : 'N/A',
                }
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching blockchain data:', err);
            const errorMessage = err.message || 'Failed to fetch blockchain data';
            setError(errorMessage);
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let intervalId;
        
        const initFetch = async () => {
            await fetchBlockchainData();
            // Only set up interval if first fetch was successful
            if (!error) {
                intervalId = setInterval(fetchBlockchainData, 12000);
            }
        };

        initFetch();

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [error]);

    if (loading) {
        return (
            <div className="container mx-auto p-4">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-xl">Loading blockchain data...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Sepolia Network Stats</h1>
                <button
                    onClick={fetchBlockchainData}
                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>

            {error ? (
                <div className="text-red-600 text-center py-8">
                    <p className="font-semibold">Error:</p>
                    <p>{error}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Network Info */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Network Information</h2>
                        <div className="space-y-2">
                            <div>Network: {stats?.network?.name || 'N/A'}</div>
                            <div>Chain ID: {stats?.network?.chainId || 'N/A'}</div>
                        </div>
                    </div>

                    {/* Latest Block */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Latest Block</h2>
                        <div className="space-y-2">
                            <div>Number: {stats?.latestBlock?.number || 'N/A'}</div>
                            <div className="truncate">Hash: {stats?.latestBlock?.hash || 'N/A'}</div>
                            <div>Timestamp: {stats?.latestBlock?.timestamp || 'N/A'}</div>
                            <div>Transactions: {stats?.latestBlock?.transactions || 'N/A'}</div>
                            <div>Gas Used: {stats?.latestBlock?.gasUsed || 'N/A'}</div>
                            <div>Gas Limit: {stats?.latestBlock?.gasLimit || 'N/A'}</div>
                            <div className="truncate">Miner: {stats?.latestBlock?.miner || 'N/A'}</div>
                        </div>
                    </div>

                    {/* Gas & Fees */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Gas & Fees (Gwei)</h2>
                        <div className="space-y-2">
                            <div>Gas Price: {stats?.fees?.gasPrice || 'N/A'}</div>
                            <div>Max Fee Per Gas: {stats?.fees?.maxFeePerGas || 'N/A'}</div>
                            <div>Max Priority Fee: {stats?.fees?.maxPriorityFeePerGas || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            )}

            <Link
                href="/"
                className="mt-8 inline-block text-purple-500 hover:text-purple-600 hover:underline"
            >
                ← Back to Home
            </Link>
            <ToastContainer position="top-right" autoClose={5000} />
        </div>
    );
} 