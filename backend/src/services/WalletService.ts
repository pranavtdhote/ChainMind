import { ethers } from "ethers";
import { BlockchainService } from "./BlockchainService";

export class WalletService {
  private wallet: ethers.Wallet | null = null;

  constructor(blockchainService: BlockchainService) {
    const privateKey = process.env.PRIVATE_KEY;
    if (privateKey) {
      try {
        const cleanKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
        this.wallet = new ethers.Wallet(cleanKey, blockchainService.getProvider());
        console.log(`[WalletService]: Admin/Operator loaded address: ${this.wallet.address}`);
      } catch (error) {
        console.error("[WalletService]: Failed to initialize signer from private key:", error);
      }
    } else {
      console.warn("[WalletService]: PRIVATE_KEY is not defined. Read-only interactions enabled.");
    }
  }

  getSigner(): ethers.Wallet | null {
    return this.wallet;
  }

  hasSigner(): boolean {
    return this.wallet !== null;
  }
}
