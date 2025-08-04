import { google } from "googleapis";
import { v4 as uuid } from "uuid";
import 'dotenv/config';

export const redirectToYoutubeLogin = (req, res) => {
    try {
        //create a new OAuth2 client
        const oauth2Client = new google.auth.OAuth2({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            redirectUri: process.env.GOOGLE_REDIRECT_URI
        })

        const state = uuid(); // Generate a unique state parameter
        const scopes = [
            "https://www.googleapis.com/auth/youtube.readonly",
            "https://www.googleapis.com/auth/userinfo.email"
        ];

        const authorizeUrl = oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: scopes,
            state,
            prompt: "consent"
        });

        res.cookie("youtube_auth_state", state, {
            maxage: 1000 * 60 * 15,
            httpOnly: true,
        })

        return res.redirect(authorizeUrl);
    } catch (error) {
        console.log("Error in redirectToYoutubeLogin controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });

    }
}

export const youtubeCallback = async (req, res) => {
    const oauth2Client = new google.auth.OAuth2(
         process.env.GOOGLE_CLIENT_ID,
         process.env.GOOGLE_CLIENT_SECRET,
         process.env.GOOGLE_REDIRECT_URI
    );

    // Check CSRF
    const returnedState = req.query.state;
    const storedState = req.cookies.youtube_auth_state;

    if (!returnedState || returnedState !== storedState) {
        res.clearCookie("youtube_auth_state");
        return res.status(400).json({ error: "Missing or malformed request" });
    }

    const { code } = req.query;
    if (!code) {
        res.clearCookie("youtube_auth_state");
        return res.status(400).json({ error: "Missing code" });
    }

    try {

        //retrieve authorization code
        const data = await oauth2Client.getToken(code);
        const accessToken = data.tokens.access_token;
        const refreshToken = data.tokens.refresh_token;

        if (!accessToken || !refreshToken) {
            throw new Error("Failed to retrieve access or refresh token");
        }

        res.cookie("youtube_access_token", accessToken, {
            maxAge: 1000 * 60 * 60, // 1 hour max age
            httpOnly: true, // Cookie is not accessible via JavaScript
        });
        res.cookie("youtube_refresh_token", refreshToken, {
            maxAge: 1000 * 60 * 60 * 6, // 6 hours max age
            httpOnly: true, // Cookie is not accessible via JavaScript
        });
        console.log(`YouTube access token: ${accessToken}`);
        res.status(200).json({ message: "YouTube login successful" });

    } catch (error) {
        console.log("Error in youtubeCallback controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getYoutubeUser = async (req, res) => {
    try {
        const youtubeAccessToken = req.cookies.youtube_access_token;
    if (!youtubeAccessToken) {
        return res.status(401).json({ error: "Unauthorized"})
    }

    const oauth2Client = new google.auth.OAuth2({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI
    })

    oauth2Client.setCredentials({ access_token: youtubeAccessToken });
    
    const youtube = google.youtube({
        version: "v3",
        auth: oauth2Client
    })

    const response = await youtube.channels.list({
        part: "snippet,contentDetails,statistics",
        mine: true
    })

    const userChannel = response.data.items?.[0]
    if (!userChannel) {
        return res.status(404).json({ error: "YouTube channel not found" });
    }

    res.status(200).json({
        data: userChannel
    })
    

    } catch (error) {
        console.error("YouTube getUser error:", error);

        if(error.code === 401) {
            res.clearCookie("youtube_access_token")
            res.redirect("/api/youtube/login");
            return;
        }

        res.status(500).json({ error: "Failed to fetch YouTube account info" });
    }
}