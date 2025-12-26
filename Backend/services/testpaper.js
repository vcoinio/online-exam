const { TestPaper, Question, Option, Subject, User, Result, Trainee, sequelize } = require("../models");
let TestPaperModel = TestPaper;
let QuestionModel = Question;
let ResultModel = Result;
let TraineeEnterModel = Trainee;
let SubjectModel = Subject;
let options = Option;
let result = require("../services/excel").result;

let createEditTest = async (req, res, next) => {
    var _id = req.body._id || null;
    if (req.user.type === 'TRAINER') {
        req.check('type', `invalid type`).notEmpty();
        req.check('title', 'enter title').notEmpty();
        req.check('questions', 'enter questions').notEmpty();

        var errors = req.validationErrors()
        if (errors) {
            res.json({
                success: false,
                message: 'Invalid inputs',
                errors: errors
            })
        }
        else {
            var title = req.body.title;
            var questions = req.body.questions; // Array of IDs
            var subjects = req.body.subjects; // Array of IDs

            if (_id != null) {
                try {
                    const testPaper = await TestPaperModel.findByPk(_id);
                    if (testPaper) {
                        await testPaper.update({ title: title });
                        if (questions) await testPaper.setQuestions(questions);
                        if (subjects) await testPaper.setSubjects(subjects);

                        res.json({
                            success: true,
                            message: "Testpaper has been updated!"
                        })
                    } else {
                        res.status(404).json({
                            success: false,
                            message: "Testpaper not found"
                        })
                    }
                } catch (err) {
                    res.status(500).json({
                        success: false,
                        message: "Unable to update testpaper!"
                    })
                }
            }
            else {
                var type = req.body.type;
                var difficulty = req.body.difficulty || 1;
                var organisation = req.body.organisation;
                var duration = req.body.duration;

                const t = await sequelize.transaction();

                try {
                    const existingTest = await TestPaperModel.findOne({
                        where: { title: title, type: type, testbegins: false }
                    });

                    if (!existingTest) {
                        const newTestPaper = await TestPaperModel.create({
                            type: type,
                            title: title,
                            difficulty: difficulty,
                            organisation: organisation,
                            duration: duration,
                            createdBy: req.user.id
                        }, { transaction: t });

                        if (questions && questions.length > 0) {
                            await newTestPaper.setQuestions(questions, { transaction: t });
                        }
                        if (subjects && subjects.length > 0) {
                            await newTestPaper.setSubjects(subjects, { transaction: t });
                        }

                        await t.commit();

                        res.json({
                            success: true,
                            message: `New testpaper created successfully!`,
                            testid: newTestPaper.id
                        })
                    } else {
                        await t.rollback();
                        res.json({
                            success: false,
                            message: `This testpaper already exists!`
                        })
                    }
                } catch (err) {
                    await t.rollback();
                    console.log(err);
                    res.status(500).json({
                        success: false,
                        message: "Unable to create new testpaper!"
                    })
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

let getSingletest = async (req, res, next) => {
    let id = req.params._id;
    console.log(id);
    try {
        const testpaper = await TestPaperModel.findOne({
            where: { id: id, status: true },
            attributes: { exclude: ['createdAt', 'updatedAt', 'status'] },
            include: [
                { model: User, attributes: ['name'] },
                {
                    model: SubjectModel,
                    as: 'subjects',
                    attributes: ['topic'],
                    through: { attributes: [] }
                },
                {
                    model: QuestionModel,
                    as: 'questions',
                    attributes: ['body'],
                    through: { attributes: [] },
                    include: [{ model: options, as: 'options' }]
                }
            ]
        });



        const data = testpaper ? [testpaper.toJSON()] : [];
        if (data.length > 0) data[0]._id = testpaper.id;

        res.json({
            success: true,
            message: `Success`,
            data: data
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            message: "Unable to fetch data"
        })
    }
}

let getAlltests = async (req, res, next) => {
    if (req.user.type === 'TRAINER') {
        try {
            const testpapers = await TestPaperModel.findAll({
                where: { createdBy: req.user.id, status: true },
                attributes: { exclude: ['status'] },
                include: [
                    {
                        model: SubjectModel,
                        as: 'subjects',
                        through: { attributes: [] }
                    },
                    {
                        model: QuestionModel,
                        as: 'questions',
                        attributes: ['body'],
                        through: { attributes: [] },
                        include: [{ model: options, as: 'options' }]
                    }
                ]
            });

            const data = testpapers.map(t => {
                const test = t.toJSON();
                test._id = t.id;
                return test;
            });

            res.json({
                success: true,
                message: `Success`,
                data: data
            })
        } catch (err) {
            console.log(err)
            res.status(500).json({
                success: false,
                message: "Unable to fetch data"
            })
        }
    }
    else {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }
}

let deleteTest = async (req, res, next) => {
    if (req.user.type === 'TRAINER') {
        var _id = req.body._id;
        try {
            await TestPaperModel.update({ status: false }, {
                where: { id: _id }
            });
            res.json({
                success: true,
                message: "Test has been deleted"
            })
        } catch (err) {
            res.status(500).json({
                success: false,
                message: "Unable to delete test"
            })
        }
    }
    else {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }
}

let TestDetails = async (req, res, next) => {
    if (req.user.type === 'TRAINER') {
        let testid = req.body.id;
        try {
            const testDetails = await TestPaperModel.findOne({
                where: { id: testid, createdBy: req.user.id },
                attributes: { exclude: ['isResultgenerated', 'isRegistrationavailable', 'createdBy', 'status', 'testbegins', 'questions'] },
                include: [{
                    model: SubjectModel,
                    as: 'subjects',
                    attributes: ['topic'],
                    through: { attributes: [] }
                }]
            });

            if (!testDetails) {
                res.json({
                    success: false,
                    message: 'Invalid test id.'
                })
            } else {
                const data = testDetails.toJSON();
                data._id = testDetails.id;
                res.json({
                    success: true,
                    message: 'Success',
                    data: data
                })
            }
        } catch (err) {
            console.log(err)
            res.status(500).json({
                success: false,
                message: "Unable to fetch details"
            })
        }
    } else {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }
}

let basicTestdetails = async (req, res, next) => {
    if (req.user.type === 'TRAINER') {
        let testid = req.body.id;
        try {
            const details = await TestPaperModel.findByPk(testid, {
                attributes: { exclude: ['questions'] },
                include: [
                    { model: User, attributes: ['name'] },
                    { model: SubjectModel, as: 'subjects', attributes: ['topic'], through: { attributes: [] } }
                ]
            });

            if (!details) {
                res.json({
                    success: false,
                    message: 'Invalid test id.'
                })
            }
            else {
                const data = details.toJSON();
                data._id = details.id;
                res.json({
                    success: true,
                    message: 'Success',
                    data: data
                })
            }
        } catch (err) {
            console.log(err)
            res.status(500).json({
                success: false,
                message: "Unable to fetch details"
            })
        }
    }
    else {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }
}

let getTestquestions = async (req, res, next) => {
    if (req.user.type === "TRAINER") {
        var testid = req.body.id;
        try {
            const testPaper = await TestPaperModel.findByPk(testid, {
                include: [{
                    model: QuestionModel,
                    as: 'questions',
                    attributes: ['body', 'quesimg', 'weightage', 'anscount'],
                    through: { attributes: [] },
                    include: [{ model: options, as: 'options' }]
                }]
            });

            if (!testPaper) {
                res.json({
                    success: false,
                    message: 'Invalid test id.'
                })
            }
            else {
                const result = testPaper.questions.map(q => {
                    const qjson = q.toJSON();
                    qjson._id = q.id;
                    return qjson;
                });
                res.json({
                    success: true,
                    message: 'Success',
                    data: result
                })
            }
        } catch (err) {
            console.log(err)
            res.status(500).json({
                success: false,
                message: "Unable to fetch details"
            })
        }
    }
    else {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }
}

let getCandidateDetails = async (req, res, next) => {
    if (req.user.type === "TRAINER") {
        var testid = req.body.testid;
        try {
            const details = await ResultModel.findAll({
                where: { testid: testid },
                attributes: ['score', 'userid'],
                include: [{ model: TraineeEnterModel }]
            });

            if (!details || details.length === 0) {
                res.json({
                    success: false,
                    message: 'Invalid testid or no candidates!'
                })
            } else {
                const data = details.map(d => {
                    const json = d.toJSON();
                    // Trainee info might be nested, let's leave it as is unless we know what frontend expects
                    return json;
                });
                res.json({
                    success: true,
                    message: 'Candidate details',
                    data: data
                })
            }
        } catch (err) {
            console.log(err)
            res.status(500).json({
                success: false,
                message: "Unable to fetch details"
            })
        }
    }
    else {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }
}


let getCandidates = async (req, res, next) => {
    if (req.user.type === "TRAINER") {
        var testid = req.body.id;
        try {
            const candidates = await TraineeEnterModel.findAll({
                where: { testid: testid },
                attributes: { exclude: ['testid'] }
            });
            const data = candidates.map(c => {
                const json = c.toJSON();
                json._id = c.id;
                return json;
            });
            res.json({
                success: true,
                message: "success",
                data: data
            })
        } catch (err) {
            res.status(500).json({
                success: false,
                message: "Unable to get candidates!"
            })
        }
    }
    else {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }
}

let beginTest = async (req, res, next) => {
    if (req.user.type === "TRAINER") {
        var id = req.body.id;
        try {
            const [updated] = await TestPaperModel.update(
                { testbegins: true, isRegistrationavailable: false },
                { where: { id: id, testconducted: false } }
            );

            if (updated) {
                const data = await TestPaperModel.findByPk(id);
                res.json({
                    success: true,
                    message: 'Test has been started.',
                    data: {
                        isRegistrationavailable: data.isRegistrationavailable,
                        testbegins: data.testbegins,
                        testconducted: data.testconducted,
                        isResultgenerated: data.isResultgenerated
                    }
                })
            }
            else {
                res.json({
                    success: false,
                    message: "Unable to start test or test already conducted."
                })
            }
        } catch (err) {
            res.status(500).json({
                success: false,
                message: "Server Error"
            })
        }
    }
    else {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }
}

let endTest = async (req, res, next) => {
    if (req.user.type === "TRAINER") {
        var id = req.body.id;
        try {
            const [updated] = await TestPaperModel.update(
                { testbegins: false, testconducted: true, isResultgenerated: true },
                { where: { id: id, testconducted: false, testbegins: true } }
            );

            if (updated) {
                const info = await TestPaperModel.findByPk(id);
                try {
                    const maxMarks = await MaxMarks(id);
                    await result(id, maxMarks); // Assuming result() supports async/await or returns promise

                    res.json({
                        success: true,
                        message: 'The test has ended.',
                        data: {
                            isRegistrationavailable: info.isRegistrationavailable,
                            testbegins: info.testbegins,
                            testconducted: info.testconducted,
                            isResultgenerated: info.isResultgenerated
                        }
                    })
                } catch (error) {
                    console.log(error)
                    res.status(500).json({
                        success: false,
                        message: "Server Error during result generation"
                    })
                }
            }
            else {
                res.json({
                    success: false,
                    message: "Invalid inputs! or test not running"
                })
            }
        } catch (err) {
            console.log(err)
            res.status(500).json({
                success: false,
                message: "Server Error"
            })
        }
    }
    else {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }
}

let MaxMarks = async (testid) => {
    try {
        const testPaper = await TestPaperModel.findByPk(testid, {
            include: [{
                model: QuestionModel,
                as: 'questions',
                attributes: ['weightage'],
                through: { attributes: [] }
            }]
        });

        if (!testPaper) {
            throw new Error('Invalid testid');
        }

        let m = 0;
        testPaper.questions.map((d) => {
            m += d.weightage;
        })
        console.log(m)
        return m;
    } catch (err) {
        throw err;
    }
}

let MM = async (req, res, next) => {
    var testid = req.body.testid;
    if (req.user.type === 'TRAINER') {
        try {
            const MaxM = await MaxMarks(testid);
            res.json({
                success: true,
                message: 'Maximum Marks',
                data: MaxM
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Unable to get Max Marks",
            })
        }
    } else {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }
}

let checkTestName = async (req, res, next) => {
    var testName = req.body.testname;
    if (req.user.type === 'TRAINER') {
        try {
            const data = await TestPaperModel.findOne({ where: { title: testName } });
            if (data) {
                res.json({
                    success: true,
                    can_use: false
                })
            }
            else {
                res.json({
                    success: true,
                    can_use: true
                })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Server error"
            })
        }
    }
    else {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }
}

module.exports = { checkTestName, createEditTest, getSingletest, getAlltests, deleteTest, MaxMarks, MM, getCandidateDetails, basicTestdetails, TestDetails, getTestquestions, getCandidates, beginTest, endTest }