// Import necessary dependencies
import { useEffect, useState } from "react"; // React hooks for state and side effects
import { ethers } from "ethers"; // Ethereum library for blockchain interaction
import { getContract, formatBlock } from "../../lib/contractUtils"; // Utility functions for contract interaction
import Link from "next/link"; // Next.js component for client-side navigation
import { ToastContainer, toast } from "react-toastify"; // Toast notifications
import "react-toastify/dist/ReactToastify.css"; // Toast notification styles

/**
 * Blocks component - Main page component that displays a list of all blocks stored in the smart contract
 * Features:
 * - Fetches and displays all blocks from the SimpleStorage contract
 * - Real-time updates when new blocks are created via event listeners
 * - Error handling and loading states
 * - Links to individual block detail pages
 * - Refresh functionality to manually update the block list
 * 
 * @component
 * @returns {JSX.Element} Rendered component
 */
export default function Blocks() {
  // State management using React hooks
  const [blocks, setBlocks] = useState([]); // Stores array of formatted block data from the contract
  const [loading, setLoading] = useState(true); // Controls loading spinner visibility
  const [error, setError] = useState(null); // Stores any error messages during data fetching

  /**
   * Fetches all blocks from the smart contract and formats them for display
   * Process:
   * 1. Checks for MetaMask installation
   * 2. Connects to the contract
   * 3. Retrieves total block count
   * 4. Iterates through blocks in reverse order (newest first)
   * 5. Fetches detailed data for each block including:
   *    - Basic block data from contract
   *    - Creation event data
   *    - Transaction receipt
   *    - Ethereum block metadata
   * 6. Updates state with formatted block data
   * 
   * @async
   * @function
   * @throws {Error} If MetaMask is not installed or connection fails
   */
  const loadBlocks = async () => {
    try {
      // Verify MetaMask installation before proceeding
      if (!window.ethereum) {
        toast.error("Please install MetaMask to view blocks");
        setLoading(false);
        return;
      }

      // Initialize blockchain connection
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = await getContract(provider);

      // Fetch total number of blocks from contract
      const blockCount = await contract.blockCount();
      const blocksData = [];
      const count = Number(blockCount);

      console.log("Total blocks:", count);

      // Create event filter to find block creation events
      const filter = contract.filters.BlockCreated();

      // Process blocks in reverse chronological order
      for (let i = count - 1; i >= 0; i--) {
        try {
          // Get block data from contract storage
          const block = await contract.getBlock(i);
          console.log("Raw block data:", block);

          // Find the event that created this block
          const events = await contract.queryFilter(filter, 0, "latest");
          const event = events.find((e) => Number(e.args[0]) === i);

          if (event) {
            // Fetch additional blockchain metadata
            const txReceipt = await provider.getTransactionReceipt(event.transactionHash);
            const ethBlock = await provider.getBlock(txReceipt.blockNumber);

            // Format block data with all metadata
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

      // Update state with fetched data
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

  /**
   * Effect hook that handles:
   * 1. Initial block data loading
   * 2. Setting up real-time event listeners for new blocks
   * 3. Cleanup of event listeners on component unmount
   * 
   * The event listener automatically triggers a reload when new blocks are created,
   * keeping the UI in sync with the blockchain state.
   */
  useEffect(() => {
    loadBlocks();

    /**
     * Sets up blockchain event listeners for real-time updates
     * Subscribes to BlockCreated events and reloads data when triggered
     * 
     * @async
     * @function
     * @returns {Function} Cleanup function to remove event listener
     */
    const setupBlockListener = async () => {
      if (!window.ethereum) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = await getContract(provider);

        // Subscribe to BlockCreated events
        contract.on("BlockCreated", (id, name, sum, creator) => {
          console.log("New block created:", { id: Number(id), name, sum: Number(sum), creator });
          loadBlocks(); // Reload all blocks to include the new one
        });

        return () => {
          contract.removeAllListeners("BlockCreated");
        };
      } catch (error) {
        console.error("Error setting up block listener:", error);
      }
    };

    setupBlockListener();

    // Cleanup function to remove event listeners when component unmounts
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

  // Render loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading blocks...</div>
        </div>
      </div>
    );
  }

  // Render error message with retry button if data fetch failed
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

  // Main UI rendering - List of blocks with details
  return (
    <div className="container mx-auto p-4">
      {/* Header section with title and manual refresh button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Blocks</h1>
        <button
          onClick={loadBlocks}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Blocks
        </button>
      </div>

      {/* Show message if no blocks exist, otherwise render block list */}
      {blocks.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No blocks found. Create some blocks on the home page!
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Render each block as a clickable card linking to its details page */}
          {blocks.map((block) => (
            <Link
              key={block.id}
              href={`/blocks/${block.ethBlockNumber}`}
              className="p-4 border rounded hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex justify-between items-start">
                {/* Left side - Block identification and basic data */}
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
                {/* Right side - Creator address and timestamp */}
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

      {/* Navigation link to return to home page */}
      <Link
        href="/"
        className="mt-8 inline-block text-blue-500 hover:text-blue-600 hover:underline"
      >
        ← Back to Home
      </Link>

      {/* Toast notifications container for displaying alerts */}
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}
