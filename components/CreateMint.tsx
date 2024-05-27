import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import { FC, useState } from "react";
import styles from "../styles/Home.module.css";
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
} from "@solana/spl-token";

export const CreateMintForm: FC = () => {
  const [txSig, setTxSig] = useState("");
  const [mint, setMint] = useState("");

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const link = () => {
    return txSig
      ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
      : "";
  };

  const createMint = async (event) => {
    event.preventDefault();
    if (!connection || !publicKey) {
      return;
    }

    // BUILD AND SEND CREATE MINT TRANSACTION HERE
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const programId = TOKEN_PROGRAM_ID;
    const accountKeypair = web3.Keypair.generate();

    const transaction = new web3.Transaction().add(
      web3.SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: accountKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId,
      }),
      createInitializeMintInstruction(
        accountKeypair.publicKey,
        7,
        publicKey,
        null,
        programId
      )
    )

    const signature = await sendTransaction(transaction, connection, { signers: [accountKeypair] })
    setTxSig(signature);
    setMint(accountKeypair.publicKey.toString())
  };

  return (
    <div>
      {publicKey ? (
        <form onSubmit={createMint} className={styles.form}>
          <button type="submit" className={styles.formButton}>
            Create Mint
          </button>
        </form>
      ) : (
        <span>Connect Your Wallet</span>
      )}
      {txSig ? (
        <div>
          <p>Token Mint Address: {mint}</p>
          <p>View your transaction on </p>
          <a href={link()}>Solana Explorer</a>
        </div>
      ) : null}
    </div>
  );
};
