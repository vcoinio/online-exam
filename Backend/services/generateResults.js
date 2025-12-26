const { Trainee, TestPaper, Question, Option, AnswerSheet, Answer, SubResult, Result, sequelize } = require("../models");
const TraineeEnterModel = Trainee;
const TestPaperModel = TestPaper;
const QuestionModel = Question;
const options = Option;
const AnswersheetModel = AnswerSheet;
const AnswersModel = Answer;
const subResultsModel = SubResult;
const ResultModel = Result;

let generateResults = (req, res, next) => {
    var userid = req.body.userid;
    var testid = req.body.testid;

    gresult(userid, testid).then((result) => {
        console.log(result)
        res.json({
            success: true,
            message: "Result generated successfully",
            result: result
        })
    }).catch((error) => {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Unable to generate result",
        })
    })
}

let gresult = (uid, tid) => {
    return new Promise(async (resolve, reject) => {
        const ansMap = ['A', 'B', 'C', 'D', 'E'];

        try {
            const results = await ResultModel.findOne({
                where: { userid: uid, testid: tid },
                include: [{ model: SubResult, as: 'result' }]
            });

            if (results) {
                resolve(results);
            } else {
                const answersheet = await AnswersheetModel.findOne({
                    where: { userid: uid, testid: tid, completed: true },
                    attributes: { exclude: ['testid', 'userid', 'startTime', 'completed'] },
                    include: [
                        {
                            model: QuestionModel,
                            as: 'questions',
                            attributes: ['id', 'explanation', 'weightage', 'body'],
                            through: { attributes: [] },
                            include: [{
                                model: options,
                                as: 'options',
                                attributes: ['id', 'isAnswer'],
                                // IMP: Order by id or createdAt to ensure deterministic A,B,C... mapping
                                // But we can't easily add order inside nested include in standard findOne usually? 
                                // Actually we can.
                            }]
                        },
                        {
                            model: AnswersModel,
                            as: 'answers',
                            attributes: ['questionid', 'chosenOption']
                        }
                    ],
                    order: [
                        [{ model: QuestionModel, as: 'questions' }, { model: options, as: 'options' }, 'createdAt', 'ASC']
                    ]
                });

                if (!answersheet) {
                    reject(new Error("invalid Inputs or AnswerSheet not completed"));
                } else {
                    var Score = 0;
                    var questions = answersheet.questions;
                    var answers = answersheet.answers;

                    // We need to match answers to questions. The order in 'questions' array and 'answers' array might not match.
                    // MongoDB code assumed implicit index matching `questions.map((d,i) => answers[i]...)`. 
                    // This is risky in SQL if not sorted.
                    // Safer to find answer by questionid.

                    let subResultsData = [];

                    for (let d of questions) {
                        // Find corresponding answer
                        let ansRecord = answers.find(a => a.questionid === d.id);
                        if (!ansRecord) {
                            // Should not happen if data integrity is good, but handle it
                            ansRecord = { chosenOption: [] };
                        }

                        var ans = ansRecord.chosenOption || []; // Array of option IDs
                        var correctAns = [];
                        var givenAns = [];

                        // d.options is the array of options for this question.
                        // We map them to A, B, C... based on index.

                        d.options.forEach((dd, ii) => {
                            if (dd.isAnswer) {
                                correctAns.push(ansMap[ii]);
                            }
                            // Check if this option ID is in the user's chosen options
                            // ans is array of IDs (strings)
                            if (ans.includes(dd.id)) {
                                givenAns.push(ansMap[ii]);
                            }
                        });

                        var l1 = correctAns.length;
                        var l2 = givenAns.length;
                        var iscorrect = false;

                        // Compare arrays
                        if (l1 == l2) {
                            // Sort to ensure order doesn't matter (though here they are both derived from same loop so order matches)
                            // But logic in original code:
                            var count = 0;
                            for (var p = 0; p < l1; p++) {
                                for (var q = 0; q < l2; q++) {
                                    if (correctAns[p] == givenAns[q]) {
                                        count++;
                                        break;
                                    }
                                }
                            }
                            if (count == l1) {
                                iscorrect = true;
                                Score += d.weightage;
                            }
                        }

                        subResultsData.push({
                            qid: d.id,
                            weightage: d.weightage,
                            correctAnswer: correctAns,
                            givenAnswer: givenAns,
                            explanation: d.explanation,
                            iscorrect: iscorrect
                        });
                    }

                    // Create Result first
                    const newResult = await ResultModel.create({
                        testid: tid,
                        userid: uid,
                        answerSheetid: answersheet.id,
                        score: Score
                    });

                    // Add resultId to subResults
                    const finalSubResults = subResultsData.map(sr => ({
                        ...sr,
                        resultId: newResult.id
                    }));

                    await subResultsModel.bulkCreate(finalSubResults);

                    // Fetch full result to return? Or just return newResult + subResults
                    newResult.result = finalSubResults; // Attach manually for response
                    resolve(newResult);
                }
            }

        } catch (err) {
            console.log(err);
            reject(err);
        }
    })
}

module.exports = { generateResults, gresult }