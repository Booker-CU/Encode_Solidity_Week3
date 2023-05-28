
import { ethers } from "ethers";
import { MyERC20Votes__factory } from "../typechain-types";


import * as dotenv from 'dotenv'
dotenv.config();

async function main() {

    //Generating Signer

    const wallet = new ethers.Wallet(process.env.YOUR_PRIVATE_KEY ?? "");
    const provider = new ethers.providers.AlchemyProvider("maticmum",process.env.YOUR_ALCHEMY_API_KEY)

    const signer = wallet.connect(provider)

    const amount = ethers.utils.parseUnits("10");

    //Attach TokenContract (Polygon Mumbia)
    const tokenContractAddress = "0x0936Be36ACd102CC7AF17Df760ca390f69891a17";
    const tokenContractFactory = new MyERC20Votes__factory(signer);

    const tokenContract = tokenContractFactory.attach(tokenContractAddress)
    console.log(`\nTokenContract address is ${tokenContract.address} \n`)

    //Minting Tokens
    const mintTX = await tokenContract.mint(signer.address, amount)
    const mintTxReceipt = await mintTX.wait()

    console.log(`\nAccount 1 ${signer.address} has minted tokens,\nand the receipt hash is  ${mintTxReceipt.transactionHash}`)

    const balanceBN = await tokenContract.balanceOf(signer.address)
    console.log(`Account1 has a balance of ${ethers.utils.formatUnits(balanceBN)}`)

    //Delegating Tokens
    const delegateTXAcc1 = await tokenContract.connect(signer).delegate(signer.address)
    await delegateTXAcc1.wait()

    const delegatedVotesAfterAcc1 = await tokenContract.getVotes(signer.address)
    console.log(`After delegating votes account ${signer.address} has ${ethers.utils.formatUnits(delegatedVotesAfterAcc1)} \n`)

}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
})
