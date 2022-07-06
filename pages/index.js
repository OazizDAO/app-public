import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import withTransition from "../HOC/withTransition";
import styles from "../styles/Home.module.css";
import NavComponent from "../components/navbar";

const SubDAO = () => {
  return <div className={styles.subDAO}>O</div>;
};

function Home() {
  const [play, setPlay] = useState(false);

  const router = useRouter();

  const hdlClick = (e) => {
    if (!play) {
      setPlay(true);
      setTimeout(() => {
        setPlay(false);
      }, 1000);
    }
  };

  useEffect(() => {
    router.prefetch("/mint");
  }, [router]);

  return (
    <div className={styles.container}>
      <Head>
        <title>OAZIZ</title>
        <meta name="description" content="Oaziz" />
        <link rel="icon" type="image/x-icon" href="./favicon.ico"></link>
      </Head>

      {/* <header className={styles.header}>
        
      </header>       */}

      <main className={styles.main}>
        <div onClick={hdlClick} className="oaziz_logo">
          <a>O</a>
        </div>
        {play && <SubDAO />}

        <div className="oaziz_profile"></div>
      </main>

      {/* <footer className={styles.footer}>
        
      </footer> */}
    </div>
  );
}

export default withTransition(Home);
