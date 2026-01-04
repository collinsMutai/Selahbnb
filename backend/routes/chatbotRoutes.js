import express from "express";
import { chatWithListingBot } from "../controllers/chatbotController.js";

const router = express.Router();

router.post("/chat", chatWithListingBot);

export default router;
