// import spotifyApi from "../utils/spotify.js";
import SpotifyWebApi from "spotify-web-api-node";

import { v4 as uuid } from "uuid";



export const redirectToSpotifyLogin = (req, res) => {
    try {

        const spotifyApi = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            redirectUri: process.env.SPOTIFY_REDIRECT_URI
        })

        const state = uuid();
        const scopes = [
            "user-read-private",
            "user-read-email"
        ]
        const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

        res.cookie("spotify_auth_state", state, {
            maxAge: 1000 * 60 * 15, // Cookie will expire in 15 minutes
            httpOnly: true, // Cookie is not accessible via JavaScript
        })

        return res.redirect(authorizeURL);

    } catch (error) {
        console.log("Error in redirectToSpotifyLogin controller", error.message);
        res.status(500).json({ error: "Internal Server Error2" });
    }
}

export const spotifyCallback = async (req, res) => {

    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: process.env.SPOTIFY_REDIRECT_URI
    })


    //Check CSRF
    const returnedState = req.query.state;
    const storedState = req.cookies.spotify_auth_state;

    if (!returnedState || returnedState !== storedState) {
        res.clearCookie("spotify_auth_state");
        return res.status(400).json({ error: "Missing or malformed request" })
    }

    const { code } = req.query;
    if (!code) {
        res.clearCookie("spotify_auth_state");
        return res.status(400).json({ error: "missing code" });
    }
    try {

        //retrieve aothorization code
        const data = await spotifyApi.authorizationCodeGrant(code);
        const accessToken = data.body.access_token;
        const refreshToken = data.body.refresh_token;

        //storing tokens in cookies
        if (!accessToken || !refreshToken) {
            throw new Error("Failed to retrieve access or refresh token");
        }
        res.cookie("spotify_access_token", accessToken, {
            maxAge: 1000 * 60 * 60,
            httpOnly: true // Cookie will expire in 1 hour
        })
        res.cookie("spotify_refresh_token", refreshToken, {
            maxAge: 1000 * 60 * 60 * 6, // Cookie will expire in 6 hour
            httpOnly: true // Cookie will expire in 1 hour
        })

        //set tokens
        spotifyApi.setAccessToken(accessToken);
        spotifyApi.setRefreshToken(refreshToken);

        console.log(`Spotify access token: ${accessToken} \n refresh token: ${refreshToken}`);
        res.status(200).json({ message: "Spotify login successful" });


    } catch (error) {
        console.log("Error in Spotify callback controller:", error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

export const getUser = async (req, res) => {
    try {

        const spotifyAccessToken = req.cookies.spotify_access_token;
        if (!spotifyAccessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const spotifyApi = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            redirectUri: process.env.SPOTIFY_REDIRECT_URI
        })


        spotifyApi.setAccessToken(spotifyAccessToken);
        const me = await spotifyApi.getMe();
        if (!me.body) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({
            id: me.body.id,
            displayName: me.body.display_name,
            email: me.body.email,
            type: me.body.type,
            href: me.body.href,
            product: me.body.product,
        })


    } catch (error) {
        console.log("Error in getUser controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const searchTracksByMood = async (req, res) => {
    try {
        
        const spotifyAccessToken = req.cookies.spotify_access_token;
        if (!spotifyAccessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const spotifyApi = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            redirectUri: process.env.SPOTIFY_REDIRECT_URI
        })
        spotifyApi.setAccessToken(spotifyAccessToken);



        const { mood } = req.query;
        if (!mood) {
            return res.status(400).json({ error: "Bad request parameters" });
        }

        const searchResults = await spotifyApi.searchTracks(`mood:${mood}`, { limit: 10 });
        res.status(200).json()



    } catch (error) {
        console.log("Error in searchHandler controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });        
    }
}