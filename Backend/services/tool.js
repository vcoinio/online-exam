var UserModel = require("../models/user");
const bcrypt = require('bcrypt');
const saltRounds = 10;


//create admin
//create admin
var createadmin = async () => {
    try {
        const existingAdmin = await UserModel.findOne({ where: { emailid: 'admin@test.com' } });
        if (existingAdmin) {
            console.log('\x1b[33m', "Admin User already exists.");
            return;
        }
        const hash = await bcrypt.hash("admin", saltRounds);
        var tempdata = new UserModel({
            name: 'Prince',
            password: hash,
            emailid: 'admin@test.com',
            contact: '8822629773',
            type: 'ADMIN',
        });
        await tempdata.save();
        console.log('\x1b[36m', "Admin User Data Is successfully created");
    } catch (err) {
        console.log("Error creating admin:", err);
    }
}



var hashPassword = (password) => {
    return (new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds).then(function (hash) {
            resolve(hash);
        }).catch((err) => {
            reject(err);
        })
    }))
}

module.exports = { createadmin, hashPassword }