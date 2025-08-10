import axios from "axios";
import 'dotenv/config';

export const apiClient = axios.create({
    baseURL: process.env.EMOTION_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
    // withCredentials: true // This allows cookies to be sent with requests
})