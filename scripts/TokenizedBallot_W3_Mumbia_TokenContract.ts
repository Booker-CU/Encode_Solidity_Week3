
import { ethers } from "ethers";
import { MyERC20Votes__factory } from "../typechain-types";


import * as dotenv from 'dotenv'
dotenv.config();

async function main() {

    //Generating Signer

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
    const provider = new ethers.providers.AlchemyProvider("maticmum",process.env.ALCHEMY_API_KEY)

    const signer = wallet.connect(provider)


    const amount = ethers.utils.parseUnits("10");


    //Creating TokenContract
    const tokenContractFactory = new MyERC20Votes__factory(signer);

    //Deploying Token Contract
    const tokenContract = await tokenContractFactory.deploy();
    const tokenContractReceipt = await tokenContract.deployTransaction.wait();

    console.log(`\nThe tokenContract address is ${tokenContract.address} \nand the transaction hash is ${tokenContractReceipt.transactionHash} \n`)



}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
})