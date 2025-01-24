import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "../lib/contractUtils"; // Ensure this function is correctly implemented
import dynamic from "next/dynamic";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MetaMaskProvider = dynamic(() => import("../lib/MetaMaskProvider"), { ssr: false });

const Home = () => {
    const [name, setName] = useState("");
    const [num1, setNum1] = useState("");
    const [num2, setNum2] = useState("");
    const [provider, setProvider] = useState(null);

    const handleConnect = async () => {
        try {
            const { ethereum } = window;
            if (!ethereum || !ethereum.isMetaMask) {
                toast.error("Please install MetaMask to use this application!");
                return;
            }

            // Request account access
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            if (!accounts || accounts.length === 0) {
                toast.error("No accounts found!");
                return;
            }

            // Create provider
            const web3Provider = new ethers.BrowserProvider(ethereum);
            setProvider(web3Provider);
            toast.success("Wallet connected successfully!");

            // Listen for account changes
            ethereum.on("accountsChanged", (newAccounts) => {
                if (newAccounts.length === 0) {
                    setProvider(null);
                    toast.info("Wallet disconnected");
                } else {
                    const newProvider = new ethers.BrowserProvider(ethereum);
                    setProvider(newProvider);
                    toast.info("Account changed");
                }
            });

        } catch (error) {
            console.error("Error connecting wallet:", error);
            if (error.code === 4001) {
                toast.error("Please connect your wallet to continue.");
            } else {
                toast.error("Failed to connect wallet. Please try again.");
            }
        }
    };

    const saveName = async () => {
        try {
            if (!provider) {
                toast.error("Please connect your wallet first.");
                return;
            }

            const signer = await provider.getSigner();
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

    const saveSum = async () => {
        try {
            if (!provider) {
                toast.error("Please connect your wallet first.");
                return;
            }

            const signer = await provider.getSigner();
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

    // Cleanup effect for MetaMask listeners
    useEffect(() => {
        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners("accountsChanged");
            }
        };
    }, []);

    return (
        <MetaMaskProvider>
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">SimpleStorage DApp</h1>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleConnect}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center space-x-2"
                        >
                            {provider ? (
                                <>
                                    <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                                    <span>Connected</span>
                                </>
                            ) : (
                                <>
                                    <span>Connect MetaMask</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
                <ToastContainer position="top-right" autoClose={5000} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                            disabled={!provider}
                            className={`w-full py-2 rounded ${
                                provider
                                    ? "bg-blue-500 text-white hover:bg-blue-600"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            Save Name
                        </button>
                    </div>
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
                            disabled={!provider}
                            className={`w-full py-2 rounded ${
                                provider
                                    ? "bg-blue-500 text-white hover:bg-blue-600"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            Save Sum
                        </button>
                    </div>
                </div>
            </div>
        </MetaMaskProvider>
    );
};

export default Home;
