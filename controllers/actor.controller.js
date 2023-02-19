const express = require("express");

const Actor = require("../models/actor.model");

const authenticate = require("../middlewares/authenticate");

const router = express.Router();

router.post(
    "/",
    authenticate,
    async (req, res) => {
        try {
            const actor = await Actor.create(req.body);

            return res.status(201).json({ actor });
        } catch (e) {
            return res.status(500).json({ status: "failed", message: e.message });
        }
    }
);

router.get("/", async (req, res) => {
    const actor = await Actor.find().populate("movies").lean().exec();
    return res.send(actor);
});

router.get("/:id", async (req, res) => {
    const actor = await Actor.findOne({ _id: ObjectId(req.params.id) }).lean().exec();

    return res.send(actor);
});

module.exports = router;
