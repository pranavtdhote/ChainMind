export interface IIpfsservice {
  /**
   * Upload JSON content (e.g. task parameters, memory payload) to IPFS.
   * Resolves to the content identifier (CID) hash.
   */
  uploadJSON(data: Record<string, any>): Promise<string>;

  /**
   * Upload a raw file (image, binary payload) to IPFS.
   * Resolves to the CID.
   */
  uploadFile(file: File): Promise<string>;

  /**
   * Retrieve and parse JSON contents from an IPFS CID.
   */
  getJSON<T>(cid: string): Promise<T>;

  /**
   * Generate a clickable HTTP gateway URL for an IPFS CID.
   */
  getGatewayUrl(cid: string): string;
}
