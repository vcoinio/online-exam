const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');

const Question = sequelize.define('QuestionModel', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    body: {
        type: DataTypes.STRING,
        allowNull: false
    },
    weightage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    anscount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    explanation: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    quesimg: {
        type: DataTypes.STRING,
        allowNull: true
    },
    difficulty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    timestamps: true,
    tableName: 'questions'
});

module.exports = Question;