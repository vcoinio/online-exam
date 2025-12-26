const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');

const Result = sequelize.define('ResultModel', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    score: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true,
    tableName: 'results'
});

module.exports = Result;