const { Schema, model } = require("mongoose");

const movieSchema = new Schema({
    name: { type: String, required: true },
    release_year: { type: Number, required: true },
    plot: { type: String, required: true },
    poster: { type: String, required: true },
    actors: [{
        type: Schema.Types.ObjectId,
        ref: "actor",
        required: true,
    }],
    producer: {
        type: Schema.Types.ObjectId,
        ref: "producer",
        required: true,
    },
}, {
    versionKey: false,
    timestamps: true,
});

module.exports = model("movie", movieSchema);