// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TaskRegistry
 * @dev Cryptographic task scheduling, execution tracker, and dependency ledger for AI Swarms.
 */
contract TaskRegistry is Ownable {
    enum TaskStatus { Created, Assigned, Running, PendingVerification, Completed, Failed, Cancelled }

    struct Task {
        bytes32 taskId;
        string descriptionURI; // IPFS specification URI
        address creator;
        address assignedAgent;
        TaskStatus status;
        uint256 createdAt;
        uint256 completedAt;
        // Dependency fields
        bytes32 parentTask;
        bytes32[] dependencies;
        uint256 priority; // 1 = Low, 2 = Medium, 3 = High
        uint256 deadline;
        uint256 estimatedTime;
        uint256 actualTime;
        uint256 retryCount;
    }

    mapping(bytes32 => Task) public tasks;
    bytes32[] public taskIds;

    // Events
    event TaskCreated(
        bytes32 indexed taskId, 
        string descriptionURI, 
        address indexed creator, 
        bytes32 parentTask,
        uint256 priority
    );
    event TaskAssigned(bytes32 indexed taskId, address indexed assignedAgent);
    event TaskTransferred(bytes32 indexed taskId, address indexed fromAgent, address indexed toAgent);
    event TaskStarted(bytes32 indexed taskId);
    event TaskCompleted(bytes32 indexed taskId, uint256 actualTime);
    event TaskFailed(bytes32 indexed taskId, uint256 retryCount);
    event TaskRetried(bytes32 indexed taskId, uint256 retryCount);
    event TaskStatusUpdated(bytes32 indexed taskId, TaskStatus status);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Creates a new task in the registry.
     */
    function createTask(
        string calldata _descriptionURI,
        bytes32 _parentTask,
        bytes32[] calldata _dependencies,
        uint256 _priority,
        uint256 _deadline,
        uint256 _estimatedTime
    ) external returns (bytes32) {
        bytes32 taskId = keccak256(abi.encodePacked(msg.sender, block.timestamp, _descriptionURI, _parentTask));
        require(tasks[taskId].taskId == bytes32(0), "TaskRegistry: Task already exists");

        tasks[taskId] = Task({
            taskId: taskId,
            descriptionURI: _descriptionURI,
            creator: msg.sender,
            assignedAgent: address(0),
            status: TaskStatus.Created,
            createdAt: block.timestamp,
            completedAt: 0,
            parentTask: _parentTask,
            dependencies: _dependencies,
            priority: _priority,
            deadline: _deadline,
            estimatedTime: _estimatedTime,
            actualTime: 0,
            retryCount: 0
        });

        taskIds.push(taskId);

        emit TaskCreated(taskId, _descriptionURI, msg.sender, _parentTask, _priority);
        return taskId;
    }

    /**
     * @notice Assigns an agent to execute the task.
     */
    function assignAgent(bytes32 _taskId, address _agent) external {
        require(tasks[_taskId].taskId != bytes32(0), "TaskRegistry: Task does not exist");
        require(tasks[_taskId].creator == msg.sender || msg.sender == owner(), "TaskRegistry: Unauthorized");
        
        tasks[_taskId].assignedAgent = _agent;
        tasks[_taskId].status = TaskStatus.Assigned;

        emit TaskAssigned(_taskId, _agent);
        emit TaskStatusUpdated(_taskId, TaskStatus.Assigned);
    }

    /**
     * @notice Transfers task assignment to another agent.
     */
    function transferTask(bytes32 _taskId, address _newAgent) external {
        require(tasks[_taskId].taskId != bytes32(0), "TaskRegistry: Task does not exist");
        require(tasks[_taskId].creator == msg.sender || msg.sender == owner(), "TaskRegistry: Unauthorized");

        address previousAgent = tasks[_taskId].assignedAgent;
        tasks[_taskId].assignedAgent = _newAgent;

        emit TaskTransferred(_taskId, previousAgent, _newAgent);
    }

    /**
     * @notice Marks a task as actively running.
     */
    function startTask(bytes32 _taskId) external {
        require(tasks[_taskId].taskId != bytes32(0), "TaskRegistry: Task does not exist");
        tasks[_taskId].status = TaskStatus.Running;

        emit TaskStarted(_taskId);
        emit TaskStatusUpdated(_taskId, TaskStatus.Running);
    }

    /**
     * @notice Marks task completed and logs execution duration.
     */
    function completeTask(bytes32 _taskId, uint256 _actualTime) external {
        require(tasks[_taskId].taskId != bytes32(0), "TaskRegistry: Task does not exist");
        tasks[_taskId].status = TaskStatus.Completed;
        tasks[_taskId].completedAt = block.timestamp;
        tasks[_taskId].actualTime = _actualTime;

        emit TaskCompleted(_taskId, _actualTime);
        emit TaskStatusUpdated(_taskId, TaskStatus.Completed);
    }

    /**
     * @notice Fails task execution and records retry count.
     */
    function failTask(bytes32 _taskId) external {
        require(tasks[_taskId].taskId != bytes32(0), "TaskRegistry: Task does not exist");
        tasks[_taskId].status = TaskStatus.Failed;
        tasks[_taskId].completedAt = block.timestamp;
        tasks[_taskId].retryCount += 1;

        emit TaskFailed(_taskId, tasks[_taskId].retryCount);
        emit TaskStatusUpdated(_taskId, TaskStatus.Failed);
    }

    /**
     * @notice Retries a failed task.
     */
    function retryTask(bytes32 _taskId) external {
        require(tasks[_taskId].taskId != bytes32(0), "TaskRegistry: Task does not exist");
        tasks[_taskId].status = TaskStatus.Assigned;
        
        emit TaskRetried(_taskId, tasks[_taskId].retryCount);
    }

    /**
     * @notice Cancels a task.
     */
    function cancelTask(bytes32 _taskId) external {
        require(tasks[_taskId].taskId != bytes32(0), "TaskRegistry: Task does not exist");
        require(tasks[_taskId].creator == msg.sender || msg.sender == owner(), "TaskRegistry: Unauthorized");
        tasks[_taskId].status = TaskStatus.Cancelled;

        emit TaskStatusUpdated(_taskId, TaskStatus.Cancelled);
    }

    /**
     * @notice Returns total number of registered tasks.
     */
    function getTaskCount() external view returns (uint256) {
        return taskIds.length;
    }

    /**
     * @notice Returns dependencies for a task.
     */
    function getTaskDependencies(bytes32 _taskId) external view returns (bytes32[] memory) {
        return tasks[_taskId].dependencies;
    }
}
