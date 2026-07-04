export interface ChainConfig {
  chainId: number;
  chainIdHex: string;
  chainName: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const MONAD_TESTNET: ChainConfig = {
  chainId: 10143,
  chainIdHex: "0x279f", // 10143 in hex
  chainName: "Monad Testnet",
  rpcUrl: "https://testnet-rpc.monad.xyz",
  blockExplorerUrl: "https://testnet.monadscan.com",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
};
