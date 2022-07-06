import React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import withTransition from "../HOC/withTransition";
import styles from "../styles/Mint.module.css";
import { AbortController } from "node-abort-controller";
import { Container, Row, Col, Button, Carousel, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-notifications/lib/notifications.css";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { providerOptions } from "../utils/providerOptions";
import { toHex, truncateAddress } from "../utils/utils";
import { networkParams } from "../utils/network";

global.AbortController = AbortController;

// const ERC1155 = "0x62099B08eA34a62876Dec559331a9c097818Fd7c"; // mainnet

const ERC1155 = "0x7297A334D80214D11132d0fbEB3704A6Ad18AeF8"; // mainnet
// const ERC1155 = "0x235Ea790c5ADae735438a90e306e048BCF3bDE58"; // testnet

const WalletConTest = () => {
  const [provider, setProvider] = useState();
  const [library, setLibrary] = useState();
  const [account, setAccount] = useState();
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [chainId, setChainId] = useState();
  const [network, setNetwork] = useState();
  const [message, setMessage] = useState("");
  const [signedMessage, setSignedMessage] = useState("");
  const [verified, setVerified] = useState();
  let web3Modal;

  const connectWallet = async () => {
    try {
      web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions, // required
      });
      const provider = await web3Modal.connect();
      const library = new ethers.providers.Web3Provider(provider);
      await switchNetwork();
      const accounts = await library.listAccounts();
      const network = await library.getNetwork();
      setProvider(provider);
      setLibrary(library);
      if (accounts) {
        setAccount(accounts[0]);
        alert(accounts[0]);
      }
      setChainId(network.chainId);
    } catch (error) {
      // alert(error);
      setError(error);
    }
  };

  const handleNetwork = (e) => {
    const id = e.target.value;
    setNetwork(Number(id));
  };

  const handleInput = (e) => {
    const msg = e.target.value;
    setMessage(msg);
  };

  const switchNetwork = async () => {
    try {
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x89" }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await library.provider.request({
            method: "wallet_addEthereumChain",
            params: [networkParams["0x89"]],
          });
        } catch (error) {
          setError(error);
        }
      }
    }
  };

  const signMessage = async () => {
    if (!library) return;
    try {
      const signature = await library.provider.request({
        method: "personal_sign",
        params: [message, account],
      });
      setSignedMessage(message);
      setSignature(signature);
    } catch (error) {
      setError(error);
    }
  };

  const verifyMessage = async () => {
    if (!library) return;
    try {
      const verify = await library.provider.request({
        method: "personal_ecRecover",
        params: [signedMessage, signature],
      });
      setVerified(verify === account.toLowerCase());
    } catch (error) {
      setError(error);
    }
  };

  const refreshState = () => {
    setAccount();
    setChainId();
    setNetwork("");
    setMessage("");
    setSignature("");
    setVerified(undefined);
  };

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    refreshState();
  };

  useEffect(() => {
    if (typeof web3Modal !== "undefined" && web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts) => {
        console.log("accountsChanged", accounts);
        if (accounts) setAccount(accounts[0]);
      };

      const handleChainChanged = (_hexChainId) => {
        setChainId(_hexChainId);
      };

      const handleDisconnect = () => {
        console.log("disconnect", error);
        disconnect();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider]);

  return (
    <>
      <div style={{ backgroundColor: "black" }}>
        <Container fluid className={styles.container}>
          <Row className={styles.rowtenti}>
            <Col className={styles.signin} sm={4}>
              <p>Sign in</p>
            </Col>
            <Col className={styles.message} sm={4}>
              <p>Connect your wallet to log in</p>
            </Col>
            <Col sm={4}>
              <img
                src={"./metamaskButton1.png"}
                type="button"
                onClick={connectWallet}
                className={styles.imgBtn}
              />
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default withTransition(WalletConTest);
