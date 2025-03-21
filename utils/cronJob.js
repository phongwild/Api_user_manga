const User = require('../models/userModel');

const removeOldHistoryCron = async () => {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const users = await User.find();
    for (const user of users) {
        user.history = user.history.filter((item) => new Date(item.addedAt) >= tenDaysAgo);
        await user.save();
    }
    console.log('Old history cleaned up at', new Date().toLocaleTimeString());
};

module.exports = removeOldHistoryCron;
