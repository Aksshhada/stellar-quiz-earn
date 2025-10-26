// src/services/nftService.ts
// Service to mint NFTs as quiz rewards on Stellar

import * as StellarSdk from "@stellar/stellar-sdk";
import { retrievePublicKey } from "./components/auth/Frighter";
import { signTransaction } from "@stellar/freighter-api";

// Contract configuration
const CONTRACT_ID = "CDM5IGFRIHE5ZW6YDXKG3JTJUAOXI2DHT3AQNHAVRFUCW3STVWEQVE4N";
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const BASE_FEE = "100000";

// Initialize RPC server
const server = new StellarSdk.rpc.Server(RPC_URL);

/**
 * Convert Account Address to ScVal form
 */
const accountToScVal = (account) => new StellarSdk.Address(account).toScVal();

/**
 * Mint an NFT to the connected wallet address
 * @param {string} publicKey - The connected wallet's public key (used for both caller and recipient)
 * @returns {Promise<Object>} Transaction result
 */
export async function mintRewardNFT(publicKey) {
  if (!publicKey) {
    throw new Error("Public key is required");
  }

  console.log("Minting NFT reward...");
  console.log("Recipient and Caller:", publicKey);

  try {
    // Validate public key
    new StellarSdk.Address(publicKey);

 

    // Get source account
    const sourceAccount = await server.getAccount(publicKey);
    console.log("Source account loaded");

    // Create contract instance
    const contract = new StellarSdk.Contract(CONTRACT_ID);

    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call("mint", accountToScVal(publicKey)))
      .setTimeout(180)
      .build();

    console.log("Transaction built");

    // Prepare transaction
    const preparedTransaction = await server.prepareTransaction(transaction);
    console.log("Transaction prepared");

    // Sign transaction with wallet
    console.log("Signing transaction with wallet...");
    const signedXDR = await signTransaction(preparedTransaction.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    // Submit signed transaction
    const signedTx = new StellarSdk.Transaction(signedXDR, NETWORK_PASSPHRASE);
    const response = await server.sendTransaction(signedTx);
    console.log("Transaction submitted! Hash:", response.hash);

    // Poll for transaction status
    const result = await pollTransactionStatus(response.hash);

    if (result.status === "SUCCESS") {
      return {
        success: true,
        txHash: response.hash,
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/${response.hash}`,
        contractUrl: `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`,
      };
    } else {
      throw new Error(`Transaction failed with status: ${result.status}`);
    }
  } catch (error) {
    console.error("NFT Minting Error:", error);
    if (error.message.includes("Maximum token supply reached")) {
      throw new Error("NFT supply limit reached");
    }
    throw new Error(`Failed to mint NFT: ${error.message}`);
  }
}

/**
 * Get NFT metadata
 * @param {string} publicKey - The connected wallet's public key (for account lookup)
 * @returns {Promise<Object>} NFT metadata
 */
export async function getNFTMetadata(publicKey) {
  try {
    const sourceAccount = await server.getAccount(publicKey);
    const contract = new StellarSdk.Contract(CONTRACT_ID);

    const [name, symbol, tokenUri, tokenImage] = await Promise.all([
      invokeContractView(contract, "name", sourceAccount),
      invokeContractView(contract, "symbol", sourceAccount),
      invokeContractView(contract, "token_uri", sourceAccount),
      invokeContractView(contract, "token_image", sourceAccount),
    ]);

    return {
      name: name ? String(name) : "SorobanNFT",
      symbol: symbol ? String(symbol) : "SBN",
      metadataUri: tokenUri ? String(tokenUri) : "",
      imageUri: tokenImage ? String(tokenImage) : "",
    };
  } catch (error) {
    console.error("Error getting NFT metadata:", error);
    return {
      name: "SorobanNFT",
      symbol: "SBN",
      metadataUri: "https://ipfs.io/ipfs/QmegWR31kiQcD9S2katTXKxracbAgLs2QLBRGruFW3NhXC",
      imageUri: "https://ipfs.io/ipfs/QmeRHSYkR4aGRLQXaLmZiccwHw7cvctrB211DzxzuRiqW6",
    };
  }
}

/**
 * Get owner of a specific token ID
 * @param {string} publicKey - The connected wallet's public key (for account lookup)
 * @param {number} tokenId - Token ID to query
 * @returns {Promise<string>} Owner address
 */
export async function getTokenOwner(publicKey, tokenId) {
  try {
    const sourceAccount = await server.getAccount(publicKey);
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const tokenIdScVal = StellarSdk.nativeToScVal(tokenId, { type: "i128" });

    const ownerAddress = await invokeContractView(
      contract,
      "owner_of",
      sourceAccount,
      [tokenIdScVal]
    );

    if (ownerAddress) {
      return StellarSdk.Address.fromScVal(ownerAddress).toString();
    }
    throw new Error("Could not retrieve owner");
  } catch (error) {
    console.error("Error fetching token owner:", error);
    throw error;
  }
}

/**
 * Check if score qualifies for NFT reward
 * @param {number} score - Quiz score (0-100)
 * @param {number} threshold - Minimum score to earn NFT (default: 80)
 * @returns {boolean}
 */
export function shouldMintReward(score, threshold = 80) {
  return score >= threshold;
}

/**
 * Helper: Invoke contract view function (simulation)
 */
async function invokeContractView(contract, methodName, sourceAccount, params = []) {
  try {
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(methodName, ...params))
      .setTimeout(30)
      .build();

    const simulated = await server.simulateTransaction(transaction);

    if (simulated.results && simulated.results.length > 0) {
      const result = simulated.results[0];
      if (result.retval) {
        return StellarSdk.scValToNative(result.retval);
      }
    }

    throw new Error("No result from simulation");
  } catch (error) {
    console.error(`Error invoking ${methodName}:`, error);
    throw error;
  }
}

/**
 * Helper: Poll transaction status
 */
async function pollTransactionStatus(txHash, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const getResponse = await server.getTransaction(txHash);

    if (getResponse.status !== "NOT_FOUND") {
      return getResponse;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error("Transaction polling timeout");
}

export default {
  mintRewardNFT,
  getNFTMetadata,
  getTokenOwner,
  shouldMintReward,
  CONTRACT_ID,
};