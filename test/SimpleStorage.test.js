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
            await simpleStorage.saveName("Test Name");
            const block = await simpleStorage.getBlock(0);
            
            expect(block.name).to.equal("Test Name");
            expect(block.sum).to.equal(0);
            expect(block.creator).to.equal(owner.address);
        });

        it("Should save name and sum correctly", async function () {
            await simpleStorage.saveNameAndSum("Test Name", 100);
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

        it("Should increment block count correctly", async function () {
            await simpleStorage.saveName("First");
            await simpleStorage.saveNameAndSum("Second", 100);
            await simpleStorage.saveSum(50, 50);

            expect(await simpleStorage.blockCount()).to.equal(3);
        });

        it("Should emit BlockCreated event", async function () {
            await expect(simpleStorage.saveNameAndSum("Test Name", 100))
                .to.emit(simpleStorage, "BlockCreated")
                .withArgs(0, "Test Name", 100, owner.address);
        });
    });

    describe("Getting data", function () {
        it("Should revert when accessing invalid block ID", async function () {
            await expect(simpleStorage.getBlock(0))
                .to.be.revertedWith("Invalid block ID");
        });
    });
}); 