import WalletConnect from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

export const providerOptions = {
  walletlink: {
    package: CoinbaseWalletSDK, // Required
    options: {
      appName: "Web 3 Modal Demo", // Required
      infuraId: "8e4b74e26e5048a7a0ddec28b0dda1f5", // Required unless you provide a JSON RPC url; see `rpc` below
    },
  },
  walletconnect: {
    package: WalletConnect, // required
    options: {
      appName: "Web 3 Modal Demo", // Required
      rpc : {80001 : "https://matic-mumbai.chainstacklabs.com/", 137 : "https://matic-mainnet.chainstacklabs.com"},
      infuraId: "8e4b74e26e5048a7a0ddec28b0dda1f5", // required
    },
  },
};
