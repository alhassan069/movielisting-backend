const { Schema, model } = require("mongoose");

const actorSchema = new Schema({
    name: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: String, required: true },
    bio: { type: String, required: true },
    movies: [{
        type: Schema.Types.ObjectId,
        ref: "movie",
    }],
    profile_pic: { type: String, required: true },
}, {
    versionKey: false,
    timestamps: true,
});

module.exports = model("actor", actorSchema);