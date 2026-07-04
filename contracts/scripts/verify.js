import hre from "hardhat";

// Update these addresses after running deploy.js
const DEPLOYED_ADDRESSES = {
  AgentRegistry: "0x3Db729E9c90CFFDe2eD50E341F284004944d182b",
  TaskRegistry: "0xC653De91891bE3a890471b05F9994c6534598F5b",
  MemoryRegistry: "0xAbc8651EF90CffDe2eD50E341F284004944D182b",
  VerificationRegistry: "0x4Fa93a6EF50eE341F284004944d182b9c71eC36a",
  CollaborationRegistry: "0x7Fe53a6EF50eE341F284004944d182b9c71eC36a",
};

async function main() {
  console.log("Verifying ChainMind Protocol contracts on Block Explorer...");

  for (const [name, addr] of Object.entries(DEPLOYED_ADDRESSES)) {
    try {
      console.log(`Verifying contract ${name} at ${addr}...`);
      await hre.run("verify:verify", {
        address: addr,
        constructorArguments: [],
      });
      console.log(`Verified ${name} successfully!`);
    } catch (error) {
      console.error(`Failed to verify ${name}:`, error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
