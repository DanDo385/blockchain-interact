// Import necessary React hooks for component state and side effects
import React, { useState, useEffect } from "react";

/**
 * MetaMaskProvider Component
 * 
 * This component serves as a wrapper to check for MetaMask installation status
 * and provide that information to child components if needed.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be rendered
 * 
 * The component performs the following:
 * 1. Maintains state for MetaMask installation status
 * 2. Checks for MetaMask presence on component mount
 * 3. Wraps children in a div container
 */
const MetaMaskProvider = ({ children }) => {
    // This check is redundant because Web3Modal:
    // 1. Already checks for wallet availability
    // 2. Handles multiple wallet types
    // 3. Provides better UX for wallet selection
    const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
    
    /**
     * Effect hook to check for MetaMask installation on component mount
     * 
     * This effect:
     * - Runs once when component mounts (empty dependency array)
     * - Checks for ethereum object injected by MetaMask
     * - Updates state based on presence of MetaMask
     * 
     * Note: window.ethereum is injected by MetaMask when installed
     * The optional chaining (?.) handles cases where ethereum object might not exist
     */
    useEffect(() => {
        const { ethereum } = window;
        setIsMetaMaskInstalled(!!ethereum?.isMetaMask);
    }, []);

    // Render children wrapped in a container div
    // This could be enhanced to pass isMetaMaskInstalled to children if needed
    return <div>{children}</div>;
};

// Export the component as the default export
export default MetaMaskProvider;
