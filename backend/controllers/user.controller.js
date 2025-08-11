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

// exports .setPreferredPlatform = async (req, res) => {
//   try {
//     const { platform } = req.body;
//     if (!platform) {
//       return res.status(400).json({ message: 'Platform is required' });
//     }

//     const validPlatforms = ['spotify', 'youtube', 'apple_music'];
//     if (!validPlatforms.includes(platform)) {
//       return res.status(400).json({ message: 'Invalid platform' });
//     }

//     const user = await User.findByIdAndUpdate(
//       req.user.id, // requires protectRoute middleware to set req.user
//       { preferredPlatform: platform },
//       { new: true }
//     );

//     res.json({ message: 'Platform updated successfully', user });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };
