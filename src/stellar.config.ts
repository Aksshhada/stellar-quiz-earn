// src/config/stellar.config.ts
import * as StellarSdk from "@stellar/stellar-sdk";

export const STELLAR_CONFIG = {
  sorobanRpcUrl: "https://soroban-testnet.stellar.org/",
  networkPassphrase: StellarSdk.Networks.TESTNET,
};