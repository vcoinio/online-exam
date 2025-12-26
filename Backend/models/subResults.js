const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');

const SubResult = sequelize.define('subResultsModel', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    explanation: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    correctAnswer: {
        type: DataTypes.JSONB, // Array of values
        allowNull: false
    },
    givenAnswer: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    weightage: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    iscorrect: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
    tableName: 'sub_results'
});

module.exports = SubResult;