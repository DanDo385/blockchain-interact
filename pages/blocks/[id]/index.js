// Import necessary dependencies
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast, ToastContainer } from "react-toastify"; // For showing notifications
import Link from "next/link";
import { SimpleStorageABI } from "../../../lib/SimpleStorageABI";
import "react-toastify/dist/ReactToastify.css";

/**
 * Initializes and returns an ethers provider connected to Infura
 * @returns {Promise<ethers.JsonRpcProvider>} Configured provider instance
 * @throws {Error} If Infura URL is not configured
 */
const initializeProvider = async () => {
  const infuraUrl = process.env.NEXT_PUBLIC_INFURA_SEPOLIA_URL;
  if (!infuraUrl) {
    throw new Error("Infura URL not configured. Please check your environment variables.");
  }

  const provider = new ethers.JsonRpcProvider(infuraUrl);
  await provider.getNetwork(); // Verify connection is working
  return provider;
};

/**
 * BlockDetails component - Displays detailed information about a specific block
 * including transaction details and contract data
 */
export default function BlockDetails() {
  const router = useRouter();
  const { id } = router.query; // This is now the Ethereum block number

  // State management
  const [block, setBlock] = useState(null);        // Stores block data from contract
  const [txDetails, setTxDetails] = useState(null); // Stores transaction details
  const [loading, setLoading] = useState(true);     // Loading state indicator
  const [error, setError] = useState(null);         // Error state management

  // Effect hook to fetch block details when component mounts or ID changes
  useEffect(() => {
    const fetchBlockDetails = async () => {
      if (!id) return;

      try {
        const provider = await initializeProvider();
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

        if (!contractAddress) {
          throw new Error("Contract address not configured. Check your environment variables.");
        }

        const contract = new ethers.Contract(contractAddress, SimpleStorageABI, provider);

        // Create event filter for BlockCreated events
        const filter = contract.filters.BlockCreated();
        const events = await contract.queryFilter(filter);
        
        // Find the event that matches our Ethereum block number
        const relevantEvent = events.find(async (event) => {
          const receipt = await provider.getTransactionReceipt(event.transactionHash);
          return receipt.blockNumber === Number(id);
        });

        if (!relevantEvent) {
          throw new Error("Block not found");
        }

        // Get the contract's internal block ID from the event
        const contractBlockId = Number(relevantEvent.args[0]);
        
        // Now fetch the block data using the contract's internal ID
        const blockData = await contract.getBlock(contractBlockId);

        // Fetch detailed transaction information
        const tx = await provider.getTransaction(relevantEvent.transactionHash);
        const receipt = await provider.getTransactionReceipt(relevantEvent.transactionHash);
        const blockInfo = await provider.getBlock(receipt.blockNumber);

        // Calculate transaction costs
        const gasUsed = receipt.gasUsed;
        const gasPrice = tx.gasPrice;
        const txFee = gasUsed * gasPrice; // Total transaction fee in wei

        // Structure transaction details for display
        setTxDetails({
          hash: relevantEvent.transactionHash,
          status: receipt.status === 1 ? "Success" : "Failed",
          blockNumber: receipt.blockNumber,
          timestamp: new Date(blockInfo.timestamp * 1000).toUTCString(),
          from: tx.from,
          to: tx.to,
          value: ethers.formatEther(tx.value || 0n), // Convert to ETH, default to 0 if null
          gasLimit: tx.gasLimit.toString(),
          gasUsed: gasUsed.toString(),
          gasPrice: ethers.formatUnits(gasPrice, "gwei"), // Convert to Gwei for readability
          txFee: ethers.formatEther(txFee), // Convert to ETH
          nonce: tx.nonce,
          input: tx.data, // Raw transaction input data
          type: tx.type,
          // Parse event data for easy access
          eventData: {
            id: Number(relevantEvent.args[0]),
            name: relevantEvent.args[1],
            sum: Number(relevantEvent.args[2]),
            creator: relevantEvent.args[3]
          }
        });

        setBlock(blockData);
        setError(null);
      } catch (error) {
        console.error("Error fetching block details:", error);
        setError(error.message || "Failed to load block details.");
        toast.error(error.message || "Failed to load block details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlockDetails();
  }, [id]);

  // Loading state UI
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading block details...</div>
        </div>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <Link href="/blocks" className="text-blue-500 hover:underline">
            ← Back to Blocks
          </Link>
        </div>
      </div>
    );
  }

  // Not found state UI
  if (!block || !txDetails) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8 text-red-600">
          <div className="mb-4">Block not found</div>
          <Link href="/blocks" className="text-blue-500 hover:underline">
            ← Back to Blocks
          </Link>
        </div>
      </div>
    );
  }

  // Main UI rendering with all block and transaction details
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Block Details</h1>

        {/* Transaction hash and status section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="font-semibold mb-2">Transaction Hash:</h2>
            <div className="text-blue-500 break-all">{txDetails.hash}</div>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Status:</h2>
            <span className={`px-2 py-1 rounded ${txDetails.status === "Success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {txDetails.status}
            </span>
          </div>
        </div>

        {/* Block number and timestamp section */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="font-semibold mb-2">Block Number:</h2>
            <div>{txDetails.blockNumber}</div>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Timestamp:</h2>
            <div>{txDetails.timestamp}</div>
          </div>
        </div>

        {/* Contract data section */}
        <div className="mt-4">
          <h2 className="font-semibold mb-2">Contract Data:</h2>
          <div className="bg-gray-50 p-4 rounded">
            <div className="mb-2">Name: {txDetails.eventData.name || 'N/A'}</div>
            <div className="mb-2">Sum: {txDetails.eventData.sum.toString()}</div>
            <div>Creator: {txDetails.eventData.creator}</div>
          </div>
        </div>

        {/* Transaction addresses section */}
        <div className="mt-4">
          <h2 className="font-semibold mb-2">From:</h2>
          <div className="text-blue-500 break-all">{txDetails.from}</div>
          <h2 className="font-semibold mt-4 mb-2">To:</h2>
          <div className="text-blue-500 break-all">{txDetails.to}</div>
        </div>

        {/* Detailed transaction information section */}
        <div className="mt-4">
          <h2 className="font-semibold mb-2">Transaction Details:</h2>
          <div className="bg-gray-50 p-4 rounded space-y-2">
            <div>Value: {txDetails.value} ETH</div>
            <div>Gas Limit: {txDetails.gasLimit}</div>
            <div>Gas Used: {txDetails.gasUsed} ({((Number(txDetails.gasUsed) / Number(txDetails.gasLimit)) * 100).toFixed(2)}%)</div>
            <div>Gas Price: {txDetails.gasPrice} Gwei</div>
            <div>Transaction Fee: {txDetails.txFee} ETH</div>
            <div>Nonce: {txDetails.nonce}</div>
            <div>Type: {txDetails.type}</div>
          </div>
        </div>

        {/* Raw transaction input data section */}
        <div className="mt-4">
          <h2 className="font-semibold mb-2">Input Data:</h2>
          <div className="bg-gray-50 p-4 rounded break-all font-mono text-sm">
            {txDetails.input}
          </div>
        </div>

        {/* Navigation link */}
        <Link href="/blocks" className="text-blue-500 hover:underline mt-8 block">
          ← Back to Blocks
        </Link>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}
