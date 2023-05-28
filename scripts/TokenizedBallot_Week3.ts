import {ethers } from "hardhat"
import { MyERC20Votes__factory, TokenizedBallot, TokenizedBallot__factory } from "../typechain-types";




async function main() {

    //Generating Signers

    const [deployer, acc1, acc2 ] = await ethers.getSigners();
    const amount = ethers.utils.parseUnits("10");


    //Creating TokenContract
    const tokenContractFactory = new MyERC20Votes__factory(deployer);

    //Deploying Token Contract
    const tokenContract = await tokenContractFactory.deploy();
    const tokenContractReceipt = await tokenContract.deployTransaction.wait();

    console.log(`\nThe tokenContract address is ${tokenContract.address} \nand the transaction hash is ${tokenContractReceipt.transactionHash} \n`)

    //Minting Tokens
    const mintTX = await tokenContract.mint(acc1.address, amount)
    const mintTxReceipt = await mintTX.wait()

    console.log(`\nAccount 1 ${acc1.address} has minted tokens,\nand the receipt hash is  ${mintTxReceipt.transactionHash}`)

    const balanceBN = await tokenContract.balanceOf(acc1.address)
    console.log(`Account1 has a balance of ${ethers.utils.formatUnits(balanceBN)}`)

    //Delegating Tokens
    const delegateTXAcc1 = await tokenContract.connect(acc1).delegate(acc1.address)
    await delegateTXAcc1.wait()

    const delegatedVotesAfterAcc1 = await tokenContract.getVotes(acc1.address)
    console.log(`After delegating votes account ${acc1.address} has ${ethers.utils.formatUnits(delegatedVotesAfterAcc1)} \n`)



    //Creating TokenizedBallot
    const tokenizedBallotFactory = new TokenizedBallot__factory(deployer)


    const proposals = process.argv.slice(2);
    console.log("Deploying TokenizedBallot contract\n");
    console.log("Proposals: ");
    proposals.forEach((element, index) => {
        console.log(`Proposal N. ${index + 1}: ${element}`);
    });

    const targetBlockNumber = await ethers.provider.getBlockNumber()

    const tokenizedBallot = await tokenizedBallotFactory.deploy(
        proposals.map(ethers.utils.formatBytes32String),
        tokenContract.address,
        targetBlockNumber
    )

    const tokenizedBallotReceipt = await tokenizedBallot.deployTransaction.wait()
    console.log(`The address for the Token Ballot contract is ${tokenizedBallot.address} \nand the transaction receipt is ${tokenizedBallotReceipt.transactionHash}\n`)
    console.log(`\nBlock Number ${targetBlockNumber} \n`)

    const getPastVotesAcc1 = await tokenContract.getPastVotes(acc1.address, targetBlockNumber)
    console.log(`Past votes for Account 1 ${ethers.utils.formatUnits(getPastVotesAcc1)}`)


    const votingPowerAcc1 = await tokenizedBallot.votingPower(acc1.address)
    console.log(`Voting power for Account 1 is ${ethers.utils.formatUnits(votingPowerAcc1)}`)

    const voteAcc1 = await tokenizedBallot.connect(acc1).vote(2,ethers.utils.parseUnits("1"))
    await voteAcc1.wait()

    const votingPowerSpentAcc1_After_V = await tokenizedBallot.votingPowerSpent(acc1.address)
    console.log(`Voting power spent for Account 1 is ${ethers.utils.formatUnits(votingPowerSpentAcc1_After_V)}`)

    const winningProposal = await tokenizedBallot.winningProposal()
    console.log(`The winning proposal so far is ${winningProposal}`)


}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
})