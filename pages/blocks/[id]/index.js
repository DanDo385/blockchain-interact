import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";
import { SimpleStorageABI } from "../../../lib/SimpleStorageABI";
import "react-toastify/dist/ReactToastify.css";

const initializeProvider = async () => {
  const infuraUrl = process.env.NEXT_PUBLIC_INFURA_SEPOLIA_URL;
  if (!infuraUrl) {
    throw new Error("Infura URL not configured. Please check your environment variables.");
  }

  const provider = new ethers.JsonRpcProvider(infuraUrl);
  await provider.getNetwork(); // Test the connection
  return provider;
};

export default function BlockDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [block, setBlock] = useState(null);
  const [txDetails, setTxDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlockDetails = async () => {
      if (!id) return;

      try {
        // Initialize provider
        const provider = await initializeProvider();
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

        if (!contractAddress) {
          throw new Error("Contract address not configured. Check your environment variables.");
        }

        const contract = new ethers.Contract(contractAddress, SimpleStorageABI, provider);

        // Fetch block data from contract
        const blockData = await contract.getBlock(id);

        // Fetch transaction details from the event logs
        const filter = contract.filters.BlockCreated(id);
        const events = await contract.queryFilter(filter);

        if (events.length > 0) {
          const event = events[0];
          const tx = await provider.getTransaction(event.transactionHash);
          const receipt = await provider.getTransactionReceipt(event.transactionHash);
          const blockInfo = await provider.getBlock(receipt.blockNumber);

          // Calculate gas fees
          const gasUsed = receipt.gasUsed;
          const gasPrice = tx.gasPrice;
          const txFee = gasUsed.mul(gasPrice);

          setTxDetails({
            hash: event.transactionHash,
            status: receipt.status === 1 ? "Success" : "Failed",
            blockNumber: receipt.blockNumber,
            timestamp: new Date(blockInfo.timestamp * 1000).toUTCString(),
            from: tx.from,
            to: tx.to,
            value: ethers.utils.formatEther(tx.value || 0),
            gasLimit: tx.gasLimit.toString(),
            gasUsed: gasUsed.toString(),
            gasPrice: ethers.utils.formatUnits(gasPrice, "gwei"),
            txFee: ethers.utils.formatEther(txFee),
            nonce: tx.nonce,
            input: tx.data,
          });
        } else {
          throw new Error("Transaction details not found.");
        }

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

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading block details...</div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Block Details</h1>

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

        {/* Additional transaction and block details */}
        <div className="mt-4">
          <h2 className="font-semibold mb-2">From:</h2>
          <div className="text-blue-500 break-all">{txDetails.from}</div>
          <h2 className="font-semibold mt-4 mb-2">To:</h2>
          <div className="text-blue-500 break-all">{txDetails.to}</div>
        </div>

        <Link href="/blocks" className="text-blue-500 hover:underline mt-4 block">
          ← Back to Blocks
        </Link>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}
