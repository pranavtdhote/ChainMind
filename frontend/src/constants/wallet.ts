export const formatAddress = (address: string | null): string => {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const parseWalletError = (error: any): string => {
  if (!error) return "An unknown wallet error occurred.";

  const code = error.code || (error.info && error.info.error && error.info.error.code);
  const message = error.message || "";

  if (code === 4001 || message.includes("user rejected")) {
    return "Transaction signature rejected by the user.";
  }
  if (code === -32603 || message.includes("Internal JSON-RPC error")) {
    return "Internal RPC processing error. Please check your network RPC status.";
  }
  if (message.includes("insufficient funds")) {
    return "Insufficient MON funds to cover transaction gas fees.";
  }
  if (message.includes("Wallet locked")) {
    return "Wallet is currently locked. Please log in to MetaMask.";
  }

  return message || "An unexpected wallet action occurred.";
};
