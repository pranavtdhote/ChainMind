// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CollaborationRegistry
 * @dev On-chain ledger for agent swarm projects, participant weights, timelines, and audit parameters.
 */
contract CollaborationRegistry is Ownable {
    struct Project {
        bytes32 projectId;
        string name;
        address owner;
        address[] participantAgents;
        string[] participantRoles;
        uint256[] contributionPercentages; // Out of 100
        bytes32[] taskIds; // Executed tasks
        bool isActive;
        uint256 createdAt;
        string timelineCid; // Timeline milestone details
        string[] artifacts; // CIDs of generated code/specs
        string verificationCid; // Final verification courtroom report CID
        string projectMetadataCid; // Project description IPFS CID
    }

    mapping(bytes32 => Project) public projects;
    bytes32[] public projectIds;

    // Events
    event CollaborationStarted(bytes32 indexed projectId, string name, address indexed owner);
    event AgentJoined(bytes32 indexed projectId, address indexed agent, string role);
    event AgentLeft(bytes32 indexed projectId, address indexed agent);
    event ContributionRecorded(bytes32 indexed projectId, address indexed agent, uint256 percentage);
    event CollaborationCompleted(bytes32 indexed projectId, string verificationCid);
    
    // Legacy support
    event ProjectCreated(bytes32 indexed projectId, string name, address indexed owner);
    event AgentAdded(bytes32 indexed projectId, address indexed agent);
    event TaskLinked(bytes32 indexed projectId, bytes32 indexed taskId);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Creates a new collaborative project space.
     */
    function createProject(string calldata _name, string calldata _metadataCid) external returns (bytes32) {
        bytes32 projectId = keccak256(abi.encodePacked(msg.sender, _name, block.timestamp));
        require(projects[projectId].projectId == bytes32(0), "CollaborationRegistry: Project already exists");

        address[] memory emptyAgents;
        string[] memory emptyRoles;
        uint256[] memory emptyPercentages;
        bytes32[] memory emptyTasks;
        string[] memory emptyArtifacts;

        projects[projectId] = Project({
            projectId: projectId,
            name: _name,
            owner: msg.sender,
            participantAgents: emptyAgents,
            participantRoles: emptyRoles,
            contributionPercentages: emptyPercentages,
            taskIds: emptyTasks,
            isActive: true,
            createdAt: block.timestamp,
            timelineCid: "",
            artifacts: emptyArtifacts,
            verificationCid: "",
            projectMetadataCid: _metadataCid
        });

        projectIds.push(projectId);

        emit ProjectCreated(projectId, _name, msg.sender);
        emit CollaborationStarted(projectId, _name, msg.sender);
        return projectId;
    }

    /**
     * @notice Adds an agent to the project collaboration space.
     */
    function addAgentToProject(
        bytes32 _projectId, 
        address _agent,
        string calldata _role
    ) external {
        Project storage project = projects[_projectId];
        require(project.projectId != bytes32(0), "CollaborationRegistry: Project does not exist");
        require(project.owner == msg.sender || msg.sender == owner(), "CollaborationRegistry: Unauthorized");
        require(project.isActive, "CollaborationRegistry: Project is inactive");

        project.participantAgents.push(_agent);
        project.participantRoles.push(_role);
        project.contributionPercentages.push(0); // Initialize contribution weight to 0

        emit AgentAdded(_projectId, _agent);
        emit AgentJoined(_projectId, _agent, _role);
    }

    /**
     * @notice Records contribution weight percentage for a participant agent.
     */
    function recordContribution(
        bytes32 _projectId,
        address _agent,
        uint256 _percentage
    ) external {
        Project storage project = projects[_projectId];
        require(project.projectId != bytes32(0), "CollaborationRegistry: Project does not exist");
        require(project.owner == msg.sender || msg.sender == owner(), "CollaborationRegistry: Unauthorized");

        for (uint256 i = 0; i < project.participantAgents.length; i++) {
            if (project.participantAgents[i] == _agent) {
                project.contributionPercentages[i] = _percentage;
                emit ContributionRecorded(_projectId, _agent, _percentage);
                break;
            }
        }
    }

    /**
     * @notice Links a task to the project.
     */
    function linkTask(bytes32 _projectId, bytes32 _taskId) external {
        Project storage project = projects[_projectId];
        require(project.projectId != bytes32(0), "CollaborationRegistry: Project does not exist");
        require(project.isActive, "CollaborationRegistry: Project is inactive");
        
        project.taskIds.push(_taskId);

        emit TaskLinked(_projectId, _taskId);
    }

    /**
     * @notice Links output artifacts CIDs to the project.
     */
    function addArtifact(bytes32 _projectId, string calldata _artifactCid) external {
        Project storage project = projects[_projectId];
        require(project.projectId != bytes32(0), "CollaborationRegistry: Project does not exist");
        project.artifacts.push(_artifactCid);
    }

    /**
     * @notice Finalizes project collaboration and registers verification court report.
     */
    function completeCollaboration(
        bytes32 _projectId, 
        string calldata _verificationCid, 
        string calldata _timelineCid
    ) external {
        Project storage project = projects[_projectId];
        require(project.projectId != bytes32(0), "CollaborationRegistry: Project does not exist");
        require(project.owner == msg.sender || msg.sender == owner(), "CollaborationRegistry: Unauthorized");

        project.isActive = false;
        project.verificationCid = _verificationCid;
        project.timelineCid = _timelineCid;

        emit CollaborationCompleted(_projectId, _verificationCid);
    }

    /**
     * @notice Returns participants of a project.
     */
    function getProjectParticipants(bytes32 _projectId) external view returns (address[] memory) {
        return projects[_projectId].participantAgents;
    }

    /**
     * @notice Returns contributions weights of project participants.
     */
    function getProjectContributions(bytes32 _projectId) external view returns (uint256[] memory) {
        return projects[_projectId].contributionPercentages;
    }

    /**
     * @notice Returns total number of projects.
     */
    function getProjectCount() external view returns (uint256) {
        return projectIds.length;
    }
}
