import User from "../models/user.model.js";

// Logic for getting users for sidebar

export const getUsersforSidebar = async (req, res) => {
    try {

        const loggedInUserId = req.user._id;


        // Exclude the logged-in user from the results

        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        res.status(200).json(filteredUsers);

    }catch (error) {
        console.error("Error in getUsersforSidebar", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }

}