// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    struct BlockData {
        uint256 id;
        string name;
        uint256 sum;
        address creator;
    }

    BlockData[] public blocks;
    uint256 public blockCount = 0;

    event BlockCreated(
        uint256 id,
        string name,
        uint256 sum,
        address indexed creator
    );

    function saveName(string calldata name) public {
        blocks.push(BlockData(blockCount, name, 0, msg.sender));
        emit BlockCreated(blockCount, name, 0, msg.sender);
        blockCount++;
    }

    function saveNameAndSum(string calldata name, uint256 sum) public {
        blocks.push(BlockData(blockCount, name, sum, msg.sender));
        emit BlockCreated(blockCount, name, sum, msg.sender);
        blockCount++;
    }

    function saveSum(uint256 num1, uint256 num2) public {
        uint256 sum = num1 + num2;
        blocks.push(BlockData(blockCount, "", sum, msg.sender));
        emit BlockCreated(blockCount, "", sum, msg.sender);
        blockCount++;
    }

    function getBlock(uint256 id) public view returns (BlockData memory) {
        require(id < blockCount, "Invalid block ID");
        return blocks[id];
    }
}
