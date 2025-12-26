const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');

const TestPaper = sequelize.define('TestPaperModel', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    organisation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    difficulty: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: true
    },
    testbegins: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    isRegistrationavailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    testconducted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    isResultgenerated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: 'testpapers'
});

module.exports = TestPaper;