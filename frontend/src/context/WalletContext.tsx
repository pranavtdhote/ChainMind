"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { MONAD_TESTNET } from "../constants/chain";
import { isEthereumAvailable, switchNetwork } from "../constants/network";
import { parseWalletError } from "../constants/wallet";
import { STORAGE_KEYS } from "../constants/constants";
import { useNotifications } from "./NotificationContext";

interface WalletContextType {
  walletAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;
  chainId: number | null;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  checkAndSwitchNetwork: () => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification } = useNotifications();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>("0.00");
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper to fetch balance and network parameters
  const updateWalletState = useCallback(async (account: string, provider: ethers.BrowserProvider) => {
    try {
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);
      setChainId(currentChainId);

      const rawBalance = await provider.getBalance(account);
      const formattedBalance = ethers.formatEther(rawBalance);
      const fixedBalance = parseFloat(formattedBalance).toFixed(4);
      setBalance(`${fixedBalance} MON`);

      setWalletAddress(account);
      setIsConnected(true);
      setError(null);

      // Store connection status
      localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, "true");

      // Verify network is Monad Testnet
      if (currentChainId !== MONAD_TESTNET.chainId) {
        addNotification("Wrong Network detected. Switch to Monad Testnet.", "warning");
      }
    } catch (err: any) {
      console.error("Error updating wallet state:", err);
      setError("Failed to query balance.");
    }
  }, [addNotification]);

  // Method to check network alignment
  const checkAndSwitchNetwork = useCallback(async (): Promise<boolean> => {
    if (!isEthereumAvailable()) {
      addNotification("MetaMask is not installed.", "error");
      return false;
    }
    const ethereum = (window as any).ethereum;
    const currentId = Number(await ethereum.request({ method: "eth_chainId" }));
    if (currentId !== MONAD_TESTNET.chainId) {
      const switched = await switchNetwork();
      if (switched) {
        addNotification("Switched to Monad Testnet network", "success");
        return true;
      }
      return false;
    }
    return true;
  }, [addNotification]);

  // Main Connect trigger
  const connectWallet = useCallback(async () => {
    if (!isEthereumAvailable()) {
      addNotification("MetaMask extension not found.", "error");
      setError("MetaMask missing.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ethereum = (window as any).ethereum;
      
      // Request account credentials
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length === 0) {
        throw new Error("No accounts found.");
      }

      const provider = new ethers.BrowserProvider(ethereum);
      
      // Switch network if wrong
      const networkAligned = await checkAndSwitchNetwork();
      if (!networkAligned) {
        throw new Error("Network switch rejected.");
      }

      await updateWalletState(accounts[0], provider);
      addNotification("Wallet successfully connected", "success");
    } catch (err: any) {
      console.error("Connection failed:", err);
      const parsedError = parseWalletError(err);
      setError(parsedError);
      addNotification(parsedError, "error");
      localStorage.removeItem(STORAGE_KEYS.WALLET_CONNECTED);
    } finally {
      setIsConnecting(false);
    }
  }, [checkAndSwitchNetwork, updateWalletState, addNotification]);

  // Disconnect handler
  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setIsConnected(false);
    setBalance("0.00");
    setChainId(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEYS.WALLET_CONNECTED);
    addNotification("Wallet disconnected", "info");
  }, [addNotification]);

  // Handle Event Listeners for MetaMask state changes
  useEffect(() => {
    if (!isEthereumAvailable()) return;

    const ethereum = (window as any).ethereum;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        const provider = new ethers.BrowserProvider(ethereum);
        await updateWalletState(accounts[0], provider);
      }
    };

    const handleChainChanged = async (chainIdHex: string) => {
      const provider = new ethers.BrowserProvider(ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        await updateWalletState(accounts[0].address, provider);
      } else {
        setChainId(Number(chainIdHex));
      }
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    // Reconnection check if already set to connected
    const wasConnected = localStorage.getItem(STORAGE_KEYS.WALLET_CONNECTED);
    if (wasConnected === "true") {
      ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(ethereum);
          updateWalletState(accounts[0], provider);
        }
      }).catch(console.error);
    }

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnectWallet, updateWalletState]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        isConnected,
        isConnecting,
        balance,
        chainId,
        error,
        connectWallet,
        disconnectWallet,
        checkAndSwitchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
