import { apiClient } from "../utils/api.js";

export const getEmotion = async (req, res) => {
    try {
        const { message } = req.query;

        if (!message) {
            return res.status(400).json({ error: "Message query parameter is required" });
        }

        const response = await apiClient.post("/analyze-emotion", {}, {
            params: { message }
        })

        const emotionsArray = response.data.emotions && response.data.emotions[0];
        let primaryEmotion

        if (emotionsArray && Array.isArray(emotionsArray) && emotionsArray.length > 0) {
            primaryEmotion = emotionsArray.reduce((max, emo) => {
                return emo.score > max.score ? emo : max;
            })
        } else {
            return res.status(400).json({
                error: "No emotions detected"
            })
        }


        return res.status(200).json({
            message,
            response: emotionsArray,
            primaryEmotion
        })
    } catch (error) {
        console.log("Error calling emotion api: ", error)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}