import { AnimatePresence } from "framer-motion";
import "../styles/globals.css";
import React from "react";

import NavComponent from "../components/navbar";

function MyApp({ Component, pageProps }) {
  return (
    <AnimatePresence exitBeforeEnter>
      <NavComponent />
      <Component {...pageProps} />
    </AnimatePresence>
  );
}

export default MyApp;
