// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VerificationRegistry
 * @dev Cryptographic auditing and validation trial records for AgentCourt.
 */
contract VerificationRegistry is Ownable {
    enum VerificationStatus { Pending, Approved, Rejected }

    struct VerificationCase {
        bytes32 caseId;
        bytes32 taskId;
        string reportURI; // Court Report IPFS CID
        uint256 consensusScore; // 0 to 100
        uint256 integrityScore; // 0 to 100
        uint256 confidenceScore; // 0 to 100
        uint256 approvalsCount;
        uint256 rejectionsCount;
        VerificationStatus status;
        uint256 expirationTime;
        address verifier;
        string evidenceHash; // IPFS CID of evidence
        bool approval;
    }

    mapping(bytes32 => VerificationCase) public cases;
    bytes32[] public caseIds;
    mapping(bytes32 => mapping(address => bool)) public hasVoted;

    // Events
    event VerificationStarted(bytes32 indexed caseId, bytes32 indexed taskId, string evidenceHash);
    event VoteSubmitted(bytes32 indexed caseId, address indexed auditor, bool approved);
    event ConsensusCalculated(bytes32 indexed caseId, uint256 consensusScore, uint256 integrityScore, uint256 confidenceScore);
    event CourtApproved(bytes32 indexed caseId, string courtReportCID);
    event CourtRejected(bytes32 indexed caseId, string courtReportCID);
    event VerificationCompleted(bytes32 indexed caseId, bool indexed approved);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Initiates a verification case for a completed task.
     */
    function initiateVerification(
        bytes32 _taskId, 
        string calldata _evidenceHash
    ) external returns (bytes32) {
        bytes32 caseId = keccak256(abi.encodePacked(_taskId, _evidenceHash, block.timestamp));
        require(cases[caseId].caseId == bytes32(0), "VerificationRegistry: Case already exists");

        cases[caseId] = VerificationCase({
            caseId: caseId,
            taskId: _taskId,
            reportURI: "",
            consensusScore: 0,
            integrityScore: 0,
            confidenceScore: 0,
            approvalsCount: 0,
            rejectionsCount: 0,
            status: VerificationStatus.Pending,
            expirationTime: block.timestamp + 3 days,
            verifier: msg.sender,
            evidenceHash: _evidenceHash,
            approval: false
        });

        caseIds.push(caseId);

        emit VerificationStarted(caseId, _taskId, _evidenceHash);
        return caseId;
    }

    /**
     * @notice Submit a verification vote (approve or reject) for a case.
     */
    function submitVote(bytes32 _caseId, bool _approve) external {
        VerificationCase storage vCase = cases[_caseId];
        require(vCase.caseId != bytes32(0), "VerificationRegistry: Case does not exist");
        require(vCase.status == VerificationStatus.Pending, "VerificationRegistry: Case already resolved");
        require(block.timestamp < vCase.expirationTime, "VerificationRegistry: Vote window closed");
        require(!hasVoted[_caseId][msg.sender], "VerificationRegistry: Agent already voted");

        hasVoted[_caseId][msg.sender] = true;

        if (_approve) {
            vCase.approvalsCount++;
        } else {
            vCase.rejectionsCount++;
        }

        emit VoteSubmitted(_caseId, msg.sender, _approve);
    }

    /**
     * @notice Finalizes the verification case based on votes and detailed metrics.
     */
    function finalizeCase(
        bytes32 _caseId,
        string calldata _courtReportCID,
        uint256 _consensusScore,
        uint256 _integrityScore,
        uint256 _confidenceScore
    ) external {
        VerificationCase storage vCase = cases[_caseId];
        require(vCase.caseId != bytes32(0), "VerificationRegistry: Case does not exist");
        require(vCase.status == VerificationStatus.Pending, "VerificationRegistry: Case already resolved");

        vCase.reportURI = _courtReportCID;
        vCase.consensusScore = _consensusScore;
        vCase.integrityScore = _integrityScore;
        vCase.confidenceScore = _confidenceScore;
        
        bool approved = _consensusScore >= 75; // 75% approval threshold
        vCase.approval = approved;
        
        if (approved) {
            vCase.status = VerificationStatus.Approved;
            emit CourtApproved(_caseId, _courtReportCID);
        } else {
            vCase.status = VerificationStatus.Rejected;
            emit CourtRejected(_caseId, _courtReportCID);
        }

        emit ConsensusCalculated(_caseId, _consensusScore, _integrityScore, _confidenceScore);
        emit VerificationCompleted(_caseId, approved);
    }

    /**
     * @notice Returns total number of cases.
     */
    function getCaseCount() external view returns (uint256) {
        return caseIds.length;
    }
}
