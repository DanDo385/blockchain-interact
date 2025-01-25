import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract, formatBlock } from "../../lib/contractUtils";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Blocks() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBlocks = async () => {
    try {
      if (!window.ethereum) {
        toast.error("Please install MetaMask to view blocks");
        setLoading(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = await getContract(provider);

      const blockCount = await contract.blockCount();
      const blocksData = [];
      const count = Number(blockCount);

      console.log("Total blocks:", count);

      const filter = contract.filters.BlockCreated();

      for (let i = count - 1; i >= 0; i--) {
        try {
          const block = await contract.getBlock(i);
          console.log("Raw block data:", block);

          const events = await contract.queryFilter(filter, 0, "latest");
          const event = events.find((e) => Number(e.args[0]) === i);

          if (event) {
            const txReceipt = await provider.getTransactionReceipt(event.transactionHash);
            const ethBlock = await provider.getBlock(txReceipt.blockNumber);

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

  useEffect(() => {
    loadBlocks();

    const setupBlockListener = async () => {
      if (!window.ethereum) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = await getContract(provider);

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

    // Cleanup function
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

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading blocks...</div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Blocks</h1>
        <button
          onClick={loadBlocks}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Blocks
        </button>
      </div>

      {blocks.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No blocks found. Create some blocks on the home page!
        </div>
      ) : (
        <div className="grid gap-4">
          {blocks.map((block) => (
        <Link
        key={block.id}
        href={`/blocks/${block.id}`} // Use block.id here
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

      <Link
        href="/"
        className="mt-8 inline-block text-blue-500 hover:text-blue-600 hover:underline"
      >
        ← Back to Home
      </Link>

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}
