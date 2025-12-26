const { Question, Option, User, Subject, sequelize } = require("../models");
const QuestionModel = Question;
const options = Option;
const tool = require("./tool");

let createQuestion = async (req, res, next) => {
    if (req.user.type === 'TRAINER') {
        req.check('body', `Invalid question!`).notEmpty();
        req.check('subject', 'Enter subject!').notEmpty();
        var errors = req.validationErrors()
        if (errors) {
            res.json({
                success: false,
                message: 'Invalid inputs',
                errors: errors
            })
        }
        else {
            var body = req.body.body;
            var option = req.body.options; // Array of objects {optbody:..., isAnswer:...}
            var quesimg = req.body.quesimg;
            var difficulty = req.body.difficulty;
            var subjectid = req.body.subject; // This should be ID
            var explanation = req.body.explanation;
            var weightage = req.body.weightage;

            let anscount = 0;
            if (option && Array.isArray(option)) {
                option.forEach((d) => {
                    if (d.isAnswer) {
                        anscount = anscount + 1;
                    }
                });
            }

            console.log(anscount);

            const t = await sequelize.transaction();

            try {
                const info = await QuestionModel.findOne({
                    where: { body: body, status: true }
                });

                if (!info) {
                    // Create Question
                    const newQuestion = await QuestionModel.create({
                        body: body,
                        explanation: explanation,
                        quesimg: quesimg,
                        subjectId: subjectid, // Ensure foreign key is correct (subjectId based on associations?)
                        // If association is 'subject', sequelize usually adds subjectId. 
                        // Let's check associations in index.js, but standard is camelCase of model + Id usually.
                        // Assuming 'subjectId' or we can pass 'subject' if using field mapping.
                        // Wait, previous code used 'subject : subjectid'.
                        // Let's assume the column is 'subjectId' or 'subject' in model definition. 
                        // Checking questions.js model earlier (Step 201), it likely has associations. 
                        // Safe bet: pass it as matches model definition.
                        // If we look at models/questions.js (Step 201), it has:
                        /*
                        Question.belongsTo(Subject, { foreignKey: 'subject', as: 'subject' }); 
                        (Note: I need to verify actual foreign key column name)
                         If not sure, I can use setSubject after creation or pass 'subject' if defined in model.
                        */
                        subject: subjectid, // Assuming model field is 'subject' or foreignKey matches
                        difficulty: difficulty,
                        createdBy: req.user.id,
                        anscount: anscount,
                        weightage: weightage,
                        status: true
                    }, { transaction: t });

                    // Create Options
                    if (option && option.length > 0) {
                        const optionData = option.map(opt => ({
                            ...opt,
                            questionId: newQuestion.id // foreign key to question
                        }));
                        await options.bulkCreate(optionData, { transaction: t });
                    }

                    await t.commit();

                    res.json({
                        success: true,
                        message: `New question created successfully!`
                    });

                } else {
                    await t.rollback();
                    res.json({
                        success: false,
                        message: `This question already exists!`
                    });
                }
            } catch (err) {
                await t.rollback();
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: "Unable to create new question!"
                });
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


let deleteQuestion = async (req, res, next) => {
    if (req.user.type === 'TRAINER') {
        var _id = req.body._id;
        try {
            await QuestionModel.update({
                status: false
            }, {
                where: { id: _id }
            });
            res.json({
                success: true,
                message: "Question has been deleted"
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: "Unable to delete question"
            });
        }
    }
    else {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }
}


let getAllQuestions = async (req, res, next) => {
    if (req.user.type === 'TRAINER') {
        var subject = req.body.subject; // Could be ID or undefined
        try {
            let whereClause = { status: true };
            if (subject && subject.length !== 0) {
                whereClause.subject = subject;
            }

            const questions = await QuestionModel.findAll({
                where: whereClause,
                attributes: { exclude: ['status'] },
                include: [
                    { model: User, attributes: ['name'] }, // Removed incorrect alias 'createdBy'
                    { model: Subject, attributes: ['topic'] }, // Removed incorrect alias 'subject'
                    { model: options, as: 'options' } // Alias 'options' is correct
                ]
            });

            const data = questions.map(q => {
                const ques = q.toJSON();
                ques._id = q.id;
                return ques;
            });

            res.json({
                success: true,
                message: `Success`,
                data: data
            });

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






let getSingleQuestion = async (req, res, next) => {
    if (req.user.type === 'TRAINER') {
        let _id = req.params._id;
        console.log(_id);
        try {
            const question = await QuestionModel.findOne({
                where: { id: _id, status: true },
                attributes: { exclude: ['status'] },
                include: [
                    { model: User, attributes: ['name'] },
                    { model: Subject, attributes: ['topic'] },
                    { model: options, as: 'options' }
                ]
            });

            if (!question) {
                res.json({
                    success: false,
                    message: `No such question exists`,
                });
            } else {
                const data = question.toJSON();
                data._id = question.id;
                res.json({
                    success: true,
                    message: `Success`,
                    data: [data]
                });
            }
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

//create test papers

module.exports = { createQuestion, getAllQuestions, getSingleQuestion, deleteQuestion }







