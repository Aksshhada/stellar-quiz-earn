// src/services/StellarService.ts
import * as StellarSdk from "@stellar/stellar-sdk";
import { STELLAR_CONFIG } from "../src/stellar.config";
import { userSignTransaction } from "./components/auth/Frighter";

export class StellarService {
  constructor(publicKey) {
    console.log("Initializing StellarService with publicKey:", publicKey);
    this.publicKey = publicKey;
    this.server = new StellarSdk.rpc.Server(STELLAR_CONFIG.sorobanRpcUrl);
  }

  async invokeContract(contractId, method, params = []) {
    try {
      if (!this.publicKey) {
        throw new Error("No public key provided");
      }

      console.log("📤 Building transaction for:", method);

      const contract = new StellarSdk.Contract(contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100000",
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(contract.call(method, ...params))
        .setTimeout(180)
        .build();

      console.log("🔧 Preparing transaction...");
      const preparedTransaction = await this.server.prepareTransaction(builtTransaction);

      console.log("✍️ Signing with Freighter...");
      const { signedTransaction, error } = await userSignTransaction(
        preparedTransaction.toXDR(),
        STELLAR_CONFIG.networkPassphrase,
        this.publicKey
      );

      if (error) {
        throw new Error(`Freighter signing failed: ${error}`);
      }

      console.log("📨 Submitting to network...");
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedTransaction,
        STELLAR_CONFIG.networkPassphrase
      );

      const response = await this.server.sendTransaction(signedTx);
      console.log("✅ Transaction submitted! Hash:", response.hash);

      return { hash: response.hash, status: "SUCCESS" };
    } catch (error) {
      console.error("❌ Transaction failed:", error);
      if (error.message?.includes("User declined")) {
        throw new Error("Transaction cancelled by user");
      }
      if (error.message?.includes("insufficient")) {
        throw new Error("Insufficient XLM balance");
      }
      throw new Error(error.message || "Transaction failed");
    }
  }

  async simulateContract(contractId, method, params = []) {
    try {
      console.log(`🔍 Simulating ${method}...`);
      const contract = new StellarSdk.Contract(contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100000",
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(contract.call(method, ...params))
        .setTimeout(30)
        .build();

      console.log("📡 Sending simulation request...");
      const simulated = await this.server.simulateTransaction(transaction);

      if (simulated.error) {
        console.error("Simulation error:", simulated.error);
        throw new Error(`Simulation failed: ${simulated.error}`);
      }

      if (simulated.results && simulated.results.length > 0) {
        const result = simulated.results[0];
        if (result.retval) {
          const nativeValue = StellarSdk.scValToNative(result.retval);
          console.log(`✅ ${method} result:`, nativeValue);
          return nativeValue;
        }
      }

      throw new Error("No result from simulation");
    } catch (error) {
      console.error(`❌ Simulation failed for ${method}:`, error);
      throw error;
    }
  }
}