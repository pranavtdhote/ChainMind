export interface IWalletService {
  /**
   * Request connection to MetaMask or other EIP-1193 wallets.
   * Resolves to the selected wallet address.
   */
  connect(): Promise<string>;

  /**
   * Disconnect the active wallet session.
   */
  disconnect(): Promise<void>;

  /**
   * Retrieve the active wallet address, or null if not connected.
   */
  getAddress(): Promise<string | null>;

  /**
   * Retrieve the current native balance (e.g. MON) of the connected wallet.
   */
  getBalance(): Promise<string>;

  /**
   * Switch the wallet network to Monad Testnet.
   */
  switchToMonadTestnet(): Promise<boolean>;

  /**
   * Sign a message for authentication purposes.
   * @param message Text to sign.
   */
  signMessage(message: string): Promise<string>;
}
