//view all subjects and single subject
const { Subject, User } = require("../models");
let SubjectModel = Subject;

let createEditsubject = async (req, res, next) => {
    var _id = req.body._id || null;
    if (req.user.type === 'ADMIN') {
        req.check('topic', `invalid topic`).notEmpty();
        var errors = req.validationErrors()
        if (errors) {
            res.json({
                success: false,
                message: 'Invalid inputs',
                errors: errors
            })
        }
        else {
            var topic = req.body.topic;
            if (_id != null) {
                try {
                    await SubjectModel.update(
                        { topic: topic },
                        { where: { id: _id } }
                    );
                    res.json({
                        success: true,
                        message: "Subject name has been changed"
                    });
                } catch (err) {
                    res.status(500).json({
                        success: false,
                        message: "Unable to change Subject name"
                    });
                }
            }
            else {
                try {
                    const info = await SubjectModel.findOne({ where: { topic: topic } });
                    if (!info) {
                        await SubjectModel.create({
                            topic: topic,
                            createdBy: req.user.id
                        });
                        res.json({
                            success: true,
                            message: `New subject created successfully!`
                        });
                    }
                    else {
                        res.json({
                            success: false,
                            message: `This subject already exists!`
                        });
                    }
                } catch (err) {
                    console.log(err);
                    res.status(500).json({
                        success: false,
                        message: "Unable to create new subject!"
                    });
                }
            }
        }
    }
    else {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }
}

let getAllSubjects = async (req, res, next) => {
    try {
        const subject = await SubjectModel.findAll({
            where: { status: true },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            include: [{
                model: User,
                attributes: ['name']
            }]
        });

        res.json({
            success: true,
            message: `Success`,
            data: subject
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Unable to fetch data"
        });
    }
}

let getSingleSubject = async (req, res, next) => {
    let id = req.params._id;
    console.log(id);
    try {
        const subject = await SubjectModel.findOne({
            where: { id: id },
            attributes: { exclude: ['createdAt', 'updatedAt', 'status'] },
            include: [{
                model: User,
                attributes: ['name']
            }]
        });

        res.json({
            success: true,
            message: `Success`,
            data: subject
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Unable to fetch data"
        });
    }
}

module.exports = { createEditsubject, getAllSubjects, getSingleSubject }
