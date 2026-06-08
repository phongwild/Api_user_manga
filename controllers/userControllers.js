const User = require('../models/userModel');

module.exports.getUsers = async (req, res) => {
    try {
        const { search, uid } = req.query;
        let users;

        if (!uid) {
            return res.status(400).json({ message: 'Missing user ID' });
        }

        if (search) {
            // const isObjectId = mongoose.Types.ObjectId.isValid(search);
            users = await User.find({
                $and: [
                    { _id: { $ne: uid } }, // Loại trừ người tìm kiếm
                    {
                        $or: [
                            { username: { $regex: search, $options: 'i' } },
                            { email: { $regex: search, $options: 'i' } }
                        ]
                    }
                ]
            });
        } else {
            users = await User.find({ _id: { $ne: uid } });
        }
        res.status(200).json(users);
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ message: `Internal server error + ${error}` });
    }
}

module.exports.profile = async (req, res) => {
    const token = req.signedCookies.jwt;
    if (token) {
        const decoded = jwt.verify(token, `${process.env.SECRET}`);
        const user = await User.findById(decoded.id);
        res.json(user);
    }
    else {
        res.status(400).json('no token');
    }
}

module.exports.getUserByID = async (req, res) => {
    try {
        const id = req.query.id;

        // Tìm user theo ID
        const user = await User.findById(id);

        // Kiểm tra nếu không tìm thấy user
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Trả về thông tin user nếu tìm thấy
        return res.status(200).json(user);
    } catch (error) {
        // Xử lý lỗi
        return res.status(500).json({ success: false, error: error.message });
    }
};

module.exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const allowedFields = ['username', 'avatar'];
        const updateFields = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateFields[field] = req.body[field];
            }
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
            new: true,
            runValidators: true,
        });

        return res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};