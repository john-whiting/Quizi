const mongodb = require('mongodb')
const crypto = require('crypto')
const session = require('express-session')

var sess = session({
    secret: '8sbh*jd5Mm560HsngcF3Wbla',
    resave: false,
    saveUninitialized: true
})

var MongoClient = mongodb.MongoClient
var url = "<DB URL>"

var db;
MongoClient.connect(url, (err, passedDb) => {
    if (err) throw err
    db = passedDb.db('quizi')
})

function hashPassword(user, pass) {
    return crypto.createHmac('sha256', pass + user).update("json").digest("base64");
}

function isAuthorized(req) {
    return req.session.hasOwnProperty('user')
}

function login(req, user, pass) {
    req.session.numCorrect = 0
    req.session.numProblems = 0

    passwdHash = hashPassword(user, pass);
    query = {
        username: user,
        password: passwdHash
    }
    return new Promise((resolve, reject) => {
        db.collection("users").find(query).toArray(function(err, result) {
            if (err || result.length < 1) {
                resolve(false)
                return
            }
            req.session.user = result[0]
            delete req.session.user.password
            resolve(true)
        });
    });
}

function signup(user, pass) {
    passwdHash = hashPassword(user, pass)
    query = {
        username: user,
        password: passwdHash,
        questionsAnswered: 0,
        questionsCorrect: 0,
        successRate: 0.0
    }
    return new Promise((resolve, reject) => {
        db.collection('users').insertOne(query)
        .then(() => {
            resolve(true)
        })
        .catch(() => {
            resolve(false)
        })
    })
}

function getBestUser(req){
    return new Promise((resolve, reject) => {
        highestUser = db.collection("users").find().sort({successRate: -1}).limit(1).toArray(function(err, result) {
            if (err){
                resolve(false)
                return
            }
            req.session.highestUser = highestUser
            delete req.session.highestUser.password
        })
    })
}

function saveUser(req) {
    var correct = req.session.user.questionsCorrect
    var answered = req.session.user.questionsAnswered
    var username = req.session.user.username

    var newValues = {
        $set: {
            questionsCorrect: correct,
            questionsAnswered: answered,
            successRate: correct / answered
        } 
    }
    db.collection("users").updateOne({ username }, newValues)
    .then(() => {})
    .catch(console.log)
}

function logout(req) {
    req.session.destroy()
}

exports.hashPassword = hashPassword
exports.isAuthorized = isAuthorized
exports.login = login
exports.signup = signup
exports.session = sess
exports.logout = logout
exports.saveUser = saveUser
//exports.getBestUser = getBestUser