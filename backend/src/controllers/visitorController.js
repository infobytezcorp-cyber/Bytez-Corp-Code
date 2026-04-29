import Visitor from "../models/VisitorModule.js";


// 🔹 SAVE VISITOR (CHECK-IN)
export const registerVisitor = async (req, res) => {
    try {
        const { name, phone, purpose } = req.body;

        const visitor = await Visitor.create({
            name,
            phone,
            purpose,
            checkInTime: new Date(),
            status: "Checked-In",
        });

        res.json(visitor);
    } catch (err) {
        res.status(500).json(err.message);
    }
};


// 🔹 GET ALL VISITORS
export const getVisitors = async (req, res) => {
    try {
        const { date, page = 1, limit = 5 } = req.query;

        let filter = {};

        // 📅 Date filter (same as your logic)
        if (date) {
            const start = new Date(date + "T00:00:00.000Z");
            const end = new Date(date + "T23:59:59.999Z");

            filter.checkInTime = {
                $gte: start,
                $lte: end,
            };
        }

        // 🔥 Pagination logic
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;

        const visitors = await Visitor.find(filter)
            .sort({ checkInTime: -1 }) // latest first
            .skip(skip)
            .limit(pageSize);

        const total = await Visitor.countDocuments(filter);

        res.json({
            visitors,
            currentPage: pageNumber,
            totalPages: Math.ceil(total / pageSize),
            totalData: total,
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// 🔹 CHECKOUT VISITOR
export const checkoutVisitor = async (req, res) => {
    try {
        const visitor = await Visitor.findById(req.params.id);

        if (!visitor) {
            return res.status(404).json({ message: "Visitor not found" });
        }

        visitor.checkOutTime = new Date();
        visitor.status = "Checked-Out";

        await visitor.save();

        res.json({success: true, visitor});
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

// 🔹 UPDATE VISITOR NAME
export const updateVisitor = async (req, res) => {
    try {
        const { name } = req.body;

        const visitor = await Visitor.findByIdAndUpdate(
            req.params.id,
            { name },
            { returnDocument: 'after' }
        );

        if (!visitor) {
            return res.status(404).json({ message: "Visitor not found" });
        }

        res.json(visitor);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};