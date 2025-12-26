var Excel = require('exceljs');
var path = require('path');
var fs = require("fs");
var gresults = require("./generateResults");
const { TestPaper, Result, Trainee } = require("../models");
const TestpaperModel = TestPaper;
const ResultModel = Result;
const TraineeModel = Trainee;

let result = (testid, MaxMarksValue) => {
  console.log('1')
  return new Promise(async (resolve, reject) => {
    console.log('2')
    var workbook = new Excel.Workbook();

    try {
      const test = await TestpaperModel.findOne({
        where: { id: testid, testconducted: true },
        attributes: ['testconducted', 'type', 'title']
      });

      console.log('3')
      if (!test) {
        console.log(test)
        reject(test || "Test not found or not conducted")
      } else {
        console.log('1')
        const results = await ResultModel.findAll({
          where: { testid: testid },
          attributes: ['score', 'userid', 'testid'],
          include: [
            {
              model: TraineeModel,
            },
            {
              model: TestpaperModel,
            }
          ]
        });

        var worksheet = workbook.addWorksheet('Results', { pageSetup: { paperSize: 9, orientation: 'landscape' } });

        console.log(test.type);
        worksheet.columns = [
          { header: 'Type', key: 'Type', width: 20 },
          { header: 'Test-Title', key: 'Title', width: 20 },
          { header: 'Name', key: 'Name', width: 30 },
          { header: 'Email', key: 'Email', width: 70 },
          { header: 'Contact', key: 'Contact', width: 35, outlineLevel: 1 },
          { header: 'Organisation', key: 'Organisation', width: 70 },
          { header: 'Score', key: 'Score', width: 20 },
          { header: 'Max Marks', key: 'Outof', width: 20 }

        ];

        let M = MaxMarksValue;
        console.log(M);

        results.map((d, i) => {
          const trainee = d.TraineeEnterModel || {};

          console.log(trainee.name);
          worksheet.addRow({
            Name: trainee.name,
            Email: trainee.emailid,
            Contact: trainee.contact,
            Organisation: trainee.organisation,
            Type: test.type,
            Title: test.title,
            Score: d.score,
            Outof: M
          });
        })

        try {
          await workbook.xlsx.writeFile(`result-${testid}.xlsx`);
          fs.rename(`result-${testid}.xlsx`, `public/result/result-${testid}.xlsx`, (err) => {
            if (err) {
              reject(err)
            }
            else {
              console.log('Rename complete!');
              resolve("Done");
            }
          });
        } catch (e) {
          console.log(e);
          reject(e);
        }

      }
    } catch (err) {
      reject(err)
    }
  })

}
module.exports = { result };
