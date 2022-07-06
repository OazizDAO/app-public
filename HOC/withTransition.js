import { motion } from "framer-motion";
import React from "react";
import styles from "./withTransition.module.css";

const withTransition = (OriginalComponent) => {
  return () => (
    <>
      <OriginalComponent />
      <motion.div
        className={styles.slideIn}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 0 }}
        exit={{ scaleX: 1 }}
        transition={{ duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] }}
      />
      <motion.div
        className={styles.slideOut}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        exit={{ scaleX: 0 }}
        transition={{ duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] }}
      />
    </>
  );
};

export default withTransition;
