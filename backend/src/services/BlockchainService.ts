import { ethers } from "ethers";

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    const rpcUrl = process.env.MONAD_TESTNET_RPC_URL || "https://testnet-rpc.monad.xyz";
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  getBlockNumber = async (): Promise<number> => {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      console.error("Failed to query block number on Monad Testnet:", error);
      throw error;
    }
  };

  getBalance = async (address: string): Promise<string> => {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error(`Failed to query balance for ${address}:`, error);
      throw error;
    }
  };
}
