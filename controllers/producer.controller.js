const express = require("express");

const authenticate = require('../middlewares/authenticate');

const Producer = require("../models/producer.model");

const router = express.Router();

router.post(
    "/",
    authenticate,
    async (req, res) => {
        try {
            const producer = await Producer.create(req.body);

            return res.status(201).json({ producer });
        } catch (e) {
            return res.status(500).json({ status: "failed", message: e.message });
        }
    }
);

router.get("/", async (req, res) => {
    const producer = await Producer.find().populate("movies").lean().exec();
    return res.send(producer);
});

router.get("/:id", async (req, res) => {
    const producer = await Producer.findOne({ _id: ObjectId(req.params.id) }).lean().exec();

    return res.send(producer);
});

module.exports = router;
