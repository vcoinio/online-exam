const sequelize = require('../services/database');
const User = require('./user');
const Subject = require('./subject');
const Question = require('./questions');
const Option = require('./option');
const TestPaper = require('./testpaper');
const Trainee = require('./trainee');
const AnswerSheet = require('./answersheet');
const Answer = require('./answers');
const Feedback = require('./feedback');
const Result = require('./results');
const SubResult = require('./subResults');

// User createdBy relations
User.hasMany(Question, { foreignKey: 'createdBy' });
Question.belongsTo(User, { foreignKey: 'createdBy' });

User.hasMany(Subject, { foreignKey: 'createdBy' });
Subject.belongsTo(User, { foreignKey: 'createdBy' });

User.hasMany(TestPaper, { foreignKey: 'createdBy' });
TestPaper.belongsTo(User, { foreignKey: 'createdBy' });

// Question & Option
Question.hasMany(Option, { as: 'options', foreignKey: 'questionId' });
Option.belongsTo(Question, { foreignKey: 'questionId' });

// Question & Subject
Subject.hasMany(Question, { foreignKey: 'subject' });
Question.belongsTo(Subject, { foreignKey: 'subject' });

// TestPaper relations
// Mongoose used Array of ObjectIds. Sequelize uses join table for M:N.
TestPaper.belongsToMany(Question, { through: 'TestQuestions', as: 'questions' });
Question.belongsToMany(TestPaper, { through: 'TestQuestions' });

TestPaper.belongsToMany(Subject, { through: 'TestSubjects', as: 'subjects' });
Subject.belongsToMany(TestPaper, { through: 'TestSubjects' });

// Trainee relations
TestPaper.hasMany(Trainee, { foreignKey: 'testid' });
Trainee.belongsTo(TestPaper, { foreignKey: 'testid' });

// AnswerSheet relations
TestPaper.hasMany(AnswerSheet, { foreignKey: 'testid' });
AnswerSheet.belongsTo(TestPaper, { foreignKey: 'testid' });

Trainee.hasMany(AnswerSheet, { foreignKey: 'userid' });
AnswerSheet.belongsTo(Trainee, { foreignKey: 'userid' });

// AnswerSheet questions (Originally simple array of Refs. Implicit M:N)
AnswerSheet.belongsToMany(Question, { through: 'AnswerSheetQuestions', as: 'questions' });
Question.belongsToMany(AnswerSheet, { through: 'AnswerSheetQuestions' });

// AnswerSheet answers
AnswerSheet.hasMany(Answer, { as: 'answers', foreignKey: 'answerSheetId' });
Answer.belongsTo(AnswerSheet, { foreignKey: 'answerSheetId' });

// Answer relations
Trainee.hasMany(Answer, { foreignKey: 'userid' });
Answer.belongsTo(Trainee, { foreignKey: 'userid' });

// Feedback relations
Trainee.hasMany(Feedback, { foreignKey: 'userid' });
Feedback.belongsTo(Trainee, { foreignKey: 'userid' });

TestPaper.hasMany(Feedback, { foreignKey: 'testid' });
Feedback.belongsTo(TestPaper, { foreignKey: 'testid' });

// Result relations
TestPaper.hasMany(Result, { foreignKey: 'testid' });
Result.belongsTo(TestPaper, { foreignKey: 'testid' });

Trainee.hasMany(Result, { foreignKey: 'userid' });
Result.belongsTo(Trainee, { foreignKey: 'userid' });

AnswerSheet.hasOne(Result, { foreignKey: 'answerSheetid' });
Result.belongsTo(AnswerSheet, { foreignKey: 'answerSheetid' });

Result.hasMany(SubResult, { as: 'result', foreignKey: 'resultId' }); // 'result' is the field name in Mongo
SubResult.belongsTo(Result, { foreignKey: 'resultId' });

Question.hasMany(SubResult, { foreignKey: 'qid' });
SubResult.belongsTo(Question, { foreignKey: 'qid' });

const models = {
    sequelize,
    User,
    Subject,
    Question,
    Option,
    TestPaper,
    Trainee,
    AnswerSheet,
    Answer,
    Feedback,
    Result,
    SubResult
};

module.exports = models;
