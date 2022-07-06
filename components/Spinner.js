import styles from "./Spinner.module.css";
import React from "react";
export default function Spinner() {
  return (
    <div className={styles.background}>
      <div className={styles.spinner}>O</div>
    </div>
  );
}
