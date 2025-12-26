const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');

const Feedback = sequelize.define('FeedbackModel', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    feedback: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'feedback'
});

module.exports = Feedback;
