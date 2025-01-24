// ABI for SimpleStorage contract
export const SimpleStorageABI = [
    {
        "inputs": [],
        "name": "blockCount",
        "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256","name": "id","type": "uint256"}],
        "name": "getBlock",
        "outputs": [
            {
                "components": [
                    {"internalType": "uint256","name": "id","type": "uint256"},
                    {"internalType": "string","name": "name","type": "string"},
                    {"internalType": "uint256","name": "sum","type": "uint256"},
                    {"internalType": "address","name": "creator","type": "address"}
                ],
                "internalType": "struct SimpleStorage.BlockData",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string","name": "name","type": "string"}],
        "name": "saveName",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string","name": "name","type": "string"},{"internalType": "uint256","name": "sum","type": "uint256"}],
        "name": "saveNameAndSum",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256","name": "num1","type": "uint256"},{"internalType": "uint256","name": "num2","type": "uint256"}],
        "name": "saveSum",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": false,"internalType": "uint256","name": "id","type": "uint256"},
            {"indexed": false,"internalType": "string","name": "name","type": "string"},
            {"indexed": false,"internalType": "uint256","name": "sum","type": "uint256"},
            {"indexed": true,"internalType": "address","name": "creator","type": "address"}
        ],
        "name": "BlockCreated",
        "type": "event"
    }
]; 