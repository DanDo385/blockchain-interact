import Web3Modal from "web3modal";
import { ethers } from "ethers";

export const connectWallet = async () => {
    const web3Modal = new Web3Modal();
    const instance = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    return provider.getSigner();
};
