const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');

const Option = sequelize.define('Options', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    optbody: {
        type: DataTypes.STRING,
        allowNull: true
    },
    optimg: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isAnswer: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    timestamps: true,
    tableName: 'options'
});

module.exports = Option;
