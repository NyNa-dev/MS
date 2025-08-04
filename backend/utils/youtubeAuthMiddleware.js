// // A new middleware file (e.g., youtubeAuthMiddleware.js)
// import { google } from "googleapis";
// import 'dotenv/config'; // Load environment variables

// // This is a factory function to create a new oauth2Client instance for each request
// const createOauth2Client = () => {
//     return new google.auth.OAuth2(
//         process.env.GOOGLE_CLIENT_ID,
//         process.env.GOOGLE_CLIENT_SECRET,
//         process.env.GOOGLE_REDIRECT_URI
//     );
// };


// export const youtubeAuthMiddleware = (req, res, next) => {
//     const accessToken = req.cookies.youtube_access_token;
//     if (!accessToken) {
//         return res.status(401).json({ error: "Unauthorized: No access token" });
//     }
//     const oauth2Client = new google.auth.OAuth2(
//         process.env.GOOGLE_CLIENT_ID,
//         process.env.GOOGLE_CLIENT_SECRET,
//         process.env.GOOGLE_REDIRECT_URI
//     );
//     oauth2Client.setCredentials({ access_token: accessToken });
//     req.youtubeOauth2Client = oauth2Client;
//     next();
// };


// export const setYouTubeCredentials = (req, res, next) => {
//     const accessToken = req.cookies.youtube_access_token;
//     const refreshToken = req.cookies.youtube_refresh_token;

//     // Attach a new, fresh oauth2Client to the request object
//     req.youtubeOauth2Client = createOauth2Client();

//     if (accessToken) {
//         req.youtubeOauth2Client.setCredentials({
//             access_token: accessToken,
//             refresh_token: refreshToken
//         });
//     }

    
    

//     // This part is crucial for automatic token refresh
//     if (accessToken && refreshToken) {
//         req.youtubeOauth2Client.setCredentials({
//             access_token: accessToken,
//             refresh_token: refreshToken
//         });

//         // Listen for the 'tokens' event to save new access tokens
//         req.youtubeOauth2Client.on('tokens', (tokens) => {
//             if (tokens.access_token) {
//                 // Update the access token cookie with the new one
//                 res.cookie("youtube_access_token", tokens.access_token, {
//                     maxAge: 1000 * 60 * 60, // 1 hour max age
//                     httpOnly: true,
//                     secure: process.env.NODE_ENV === 'production', // Use secure in prod
//                     sameSite: 'Lax'
//                 });
//             }
//             // Note: The refresh token typically only changes on the first grant
//         });
//     }



// };

