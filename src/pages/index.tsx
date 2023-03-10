import { type NextPage } from "next";
import Head from "next/head";
import { Timeline } from "../components";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Twitter Clone</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        {/* {JSON.stringify(session)} */}
        <Timeline where={{}} />
      </div>
    </>
  );
};

export default Home;
