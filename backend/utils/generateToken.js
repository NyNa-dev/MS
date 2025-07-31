import jwt from "jsonwebtoken";

const generateTokenandSetCookie = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET,{
        expiresIn: "7d", // Token will expire in 7 days
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie will expire in 7 days
        httpOnly: true, // Cookie is not accessible via JavaScript
        sameSite: "strict", // Cookie is sent only for same-site requests
        secure: process.env.NODE_ENV !== "development", // Cookie is sent only over HTTPS in production
    }); // Set the JWT token in a cookie
};
export default generateTokenandSetCookie;

