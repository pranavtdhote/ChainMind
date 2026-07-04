import { ethers } from "ethers";
import { BlockchainService } from "./BlockchainService";

export const AGENT_REGISTRY_ABI = [
  "function registerAgent(string name, string role, string description, string[] capabilities, string avatar) external",
  "function updateAgent(string name, string role, string description, string[] capabilities, string avatar) external",
  "function changeStatus(string status) external",
  "function increaseReputation(address agent, uint256 amount) external",
  "function decreaseReputation(address agent, uint256 amount) external",
  "function incrementTask(address agent) external",
  "function incrementVerification(address agent) external",
  "function incrementMemory(address agent) external",
  "function getAgent(address _agent) external view returns (address wallet, string name, string role, string description, string[] capabilities, string avatar, uint256 trustScore, uint256 reputation, uint256 completedTasks, uint256 verificationCount, uint256 memoryCount, string status, string currentProject, bool availability, string verificationStatus, string[] achievements, string[] badges)",
  "function getAllAgents() external view returns (address[] memory)",
  "event AgentRegistered(address indexed agentAddress, string name, string role, string avatar)",
  "event AgentUpdated(address indexed agentAddress, string name, string role, string avatar)",
  "event StatusChanged(address indexed agentAddress, string newStatus)",
  "event ReputationChanged(address indexed agentAddress, uint256 newReputation, bool increased)",
  "event TaskCompleted(address indexed agentAddress, uint256 completedTasksCount)",
  "event VerificationCompleted(address indexed agentAddress, uint256 verificationCount)",
  "event MemoryCreated(address indexed agentAddress, uint256 memoryCount)"
];

export class ContractService {
  private blockchainService: BlockchainService;
  private agentRegistryAddress: string;

  constructor(blockchainService: BlockchainService) {
    this.blockchainService = blockchainService;
    this.agentRegistryAddress = process.env.AGENT_REGISTRY_CONTRACT_ADDRESS || "0x3Db729E9c90CFFDe2eD50E341F284004944d182b";
  }

  getAgentRegistryContract(signer?: ethers.Signer): ethers.Contract {
    const providerOrSigner = signer || this.blockchainService.getProvider();
    return new ethers.Contract(this.agentRegistryAddress, AGENT_REGISTRY_ABI, providerOrSigner);
  }
}
