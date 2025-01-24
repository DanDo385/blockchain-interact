import React, { useState, useEffect } from "react";

const MetaMaskProvider = ({ children }) => {
    const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

    useEffect(() => {
        const { ethereum } = window;
        setIsMetaMaskInstalled(!!ethereum?.isMetaMask);
    }, []);

    return <div>{children}</div>;
};

export default MetaMaskProvider;
