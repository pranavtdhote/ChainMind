// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MemoryRegistry
 * @dev Memory Passport ledger, tracking multi-version CIDs, consensus metrics, and cryptographic permissions.
 */
contract MemoryRegistry is Ownable {
    // Permission levels: 0 = None, 1 = Viewer, 2 = Collaborator, 3 = Owner
    enum PermissionLevel { None, Viewer, Collaborator, Owner }

    struct MemoryRecord {
        bytes32 memoryId;
        address owner;
        bytes32 projectId;
        bytes32 taskId;
        string latestIpfsHash; // Latest IPFS CID
        uint256 version;
        uint256 integrityScore;
        uint256 consensusScore;
        bool isVerified;
        bool isPrivate;
        uint256 blockTimestamp;
        string[] versionHistory; // CIDs array of past versions
    }

    mapping(bytes32 => MemoryRecord) public memories;
    bytes32[] public memoryIds;
    
    // permissions: memoryId => user address => permission level
    mapping(bytes32 => mapping(address => PermissionLevel)) public permissions;
    mapping(address => bytes32[]) public agentMemories;

    // Events
    event MemoryCreated(
        bytes32 indexed memoryId, 
        string ipfsHash, 
        address indexed owner, 
        bytes32 indexed projectId
    );
    event MemoryUpdated(bytes32 indexed memoryId, string newIpfsHash, uint256 version);
    event PermissionGranted(bytes32 indexed memoryId, address indexed user, PermissionLevel level);
    event PermissionRevoked(bytes32 indexed memoryId, address indexed user);
    event VersionCreated(bytes32 indexed memoryId, string ipfsHash, uint256 version);

    modifier onlyMemoryOwner(bytes32 _memoryId) {
        require(memories[_memoryId].owner == msg.sender || msg.sender == owner(), "MemoryRegistry: Unauthorized");
        _;
    }

    modifier hasPermission(bytes32 _memoryId, PermissionLevel _required) {
        PermissionLevel level = permissions[_memoryId][msg.sender];
        if (msg.sender == memories[_memoryId].owner || msg.sender == owner()) {
            level = PermissionLevel.Owner;
        }
        require(uint8(level) >= uint8(_required), "MemoryRegistry: Insufficient permission");
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Registers a new memory passport footprint.
     */
    function registerMemory(
        bytes32 _projectId,
        bytes32 _taskId,
        string calldata _ipfsHash,
        uint256 _integrity,
        uint256 _consensus,
        bool _isVerified,
        bool _isPrivate
    ) external returns (bytes32) {
        bytes32 memoryId = keccak256(abi.encodePacked(msg.sender, _projectId, _taskId, _ipfsHash, block.timestamp));
        require(memories[memoryId].memoryId == bytes32(0), "MemoryRegistry: Memory already registered");

        string[] memory emptyHistory;

        memories[memoryId] = MemoryRecord({
            memoryId: memoryId,
            owner: msg.sender,
            projectId: _projectId,
            taskId: _taskId,
            latestIpfsHash: _ipfsHash,
            version: 1,
            integrityScore: _integrity,
            consensusScore: _consensus,
            isVerified: _isVerified,
            isPrivate: _isPrivate,
            blockTimestamp: block.timestamp,
            versionHistory: emptyHistory
        });

        memories[memoryId].versionHistory.push(_ipfsHash);
        memoryIds.push(memoryId);
        agentMemories[msg.sender].push(memoryId);
        permissions[memoryId][msg.sender] = PermissionLevel.Owner;

        emit MemoryCreated(memoryId, _ipfsHash, msg.sender, _projectId);
        emit VersionCreated(memoryId, _ipfsHash, 1);
        return memoryId;
    }

    /**
     * @notice Updates a memory record to a new version.
     */
    function updateMemory(
        bytes32 _memoryId,
        string calldata _newIpfsHash,
        uint256 _integrity,
        uint256 _consensus,
        bool _verified
    ) external hasPermission(_memoryId, PermissionLevel.Collaborator) {
        MemoryRecord storage record = memories[_memoryId];
        require(record.memoryId != bytes32(0), "MemoryRegistry: Memory does not exist");

        record.latestIpfsHash = _newIpfsHash;
        record.version += 1;
        record.integrityScore = _integrity;
        record.consensusScore = _consensus;
        record.isVerified = _verified;
        record.blockTimestamp = block.timestamp;
        record.versionHistory.push(_newIpfsHash);

        emit MemoryUpdated(_memoryId, _newIpfsHash, record.version);
        emit VersionCreated(_memoryId, _newIpfsHash, record.version);
    }

    /**
     * @notice Grants permission to another wallet address.
     */
    function grantPermission(
        bytes32 _memoryId,
        address _user,
        PermissionLevel _level
    ) external onlyMemoryOwner(_memoryId) {
        require(_user != address(0), "MemoryRegistry: Invalid user");
        permissions[_memoryId][_user] = _level;

        emit PermissionGranted(_memoryId, _user, _level);
    }

    /**
     * @notice Revokes permission from another wallet address.
     */
    function revokePermission(bytes32 _memoryId, address _user) external onlyMemoryOwner(_memoryId) {
        require(_user != address(0), "MemoryRegistry: Invalid user");
        permissions[_memoryId][_user] = PermissionLevel.None;

        emit PermissionRevoked(_memoryId, _user);
    }

    /**
     * @notice Get version history array of past CIDs.
     */
    function getVersionHistory(bytes32 _memoryId) external view returns (string[] memory) {
        return memories[_memoryId].versionHistory;
    }

    /**
     * @notice Returns total number of registered memories.
     */
    function getMemoryCount() external view returns (uint256) {
        return memoryIds.length;
    }
}
