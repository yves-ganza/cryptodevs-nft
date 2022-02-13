import { Contract, ethers, utils, providers } from 'ethers'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { abi, NFT_CONTRACT_ADDRESS, WHITELIST_CONTRACT_ADDRESS} from '../constants'
import Web3Modal from 'web3modal'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [whitelisted, setWhitelisted] = useState(false)
  const [presaleStarted, setPresaleStarted] = useState(false)
  const [presaleEnded, setPresaleEnded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isOwner, setIsOwner] = useState(false)
  const [tokenIdsMinted, setTokenIdsMinted] = useState('0')
  const web3ModalRef = useRef()

  const connectWallet = async () => {
    try {
      await getProviderOrSigner()
      setWalletConnected(true)
      setError('')
    } catch (error) {
      console.log(error)
      setError('Failed to connect to wallet!')
    }
  }

  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      setError("Change network to Rinkeby");
      return
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  //TODO
  const checkIfWhitelisted = async () => {
    const provider = await getProviderOrSigner()
  }

  const presaleMint = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const contract = new Contract(
        NFT_CONTRACT_ADDRESS, abi, signer
      )

      const tx = await contract.presaleMint({value: utils.parseEther('0.01')})
      setLoading(true)
      await tx.wait()
      setLoading(false)
      setError('')
      window.alert('You have successfully minted a CryptoDev!')
    } catch (error) {
      console.log(error)
      setError('Presale Mint operation failed!')
    }
  }

  const publicMint = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const contract = new Contract(
        NFT_CONTRACT_ADDRESS, abi, signer
      )

      const tx = await contract.mint({value: utils.parseEther('0.01')})
      setLoading(true)
      await tx.wait()
      setLoading(false)
      setError('')
      window.alert('You have successfully minted a CryptoDev!')
    } catch (error) {
      console.log(error)
      setError('Public Mint operation failed!')
    }
  }

  const startPresale = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const contract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer)
  
      const tx = await contract.startPresale()
      setLoading(true)
      await tx.wait()
      setLoading(false)
      presaleStarted(true)
      setError('')
    } catch (error) {
      console.log(error)
      setError('Starting Presale failed!')
    }

  }

  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner()
      const contract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider)

      const _presaleStarted = await contract.presaleStarted()
      if(!_presaleStarted){
        await getOwner()
      }
      setPresaleStarted(_presaleStarted)
      return _presaleStarted
    }catch(error){
      console.log(error)
    }
  }

  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner()
      const contract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider)

      const _presaleEnded = await contract.presaleEnded()
      const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000))
      setPresaleEnded(hasEnded)
      return hasEnded
    } catch (error) {
      console.log(error)
    }
  }

  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner()
      const contract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider)
      
      const _owner = await contract.owner()
      
      const signer = await getProviderOrSigner(true)
      const address = await signer.getAddress()
  
      if(address.toLowerCase() === _owner.toLowerCase()){
        setIsOwner(true)
      }
      else{
        setIsOwner(false)
      }
      
    } catch (error) {
      console.log(error)
    }
  }

  const getTokensMinted = async () => {
    try {
      const provider = await getProviderOrSigner()
      const contract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider)
  
      const _tokensMinted = await contract.tokenIds()
      setTokenIdsMinted(_tokensMinted.toString())
      
    } catch (error) {
      console.log(error)
    }
  }

  const renderButton = () => {
    if(!walletConnected){
      return (
        <button className={styles.button} onClick={connectWallet}>
          Connect Wallet
        </button>
      )
    }

    if(loading){
      return(
        <div className={styles.button}>
          Loading...
        </div>
      )
    }

    if(isOwner && !presaleStarted){
      return(
        <button className={styles.button} onClick={startPresale}>
          Start presale
        </button>
      )
    }

    if(!presaleStarted){
      return(
        <div>
          <div className={styles.description}>Presale hasn&apos;t started yet!</div>
        </div>
      )
    }

    if(presaleStarted && !presaleEnded){
      return(
        <div>
          <div className={styles.description}>Presale has started!!! If your address is whitelisted, Mint a CryptoDev</div>
          <button className={styles.button} onClick={presaleMint}>Presale Mint 🚀</button>
        </div>
      )
    }

    if(presaleStarted && presaleEnded){
      return(
        <button className={styles.button} onClick={publicMint}>Public Mint 🚀</button>
      )
    }
  }

  const errorAlert = () => {
    if(error){
      return (
        <div className={styles.alert}>
          {error}
        </div>
      )
    }

    return('')
  }

  useEffect(() => {
    if(!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network: 'rinkeby',
        providerOptions: {},
        disableInjectedProvider: false
      })

      connectWallet()

      const _presaleStarted = checkIfPresaleStarted()
      if(_presaleStarted){
        checkIfPresaleEnded()
      }

      getTokensMinted()

      const presaleEndedInterval = setInterval(async () => {
        const _presaleStarted = await checkIfPresaleStarted()
        if(_presaleStarted){
          const _presaleEnded = await checkIfPresaleEnded()
          if(_presaleEnded){
            setPresaleEnded(true)
            clearInterval(presaleEndedInterval)
          }
        }
      }, 5 * 1000)

      setInterval(async () => {
        await getTokensMinted()
      }, 5 * 1000)

    }
  }, [walletConnected])
  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        {errorAlert()}
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/20 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./cryptodevs/0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto YG
      </footer>
    </div>
  )
}
