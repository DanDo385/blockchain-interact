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
            const infuraUrl = process.env.NEXT_PUBLIC_INFURA_SEPOLIA_URL;
            if (!infuraUrl) {
                throw new Error("Infura URL not configured. Please check your environment variables.");
            }

            const provider = new ethers.JsonRpcProvider(infuraUrl);
            
            // Fetch latest block
            const latestBlock = await provider.getBlock('latest');
            
            // Fetch network details
            const network = await provider.getNetwork();
            
            // Get fee data using getFeeData() method
            const feeData = await provider.getFeeData();

            // Get pending transactions (mempool)
            const pendingCount = await provider.send('txpool_status', []);

            setStats({
                network: {
                    name: network.name,
                    chainId: network.chainId.toString(),
                },
                latestBlock: {
                    number: latestBlock.number,
                    hash: latestBlock.hash,
                    timestamp: new Date(latestBlock.timestamp * 1000).toLocaleString(),
                    gasLimit: latestBlock.gasLimit.toString(),
                    gasUsed: latestBlock.gasUsed.toString(),
                    miner: latestBlock.miner,
                    transactions: latestBlock.transactions.length,
                },
                mempool: {
                    pending: parseInt(pendingCount.pending || '0', 16),
                    queued: parseInt(pendingCount.queued || '0', 16),
                },
                fees: {
                    gasPrice: ethers.formatUnits(feeData.gasPrice || 0n, 'gwei'),
                    maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : 'N/A',
                    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : 'N/A',
                }
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching blockchain data:', err);
            setError('Failed to fetch blockchain data');
            toast.error('Failed to fetch blockchain data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlockchainData();
        const interval = setInterval(fetchBlockchainData, 12000); // Refresh every 12 seconds
        return () => clearInterval(interval);
    }, []);

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
                >
                    Refresh Data
                </button>
            </div>

            {error ? (
                <div className="text-red-600 text-center py-8">{error}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Network Info */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Network Information</h2>
                        <div className="space-y-2">
                            <div>Network: {stats.network.name}</div>
                            <div>Chain ID: {stats.network.chainId}</div>
                        </div>
                    </div>

                    {/* Latest Block */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Latest Block</h2>
                        <div className="space-y-2">
                            <div>Number: {stats.latestBlock.number}</div>
                            <div className="truncate">Hash: {stats.latestBlock.hash}</div>
                            <div>Timestamp: {stats.latestBlock.timestamp}</div>
                            <div>Transactions: {stats.latestBlock.transactions}</div>
                            <div>Gas Used: {stats.latestBlock.gasUsed}</div>
                            <div>Gas Limit: {stats.latestBlock.gasLimit}</div>
                            <div className="truncate">Miner: {stats.latestBlock.miner}</div>
                        </div>
                    </div>

                    {/* Mempool Stats */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Mempool</h2>
                        <div className="space-y-2">
                            <div>Pending Transactions: {stats.mempool.pending}</div>
                            <div>Queued Transactions: {stats.mempool.queued}</div>
                        </div>
                    </div>

                    {/* Gas & Fees */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Gas & Fees (Gwei)</h2>
                        <div className="space-y-2">
                            <div>Gas Price: {stats.fees.gasPrice}</div>
                            <div>Max Fee Per Gas: {stats.fees.maxFeePerGas}</div>
                            <div>Max Priority Fee: {stats.fees.maxPriorityFeePerGas}</div>
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