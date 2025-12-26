const { Trainee, TestPaper, Feedback, Question, Option, AnswerSheet, Answer, sequelize } = require("../models");
const TraineeEnterModel = Trainee;
const TestPaperModel = TestPaper;
const FeedbackModel = Feedback;
const QuestionModel = Question;
const options = Option;
const AnswersheetModel = AnswerSheet;
const AnswersModel = Answer;
const sendmail = require("../services/mail").sendmail;
const { Op } = require("sequelize");

let traineeenter = async (req, res, next) => {
    req.check('emailid', ` Invalid email address.`).isEmail().notEmpty();
    req.check('name', 'This field is required.').notEmpty();
    req.check('contact', 'Invalid contact.').isLength({ min: 13, max: 13 }).isNumeric({ no_symbols: false });
    var errors = req.validationErrors()
    if (errors) {
        res.json({
            success: false,
            message: 'Invalid inputs',
            errors: errors
        })
    }
    else {
        var name = req.body.name;
        var emailid = req.body.emailid;
        var contact = req.body.contact;
        var organisation = req.body.organisation;
        var testid = req.body.testid;
        var location = req.body.location;

        try {
            const info = await TestPaperModel.findOne({ where: { id: testid, isRegistrationavailable: true } });

            if (info) {
                const data = await TraineeEnterModel.findOne({
                    where: {
                        [Op.or]: [
                            { emailid: emailid, testid: testid },
                            { contact: contact, testid: testid }
                        ]
                    }
                });

                if (data) {
                    res.json({
                        success: false,
                        message: "This id has already been registered for this test!"
                    })
                }
                else {
                    const u = await TraineeEnterModel.create({
                        name: name,
                        emailid: emailid,
                        contact: contact,
                        organisation: organisation,
                        testid: testid,
                        location: location
                    });

                    sendmail(emailid, "Registered Successfully", `You have been successfully registered for the test. Click on the link given to take test  "${req.protocol + '://' + req.get('host')}/trainee/taketest?testid=${testid}&traineeid=${u.id}"`)
                        .then((dd) => {
                            console.log(dd)
                        }).catch((errr) => {
                            console.log(errr);
                        });

                    res.json({
                        success: true,
                        message: `Trainee registered successfully!`,
                        user: u
                    })
                }
            }
            else {
                res.json({
                    success: false,
                    message: ` Registration for this test has been closed!`
                })
            }
        } catch (err) {
            console.log(err)
            res.status(500).json({
                success: false,
                message: `Server error!`
            })
        }
    }
}

let correctAnswers = async (req, res, next) => {
    var _id = req.body._id;
    try {
        const correctAnswers = await TestPaperModel.findAll({
            where: { id: _id, testconducted: true },
            attributes: { exclude: ['type', 'subjects', 'duration', 'organisation', 'difficulty', 'testbegins', 'status', 'createdBy', 'isRegistrationavailable', 'testconducted'] },
            include: [{
                model: QuestionModel,
                as: 'questions',
                attributes: ['body', 'quesimg', 'weightage', 'anscount', 'explanation'],
                through: { attributes: [] },
                include: [{
                    model: options,
                    as: 'options'
                }]
            }]
        });

        if (!correctAnswers || correctAnswers.length === 0) {
            res.json({
                success: false,
                message: 'Invalid test id.'
            })
        }
        else {
            res.json({
                success: true,
                message: 'Success',
                data: correctAnswers
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

let feedback = async (req, res, next) => {
    var userid = req.body.userid;
    var testid = req.body.testid;
    var feedback = req.body.feedback;
    var rating = req.body.rating;

    try {
        await FeedbackModel.create({
            feedback: feedback,
            rating: rating,
            userid: userid,
            testid: testid
        });
        res.json({
            success: true,
            message: `Feedback recorded successfully!`
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Error occured!"
        })
    }
}

let checkFeedback = async (req, res, next) => {
    var userid = req.body.userid;
    var testid = req.body.testid;
    try {
        const info = await FeedbackModel.findOne({ where: { userid: userid, testid: testid } });
        if (!info) {
            res.json({
                success: true,
                message: 'Feedback is not given by this userid.',
                status: false
            })
        } else {
            res.json({
                success: true,
                message: 'Feedback given',
                status: true
            })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Error occured!"
        })
    }
}

let resendmail = async (req, res, next) => {
    var userid = req.body.id;
    try {
        const info = await TraineeEnterModel.findByPk(userid, { attributes: ['id', 'emailid', 'testid'] });
        if (info) {
            console.log(info)
            sendmail(info.emailid, "Registered Successfully", `You have been successfully registered for the test. Click on the link given to take test  "${req.protocol + '://' + req.get('host')}/trainee/taketest?testid=${info.testid}&traineeid=${info.id}"`)
                .then((dd) => {
                    console.log(dd)
                }).catch((errr) => {
                    console.log(errr);
                })
            res.json({
                success: true,
                message: `Link sent successfully!`,
            })
        }
        else {
            res.json({
                success: false,
                message: "This user has not been registered."
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

let Testquestions = async (req, res, next) => {
    var testid = req.body.id;
    try {
        const testPaper = await TestPaperModel.findByPk(testid, {
            attributes: { exclude: ['type', 'title', 'subjects', 'organisation', 'difficulty', 'testbegins', 'status', 'createdBy', 'isRegistrationavailable'] },
            include: [{
                model: QuestionModel,
                as: 'questions',
                attributes: ['body', 'quesimg', 'weightage', 'anscount'], // 'duration' was in generic select but not in question model typically? Check model.
                through: { attributes: [] },
                include: [{
                    model: options,
                    as: 'options',
                    attributes: ['optbody', 'optimg']
                }]
            }]
        });

        if (!testPaper) {
            res.json({
                success: false,
                message: 'Invalid test id.'
            })
        }
        else {
            res.json({
                success: true,
                message: 'Success',
                data: testPaper.questions
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

let Answersheet = async (req, res, next) => {
    var userid = req.body.userid;
    var testid = req.body.testid;

    try {
        const traineeUser = await TraineeEnterModel.findOne({ where: { id: userid, testid: testid } });
        const testPaper = await TestPaperModel.findOne({
            where: { id: testid, testbegins: true, testconducted: false },
            include: [{
                model: QuestionModel,
                as: 'questions',
                through: { attributes: [] }
            }]
        });

        if (traineeUser && testPaper) {
            const existingSheet = await AnswersheetModel.findAll({ where: { userid: userid, testid: testid } });

            if (existingSheet.length > 0) {
                res.json({
                    success: true,
                    message: 'Answer Sheet already exists!',
                    data: existingSheet
                })
            }
            else {
                const questions = testPaper.questions;
                const answerData = questions.map(q => ({
                    questionid: q.id,
                    chosenOption: [], // Initialize as empty array (JSON)
                    userid: userid
                }));

                const t = await sequelize.transaction();

                try {
                    // Create answers, but we need to associate them with the sheet later? 
                    // Or create sheet first? 
                    // In index.js: AnswerSheet.hasMany(Answer, { as: 'answers', foreignKey: 'answerSheetId' });
                    // So we should create Sheet, then create Answers with sheetId.

                    const startTime = Date.now(); // Store as number/bigint
                    const newSheet = await AnswersheetModel.create({
                        startTime: startTime,
                        testid: testid,
                        userid: userid,
                        completed: false
                    }, { transaction: t });

                    // Associate questions to the sheet (Many-to-Many)
                    await newSheet.setQuestions(questions, { transaction: t });

                    // Create Answer records linked to the sheet
                    const answersWithSheetId = answerData.map(a => ({
                        ...a,
                        answerSheetId: newSheet.id
                    }));

                    await AnswersModel.bulkCreate(answersWithSheetId, { transaction: t });

                    await t.commit();

                    res.json({
                        success: true,
                        message: 'Test has started!'
                    })

                } catch (error) {
                    await t.rollback();
                    console.log(error);
                    res.status(500).json({
                        success: false,
                        message: "Unable to create Answersheet"
                    })
                }
            }
        }
        else {
            res.json({
                success: false,
                message: 'Invalid URL'
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

let flags = async (req, res, next) => {
    var testid = req.body.testid;
    var traineeid = req.body.traineeid;

    try {
        const p1 = AnswersheetModel.findOne({ where: { userid: traineeid, testid: testid }, attributes: ['id', 'startTime', 'completed'] });
        const p2 = TraineeEnterModel.findByPk(traineeid, { attributes: ['id'] });
        const p3 = TestPaperModel.findByPk(testid, { attributes: ['testbegins', 'testconducted', 'duration'] });

        const [sheet, trainee, test] = await Promise.all([p1, p2, p3]);

        console.log([sheet, trainee, test]);

        if (!trainee) {
            res.json({
                success: false,
                message: 'Invalid URL!'
            })
        } else {
            var startedWriting = false;
            var pending = null;
            var present = Date.now();

            if (sheet) {
                startedWriting = true;
                // startTime is BigInt, convert to Number for calculation
                pending = (test.duration * 60) - ((present - Number(sheet.startTime)) / 1000);

                if (pending <= 0) {
                    await AnswersheetModel.update({ completed: true }, { where: { userid: traineeid, testid: testid } });
                    res.json({
                        success: true,
                        message: 'Successfull',
                        data: {
                            testbegins: test.testbegins,
                            testconducted: test.testconducted,
                            startedWriting: startedWriting,
                            pending: pending,
                            completed: true
                        }
                    })
                } else {
                    res.json({
                        success: true,
                        message: 'Successfull',
                        data: {
                            testbegins: test.testbegins,
                            testconducted: test.testconducted,
                            startedWriting: startedWriting,
                            pending: pending,
                            completed: sheet.completed
                        }
                    })
                }
            }
            else {
                res.json({
                    success: true,
                    message: 'Successfull',
                    data: {
                        testbegins: test.testbegins,
                        testconducted: test.testconducted,
                        startedWriting: startedWriting,
                        pending: pending,
                        completed: false
                    }
                })
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Unable to fetch details"
        })
    }
}

let TraineeDetails = async (req, res, next) => {
    var traineeid = req.body._id;
    try {
        const info = await TraineeEnterModel.findByPk(traineeid, { attributes: ['name', 'emailid', 'contact'] });
        if (info) {
            res.json({
                success: true,
                message: 'Trainee details',
                data: info
            })
        } else {
            res.json({
                success: false,
                message: 'This trainee does not exists'
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch details"
        })
    }
}

let chosenOptions = async (req, res, next) => {
    var testid = req.body.testid;
    var userid = req.body.userid;
    try {
        const answersheet = await AnswersheetModel.findOne({
            where: { testid: testid, userid: userid },
            attributes: ['id'], // just need ID to find answers usually, but original returned 'answers' populated
            include: [{
                model: AnswersModel,
                as: 'answers'
            }]
        });

        if (!answersheet) {
            res.json({
                success: false,
                message: 'Answersheet does not exist'
            })
        } else {
            res.json({
                success: true,
                message: 'Chosen Options',
                data: answersheet
            })
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error occured!"
        })
    }
}

let UpdateAnswers = async (req, res, next) => {
    var testid = req.body.testid;
    var userid = req.body.userid;
    var questionid = req.body.qid;
    var newAnswer = req.body.newAnswer;

    try {
        const p1 = TestPaperModel.findByPk(testid, { attributes: ['duration'] });
        const p2 = AnswersheetModel.findOne({ where: { testid: testid, userid: userid, completed: false }, attributes: ['id', 'startTime'] });

        const [test, sheet] = await Promise.all([p1, p2]);
        var present = Date.now();

        if (sheet) {
            var pending = null;
            pending = (test.duration * 60) - ((present - Number(sheet.startTime)) / 1000);

            if (pending > 0) {
                // Update answer
                // Logic: find Answer record where questionid = qid AND userid = userid
                // OR use answerSheetId if available. logic used userid and questionid.

                const [updated] = await AnswersModel.update(
                    { chosenOption: newAnswer },
                    { where: { questionid: questionid, userid: userid } }
                );

                if (updated) {
                    // Fetch updated info to return
                    const info = await AnswersModel.findOne({ where: { questionid: questionid, userid: userid } });
                    res.json({
                        success: true,
                        message: 'Answer Updated',
                        data: info
                    })
                } else {
                    res.json({
                        success: false,
                        message: 'Question is required! or Answer not found'
                    })
                }
            } else {
                await AnswersheetModel.update({ completed: true }, { where: { testid: testid, userid: userid } });
                res.json({
                    success: false,
                    message: 'Time is up!'
                })
            }
        } else {
            res.json({
                success: false,
                message: 'Unable to update answer'
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error occured!"
        })
    }
}

let EndTest = async (req, res, next) => {
    var testid = req.body.testid;
    var userid = req.body.userid;
    try {
        const [updated] = await AnswersheetModel.update({ completed: true }, { where: { testid: testid, userid: userid } });
        if (updated) {
            res.json({
                success: true,
                message: 'Your answers have been submitted'
            })
        } else {
            res.json({
                success: false,
                message: 'Unable to submit answers!'
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error occured!"
        })
    }
}

let getQuestion = async (req, res, next) => {
    let qid = req.body.qid;
    try {
        const question = await QuestionModel.findOne({
            where: { id: qid, status: true },
            attributes: ['body', 'quesimg'], // check what to select
            include: [{
                model: options,
                as: 'options',
                attributes: ['optbody', 'optimg']
            }]
        });

        if (!question) {
            res.json({
                success: false,
                message: `No such question exists`,
            })
        }
        else {
            res.json({
                success: true,
                message: `Success`,
                data: [question] // Frontend likely expects array
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            message: "Unable to fetch data"
        })
    }
}

module.exports = { traineeenter, feedback, checkFeedback, resendmail, correctAnswers, Answersheet, flags, chosenOptions, TraineeDetails, Testquestions, UpdateAnswers, EndTest, getQuestion }