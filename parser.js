const { resolve } = require("path");

async function parseToLatex(strToParse) {
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python',["./Parser.py", strToParse]);

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(strToParse)
        }, 2000)
        pythonProcess.stdout.on('data', (data) => {
            resolve(data.toString())
        })
    })
}

exports.parseToLatex = parseToLatex