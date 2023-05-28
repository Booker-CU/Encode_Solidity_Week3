import {ethers } from "hardhat"
import { MyERC20Votes__factory } from "../typechain-types";

const MINT_AMOUNT = ethers.utils.parseUnits("10");

async function main() {

    // Creating Signers and new instance of smart contract
    const [deployer, acc1, acc2 ] = await ethers.getSigners();
    const contractFactory = new MyERC20Votes__factory(deployer);

    // Verifing contract was deployed
    const contract = await contractFactory.deploy();
    const receipt = await contract.deployTransaction.wait();

    console.log (`\nThis contract was deployed at ${contract.address} and at block ${receipt.blockNumber} \n`)

    const mintTx = await contract.mint(acc1.address,MINT_AMOUNT);
    const mintTxReceipt = await mintTx.wait();

    console.log(`Minted ${ethers.utils.formatUnits(MINT_AMOUNT)} to the address of ${acc1.address} at block ${mintTxReceipt.blockNumber} \n` )

    const balanceBN = await contract.balanceOf(acc1.address)
    console.log(`Account ${acc1.address} has a balance of ${ethers.utils.formatUnits(balanceBN)} \n`)

    const votesBefore = await contract.getVotes(acc1.address);
    console.log(`Votes for address ${acc1.address} are ${ethers.utils.formatUnits(votesBefore)} before delegating \n`)

    const delegateTx = await contract.connect(acc1).delegate(acc1.address);
    await delegateTx.wait();

    const votesAfter = await contract.getVotes(acc1.address)
    console.log(`After delegating votes account ${acc1.address} has ${ethers.utils.formatUnits(votesAfter)} \n`)

    const transferTx = await contract
        .connect(acc1)
        .transfer(acc2.address, MINT_AMOUNT.div(2))
    await transferTx.wait()

    const votes1AfterTransfer = await contract.getVotes(acc1.address)
    console.log(`Account 1 ${acc1.address} votes after transfer is ${ethers.utils.formatUnits(votes1AfterTransfer)} \n`)

    const votes2AfterTransfer = await contract.getVotes(acc2.address)
    console.log(`Account 2 ${acc2.address} votes after transfer is ${ethers.utils.formatUnits(votes2AfterTransfer)}\n`)

    const delegateAccount2Tx = await contract.connect(acc2).delegate(acc2.address);
    await delegateAccount2Tx.wait();

    const getVotesAccount2 = await contract.getVotes(acc2.address);
    console.log(`Votes for Account 2 ${acc2.address} are ${ethers.utils.formatUnits(getVotesAccount2)} \n`)

    const lastBlock = await ethers.provider.getBlock("latest");
    console.log(`The current block number is ${lastBlock.number} \n`)

    let pastVotes = await contract.getPastVotes(acc1.address, lastBlock.number - 1)
    console.log(`Account ${acc2.address} has ${ethers.utils.formatUnits(pastVotes)} units of voting power after transfer`)
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
})