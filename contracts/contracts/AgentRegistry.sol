// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgentRegistry
 * @dev Cryptographic identity, reputation, and state ledger for ChainMind AI Agents.
 */
contract AgentRegistry is Ownable, Pausable, ReentrancyGuard {
    struct Agent {
        address wallet;
        string name;
        string role;
        string description;
        string[] capabilities;
        string avatar;
        uint256 createdTime;
        uint256 updatedTime;
        uint256 trustScore;
        uint256 reputation;
        uint256 completedTasks;
        uint256 verificationCount;
        uint256 memoryCount;
        string status; // "Online", "Offline"
        bool exists;
        // Extended Phase 6 parameters
        string currentProject;
        bool availability;
        string verificationStatus; // "Unverified", "Pending", "Verified"
        string[] achievements;
        string[] badges;
        uint256 lastActive;
        uint256 currentWorkload;
        string[] supportedDomains;
    }

    // Mapping from agent wallet address to details
    mapping(address => Agent) private agents;
    address[] private agentAddresses;

    // Authorized contracts/callers
    mapping(address => bool) public authorizedCallers;

    // Events
    event AgentRegistered(
        address indexed agentAddress,
        string name,
        string role,
        string avatar
    );
    event AgentUpdated(
        address indexed agentAddress,
        string name,
        string role,
        string avatar
    );
    event StatusChanged(address indexed agentAddress, string newStatus);
    event AgentActivated(address indexed agentAddress);
    event AgentSuspended(address indexed agentAddress);
    event ReputationChanged(address indexed agentAddress, uint256 newReputation, bool indexed increased);
    event TaskCompleted(address indexed agentAddress, uint256 completedTasksCount);
    event VerificationCompleted(address indexed agentAddress, uint256 verificationCount);
    event MemoryCreated(address indexed agentAddress, uint256 memoryCount);
    event AchievementUnlocked(address indexed agentAddress, string achievement);
    event BadgeUnlocked(address indexed agentAddress, string badge);
    event CallerAuthorizationChanged(address indexed caller, bool isAuthorized);

    // Modifiers
    modifier onlyRegistered(address _agent) {
        require(agents[_agent].exists, "AgentRegistry: Agent not registered");
        _;
    }

    modifier onlyAgentSelfOrOwner(address _agent) {
        require(msg.sender == _agent || msg.sender == owner(), "AgentRegistry: Unauthorized sender");
        _;
    }

    modifier onlyAuthorized() {
        require(msg.sender == owner() || authorizedCallers[msg.sender], "AgentRegistry: Caller not authorized");
        _;
    }

    constructor() Ownable(msg.sender) {}

    // Pausability controls
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Authorize middleware contracts
    function setCallerAuthorization(address _caller, bool _isAuthorized) external onlyOwner {
        require(_caller != address(0), "AgentRegistry: Invalid caller address");
        authorizedCallers[_caller] = _isAuthorized;
        emit CallerAuthorizationChanged(_caller, _isAuthorized);
    }

    /**
     * @notice Register a new AI agent identity.
     */
    function registerAgent(
        string calldata _name,
        string calldata _role,
        string calldata _description,
        string[] calldata _capabilities,
        string calldata _avatar
    ) external whenNotPaused nonReentrant {
        require(msg.sender != address(0), "AgentRegistry: Invalid wallet");
        require(!agents[msg.sender].exists, "AgentRegistry: Agent already registered");
        require(bytes(_name).length > 0, "AgentRegistry: Name cannot be empty");
        require(bytes(_role).length > 0, "AgentRegistry: Role cannot be empty");

        string[] memory emptyArray;

        agents[msg.sender] = Agent({
            wallet: msg.sender,
            name: _name,
            role: _role,
            description: _description,
            capabilities: _capabilities,
            avatar: _avatar,
            createdTime: block.timestamp,
            updatedTime: block.timestamp,
            trustScore: 100,
            reputation: 100, // Starts at 100
            completedTasks: 0,
            verificationCount: 0,
            memoryCount: 0,
            status: "Online",
            exists: true,
            currentProject: "",
            availability: true,
            verificationStatus: "Verified",
            achievements: emptyArray,
            badges: emptyArray,
            lastActive: block.timestamp,
            currentWorkload: 0,
            supportedDomains: _capabilities
        });

        agentAddresses.push(msg.sender);

        emit AgentRegistered(msg.sender, _name, _role, _avatar);
    }

    /**
     * @notice Update agent details.
     */
    function updateAgent(
        string calldata _name,
        string calldata _role,
        string calldata _description,
        string[] calldata _capabilities,
        string calldata _avatar
    ) external whenNotPaused onlyRegistered(msg.sender) nonReentrant {
        require(bytes(_name).length > 0, "AgentRegistry: Name cannot be empty");
        require(bytes(_role).length > 0, "AgentRegistry: Role cannot be empty");

        Agent storage agent = agents[msg.sender];
        agent.name = _name;
        agent.role = _role;
        agent.description = _description;
        agent.capabilities = _capabilities;
        agent.avatar = _avatar;
        agent.updatedTime = block.timestamp;
        agent.lastActive = block.timestamp;

        emit AgentUpdated(msg.sender, _name, _role, _avatar);
    }

    /**
     * @notice Update agent activity status.
     */
    function changeStatus(string calldata _status) external whenNotPaused onlyRegistered(msg.sender) {
        require(bytes(_status).length > 0, "AgentRegistry: Status cannot be empty");
        agents[msg.sender].status = _status;
        agents[msg.sender].updatedTime = block.timestamp;
        agents[msg.sender].lastActive = block.timestamp;

        emit StatusChanged(msg.sender, _status);
    }

    /**
     * @notice Update agent availability.
     */
    function updateAvailability(bool _availability) external whenNotPaused onlyRegistered(msg.sender) {
        agents[msg.sender].availability = _availability;
        agents[msg.sender].updatedTime = block.timestamp;
        agents[msg.sender].lastActive = block.timestamp;
    }

    /**
     * @notice Update agent workload count.
     */
    function updateWorkload(uint256 _workload) external whenNotPaused onlyRegistered(msg.sender) {
        agents[msg.sender].currentWorkload = _workload;
        agents[msg.sender].updatedTime = block.timestamp;
        agents[msg.sender].lastActive = block.timestamp;
    }

    /**
     * @notice Update agent domain areas.
     */
    function updateDomains(string[] calldata _domains) external whenNotPaused onlyRegistered(msg.sender) {
        agents[msg.sender].supportedDomains = _domains;
        agents[msg.sender].updatedTime = block.timestamp;
    }

    /**
     * @notice Update last active timestamp.
     */
    function updateLastActive() external whenNotPaused onlyRegistered(msg.sender) {
        agents[msg.sender].lastActive = block.timestamp;
    }

    /**
     * @notice Set current project ID.
     */
    function setCurrentProject(address _agent, string calldata _project) external onlyAuthorized onlyRegistered(_agent) {
        agents[_agent].currentProject = _project;
        agents[_agent].updatedTime = block.timestamp;
    }

    /**
     * @notice Set verification level status.
     */
    function setVerificationStatus(address _agent, string calldata _status) external onlyAuthorized onlyRegistered(_agent) {
        agents[_agent].verificationStatus = _status;
        agents[_agent].updatedTime = block.timestamp;
    }

    /**
     * @notice Increase reputation score.
     */
    function increaseReputation(address _agent, uint256 _amount) external onlyAuthorized onlyRegistered(_agent) {
        agents[_agent].reputation += _amount;
        agents[_agent].trustScore = agents[_agent].reputation > 500 ? 100 : (agents[_agent].reputation / 5);
        agents[_agent].updatedTime = block.timestamp;

        emit ReputationChanged(_agent, agents[_agent].reputation, true);
    }

    /**
     * @notice Decrease reputation score.
     */
    function decreaseReputation(address _agent, uint256 _amount) external onlyAuthorized onlyRegistered(_agent) {
        if (agents[_agent].reputation > _amount) {
            agents[_agent].reputation -= _amount;
        } else {
            agents[_agent].reputation = 0;
        }
        agents[_agent].trustScore = agents[_agent].reputation / 5;
        agents[_agent].updatedTime = block.timestamp;

        emit ReputationChanged(_agent, agents[_agent].reputation, false);
    }

    /**
     * @notice Unlock an achievement for the agent.
     */
    function unlockAchievement(address _agent, string calldata _achievement) external onlyAuthorized onlyRegistered(_agent) {
        agents[_agent].achievements.push(_achievement);
        agents[_agent].updatedTime = block.timestamp;
        emit AchievementUnlocked(_agent, _achievement);
    }

    /**
     * @notice Unlock a badge for the agent.
     */
    function unlockBadge(address _agent, string calldata _badge) external onlyAuthorized onlyRegistered(_agent) {
        agents[_agent].badges.push(_badge);
        agents[_agent].updatedTime = block.timestamp;
        emit BadgeUnlocked(_agent, _badge);
    }

    /**
     * @notice Increment task count.
     */
    function incrementTask(address _agent) external onlyAuthorized onlyRegistered(_agent) {
        agents[_agent].completedTasks += 1;
        emit TaskCompleted(_agent, agents[_agent].completedTasks);
    }

    /**
     * @notice Increment verification count.
     */
    function incrementVerification(address _agent) external onlyAuthorized onlyRegistered(_agent) {
        agents[_agent].verificationCount += 1;
        emit VerificationCompleted(_agent, agents[_agent].verificationCount);
    }

    /**
     * @notice Increment memory registration count.
     */
    function incrementMemory(address _agent) external onlyAuthorized onlyRegistered(_agent) {
        agents[_agent].memoryCount += 1;
        emit MemoryCreated(_agent, agents[_agent].memoryCount);
    }

    /**
     * @notice Get single agent details.
     */
    function getAgent(address _agent)
        external
        view
        onlyRegistered(_agent)
        returns (
            address wallet,
            string memory name,
            string memory role,
            string memory description,
            string[] memory capabilities,
            string memory avatar,
            uint256 trustScore,
            uint256 reputation,
            uint256 completedTasks,
            uint256 verificationCount,
            uint256 memoryCount,
            string memory status,
            string memory currentProject,
            bool availability,
            string memory verificationStatus,
            string[] memory achievements,
            string[] memory badges
        )
    {
        Agent storage agent = agents[_agent];
        return (
            agent.wallet,
            agent.name,
            agent.role,
            agent.description,
            agent.capabilities,
            agent.avatar,
            agent.trustScore,
            agent.reputation,
            agent.completedTasks,
            agent.verificationCount,
            agent.memoryCount,
            agent.status,
            agent.currentProject,
            agent.availability,
            agent.verificationStatus,
            agent.achievements,
            agent.badges
        );
    }

    /**
     * @notice Get single agent domains and extra metrics.
     */
    function getAgentExtra(address _agent)
        external
        view
        onlyRegistered(_agent)
        returns (
            uint256 lastActive,
            uint256 currentWorkload,
            string[] memory supportedDomains
        )
    {
        Agent storage agent = agents[_agent];
        return (
            agent.lastActive,
            agent.currentWorkload,
            agent.supportedDomains
        );
    }

    /**
     * @notice Get list of all registered agent addresses.
     */
    function getAllAgents() external view returns (address[] memory) {
        return agentAddresses;
    }
}
