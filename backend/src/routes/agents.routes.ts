import { Router } from "express";
import { AgentController } from "../controllers/AgentController";
import { AgentRepository } from "../repositories/AgentRepository";
import { BlockchainService } from "../services/BlockchainService";
import { ContractService } from "../services/ContractService";
import { AgentRegistryService } from "../services/AgentRegistryService";

const router = Router();

// Instantiate blockchain services
const blockchainService = new BlockchainService();
const contractService = new ContractService(blockchainService);
const agentRegistryService = new AgentRegistryService(contractService);

// Instantiate repositories and controllers
const agentRepository = new AgentRepository();
const agentController = new AgentController(agentRepository, agentRegistryService);

// Leaderboard MUST be declared before :address wildcard to avoid collision
router.get("/leaderboard", agentController.getLeaderboard);
router.get("/", agentController.getAgents);
router.get("/:address", agentController.getAgentByAddress);
router.post("/", agentController.registerAgent);

export default router;
