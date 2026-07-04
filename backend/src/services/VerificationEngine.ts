import { SharedContext } from "../types/orchestrator";
import { IValidationResult } from "../models/CourtReport";

export interface IValidator {
  name: string;
  validate(context: SharedContext): Promise<IValidationResult>;
}

// 1. Requirement Validator
export class RequirementValidator implements IValidator {
  name = "Requirement Validator";
  async validate(context: SharedContext): Promise<IValidationResult> {
    const issues: string[] = [];
    let score = 100;

    const requirements = context.requirements || [];
    const completedTasks = context.completedTasks || [];

    if (requirements.length === 0) {
      issues.push("No initial requirements found in context.");
      score -= 30;
    }

    // Verify milestones completion
    if (!completedTasks.includes("Research")) {
      issues.push("Task graph indicates missing Research milestone.");
      score -= 20;
    }

    return {
      validatorName: this.name,
      score: Math.max(0, score),
      approved: score >= 75,
      issues,
      recommendation: score < 75 ? "Reassign to Manager to plan requirements mapping." : "Requirements satisfied.",
    };
  }
}

// 2. Architecture Validator
export class ArchitectureValidator implements IValidator {
  name = "Architecture Validator";
  async validate(context: SharedContext): Promise<IValidationResult> {
    const issues: string[] = [];
    let score = 100;
    
    const devOut = context.developerOutput;
    const researchOut = context.researchOutput;

    if (!devOut || !devOut.generatedModules) {
      issues.push("No developer output modules found to check architecture compliance.");
      score -= 40;
    } else {
      const designPattern = researchOut?.architecture?.pattern || "";
      const summary = devOut.implementationSummary || "";
      
      const patternFirstWord = designPattern.toLowerCase().split(" ")[0] || "";
      if (designPattern && patternFirstWord && !summary.toLowerCase().includes(patternFirstWord)) {
        issues.push(`Architecture design pattern divergence: Research suggested "${designPattern}" but Developer summary differs.`);
        score -= 20;
      }
    }

    return {
      validatorName: this.name,
      score: Math.max(0, score),
      approved: score >= 75,
      issues,
      recommendation: score < 75 ? "Align developer output module declarations with suggested system design patterns." : "Architecture patterns comply.",
    };
  }
}

// 3. Technology Validator
export class TechnologyValidator implements IValidator {
  name = "Technology Validator";
  async validate(context: SharedContext): Promise<IValidationResult> {
    const issues: string[] = [];
    let score = 100;

    const researchLibs = context.researchOutput?.libraries || [];
    const devModules = context.developerOutput?.generatedModules || [];

    if (researchLibs.length > 0 && devModules.length > 0) {
      const codeString = devModules.map((m: any) => m.code).join(" ");
      
      researchLibs.forEach((lib: string) => {
        const cleanLib = (lib.split("@")[0] || "").toLowerCase();
        if (cleanLib && cleanLib !== "framer-motion" && !codeString.toLowerCase().includes(cleanLib)) {
          issues.push(`Technology stack mismatch: Recommended library "${lib}" not utilized in code modules.`);
          score -= 15;
        }
      });
    }

    return {
      validatorName: this.name,
      score: Math.max(0, score),
      approved: score >= 75,
      issues,
      recommendation: score < 75 ? "Install recommended library versions and integrate them into source files." : "Technology alignment validated.",
    };
  }
}

// 4. Security Validator
export class SecurityValidator implements IValidator {
  name = "Security Validator";
  async validate(context: SharedContext): Promise<IValidationResult> {
    const issues: string[] = [];
    let score = 100;

    const devModules = context.developerOutput?.generatedModules || [];
    
    devModules.forEach((mod: any) => {
      const code = mod.code || "";
      
      // Smart contract vulnerabilities check
      if (mod.filePath.endsWith(".sol")) {
        if (code.includes("tx.origin")) {
          issues.push(`Security Hazard in ${mod.moduleName}: Authorization check uses dangerous 'tx.origin' pattern.`);
          score -= 40;
        }
        if (code.includes(".call{") && !code.includes("reentrancy") && !code.includes("nonReentrant")) {
          issues.push(`Security Threat in ${mod.moduleName}: External call performed without reentrancy guard.`);
          score -= 20;
        }
      }

      // Backend vulnerability checks
      if (mod.filePath.endsWith(".ts") || mod.filePath.endsWith(".js")) {
        if (code.includes("eval(") || code.includes("exec(")) {
          issues.push(`Malicious Command Pattern in ${mod.moduleName}: Usage of 'eval' or shell execute commands.`);
          score -= 30;
        }
      }
    });

    return {
      validatorName: this.name,
      score: Math.max(0, score),
      approved: score >= 80,
      issues,
      recommendation: score < 80 ? "Audit source code, remove unsafe execute blocks, and implement reentrancy guards." : "Security audit approved.",
    };
  }
}

// 5. Consistency Validator
export class ConsistencyValidator implements IValidator {
  name = "Consistency Validator";
  async validate(context: SharedContext): Promise<IValidationResult> {
    const issues: string[] = [];
    let score = 100;

    const researchSummary = JSON.stringify(context.researchOutput || {});
    const devSummary = JSON.stringify(context.developerOutput || {});

    // ⭐ Innovation Conflict Check: Recommended PostgreSQL but Developer used MySQL
    const pgTerms = ["postgres", "postgresql"];
    const mysqlTerms = ["mysql", "mariadb"];

    const researchRecommendsPg = pgTerms.some(term => researchSummary.toLowerCase().includes(term));
    const devUsesMysql = mysqlTerms.some(term => devSummary.toLowerCase().includes(term));

    if (researchRecommendsPg && devUsesMysql) {
      issues.push("Conflict Detected: Research recommended PostgreSQL database, but Developer utilized MySQL storage instead.");
      score -= 35;
    }

    return {
      validatorName: this.name,
      score: Math.max(0, score),
      approved: score >= 75,
      issues,
      recommendation: score < 75 ? "Align database connector parameters. Swap MySQL connection strings for PostgreSQL." : "Cross-agent outputs are consistent.",
    };
  }
}

// 6. Completeness Validator
export class CompletenessValidator implements IValidator {
  name = "Completeness Validator";
  async validate(context: SharedContext): Promise<IValidationResult> {
    const issues: string[] = [];
    let score = 100;

    const pendingTasks = context.pendingTasks || [];
    const completedTasks = context.completedTasks || [];

    if (pendingTasks.length > 0) {
      issues.push(`Unfinished task modules remain in workspace: ${pendingTasks.join(", ")}`);
      score -= 20;
    }

    if (completedTasks.length < 3) {
      issues.push("Swarm sequence terminated early. Under half of target milestones reached.");
      score -= 30;
    }

    return {
      validatorName: this.name,
      score: Math.max(0, score),
      approved: score >= 75,
      issues,
      recommendation: score < 75 ? "Resume orchestrator execution loop to process remaining pending tasks." : "Tasks complete.",
    };
  }
}

// 7. Monad Usage Validator
export class MonadUsageValidator implements IValidator {
  name = "Monad Usage Validator";
  async validate(context: SharedContext): Promise<IValidationResult> {
    const issues: string[] = [];
    let score = 100;

    const devModules = context.developerOutput?.generatedModules || [];
    let hasMonadIntegration = false;

    devModules.forEach((mod: any) => {
      const code = mod.code || "";
      if (code.toLowerCase().includes("monad") || code.toLowerCase().includes("10143")) {
        hasMonadIntegration = true;
      }
    });

    if (!hasMonadIntegration) {
      issues.push("Monad Integration missing: Code lacks Monad chain ID or testnet RPC parameters.");
      score -= 45;
    }

    return {
      validatorName: this.name,
      score: Math.max(0, score),
      approved: score >= 75,
      issues,
      recommendation: score < 75 ? "Add Monad Testnet Chain ID (10143) to contract deploy scripts." : "Monad configuration validated.",
    };
  }
}

// 8. IPFS Validator
export class IPFSValidator implements IValidator {
  name = "IPFS Validator";
  async validate(context: SharedContext): Promise<IValidationResult> {
    const issues: string[] = [];
    let score = 100;

    if (context.contextVersion && context.contextVersion > 1) {
      // Must contain a version change log pointer
      if (!context.agentHistory.some((h) => h.action.toLowerCase().includes("restored") || h.action.toLowerCase().includes("version"))) {
        issues.push("IPFS Rollback pointer missing: Version iteration lacks parent CID history link.");
        score -= 20;
      }
    }

    return {
      validatorName: this.name,
      score: Math.max(0, score),
      approved: score >= 75,
      issues,
      recommendation: score < 75 ? "Append parent IPFS CID hash parameter to version metadata." : "IPFS indexing verified.",
    };
  }
}

// 9. Best Practice Validator
export class BestPracticeValidator implements IValidator {
  name = "Best Practice Validator";
  async validate(context: SharedContext): Promise<IValidationResult> {
    const issues: string[] = [];
    let score = 100;

    const devModules = context.developerOutput?.generatedModules || [];
    
    if (devModules.length > 0) {
      devModules.forEach((mod: any) => {
        const code = mod.code || "";
        if (mod.filePath.endsWith(".ts") && !code.includes("interface ") && !code.includes("type ")) {
          issues.push(`Best practice warning in ${mod.moduleName}: TypeScript file lacks structured interface declarations.`);
          score -= 10;
        }
        if (code.includes("any")) {
          issues.push(`Best practice warning in ${mod.moduleName}: Usage of 'any' type checks detected.`);
          score -= 10;
        }
      });
    }

    return {
      validatorName: this.name,
      score: Math.max(0, score),
      approved: score >= 75,
      issues,
      recommendation: score < 75 ? "Replace 'any' with strongly typed interfaces and generic definitions." : "Best practices checked.",
    };
  }
}

// 10. Documentation Validator
export class DocumentationValidator implements IValidator {
  name = "Documentation Validator";
  async validate(context: SharedContext): Promise<IValidationResult> {
    const issues: string[] = [];
    let score = 100;

    if (!context.documentation) {
      issues.push("Documentation artifact missing in project memory.");
      score -= 30;
    } else {
      const doc = context.documentation;
      if (!doc.installation || !doc.usage) {
        issues.push("Documentation is incomplete: missing installation steps or usage manuals.");
        score -= 20;
      }
    }

    return {
      validatorName: this.name,
      score: Math.max(0, score),
      approved: score >= 75,
      issues,
      recommendation: score < 75 ? "Reassign to Documentation Agent to write setup details." : "Documentation validated.",
    };
  }
}

export class ValidatorFactory {
  static getValidators(): IValidator[] {
    return [
      new RequirementValidator(),
      new ArchitectureValidator(),
      new TechnologyValidator(),
      new SecurityValidator(),
      new ConsistencyValidator(),
      new CompletenessValidator(),
      new MonadUsageValidator(),
      new IPFSValidator(),
      new BestPracticeValidator(),
      new DocumentationValidator(),
    ];
  }
}

export class VerificationEngine {
  static async runAllValidators(context: SharedContext): Promise<IValidationResult[]> {
    const validators = ValidatorFactory.getValidators();
    const results: IValidationResult[] = [];

    for (const validator of validators) {
      const res = await validator.validate(context);
      results.push(res);
    }

    return results;
  }
}
