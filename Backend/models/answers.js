const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');

const Answer = sequelize.define('AnswersModel', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    questionid: {
        type: DataTypes.STRING, /* or UUID if we strictly link to QuestionModel, but schema said String. */
        allowNull: false
    },
    chosenOption: {
        type: DataTypes.JSONB,
        defaultValue: []
    }
}, {
    timestamps: true,
    tableName: 'answers'
});

module.exports = Answer;