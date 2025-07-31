import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },

    lastName: {
        type: String,
        required: true,
    },


    username: {
        type: String,
        required: true,
        unique: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}/,
    },

    password: {
        type: String,
        required: true,
        minilength: 7,
    },

    gender: {
        type: String,
        required: true,
        enum: ["male","female"]
    },

    profilePicture: {
        type: String,
        default: "",
    },
    // createdAt, updateAt
}, {timestamps: true}
);


const User = mongoose.model("User", userSchema);

export default User;