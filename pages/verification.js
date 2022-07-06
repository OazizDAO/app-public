import React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import withTransition from "../HOC/withTransition";
import { ethers, utils } from "ethers";
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
import axios from "axios";
import { GoogleSpreadsheet } from "google-spreadsheet";
global.AbortController = AbortController;
const UserManage = "0x44BDAB155028a02e0223229276CcfFdF1621C011";
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_ID = process.env.SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_SERVICE_PRIVATE_KEY = process.env.GOOGLE_SERVICE_PRIVATE_KEY;

const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

const appendSpreadsheet = async (row) => {
  try {
    await doc.useServiceAccountAuth({
      client_email: CLIENT_EMAIL,
      private_key: GOOGLE_SERVICE_PRIVATE_KEY.replace(/\n/g, "\n"),
    });
    console.log("auth done");
    // loads document properties and worksheets
    await doc.loadInfo();

    const sheet = doc.sheetsById[SHEET_ID];
    const result = await sheet.addRow(row);
  } catch (e) {
    console.error("Error: ", e);
  }
};

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

const web3Modal =
  typeof window !== "undefined" &&
  new Web3Modal({
    cacheProvider: true,
    providerOptions,
  });
const keysFieldsHash = [
  "0xccecd333818f978cc7d73d78f7cf5106efe28b6bd5edefa86b992f8502cf3557", //Event Count
];
// "Event Count"
const fieldNames = [
  "Event Name*",
  "Your email*",
  "Social media link*",
  "Why do you want to mint NFTs?*",
  "How many NFTs would you like to mint?*",
  "How often are you going to mint NFTS?*",
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
  const [eventCount, setEventCount] = useState("0");
  const [data, setData] = useState(["", "", "", "", "", ""]);
  const [currentEventIndex, setCurrentEventIndex] = useState(1);
  const ipfs = create({
    url: "https://ipfs.infura.io:5001/api/v0",
  });

  const keccak256Generator = (data) => {
    return utils.keccak256(utils.toUtf8Bytes(data)).toString();
  };

  const checkVerification = async (w_addr) => {
    try {
      await doc.useServiceAccountAuth({
        client_email: CLIENT_EMAIL,
        private_key: GOOGLE_SERVICE_PRIVATE_KEY.replace(/\n/g, "\n"),
      });
      console.log("auth done");
      // loads document properties and worksheets
      await doc.loadInfo();

      const sheet = doc.sheetsById[SHEET_ID];
      const rows = await sheet.getRows();
      for (let i = 0; i < rows.length; i++) {
        const rowData = rows[i];
        console.log(rowData._rawData[0]);
        if (rowData._rawData[0] === w_addr) {
          if (rowData._rawData[7] === "TRUE") {
            return 1;
          }
          return 2;
        }
      }
      return 0;
    } catch (e) {
      console.error("Error: ", e);
      return 0;
    }
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
      setData(["", "", "", "", "", ""]);
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
      // Subscribe to accounts change

      const datas = await identityContract.getData(keysFieldsHash);
      setEventCount(datas[0] === "" ? "0" : datas[0]);
      if (datas[0] !== "" && datas[0] !== "0") {
        if (datas[0] !== "1") {
          alert("This is only required for the first time");
          return;
        }
      }

      const isVerified = await checkVerification(w_addr);
      console.log(isVerified);
      if (isVerified == 1) {
        alert("You are already verified");
        // router.push("/event-creation");
      } else if (isVerified == 2) {
        alert("your verification under process, wait please");
      }
      provider.on("accountsChanged", (accounts) => {
        connectWallet();
      });
    } catch (error) {
      alert(error);
      console.log(error);
    }
  };

  const sendRequest = async () => {
    try {
      console.log(data);
      const newRow = {
        "Metamask Address": walletAddress,
        "Event name": data[0],
        Email: data[1],
        "Link to social media": data[2],
        "Why do you want to mint NFTs": data[3],
        "How many NFTs do you want to mint": data[4],
        "How often are you going to mint NFTs": data[5],
        Approved: "false",
      };
      setIsLoading(true);
      const isVerified = await checkVerification(walletAddress);
      if (isVerified == 0) await appendSpreadsheet(newRow);
      else alert("You already have verification");
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

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
            })}
            {identityContractAddress ===
            "0x0000000000000000000000000000000000000000" ? (
              <div>You should create identity contract first</div>
            ) : (
              <>
                <button onClick={sendRequest}>Send Request</button>
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
