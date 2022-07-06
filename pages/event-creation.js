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
import mapboxgl from "!mapbox-gl";
global.AbortController = AbortController;
const UserManage = "0x44BDAB155028a02e0223229276CcfFdF1621C011";
mapboxgl.accessToken = process.env.MAPBOX_TOKEN;

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
  "0xccecd333818f978cc7d73d78f7cf5106efe28b6bd5edefa86b992f8502cf3557", //Event Count
];
// "Event Count"
const fieldNames = [
  "Avatar",
  "Event Name",
  "Description",
  "Banner",
  "Time & Date",
  "Online Location Link",
  "Offline location",
  "Discord",
  "Twitter",
  "Website",
];

const MintToken = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);

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
  const [data, setData] = useState(["", "", "", "", "", "", "", "", "", ""]);
  const [eventData, setEventData] = useState({});
  const [currentEventIndex, setCurrentEventIndex] = useState(1);
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
    setData([
      tempdata,
      data[1],
      data[2],
      data[3],
      data[4],
      data[5],
      data[6],
      data[7],
      data[8],
      data[9],
    ]);

    console.log(tempdata);

    form.reset();
  };

  const keccak256Generator = (data) => {
    return utils.keccak256(utils.toUtf8Bytes(data)).toString();
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
      setData(["", "", "", "", "", "", "", "", "", ""]);
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
      setEventCount(datas[0] === "" ? "0" : datas[0]);
      if (datas[0] !== "" && datas[0] !== "0") {
        let resultOFEventData = [];
        let i;
        for (i = 1; i <= parseInt(datas[0]); i++) {
          const hashField = keccak256Generator("Event" + i);
          const eventIpfsLink = await identityContract.getData([hashField]);
          const dataResult = await axios.get(eventIpfsLink[0]);
          resultOFEventData[i] = dataResult.data;
          console.log(resultOFEventData[i]);
        }
        setEventData(resultOFEventData);
        const toSetData = fieldNames.map((val, index) => {
          return resultOFEventData[currentEventIndex][val];
        });
        setData(toSetData);
        setTimeout(() => {
          map.current.flyTo({
            center: [toSetData[6]["Longitude"], toSetData[6]["Latitude"]],
          });
          map.current.setZoom(toSetData[6]["Zoom"]);
        }, 500);
      }
      // Subscribe to accounts change
      provider.on("accountsChanged", (accounts) => {
        connectWallet();
      });
    } catch (error) {
      alert(error);
      console.log(error);
    }
  };

  const eventDataUploadToIpfs = async () => {
    const uploadData = JSON.stringify({
      Avatar: data[0],
      "Event Name": data[1],
      Description: data[2],
      Banner: data[3],
      "Time & Date": data[4],
      "Online Location Link": data[5],
      "Offline location": data[6],
      Discord: data[7],
      Twitter: data[8],
      Website: data[9],
    });
    const result = await ipfs.add(uploadData);

    return "https://ipfs.infura.io/ipfs/" + result.path;
  };
  const createEvent = async () => {
    const provider = library;
    try {
      const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      let identityContract = new ethers.Contract(
        identityContractAddress,
        erc725Abi,
        signer
      );
      setIsLoading(true);
      const hashField = keccak256Generator("Event1");
      const resultPath = await eventDataUploadToIpfs();
      console.log(resultPath);
      const eventSaveCount = (parseInt(eventCount) + 1).toString();
      await identityContract.setData(
        ["0xccecd333818f978cc7d73d78f7cf5106efe28b6bd5edefa86b992f8502cf3557"],
        [eventSaveCount]
      );
      setEventCount(eventSaveCount);
      setTimeout(async function () {
        //your code to be executed after 5 second

        await identityContract.setData([hashField], [resultPath]);
        setIsLoading(false);
      }, 20000);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };
  const saveEventChange = async () => {
    const provider = library;
    try {
      const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      let identityContract = new ethers.Contract(
        identityContractAddress,
        erc725Abi,
        signer
      );
      setIsLoading(true);
      const hashField = keccak256Generator("Event1");
      const resultPath = await eventDataUploadToIpfs();
      console.log(resultPath);
      await identityContract.setData([hashField], [resultPath]);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    return () => {
      clearInterval(intervalId);
    };
  }, [intervalId]);

  useEffect(() => {
    if (map?.current || !mapContainer?.current) return; // initialize map only once
    if (typeof window === "undefined") return;
    // mapContainer = React.createRef();
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
      attributionControl: false,
    });
  }, [map?.current, mapContainer?.current]);

  useEffect(() => {
    if (!map?.current) return; // wait for map to initialize
    if (typeof window === "undefined") return;
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
      let tempData = [...data];
      tempData[6] = {
        Longitude: map.current.getCenter().lng.toFixed(4),
        Latitude: map.current.getCenter().lat.toFixed(4),
        Zoom: map.current.getZoom().toFixed(2),
      };
      setData(tempData);
    });
  }, [map?.current, data]);

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
              } else if (val === "Offline location") {
                return (
                  <div>
                    <div className="mapbarForInfo">
                      Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
                    </div>
                    <div ref={mapContainer} className="map-container" />
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
              <div>You should create identity contract first</div>
            ) : (
              <>
                <button onClick={createEvent}>Create Event</button>
                <button onClick={saveEventChange}>Save Changes</button>
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
