const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');

const Subject = sequelize.define('SubjectModel', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    topic: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    timestamps: true,
    tableName: 'subjects'
});

module.exports = Subject;