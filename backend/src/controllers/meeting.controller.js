import { Meeting } from "../models/meeting.model.js"; // Adjust the path to your model

// 1. Create a new meeting
export const createMeeting = async (req, res) => {
    try {
        const { user_id, meetingCode } = req.body;

        if (!meetingCode) {
            return res.status(400).json({ error: "Meeting code is required" });
        }

        // Check if the meeting code already exists (optional, as Mongoose unique:true will throw an error anyway)
        const existingMeeting = await Meeting.findOne({ meetingCode });
        if (existingMeeting) {
            return res.status(409).json({ error: "Meeting code already exists" });
        }

        const newMeeting = new Meeting({
            user_id,
            meetingCode
        });

        await newMeeting.save();

        return res.status(201).json({ 
            message: "Meeting successfully created", 
            meetingCode: newMeeting.meetingCode 
        });

    } catch (error) {
        console.error("Error creating meeting:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// 2. Join/Verify an existing meeting
export const joinMeeting = async (req, res) => {
    try {
        const { meetingCode } = req.params;

        if (!meetingCode) {
            return res.status(400).json({ error: "Meeting code is required" });
        }

        // Search the database for the provided meeting code
        const meeting = await Meeting.findOne({ meetingCode });

        if (meeting) {
            return res.status(200).json({ 
                message: "Meeting found", 
                meeting 
            });
        } else {
            return res.status(404).json({ error: "Meeting not found or has expired" });
        }

    } catch (error) {
        console.error("Error joining meeting:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};