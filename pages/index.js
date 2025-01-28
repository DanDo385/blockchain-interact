// Import necessary dependencies
import React, { useState, useEffect } from "react";
import { getContract } from "../lib/contractUtils";
import { connectWallet } from "../lib/walletConnector"; // Import the connectWallet function
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from 'next/link';

/**
 * Home component - Main page of the DApp
 * Provides interface for connecting wallet and interacting with smart contract
 */
const Home = () => {
    // State management for form inputs and Web3 connection
    const [name, setName] = useState("");
    const [num1, setNum1] = useState("");
    const [num2, setNum2] = useState("");
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [isCombinedValid, setIsCombinedValid] = useState(false);

    /**
     * Handles wallet connec ion using MetaMask
     * Sets up provider and signer for blockchain interactions
     * Also sets up listeners for account changes
     */
    const handleConnect = async () => {
        try {
            // Use the connectWallet function from web3.js
            const { provider: web3Provider, signer: web3Signer } = await connectWallet();
            
            setProvider(web3Provider);
            setSigner(web3Signer);
            toast.success("Wallet connected successfully!");

            // Fix: Use the window.ethereum event listener instead
            if (window.ethereum) {
                window.ethereum.on("accountsChanged", async () => {
                    try {
                        const { provider: newProvider, signer: newSigner } = await connectWallet();
                        setProvider(newProvider);
                        setSigner(newSigner);
                        toast.info("Account changed");
                    } catch (error) {
                        setProvider(null);
                        setSigner(null);
                        toast.info("Wallet disconnected");
                    }
                });
            }
        } catch (error) {
            console.error("Error connecting wallet:", error);
            if (error.code === 4001) {
                toast.error("Please connect your wallet to continue.");
            } else {
                toast.error("Failed to connect wallet. Please try again.");
            }
        }
    };

    /**
     * Saves a name to the blockchain using the smart contract
     * Requires an active wallet connection
     * Clears input field after successful transaction
     */
    const saveName = async () => {
        try {
            if (!signer) {
                toast.error("Please connect your wallet first.");
                return;
            }

            const contract = await getContract(signer);
            const tx = await contract.saveName(name);
            await tx.wait();

            setName("");
            toast.success("Name saved successfully!");
        } catch (error) {
            console.error("Error saving name:", error);
            if (error.code === 4001) {
                toast.error("Transaction was rejected. Please try again.");
            } else {
                toast.error("Failed to save name. Please try again.");
            }
        }
    };

    /**
     * Saves the sum of two numbers to the blockchain
     * Requires an active wallet connection
     * Clears input fields after successful transaction
     */
    const saveSum = async () => {
        try {
            if (!signer) {
                toast.error("Please connect your wallet first.");
                return;
            }

            const contract = await getContract(signer);
            const tx = await contract.saveSum(Number(num1), Number(num2));
            await tx.wait();

            setNum1("");
            setNum2("");
            toast.success("Sum saved successfully!");
        } catch (error) {
            console.error("Error saving sum:", error);
            if (error.code === 4001) {
                toast.error("Transaction was rejected. Please try again.");
            } else {
                toast.error("Failed to save sum. Please try again.");
            }
        }
    };

    const saveNameAndSum = async () => {
        try {
            if (!signer) {
                toast.error("Please connect your wallet first.");
                return;
            }

            const contract = await getContract(signer);
            
            // Save name first
            const nameTx = await contract.saveName(name);
            await nameTx.wait();
            toast.info("Name saved, now saving sum...");
            
            // Then save sum
            const sumTx = await contract.saveSum(Number(num1), Number(num2));
            await sumTx.wait();

            // Clear all inputs after success
            setName("");
            setNum1("");
            setNum2("");
            toast.success("Name and Sum saved successfully!");
        } catch (error) {
            console.error("Error saving name and sum:", error);
            if (error.code === 4001) {
                toast.error("Transaction was rejected. Please try again.");
            } else {
                toast.error("Failed to save name and sum. Please try again.");
            }
        }
    };

    // Cleanup effect to remove event listeners when component unmounts
    useEffect(() => {
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener("accountsChanged", () => {});
            }
        };
    }, []);

    useEffect(() => {
        // Check if all fields are filled
        const isNameValid = name.trim() !== "";
        const areSumFieldsValid = num1 !== "" && num2 !== "";
        setIsCombinedValid(isNameValid && areSumFieldsValid);
    }, [name, num1, num2]);

    // Render the UI with two main sections: Save Name and Save Sum
    return (
        <div className="container mx-auto p-4">
            {/* Header section with title and wallet connection button */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">SimpleStorage DApp</h1>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleConnect}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center space-x-2"
                    >
                        {signer ? (
                            <>
                                <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                                <span>Connected</span>
                            </>
                        ) : (
                            <>
                                <span>Connect Wallet</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={5000} />
            {/* Main content grid with two cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Save Name card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Save Name</h2>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter name"
                        className="w-full p-2 border rounded mb-4"
                    />
                    <button
                        onClick={saveName}
                        disabled={!signer}
                        className={`w-full py-2 rounded ${
                            signer
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                        Save Name
                    </button>
                </div>
                {/* Save Sum card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Save Sum</h2>
                    <input
                        type="number"
                        value={num1}
                        onChange={(e) => setNum1(e.target.value)}
                        placeholder="Enter first number"
                        className="w-full p-2 border rounded mb-4"
                    />
                    <input
                        type="number"
                        value={num2}
                        onChange={(e) => setNum2(e.target.value)}
                        placeholder="Enter second number"
                        className="w-full p-2 border rounded mb-4"
                    />
                    <button
                        onClick={saveSum}
                        disabled={!signer}
                        className={`w-full py-2 rounded ${
                            signer
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                        Save Sum
                    </button>
                </div>
            </div>

            {/* Add blank line */}
            <div className="h-4"></div>

            {/* Add combined save button with spacing */}
            <div className="mt-8 mb-8 text-center">
                <button
                    onClick={saveNameAndSum}
                    disabled={!signer || !isCombinedValid}
                    className={`w-full max-w-md mx-auto py-3 rounded-lg ${
                        signer && isCombinedValid
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                    Save Name and Sum
                </button>
            </div>

            {/* Add blank line */}
            <div className="h-4"></div>

            {/* Add Blocks button section with spacing */}
            <div className="mt-8 text-center">
                <Link
                    href="/blocks"
                    className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                    View All Blocks
                </Link>
            </div>
        </div>
    );
};

export default Home;
