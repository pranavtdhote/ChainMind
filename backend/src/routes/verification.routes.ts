import { Router } from "express";
import { VerificationController } from "../controllers/VerificationController";

const router = Router();
const verificationController = new VerificationController();

router.get("/", verificationController.getCases);
router.post("/:caseId/vote", verificationController.submitVote);

export default router;
