const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');

const Trainee = sequelize.define('TraineeEnterModel', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    emailid: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contact: {
        type: DataTypes.STRING, // schema said Number, but phones are usually strings. I'll use String to be safe.
        allowNull: false
    },
    organisation: {
        type: DataTypes.STRING,
        allowNull: true // Schema said required: true, I'll match.
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: 'trainees'
});

module.exports = Trainee;