import React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import withTransition from "../HOC/withTransition";
import { ethers } from "ethers";
import Spinner from "../components/Spinner";
import TokenFactory from "../artifacts/contracts/Oaziz1135.sol/OAZIZ.json";
import styles from "../styles/Mint.module.css";
import { AbortController } from "node-abort-controller";
import truncateEthAddress from "truncate-eth-address";
import { Container, Row, Col, Button, Carousel, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-notifications/lib/notifications.css";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
global.AbortController = AbortController;

// const ERC1155 = "0x62099B08eA34a62876Dec559331a9c097818Fd7c"; // mainnet

const ERC1155 = "0x7297A334D80214D11132d0fbEB3704A6Ad18AeF8"; // mainnet
// const ERC1155 = "0x235Ea790c5ADae735438a90e306e048BCF3bDE58"; // testnet

const ClaimingPage = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isWhitelisted, setIsWhitelisted] = useState(true);
  const [ownedTokens, setOwnedTokens] = useState([]);
  const [remainingMintNumber, setRemainingMintNumber] = useState(0);
  const [ownedTokenNumber, setOwnedTokenNumber] = useState(0);
  const [assetDetalOpen, openAssetDetal] = useState(true);
  const [isSignedIn, setSignedIn] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const [popupContent, setPopUpContent] = useState({ title: "", content: "" });

  const switchNetwork = async () => {
    const chainId = "0x89"; // Polygon Mainnet
    // const chainId = "0x13881"; // Polygon Testnet

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
                chainName: "Polygon Mainnet",
                chainId: chainId,
                nativeCurrency: {
                  name: "MATIC",
                  decimals: 18,
                  symbol: "MATIC",
                },
                rpcUrls: ["https://polygon-rpc.com/"],
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
    setSignedIn(false);
    if (!window.ethereum) {
      setPopUpContent({
        title: "Something went wrong",
        content: "Please install metamask",
      });
      setShowPopUp(true);
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const w_addr = (await signer.getAddress()).toString();
      setWalletAddress(w_addr);

      const isPolygonNetwork = await switchNetwork();
      if (isPolygonNetwork === false) return;
      let contract = new ethers.Contract(ERC1155, TokenFactory.abi, signer);

      let res = await contract.whitelists(w_addr.toString());
      setIsWhitelisted(res > 0);
      if (res.toString() === "0") {
        setPopUpContent({
          title: "You are not in the winner list",
          content:
            "Please check your wallet address or contact the event organizer",
        });
        setShowPopUp(true);
        return;
      }

      setSignedIn(true);
      let resBalance = await contract.balancesOfAddress(w_addr);

      setOwnedTokenNumber(resBalance.toString());

      //      setShowMintButton(res > resBalance);
      if (res > resBalance) {
        setRemainingMintNumber(res - resBalance);
      }

      if (parseInt(resBalance) > 0) {
        let receipt = await Promise.allSettled(
          new Array(parseInt(resBalance.toString()))
            .fill(0)
            .map((_, index) => contract.balanceOwns(w_addr, index))
        );

        const urls = await Promise.all(
          receipt.map(async (r) => {
            const val = parseInt(r.value.toString()) + 1;

            return {
              image: "./tickets/" + val + ".jpg",
              id: val,
            };
          })
        );
        setOwnedTokens(urls);
      }
    } catch (err) {
      console.log(err);
      // alert(err);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", function (accounts) {
        // Time to reload your interface with accounts[0]!
        connectWallet();
      });
    }
  }, []);

  return (
    <>
      <div style={{ backgroundColor: "black" }}>
        {isSignedIn === false ? (
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
        ) : (
          <Container className={styles.event}>
            <Row className={styles.rowtent}>
              <Col sm={5} align="center" style={{ position: "relative" }}>
                {ownedTokens.length && (
                  <Carousel
                    className={styles.carousel}
                    controls={ownedTokens.length > 1}
                    indicators={false}
                  >
                    {ownedTokens.map((ownedToken, index) => {
                      const { image, id } = ownedToken;
                      // alert("image should show");
                      if (image) {
                        return (
                          <Carousel.Item
                            style={{
                              backgroundColor: "rgb(20,20,20)",
                            }}
                          >
                            <a
                              href={image}
                              download
                              style={{
                                position: "absolute",
                                top: "20px",
                                right: "50px",
                                color: "white",
                                zIndex: "10",
                                cursor: "pointer",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="40px"
                                height="40px"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="white"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                              </svg>
                            </a>
                            <img
                              className={styles.img}
                              src={image}
                              alt="ticket"
                              loading="lazy"
                            />
                          </Carousel.Item>
                        );
                      }
                    })}
                  </Carousel>
                )}
                <div
                  style={{
                    position: "relative",
                    color: "gray",
                    fontWeight: "700",
                    fontSize: "30px",
                    marginBottom: "30px",
                    cursor: "pointer",
                    marginTop: "30px",
                  }}
                  onClick={() => openAssetDetal(!assetDetalOpen)}
                  align="left"
                >
                  Asset details
                  <div
                    className="arrow-up"
                    style={{
                      transform: `rotate(${assetDetalOpen ? "90" : "-90"}deg)`,
                      transition: "transform 0.3s",
                    }}
                  >
                    {"<"}
                  </div>
                </div>
                <div
                  className={`${
                    assetDetalOpen
                      ? "asset_drop-down"
                      : "asset_hidden_drop-down"
                  }`}
                  style={{ position: "relative", overflow: "hidden" }}
                >
                  <div className="" align="left">
                    <p className={styles.title}>Token standard</p>
                    <p className={styles.desc}>ERC1155</p>
                    <p className={styles.title}>Network</p>
                    <p className={styles.desc}>Polygon</p>
                    <a
                      className={styles.title}
                      style={{ color: "blue" }}
                      href={
                        "https://polygonscan.com/token/0xf802ad1580e5bc963862a85ee85156b62241832a?a=" +
                        walletAddress
                      }
                    >
                      Transaction(s) details link
                    </a>
                  </div>
                </div>
              </Col>

              <Col md={{ span: 6, offset: 1 }}>
                <h1 className={styles.head}>BlockShow Festival</h1>

                <Row
                  style={{
                    textAlign: "center",
                    alignItems: "center",
                    color: "white",
                    marginBottom: "3rem",
                  }}
                ></Row>

                <p className={styles.content}>
                  {ownedTokenNumber}/37 tickets owned
                </p>

                <p className={styles.content}>
                  This NFT ticket is designed specially for BlockShow tickets
                  raffle winners, making them eligible for an entry to one of
                  any upcoming BlockShow events.
                  <br />
                  BlockShow is an iconic crypto and blockchain festival since
                  2016, which transformed to an event DAO in 2022 aiming to
                  create the biggest community-owned Web3 Festival in the world.
                </p>

                <p className={styles.title}>Owned by</p>
                <Row style={{ marginBottom: "3rem" }}>
                  <Col
                    sm={2}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "0px",
                    }}
                  >
                    <img
                      style={{ borderRadius: "50%", objectFit: "cover" }}
                      width="50px"
                      height="50px"
                      src="./avatar.png"
                      alt="avatar"
                    />
                  </Col>
                  <Col
                    sm={10}
                    style={{
                      paddingLeft: "0px",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "PT Root UI",
                        fontStyle: "normal",
                        fontWeight: "700",
                        color: "white",
                      }}
                    ></p>
                    <p
                      className={styles.desc}
                      style={{
                        marginBottom: "0 !important",
                        marginLeft: "10px",
                      }}
                    >
                      <a
                        className={styles.desc}
                        href={
                          "https://polygonscan.com/address/" + walletAddress
                        }
                      >
                        {truncateEthAddress(walletAddress)}
                      </a>
                    </p>
                  </Col>
                </Row>

                <p className={styles.title}>Created by</p>
                <Row style={{ marginBottom: "3rem" }}>
                  <Col
                    sm={2}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "0px",
                    }}
                  >
                    <img
                      style={{ objectFit: "cover" }}
                      width="50px"
                      height="50px"
                      src="./event.png"
                      alt="blockshow-icon"
                    />
                  </Col>
                  <Col
                    sm={10}
                    style={{
                      paddingLeft: "0px",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "PT Root UI",
                        fontStyle: "normal",
                        fontWeight: "700",
                        color: "white",
                      }}
                    ></p>
                    <p
                      className={styles.desc}
                      style={{
                        marginBottom: "0 !important",
                        marginLeft: "10px",
                      }}
                    >
                      <a
                        className={styles.desc}
                        href={"https://polygonscan.com/address/" + ERC1155}
                      >
                        {truncateEthAddress(ERC1155)}
                      </a>
                    </p>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        )}
        <Modal
          centered
          show={showPopUp}
          onHide={() => {
            setShowPopUp(false);
          }}
        >
          <Modal.Header
            style={{
              backgroundColor: "rgb(27, 29, 32)",
              color: "white",
              border: "none",
            }}
          >
            <Modal.Title
              style={{
                backgroundColor: "rgb(27, 29, 32)",
                color: "white",
              }}
            >
              {popupContent.title}
            </Modal.Title>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
            ></button>
          </Modal.Header>
          <Modal.Body
            style={{
              backgroundColor: "rgb(27, 29, 32)",
              color: "white",
              border: "none",
            }}
          >
            {popupContent.content}
          </Modal.Body>
          <Modal.Footer
            style={{
              backgroundColor: "rgb(27, 29, 32)",
              color: "white",
              border: "none",
            }}
          >
            <Button
              style={{
                background:
                  "linear-gradient(45deg, rgb(249,212, 166), rgb(240,108, 105))",
                border: "none",
                borderRadius: "20px",
                color: "black",
                width: "60px",
                fontWeight: "600",
              }}
              onClick={() => {
                setShowPopUp(false);
              }}
            >
              OK
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default withTransition(ClaimingPage);
