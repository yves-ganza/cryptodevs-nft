const {ethers} = require('hardhat')
require('dotenv').config({path: '.env'})
const {WHITELIST_CONTRACT_ADDRESS, METADATA_URL} = require('../client/constants')

async function main(){
    const contractFactory = await ethers.getContractFactory('CryptoDevs')

    const deployedCryptoDevContract = await contractFactory.deploy(
        METADATA_URL,
        WHITELIST_CONTRACT_ADDRESS
    )

    console.log('Deploying...')
    await deployedCryptoDevContract.deployed()
    console.log('CryptoDev contract address ', deployedCryptoDevContract.address)
}

main().then(() => process.exit(0))
.catch(e => {
    console.log(e)
    process.exit(1)
})