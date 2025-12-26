const { TestPaper, Feedback, Trainee } = require("../models");
let TestPaperModel = TestPaper;
const appRoot = require("app-root-path");
let FeedbackModel = Feedback;

let stopRegistration = async (req, res, next) => {
    if (req.user.type === 'TRAINER') {

        var id = req.body.id;
        var s = req.body.status;

        try {
            const paper = await TestPaperModel.findByPk(id, {
                attributes: ['id', 'testbegins', 'testconducted']
            });

            if (paper) {
                if (!paper.testbegins && !paper.testconducted) {
                    await TestPaperModel.update(
                        { isRegistrationavailable: s },
                        { where: { id: id } }
                    );

                    res.json({
                        success: true,
                        message: `Registration status changed!`,
                        currentStatus: s
                    })
                }
                else {
                    res.json({
                        success: false,
                        message: "Unable to change registration status (Test started or conducted)"
                    })
                }
            }
            else {
                res.status(500).json({
                    success: false,
                    message: "Unable to change registration status (Test not found)"
                })
            }
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Unable to change registration status"
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

let Download = (req, res, next) => {
    var testid = req.body.id;
    if (req.user.type === 'TRAINER') {
        const file = `${req.protocol + '://' + req.get('host')}/result/result-${testid}.xlsx`;
        res.json({
            success: true,
            message: 'File sent successfully',
            file: file
        })
    } else {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }

}

let getFeedBack = async (req, res, next) => {
    var testid = req.body.testid;
    if (req.user.type === 'TRAINER') {
        try {
            const data = await FeedbackModel.findAll({
                where: { testid: testid },
                include: [{ model: Trainee }] // BelongsTo Trainee (foreignKey: 'userid')
            });

            res.json({
                success: true,
                message: "Feedbacks Sent Successfully",
                data: data
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                success: false,
                message: "Server Error"
            })
        }
    } else {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }
}

module.exports = { stopRegistration, Download, getFeedBack }