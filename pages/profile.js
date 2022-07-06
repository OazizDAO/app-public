import React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
// import { useDropzone } from "react-dropzone";
import withTransition from "../HOC/withTransition";
import { ethers } from "ethers";
import Spinner from "../components/Spinner";
import styles from "../styles/Mint.module.css";
import erc725Abi from "../artifacts/erc725Abi";
import userManageAbi from "../artifacts/usermanageAbi";
import { AbortController } from "node-abort-controller";
import { Container, Row, Col, Button, Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { skipPartiallyEmittedExpressions } from "typescript";
import Router from "next/router";
import { toHex, truncateAddress } from "../utils/utils";
import Web3Modal from "web3modal";
import { providerOptions } from "../utils/providerOptions";
import { RequestEthereumAccountsResponse } from "@coinbase/wallet-sdk/dist/relay/Web3Response";
import { create, CID, IPFSHTTPClient } from "ipfs-http-client";
global.AbortController = AbortController;
const UserManage = "0x44BDAB155028a02e0223229276CcfFdF1621C011";

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

const web3Modal =
  typeof window !== "undefined" &&
  new Web3Modal({
    cacheProvider: true,
    providerOptions,
  });
const initialAvatars = [
  "https://ipfs.io/ipfs/QmSGADYccdJASJE12tfFzLWyjDWUj7shfdKrM19DYAwhJz/1.png",
  "https://ipfs.io/ipfs/QmSGADYccdJASJE12tfFzLWyjDWUj7shfdKrM19DYAwhJz/2.png",
  "https://ipfs.io/ipfs/QmSGADYccdJASJE12tfFzLWyjDWUj7shfdKrM19DYAwhJz/3.png",
  "https://ipfs.io/ipfs/QmSGADYccdJASJE12tfFzLWyjDWUj7shfdKrM19DYAwhJz/4.png",
  "https://ipfs.io/ipfs/QmSGADYccdJASJE12tfFzLWyjDWUj7shfdKrM19DYAwhJz/5.png",
  "https://ipfs.io/ipfs/QmSGADYccdJASJE12tfFzLWyjDWUj7shfdKrM19DYAwhJz/1.png",
];
const keysFieldsHash = [
  "0x29a36bb22f3c260ddca59a40dffde48863da1d6fba3d1f55dedde5c8e1942577", //Avatar
  "0xc55da378b3897c7aeec303b4fa7eceb3005a395160399831e4be123082c760da", //Username
  "0xf334153f5c7625bf7b72a3d4cfc578934b25ff90f49b6c25f23de292ecdca776", //Email address
  "0x95e794640ff3efd16bfe738f1a9bf2886d166af549121f57d6e14af6b513f45d", //Description
  "0x2c661e9e28ce4219ae3e7e2a26490db6fe227f8b12be39c5710cf8c2d36021a8", //Social media links
];

const fieldNames = [
  "Avatar:",
  "Username:",
  "Email address(optional):",
  "Description:",
  "Social media links:",
];

const MintToken = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState();
  const [library, setLibrary] = useState();
  const [account, setAccount] = useState();
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [network, setNetwork] = useState();
  const [message, setMessage] = useState("");
  const [signedMessage, setSignedMessage] = useState("");
  const [verified, setVerified] = useState();
  const refAnimationInstance = useRef(null);
  const [intervalId, setIntervalId] = useState();
  const [walletAddress, setWalletAddress] = useState("0");
  const [identityName, setIdentityName] = useState("");
  const [identityContractAddress, setIdentityContractAddress] = useState(
    "0x0000000000000000000000000000000000000000"
  );
  const [data, setData] = useState(["", "", "", "", ""]);
  const ipfs = create({
    url: "https://ipfs.infura.io:5001/api/v0",
  });
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const form = event.target;
    const files = form[0].files;

    if (!files || files.length === 0) {
      return alert("No files selected");
    }

    const file = files[0];
    // upload files
    const result = await ipfs.add(file);

    console.log(result.cid.toString());
    console.log(result.path);

    const tempdata = "https://ipfs.infura.io/ipfs/" + result.path;
    setData([tempdata, data[1], data[2], data[3], data[4]]);

    console.log(tempdata);

    form.reset();
  };

  const switchNetwork = async () => {
    // const chainId = "0x89"; // Polygon Mainnet
    const chainId = "0x13881"; // Polygon Testnet

    if (window.ethereum && window.ethereum.networkVersion !== chainId) {
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainId }],
        });
      } catch (err) {
        if (err.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainName: "Polygon Testnet",
                chainId: chainId,
                nativeCurrency: {
                  name: "MATIC",
                  decimals: 18,
                  symbol: "MATIC",
                },
                rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
              },
            ],
          });
        } else {
          setPopUpContent({
            title: "Something went wrong",
            content:
              "Please check you are connected to Polygon Network or contact event organizer to see if your address is in the winner list.",
          });
          setShowPopUp(true);
          return false;
        }
      }
    }
    return true;
  };

  const connectWallet = async () => {
    try {
      setData(["", "", "", "", ""]);
      setWalletAddress("0");
      setIdentityName("");
      web3Modal.clearCachedProvider();
      const provider = await web3Modal.connect();

      const library = new ethers.providers.Web3Provider(provider);
      await switchNetwork();
      const accounts = await library.listAccounts();
      const network = await library.getNetwork();
      const signer = await library.getSigner();
      setProvider(provider);
      setLibrary(library);
      let w_addr;
      if (accounts) {
        w_addr = accounts[0].toString();
      }
      setWalletAddress(w_addr);
      console.log(w_addr);
      let userManageContract = new ethers.Contract(
        UserManage,
        userManageAbi,
        signer
      );

      const ownerAddress = await userManageContract.owner();
      alert(ownerAddress);
      alert(w_addr);
      const identityAddress = await userManageContract.identityContracts(
        w_addr
      );
      setIdentityContractAddress(identityAddress);
      if (identityAddress === "0x0000000000000000000000000000000000000000") {
        alert("you don't have identity contract yet");
        return;
      }
      const identityContract = new ethers.Contract(
        identityAddress,
        erc725Abi,
        signer
      );

      const name1 = await identityContract.name();
      setIdentityName(name1);

      const datas = await identityContract.getData(keysFieldsHash);
      console.log(datas);
      setData(datas);

      // Subscribe to accounts change
      provider.on("accountsChanged", (accounts) => {
        connectWallet();
      });
    } catch (error) {
      alert(error);
    }
  };

  const createIdentity = async () => {
    const provider = library;
    try {
      alert(process.env.PRIVATE_KEY);
      const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      let userManageContract = new ethers.Contract(
        UserManage,
        userManageAbi,
        signer
      );
      setIsLoading(true);
      let tempData0 = data[0].toString();
      if (data[0] === "") {
        const idAvatar = Math.floor(randomInRange(0, 5));
        console.log(idAvatar, "idAvatar ");
        tempData0 = initialAvatars[idAvatar];
        console.log(data);
      }
      let newData = data;
      newData[0] = tempData0.toString();
      console.log(newData);
      await userManageContract.createIdentity(
        keysFieldsHash,
        data,
        walletAddress.toString(),
        { gasLimit: 300000 }
      );
      setData(newData);
      alert("you identity successfully created");
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.log(err);
    }
  };

  const saveIdentity = async () => {
    const provider = library;
    try {
      const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      let identityContract = new ethers.Contract(
        identityContractAddress,
        erc725Abi,
        signer
      );
      setIsLoading(true);
      await identityContract.setData(keysFieldsHash, data);
      setIsLoading(false);
      alert("successfully saved");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalId);
    };
  }, [intervalId]);

  return (
    <>
      {isLoading && <Spinner />}
      <div>
        {walletAddress === "0" ? (
          <Container fluid className={styles.container}>
            <Row className={styles.rowtent}>
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
        ) : (
          <div>
            <button
              onClick={async () => {
                setWalletAddress("0");
                if (provider && provider.close) await provider.close;
                setProvider(null);
                await web3Modal.clearCachedProvider();
                localStorage.removeItem("walletconnect");
                localStorage.removeItem("WALLETCONNECT_DEEPLINK_CHOICE");
              }}
            >
              disconnect
            </button>
            <div>
              Wallet Address :
              <input value={walletAddress} disabled={true}></input>
            </div>
            <div>
              Name :<input value={identityName} disabled={true}></input>
            </div>
            {fieldNames.map((val, index) => {
              if (index == 0) {
                return (
                  <div>
                    <img
                      src={data[index]}
                      style={{
                        width: "100px",
                        borderRadius: "50px",
                      }}
                    ></img>
                    <form onSubmit={onSubmitHandler}>
                      <input name="file" type="file" />

                      <button type="submit">Upload File</button>
                    </form>
                  </div>
                );
              } else {
                return (
                  <div>
                    {val}
                    <input
                      value={data[index]}
                      onChange={(e) => {
                        let arr = [...data];
                        arr[index] = e.target.value;
                        setData(arr);
                      }}
                    ></input>
                  </div>
                );
              }
            })}
            {identityContractAddress ===
            "0x0000000000000000000000000000000000000000" ? (
              <button onClick={createIdentity}>Create Identity</button>
            ) : (
              <>
                <button onClick={saveIdentity}>Save Changes</button>
                <Container fluid className={styles.container}>
                  <Row>{identityContractAddress}</Row>
                </Container>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default withTransition(MintToken);
