const e = require('express')
const express = require('express')
const Auth = require('./auth.js')
const TeXParser = require('./parser.js')
const app = express()
const port = 3000
 
const validTypes = [
    'algebra', 'arithmetic', 'calculus',
    'comparison', 'measurement', 'numbers',
    'polynomials', 'probability'
]
const validDiffs = [
    'easy', 'medium', 'hard'
]

function shuffle(arr) {
    var j, x, i;
    for (i = arr.length - 1; i > 0; i--) {
        j = Math.round(Math.random() * (i + 1));
        if (j >= arr.length)
            continue
        x = arr[i];
        arr[i] = arr[j];
        arr[j] = x;
    }
    return arr;
}

///////////////////////////////
// EXPRESS APP CONFIGURATION //
///////////////////////////////

app.use(Auth.session)
app.use(express.json()) // for parsing application/json
app.use(express.raw());
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.set('view engine', 'ejs')

////////////////////////
// VIEW CONFIGURATION //
////////////////////////

app.get('/blackboard_stock_image.jpg', (request, response) => {
    response.sendFile('./views/images/blackboard_stock_image.jpg', { root: __dirname })
})

app.get('/', (request, response) => {
    if (Auth.isAuthorized(request)) {
        response.render('pages/index', {user: request.session.user, maxUser: request.session.maxUser})
    } else {
        response.render('pages/index', {maxUser: request.session.maxUser})
    }
})

app.get('/q/:type/:difficulty?', (request, response) => {
    if (!Auth.isAuthorized(request)) {
        response.redirect('/')
        return
    }
    const type = request.params.type
    const diff = request.params.difficulty
    if (validTypes.includes(type)) {
        response.render('pages/question-page', {type, diff, user: request.session.user})
    } else {
        response.render('pages/not-found')
    }
})

app.get('/signup', (request, response) => {
    if (Auth.isAuthorized(request)) {
        response.redirect('/')
        return
    }
    response.render('pages/signup', {query: request.query})
})

app.get('/login', (request, response) => {
    if (Auth.isAuthorized(request)) {
        response.redirect('/')
        return
    }
    response.render('pages/login', {query: request.query})
})

app.get('/logout', (request, response) => {
    if (!Auth.isAuthorized(request)) {
        response.redirect('/')
        return
    }
    Auth.logout(request)
    response.redirect('/')
})


///////////////////////
// API CONFIGURATION //
///////////////////////

/*
    Authorizes a client with a user name and password
*/


app.post('/authorize', (request, response) => {
    const username = request.body.username
    const password = request.body.password

    Auth.login(request, username, password)
    .then((data) => {
        if (data) 
            response.redirect('/')
        else
            response.redirect(`/login?error=1`)
    })
})

app.post('/createuser', (request, response) => {
    const username = request.body.username
    const password = request.body.password

    Auth.signup(username, password)
    .then((data) => {
        if (data) 
            response.redirect('/')
        else
            response.redirect(`/signup?error=1`)
    })
})

/*
    Get a random question given a type and difficulty
*/
app.get('/api/question/:type/:difficulty/', (request, response) => {
    const type = request.params.type
    const diff = request.params.difficulty

    if (!validTypes.includes(type) || !validDiffs.includes(diff)) {
        response.json('Invalid Type or Difficulty')
    } else {
        // Valid type and difficulty
        const questions = require(`./questions/${request.params.type}_${request.params.difficulty}.json`).questions;
        const i = Math.floor(Math.random()*questions.length);

        TeXParser.parseToLatex(questions[i].question)
        .then(async (resp) => {
            var answerKeys = Object.keys(questions[i].answers)

            var ans = [];
            for (var j = 0; j < answerKeys.length; ++j) 
            {
                var a = await TeXParser.parseToLatex(answerKeys[j])
                ans.push({
                    nice: a,
                    ans: answerKeys[j]
                })
            }
            ans = shuffle(ans)

            var ret = {
                question: resp,
                answers: ans,
                index: i,
                userDataString: ''
            }
            if (Auth.isAuthorized(request)){
                if (request.session.user.questionsAnswered == 0){
                    ret.userDataString = "Answer Questions to Load your Success Rate!"
                }
                else{
                    const successRate = Math.round(10000 * request.session.user.questionsCorrect / request.session.user.questionsAnswered) / 100
                    ret.userDataString = "User Success Rate: " + successRate.toString() + "%"
                }
            }
            response.json(ret)
        })
    }
})

app.post('/api/render/choices', (request, response) => {
    response.render('partials/question-buttons', {choices:request.body.choices}, function(err, html) {
        response.send(html);
    })
})

app.post('/api/check/:type/:difficulty/:i', (request, response) => {
    const questions = require(`./questions/${request.params.type}_${request.params.difficulty}.json`).questions;
    var correctAnswer = ''
    var answerKeys = Object.keys(questions[request.params.i].answers)
    for (var ind = 0; ind < answerKeys.length; ind++) {
        if (questions[request.params.i].answers[answerKeys[ind]] == true) {
            correctAnswer = answerKeys[ind].toString()
            break
        }
    }
    
    const isCorrect = correctAnswer.replace(/\s/, '') == request.body.answer.replace(/\s/, '')
    response.json(isCorrect)

    if (Auth.isAuthorized(request)) {
        request.session.user.questionsCorrect += isCorrect ? 1 : 0
        request.session.user.questionsAnswered += 1
        request.session.save()
        Auth.saveUser(request)
    }
})

app.get('/api/steps/:type/:difficulty/:i', (request, response) => {
    response.json('steps returned here')
})

app.get('/api/answer/:type/:difficulty/:i', (request, response) => {
    response.json('answer returned here')
})

app.listen(port, () => {
    console.log(`Started Math Quiz App!`)
})