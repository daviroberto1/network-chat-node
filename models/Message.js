const db = require('../db/conn')
const { Sequelize, DataTypes } = require("sequelize")

const User = require('./User')

const Message = db.sequelize.define('Message',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    message: {
        type: DataTypes.STRING
    }
})

Message.belongsTo(User)
User.hasMany(Message)

module.exports = Message;