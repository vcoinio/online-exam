const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');

const AnswerSheet = sequelize.define('AnswersheetModel', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    startTime: {
        type: DataTypes.BIGINT, // Number in mongo, likely timestamp
        allowNull: false
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: 'answersheets'
});

module.exports = AnswerSheet;