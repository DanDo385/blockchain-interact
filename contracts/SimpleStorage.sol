// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleStorage
 * @dev A contract for storing blocks of data with names and sums
 * The contract interacts with a web frontend where users can input values
 * that get passed as parameters to these contract functions
 */
contract SimpleStorage {
    // Struct to define the data structure for each block
    struct BlockData {
        uint256 id;        // Unique identifier for the block
        string name;       // Optional name field
        uint256 sum;       // Numerical sum value
        address creator;   // Ethereum address that created this block
    }

    // Dynamic array to store all blocks
    BlockData[] public blocks;
    
    // Counter to track total number of blocks and assign unique IDs
    uint256 public blockCount = 0;

    // Event emitted when a new block is created
    event BlockCreated(
        uint256 id,
        string name,
        uint256 sum,
        address indexed creator
    );

    /**
     * @dev Saves a block with just a name
     * @param name The name string to store
     * The frontend calls this function by passing the name parameter from the web interface
     */
    function saveName(string calldata name) public {
        blocks.push(BlockData(blockCount, name, 0, msg.sender));
        emit BlockCreated(blockCount, name, 0, msg.sender);
        blockCount++;
    }

    /**
     * @dev Saves a block with both name and sum
     * @param name The name string to store
     * @param sum The pre-calculated sum to store
     * The frontend calls this function by passing both parameters from the web interface
     */
    function saveNameAndSum(string calldata name, uint256 sum) public {
        blocks.push(BlockData(blockCount, name, sum, msg.sender));
        emit BlockCreated(blockCount, name, sum, msg.sender);
        blockCount++;
    }

    /**
     * @dev Saves a block with the sum of two numbers
     * @param num1 First number to add
     * @param num2 Second number to add
     * The frontend (pages/index.js) collects these numbers from user input fields
     * and passes them as parameters when calling this function through ethers.js.
     * The contract receives these exact values as parameters when the transaction
     * is executed on the blockchain.
     */
    function saveSum(uint256 num1, uint256 num2) public {
        uint256 sum = num1 + num2;
        blocks.push(BlockData(blockCount, "", sum, msg.sender));
        emit BlockCreated(blockCount, "", sum, msg.sender);
        blockCount++;
    }

    /**
     * @dev Retrieves a specific block by ID
     * @param id The unique identifier of the block to retrieve
     * @return BlockData The complete block data struct
     */
    function getBlock(uint256 id) public view returns (BlockData memory) {
        require(id < blockCount, "Invalid block ID");
        return blocks[id];
    }
}
