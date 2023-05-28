import { ethers } from "ethers";
import { MyERC20Votes__factory, TokenizedBallot__factory } from "../typechain-types";


import * as dotenv from 'dotenv'
dotenv.config();

async function main() {

    //Generating Signer

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
    const provider = new ethers.providers.AlchemyProvider("maticmum",process.env.ALCHEMY_API_KEY)

    const signer = wallet.connect(provider)

    const amount = ethers.utils.parseUnits("10");

    //Attach TokenContract (Polygon Mumbia)
    const tokenContractAddress = "0x0936Be36ACd102CC7AF17Df760ca390f69891a17";
    const tokenContractFactory = new MyERC20Votes__factory(signer);

    const tokenContract = tokenContractFactory.attach(tokenContractAddress)
    console.log(`\nTokenContract address is ${tokenContract.address} \n`)

    //Account 3 address 0xA181786c73F49A25EE8cD40b9b9Cd31b4cAe711B

    //Creating TokenizedBallot
    const tokenizedBallotFactory = new TokenizedBallot__factory(signer)


    const proposals = process.argv.slice(2);
    console.log("Deploying TokenizedBallot contract\n");
    console.log("Proposals: ");
    proposals.forEach((element, index) => {
        console.log(`Proposal N. ${index + 1}: ${element}`);
    });

    const targetBlockNumber = await provider.getBlockNumber();

    const tokenizedBallot = await tokenizedBallotFactory.deploy(
        proposals.map(ethers.utils.formatBytes32String),
        tokenContract.address,
        targetBlockNumber
    )

    const tokenizedBallotReceipt = await tokenizedBallot.deployTransaction.wait()
    console.log(`The address for the Token Ballot contract is ${tokenizedBallot.address} \nand the transaction receipt is ${tokenizedBallotReceipt.transactionHash}\n`)
    console.log(`\nBlock Number ${targetBlockNumber} \n`)



    const getPastVotesAcc1 = await tokenContract.getPastVotes(signer.address, targetBlockNumber)
    console.log(`Past votes for Account 1 ${ethers.utils.formatUnits(getPastVotesAcc1)}`)


    const votingPowerAcc1 = await tokenizedBallot.votingPower(signer.address)
    console.log(`Voting power for Account 1 is ${ethers.utils.formatUnits(votingPowerAcc1)}`)

    const voteAcc1 = await tokenizedBallot.connect(signer).vote(2,ethers.utils.parseUnits("1"))
    await voteAcc1.wait()

    const votingPowerSpentAcc1_After_V = await tokenizedBallot.votingPowerSpent(signer.address)
    console.log(`Voting power spent for Account 1 is ${ethers.utils.formatUnits(votingPowerSpentAcc1_After_V)}`)

    const winningProposal = await tokenizedBallot.winningProposal()
    console.log(`The winning proposal so far is ${winningProposal}`)

}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
})