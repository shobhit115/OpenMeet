import express from "express";
import { createMeeting, joinMeeting } from "../controllers/meeting.controller.js";

const router = express.Router();

// POST request to create a meeting
router.post("/create", createMeeting);

// GET request to check if a meeting exists before joining
router.get("/join/:meetingCode", joinMeeting);

export default router;