const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const Hoot = require('../models/hoot.js');
const router = express.Router();

// POST - /hoots
router.post("/", verifyToken, async(req, res) => {
    try {
        req.body.author = req.user._id;
        const hoot = await Hoot.create(req.body);
        hoot._doc.author = req.user;
        res.status(201).json(hoot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET - /hoots
router.get('/', verifyToken, async(req, res) => {
    try {
        const hoots = await Hoot.find({}).populate('author').sort({ createdAt: 'desc' });

        res.status(200).json(hoots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET - /hoots/:hootId
router.get('/:hootId', verifyToken, async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId).populate("author");
        res.status(200).json(hoot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - /hoots/:hootId
router.put("/:hootId", verifyToken, async (req, res) => {
    try {
        // Find the hoot:
        const hoot = await Hoot.findById(req.params.hootId);

        // Check permissions:
        if (!hoot.author.equals(req.user._id)) {
        return res.status(403).send("You're not allowed to do that!");
        }

        // Update hoot:
        const updatedHoot = await Hoot.findByIdAndUpdate(
        req.params.hootId,
        req.body,
        { new: true }
        );

        // Append req.user to the author property:
        updatedHoot._doc.author = req.user;

        // Issue JSON response:
        res.status(200).json(updatedHoot);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// DELETE - /hoots/:hootId
router.delete("/:hootId", verifyToken, async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId);

        if (!hoot.author.equals(req.user._id)) {
            return res.status(403).send('You\'re not allowed to do that!');
        }

        const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);
        res.status(200).json(deletedHoot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;