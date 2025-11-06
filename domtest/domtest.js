const questions = [
    {
        question: "А голос у него был не такой, как у почтальона Печкина, дохленький. У Гаврюши голосище был, как у электрички. Он _____ _____ на ноги поднимал.",
        answers: [
            { text: "Пол деревни, за раз", correct: false },
            { text: "Полдеревни, зараз", correct: true, explanation: "Правильно! Раздельно существительное будет писаться в случае наличия дополнительного слова между существительным и частицей. Правильный ответ: полдеревни пишется слитно. Зараз (ударение на второй слог) — это обстоятельственное наречие, пишется слитно. Означает быстро, одним махом." },
            { text: "Пол-деревни, за раз", correct: false }
        ]
    },
    {
        question: "А эти слова как пишутся?",
        answers: [
            { text: "Капуччино и эспрессо", correct: false },
            { text: "Каппуччино и экспресо", correct: false },
            { text: "Капучино и эспрессо", correct: true, explanation: "Конечно! По орфографическим нормам русского языка единственно верным написанием будут «капучино» и «эспрессо»." }
        ]
    },
    {
        question: "Как нужно писать?",
        answers: [
            { text: "Черезчур", correct: false },
            { text: "Черес-чур", correct: false },
            { text: "Чересчур", correct: true, explanation: "Да! Это слово появилось от соединения предлога «через» и древнего слова «чур», которое означает «граница», «край». Но слово претерпело изменения, так что правильное написание учим наизусть — «чересчур»." }
        ]
    },
    {
        question: "Где допущена ошибка?",
        answers: [
            { text: "Аккордеон", correct: false },
            { text: "Белиберда", correct: false },
            { text: "Эпелепсия", correct: true, explanation: "Верно! Это слово пишется так: «эпИлепсия»." }
        ]
    }
];

let currentQuestions = [];
let correctAnswersCount = 0;
let totalAnswered = 0;
let currentQuestionIndex = 0;

let questionsContainer, noQuestions, stats, statsText;

function initTest() {
    questionsContainer = document.getElementById('questionsContainer');
    noQuestions = document.getElementById('noQuestions');
    stats = document.getElementById('stats');
    statsText = document.getElementById('statsText');
    
    currentQuestions = [...questions].sort(() => Math.random() - 0.5);
    correctAnswersCount = 0;
    totalAnswered = 0;
    currentQuestionIndex = 0;
    
    questionsContainer.innerHTML = '';
    
    noQuestions.classList.remove('show');
    stats.classList.remove('show');
    
    showNextQuestion();
}

function showNextQuestion() {
    if (currentQuestionIndex < currentQuestions.length) {
        const question = currentQuestions[currentQuestionIndex];
        const questionBlock = createQuestionBlock(question, currentQuestionIndex);
        questionsContainer.appendChild(questionBlock);
        
        setTimeout(() => {
            questionBlock.style.opacity = '1';
            questionBlock.style.transform = 'translateY(0)';
        }, 100);
        
        currentQuestionIndex++;
    } else {
        setTimeout(() => {
            noQuestions.classList.add('show');
        }, 500);
    }
}

function createQuestionBlock(question, index) {
    const questionBlock = document.createElement('div');
    questionBlock.className = 'question-block';
    questionBlock.dataset.index = index;
    questionBlock.style.opacity = '0';
    questionBlock.style.transform = 'translateY(20px)';
    questionBlock.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    const questionHeader = document.createElement('div');
    questionHeader.className = 'question-header';
    
    const questionNumber = document.createElement('div');
    questionNumber.className = 'question-number';
    questionNumber.textContent = index + 1;
    
    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.textContent = question.question;
    
    questionHeader.appendChild(questionNumber);
    questionHeader.appendChild(questionText);
    
    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    
    const shuffledAnswers = [...question.answers].sort(() => Math.random() - 0.5);
    
    shuffledAnswers.forEach((answer) => {
        const answerBlock = document.createElement('div');
        answerBlock.className = 'answer-block';
        answerBlock.textContent = answer.text;
        answerBlock.dataset.correct = answer.correct;
        
        if (!question.answered) {
            answerBlock.addEventListener('click', () => handleAnswerClick(answerBlock, answer, questionBlock, question));
        }
        
        answersContainer.appendChild(answerBlock);
    });
    
    if (question.answered) {
        showQuestionResult(questionBlock, question);
    }
    
    questionBlock.appendChild(questionHeader);
    questionBlock.appendChild(answersContainer);
    
    return questionBlock;
}

function handleAnswerClick(answerBlock, answer, questionBlock, question) {
    if (question.answered) return;
    
    answerBlock.classList.add('selected');
    
    processAnswer(answerBlock, answer, questionBlock, question);
}

function processAnswer(answerBlock, answer, questionBlock, question) {
    question.answered = true;
    totalAnswered++;
    
    if (answer.correct) {
        correctAnswersCount++;
        
        answerBlock.classList.add('correct', 'expanded');
        
        showAnswerMarker(questionBlock, true);
        
        if (answer.explanation) {
            const explanation = document.createElement('div');
            explanation.className = 'explanation';
            explanation.textContent = answer.explanation;
            questionBlock.appendChild(explanation);
            
            setTimeout(() => {
                explanation.classList.add('show');
            }, 500);
        }
        
        const incorrectAnswers = questionBlock.querySelectorAll('.answer-block:not(.correct)');
        incorrectAnswers.forEach((block, index) => {
            setTimeout(() => {
                block.style.animation = 'moveRight 0.5s forwards';
            }, index * 200);
        });
        
        setTimeout(() => {
            answerBlock.style.animation = 'fadeOutCorrect 0.5s forwards';
            setTimeout(() => {
                showNextQuestion();
            }, 500);
        }, 2000);
        
    } else {
        answerBlock.classList.add('incorrect');
        
        showAnswerMarker(questionBlock, false);
        
        const allAnswers = questionBlock.querySelectorAll('.answer-block');
        allAnswers.forEach((block, index) => {
            setTimeout(() => {
                block.style.animation = 'moveDown 0.5s forwards';
            }, index * 200);
        });
        
        setTimeout(() => {
            showNextQuestion();
        }, 1500);
    }
    
    checkAllQuestionsAnswered();
}

function showQuestionResult(questionBlock, question) {
    const answerBlocks = questionBlock.querySelectorAll('.answer-block');
    answerBlocks.forEach(block => {
        if (block.dataset.correct === 'true') {
            block.classList.add('correct');
        } else {
            block.classList.add('incorrect');
        }
    });
    
    showAnswerMarker(questionBlock, question.isCorrect);
    
    if (question.isCorrect) {
        const correctAnswer = question.answers.find(answer => answer.correct);
        if (correctAnswer && correctAnswer.explanation) {
            const explanation = document.createElement('div');
            explanation.className = 'explanation show';
            explanation.textContent = correctAnswer.explanation;
            questionBlock.appendChild(explanation);
        }
    }
}

function showAnswerMarker(questionBlock, isCorrect) {
    const marker = document.createElement('div');
    marker.className = `marker ${isCorrect ? 'correct' : 'incorrect'}`;
    marker.innerHTML = isCorrect ? '✓' : '✗';
    questionBlock.querySelector('.question-header').appendChild(marker);
}

function checkAllQuestionsAnswered() {
    if (totalAnswered === currentQuestions.length) {
        setTimeout(() => {
            showStats();
        }, 3000);
    }
}

function showStats() {
    statsText.textContent = `Вы ответили правильно на ${correctAnswersCount} из ${currentQuestions.length} вопросов`;
    stats.classList.add('show');
}

document.addEventListener('DOMContentLoaded', initTest);
