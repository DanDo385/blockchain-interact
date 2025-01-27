// Import necessary dependencies
import { useEffect, useState } from "react"; // React hooks for state and side effects
import { ethers } from "ethers"; // Ethereum library for blockchain interaction
import { getContract, formatBlock } from "../../lib/contractUtils"; // Utility functions for contract interaction
import Link from "next/link"; // Next.js component for client-side navigation
import { ToastContainer, toast } from "react-toastify"; // Toast notifications
import "react-toastify/dist/ReactToastify.css"; // Toast notification styles

/**
 * Blocks component - Displays a list of all blocks stored in the smart contract
 * Includes real-time updates when new blocks are created
 */
export default function Blocks() {
  // State management
  const [blocks, setBlocks] = useState([]); // Stores array of block data
  const [loading, setLoading] = useState(true); // Loading state indicator
  const [error, setError] = useState(null); // Error state management

  /**
   * Fetches all blocks from the smart contract and formats them for display
   * Includes metadata like Ethereum block number and timestamp
   */
  const loadBlocks = async () => {
    try {
      // Check for MetaMask installation
      if (!window.ethereum) {
        toast.error("Please install MetaMask to view blocks");
        setLoading(false);
        return;
      }

      // Initialize provider and contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = await getContract(provider);

      // Get total number of blocks
      const blockCount = await contract.blockCount();
      const blocksData = [];
      const count = Number(blockCount);

      console.log("Total blocks:", count);

      // Create event filter for BlockCreated events
      const filter = contract.filters.BlockCreated();

      // Iterate through blocks in reverse order (newest first)
      for (let i = count - 1; i >= 0; i--) {
        try {
          // Fetch block data from contract
          const block = await contract.getBlock(i);
          console.log("Raw block data:", block);

          // Find corresponding creation event for this block
          const events = await contract.queryFilter(filter, 0, "latest");
          const event = events.find((e) => Number(e.args[0]) === i);

          if (event) {
            // Get additional metadata from transaction receipt and block
            const txReceipt = await provider.getTransactionReceipt(event.transactionHash);
            const ethBlock = await provider.getBlock(txReceipt.blockNumber);

            // Format block data with metadata
            const formattedBlock = formatBlock(block, {
              ethBlockNumber: txReceipt.blockNumber,
              timestamp: new Date(ethBlock.timestamp * 1000).toISOString(),
            });

            blocksData.push(formattedBlock);
          }
        } catch (error) {
          console.error(`Error loading block ${i}:`, error);
          toast.error(`Failed to load block ${i}`);
        }
      }

      setBlocks(blocksData);
      setError(null);
    } catch (error) {
      console.error("Error loading blocks:", error);
      setError("Failed to load blocks. Please check your connection and try again.");
      toast.error("Failed to load blocks. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Effect hook for initial load and event listener setup
  useEffect(() => {
    loadBlocks();

    /**
     * Sets up event listener for new block creation
     * Reloads blocks when a new one is created
     */
    const setupBlockListener = async () => {
      if (!window.ethereum) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = await getContract(provider);

        // Listen for BlockCreated events
        contract.on("BlockCreated", (id, name, sum, creator) => {
          console.log("New block created:", { id: Number(id), name, sum: Number(sum), creator });
          loadBlocks(); // Reload all blocks when a new one is created
        });

        return () => {
          contract.removeAllListeners("BlockCreated");
        };
      } catch (error) {
        console.error("Error setting up block listener:", error);
      }
    };

    setupBlockListener();

    // Cleanup function to remove event listeners
    return () => {
      if (window.ethereum) {
        const cleanup = async () => {
          try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = await getContract(provider);
            contract.removeAllListeners("BlockCreated");
          } catch (error) {
            console.error("Error cleaning up listeners:", error);
          }
        };
        cleanup();
      }
    };
  }, []);

  // Loading state UI
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading blocks...</div>
        </div>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8 text-red-600">
          <p>{error}</p>
          <button
            onClick={loadBlocks}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main UI - List of blocks
  return (
    <div className="container mx-auto p-4">
      {/* Header section with title and refresh button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Blocks</h1>
        <button
          onClick={loadBlocks}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Blocks
        </button>
      </div>

      {/* Conditional rendering based on blocks existence */}
      {blocks.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No blocks found. Create some blocks on the home page!
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Map through blocks and render each as a link to its details page */}
          {blocks.map((block) => (
            <Link
              key={block.id}
              href={`/blocks/${block.id}`}
              className="p-4 border rounded hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">
                    Block #{block.ethBlockNumber.toLocaleString()}
                    <span className="text-sm text-gray-500 ml-2">
                      (Contract ID: {block.id})
                    </span>
                  </div>
                  <div>Name: {block.name || "N/A"}</div>
                  <div>Sum: {block.sum.toString()}</div>
                </div>
                <div className="text-sm text-gray-500">
                  <div className="truncate" style={{ maxWidth: "200px" }}>
                    Creator: {block.creator}
                  </div>
                  {block.timestamp && (
                    <div className="mt-1 text-xs">
                      {new Date(block.timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Navigation link back to home page */}
      <Link
        href="/"
        className="mt-8 inline-block text-blue-500 hover:text-blue-600 hover:underline"
      >
        ← Back to Home
      </Link>

      {/* Toast notification container */}
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}
