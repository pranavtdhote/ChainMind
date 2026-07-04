import { MONAD_TESTNET } from "./chain";

export const isEthereumAvailable = (): boolean => {
  return typeof window !== "undefined" && (window as any).ethereum !== undefined;
};

export const switchNetwork = async (): Promise<boolean> => {
  if (!isEthereumAvailable()) return false;

  const ethereum = (window as any).ethereum;
  try {
    // Attempt to switch to Monad Testnet
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: MONAD_TESTNET.chainIdHex }],
    });
    return true;
  } catch (switchError: any) {
    // Error code 4902 indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: MONAD_TESTNET.chainIdHex,
              chainName: MONAD_TESTNET.chainName,
              rpcUrls: [MONAD_TESTNET.rpcUrl],
              blockExplorerUrls: [MONAD_TESTNET.blockExplorerUrl],
              nativeCurrency: MONAD_TESTNET.nativeCurrency,
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error("Failed to add Monad Testnet network:", addError);
        return false;
      }
    }
    console.error("Failed to switch to Monad Testnet:", switchError);
    return false;
  }
};
