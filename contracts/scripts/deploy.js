import hre from "hardhat";

async function main() {
  console.log("Starting deployment of ChainMind Protocol contracts...");

  // 1. Deploy AgentRegistry
  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy();
  await agentRegistry.waitForDeployment();
  const agentRegistryAddr = await agentRegistry.getAddress();
  console.log(`AgentRegistry deployed to: ${agentRegistryAddr}`);

  // 2. Deploy TaskRegistry
  const TaskRegistry = await hre.ethers.getContractFactory("TaskRegistry");
  const taskRegistry = await TaskRegistry.deploy();
  await taskRegistry.waitForDeployment();
  const taskRegistryAddr = await taskRegistry.getAddress();
  console.log(`TaskRegistry deployed to: ${taskRegistryAddr}`);

  // 3. Deploy MemoryRegistry
  const MemoryRegistry = await hre.ethers.getContractFactory("MemoryRegistry");
  const memoryRegistry = await MemoryRegistry.deploy();
  await memoryRegistry.waitForDeployment();
  const memoryRegistryAddr = await memoryRegistry.getAddress();
  console.log(`MemoryRegistry deployed to: ${memoryRegistryAddr}`);

  // 4. Deploy VerificationRegistry
  const VerificationRegistry = await hre.ethers.getContractFactory("VerificationRegistry");
  const verificationRegistry = await VerificationRegistry.deploy();
  await verificationRegistry.waitForDeployment();
  const verificationRegistryAddr = await verificationRegistry.getAddress();
  console.log(`VerificationRegistry deployed to: ${verificationRegistryAddr}`);

  // 5. Deploy CollaborationRegistry
  const CollaborationRegistry = await hre.ethers.getContractFactory("CollaborationRegistry");
  const collaborationRegistry = await CollaborationRegistry.deploy();
  await collaborationRegistry.waitForDeployment();
  const collaborationRegistryAddr = await collaborationRegistry.getAddress();
  console.log(`CollaborationRegistry deployed to: ${collaborationRegistryAddr}`);

  // 6. Set up authorizations in AgentRegistry so TaskRegistry & VerificationRegistry can modify reputation
  console.log("Setting caller authorization rules in AgentRegistry...");
  
  let tx = await agentRegistry.setCallerAuthorization(taskRegistryAddr, true);
  await tx.wait();
  console.log(`Authorized TaskRegistry in AgentRegistry.`);

  tx = await agentRegistry.setCallerAuthorization(verificationRegistryAddr, true);
  await tx.wait();
  console.log(`Authorized VerificationRegistry in AgentRegistry.`);

  console.log("ChainMind Protocol contracts deployment and authorization finished successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
