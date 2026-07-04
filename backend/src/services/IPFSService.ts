import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export class IPFSService {
  private pinataApiKey: string | undefined;
  private pinataSecretApiKey: string | undefined;
  private pinataJwt: string | undefined;
  private mockDir: string;

  constructor() {
    this.pinataApiKey = process.env.PINATA_API_KEY;
    this.pinataSecretApiKey = process.env.PINATA_API_SECRET;
    this.pinataJwt = process.env.PINATA_JWT;
    
    // Create a local folder to cache and simulate IPFS files when keys are missing
    this.mockDir = path.join(process.cwd(), "data", "ipfs_mock");
    if (!fs.existsSync(this.mockDir)) {
      fs.mkdirSync(this.mockDir, { recursive: true });
    }
  }

  private isPinataConfigured(): boolean {
    const hasKeys = !!(this.pinataApiKey && this.pinataSecretApiKey && !this.pinataApiKey.includes("your_key"));
    const hasJwt = !!(this.pinataJwt && !this.pinataJwt.includes("your_jwt"));
    return hasKeys || hasJwt;
  }

  /**
   * Uploads project memory JSON to IPFS (via Pinata or local fallback).
   * @param payload JSON data to upload.
   */
  async uploadMemory(payload: any): Promise<string> {
    const dataStr = JSON.stringify(payload);
    
    // Check payload size (limit to 10MB)
    const payloadBytes = Buffer.byteLength(dataStr, "utf8");
    if (payloadBytes > 10 * 1024 * 1024) {
      throw new Error("Memory payload exceeds max size limit of 10MB");
    }

    if (!this.isPinataConfigured()) {
      // Local fallback logic
      const mockCid = "QmCM" + this.generateHash(dataStr).substring(0, 42);
      console.log(`[IPFSService]: Pinata credentials missing. Caching payload locally as mock CID: ${mockCid}`);
      
      const filePath = path.join(this.mockDir, `${mockCid}.json`);
      fs.writeFileSync(filePath, dataStr, "utf8");
      return mockCid;
    }

    // Call Pinata Pin JSON endpoint
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        attempts++;
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (this.pinataJwt) {
          headers["Authorization"] = `Bearer ${this.pinataJwt}`;
        } else {
          headers["pinata_api_key"] = this.pinataApiKey!;
          headers["pinata_secret_api_key"] = this.pinataSecretApiKey!;
        }

        const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
          method: "POST",
          headers,
          body: JSON.stringify({
            pinataContent: payload,
            pinataMetadata: {
              name: `ChainMind-Memory-${payload.projectName || "Project"}-${Date.now()}`,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Pinata returned error status ${response.status}: ${await response.text()}`);
        }

        const resData: any = await response.json();
        if (!resData.IpfsHash) {
          throw new Error("Pinata response missing IpfsHash parameter");
        }

        return resData.IpfsHash;
      } catch (err: any) {
        console.warn(`[IPFSService]: Upload attempt ${attempts} failed: ${err.message}`);
        if (attempts >= maxAttempts) {
          throw new Error(`IPFS upload failed after ${maxAttempts} attempts: ${err.message}`);
        }
        // Wait 1s before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw new Error("IPFS upload execution flow failed unexpectedly.");
  }

  /**
   * Retrieves project memory JSON from IPFS (via Pinata or local fallback).
   * @param cid The IPFS CID hash.
   */
  async downloadMemory(cid: string): Promise<any> {
    if (!cid || typeof cid !== "string" || !cid.startsWith("Qm")) {
      throw new Error("Invalid IPFS CID format provided");
    }

    // Check local fallback cache first
    const localPath = path.join(this.mockDir, `${cid}.json`);
    if (fs.existsSync(localPath)) {
      console.log(`[IPFSService]: Retrieved payload from local mock IPFS storage: ${cid}`);
      const dataStr = fs.readFileSync(localPath, "utf8");
      return JSON.parse(dataStr);
    }

    if (!this.isPinataConfigured()) {
      throw new Error(`Pinata not configured and CID ${cid} not found in local mock cache.`);
    }

    // Attempt fetching from public/Pinata gateways
    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${cid}`,
      `https://ipfs.io/ipfs/${cid}`,
    ];

    for (const url of gateways) {
      try {
        console.log(`[IPFSService]: Attempting download from gateway: ${url}`);
        const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (response.ok) {
          const payload = await response.json();
          // Cache locally to accelerate subsequent queries
          fs.writeFileSync(localPath, JSON.stringify(payload), "utf8");
          return payload;
        }
      } catch (err: any) {
        console.warn(`[IPFSService]: Failed download from ${url}: ${err.message}`);
      }
    }

    throw new Error(`Failed to download CID ${cid} from any IPFS gateways.`);
  }

  /**
   * Unpins a CID from Pinata (unpins local cache or makes REST call).
   */
  async unpin(cid: string): Promise<boolean> {
    const localPath = path.join(this.mockDir, `${cid}.json`);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }

    if (!this.isPinataConfigured()) {
      return true;
    }

    try {
      const headers: Record<string, string> = {};
      if (this.pinataJwt) {
        headers["Authorization"] = `Bearer ${this.pinataJwt}`;
      } else {
        headers["pinata_api_key"] = this.pinataApiKey!;
        headers["pinata_secret_api_key"] = this.pinataSecretApiKey!;
      }

      const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
        method: "DELETE",
        headers,
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Checks Pinata health/authorization.
   */
  async health(): Promise<boolean> {
    if (!this.isPinataConfigured()) return true; // Mock is always healthy
    try {
      const headers: Record<string, string> = {};
      if (this.pinataJwt) {
        headers["Authorization"] = `Bearer ${this.pinataJwt}`;
      } else {
        headers["pinata_api_key"] = this.pinataApiKey!;
        headers["pinata_secret_api_key"] = this.pinataSecretApiKey!;
      }
      const response = await fetch("https://api.pinata.cloud/data/testAuthentication", { headers });
      return response.ok;
    } catch {
      return false;
    }
  }

  private generateHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
}
export const ipfsService = new IPFSService();
