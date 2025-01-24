const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleStorage", function () {
    let simpleStorage;
    let owner;
    let addr1;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
        simpleStorage = await SimpleStorage.deploy();
    });

    describe("Saving data", function () {
        it("Should save name correctly", async function () {
            await simpleStorage.saveName("Test Name", 100);
            const block = await simpleStorage.getBlock(0);
            
            expect(block.name).to.equal("Test Name");
            expect(block.sum).to.equal(100);
            expect(block.creator).to.equal(owner.address);
        });

        it("Should save sum correctly", async function () {
            await simpleStorage.saveSum(50, 50);
            const block = await simpleStorage.getBlock(0);
            
            expect(block.name).to.equal("");
            expect(block.sum).to.equal(100);
            expect(block.creator).to.equal(owner.address);
        });
    });
}); 