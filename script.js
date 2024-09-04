let questionCounter = 0;
let incorrectAnswers = [];
let interactionMode = 'dragDrop'; // 'dragDrop' or 'typeOnly'

// Function to add new questions dynamically
function addQuestion(type) {
    questionCounter++;
    const questionsContainer = document.getElementById('questionsContainer');

    const newQuestionDiv = document.createElement('div');
    newQuestionDiv.className = 'question-block';
    newQuestionDiv.setAttribute('data-type', type);
    newQuestionDiv.setAttribute('draggable', 'false'); // Initially not draggable
    newQuestionDiv.setAttribute('id', `question-${questionCounter}`);
    newQuestionDiv.innerHTML = `
        <div class="question-header">
            <span class="drag-handle" draggable="true" ondragstart="dragStart(event)" ondragover="allowDrop(event)" ondrop="drop(event)">☰</span>
            <span class="question-title" contenteditable="true">${getQuestionTitle(type)} ${questionCounter}</span>
            <div class="header-buttons">
                <button class="collapse-question" onclick="toggleCollapse(this)">Collapse</button>
                <button class="delete-question" onclick="deleteQuestion(this)">Delete Question</button>
            </div>
        </div>
        <div class="question-content">
            ${getQuestionContent(type, questionCounter)}
            <div class="points-duration">
                Points: <input type="number" id="points${questionCounter}" value="1" min="1">
                Duration (seconds): <input type="number" id="duration${questionCounter}" value="60" min="1">
                <label class="mandatory-checkbox">
                    Mandatory: <input type="checkbox" id="mandatory${questionCounter}">
                </label>
            </div>
        </div>
    `;

    // Event listeners for drag and drop on drag handle only
    newQuestionDiv.querySelector('.drag-handle').addEventListener('dragstart', dragStart);
    newQuestionDiv.querySelector('.drag-handle').addEventListener('dragover', dragOver);
    newQuestionDiv.querySelector('.drag-handle').addEventListener('drop', drop);
    newQuestionDiv.querySelector('.drag-handle').addEventListener('dragend', dragEnd);

    questionsContainer.appendChild(newQuestionDiv);
}


function getQuestionTitle(type) {
    if (type === 'choice') return 'Choice Question';
    if (type === 'fillgap') return 'Fill-in-the-Blank Question';
    if (type === 'categorize') return 'Categorize Question';
    if (type === 'reorder') return 'Reorder Question';
}

function getQuestionContent(type, questionId) {
    if (type === 'choice') return createChoiceQuestion(questionId);
    if (type === 'fillgap') return createFillGapQuestion(questionId);
    if (type === 'categorize') return createCategorizeQuestion(questionId);
    if (type === 'reorder') return createReorderQuestion(questionId);
}

function createChoiceQuestion(questionId) {
    return `
        <div class="question">
            <label for="question${questionId}">Choice Question</label>
            <input type="text" id="question${questionId}" name="question${questionId}" placeholder="Enter your question here">
        </div>
        <div class="toggle-container">
            <label for="multiAnswerToggle${questionId}">Multiple answers</label>
            <label class="toggle-switch">
                <input type="checkbox" id="multiAnswerToggle${questionId}" onchange="toggleMultipleAnswers(${questionId})">
                <span class="toggle-slider"></span>
            </label>
        </div>
        <div class="choices" id="choices${questionId}">
            <div class="choice" onclick="selectAnswer(this, ${questionId})">
                <input type="text" placeholder="Your answer here">
                <button onclick="removeChoice(this, event)">&#10006;</button>
            </div>
            <div class="choice" onclick="selectAnswer(this, ${questionId})">
                <input type="text" placeholder="Your answer here">
                <button onclick="removeChoice(this, event)">&#10006;</button>
            </div>
            <div class="add-more" onclick="addChoice(${questionId})">Add more</div>
        </div>
    `;
}

function createFillGapQuestion(questionId) {
    return `
        <h3>Fill-in-the-Blank Question</h3>
        <div contenteditable="true" class="fill-gap-text" id="quizText${questionId}" placeholder="Type your quiz text here and use '__' to create blanks." oninput="updateBlanks(this)"></div>
        <h4>Incorrect Answers</h4>
        <div class="incorrect-answer-container">
            <input type="text" id="incorrectAnswer${questionId}" placeholder="Enter an incorrect answer">
            <button class="add-incorrect-answer" onclick="addIncorrectAnswer(${questionId})">Add Incorrect Answer</button>
        </div>
        <div id="incorrectAnswers${questionId}" class="incorrect-answers-list"></div>
    `;
}

function createCategorizeQuestion(questionId) {
    return `
        <div class="categories" id="categoriesContainer${questionId}">
            <div class="category">
                <input type="text" placeholder="Type category name" class="category-title">
                <div class="answer-list" id="category${questionId}_1" ondrop="dropAnswer(event)" ondragover="allowDrop(event)">
                    <div class="answer" draggable="true" ondragstart="dragAnswer(event)" id="answer${questionId}_1">
                        Answer 1
                        <button class="remove-answer-btn" onclick="removeAnswer(this)">X</button>
                    </div>
                </div>
                <button class="add-option" onclick="addOption('category${questionId}_1')">+ Add answer option</button>
                <button class="delete-category" onclick="removeCategory(this)">Delete Category</button>
            </div>
        </div>
        <button class="add-category" onclick="addCategory(${questionId})">+ Add New Category</button>
    `;
}

function toggleCollapse(button) {
    const questionContent = button.parentElement.parentElement.nextElementSibling;
    if (questionContent.style.display === 'none') {
        questionContent.style.display = 'block';
        button.textContent = 'Collapse';
    } else {
        questionContent.style.display = 'none';
        button.textContent = 'Expand';
    }
}

function updateBlanks(contentDiv) {
    const textContent = contentDiv.innerHTML;

    const updatedContent = textContent.replace(/__(&nbsp;| )/g, '<input type="text" class="blank" placeholder="Answer">');

    if (contentDiv.innerHTML !== updatedContent) {
        contentDiv.innerHTML = updatedContent;
        placeCaretAtEnd(contentDiv);
    }
}

function placeCaretAtEnd(el) {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

function removeChoice(button, event) {
    event.stopPropagation();
    button.parentElement.remove();
}

function removeAnswer(button) {
    const answer = button.parentElement;
    answer.remove();
}

function deleteQuestion(button) {
    button.closest('.question-block').remove();
}

function selectAnswer(choiceDiv, questionId) {
    const isMultiple = document.getElementById(`multiAnswerToggle${questionId}`).checked;
    if (!isMultiple) {
        const choices = choiceDiv.parentElement.querySelectorAll('.choice');
        choices.forEach(choice => choice.classList.remove('selected'));
    }
    choiceDiv.classList.toggle('selected');
}

function toggleMultipleAnswers(questionId) {
    const isMultiple = document.getElementById(`multiAnswerToggle${questionId}`).checked;
    const choices = document.getElementById(`choices${questionId}`).querySelectorAll('.choice');
    if (!isMultiple) {
        choices.forEach(choice => choice.classList.remove('selected'));
    }
}

function addChoice(questionId) {
    const choicesContainer = document.getElementById(`choices${questionId}`);
    const newChoice = document.createElement('div');
    newChoice.className = 'choice';
    newChoice.onclick = function () { selectAnswer(newChoice, questionId); };
    newChoice.innerHTML = `
        <input type="text" placeholder="Your answer here">
        <button onclick="removeChoice(this, event)">&#10006;</button>
    `;
    choicesContainer.insertBefore(newChoice, choicesContainer.querySelector('.add-more'));
}

function addIncorrectAnswer(questionId) {
    const incorrectAnswer = document.getElementById(`incorrectAnswer${questionId}`).value;
    if (incorrectAnswer) {
        incorrectAnswers.push(incorrectAnswer);
        updateIncorrectAnswers(questionId);
        document.getElementById(`incorrectAnswer${questionId}`).value = '';
    }
}

function updateIncorrectAnswers(questionId) {
    const incorrectAnswersDiv = document.getElementById(`incorrectAnswers${questionId}`);
    incorrectAnswersDiv.innerHTML = '';
    incorrectAnswers.forEach((answer, index) => {
        incorrectAnswersDiv.innerHTML += `
            <div class="incorrect-answer-item">${answer} <button onclick="removeIncorrectAnswer(${index}, ${questionId})">Remove</button></div>
        `;
    });
}

function removeIncorrectAnswer(index, questionId) {
    incorrectAnswers.splice(index, 1);
    updateIncorrectAnswers(questionId);
}

// Drag and Drop Functions for Categorize Questions
function allowDrop(event) {
    event.preventDefault();
}

function dragAnswer(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function dropAnswer(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text");
    var dropTarget = event.target;

    // Ensure dropping on answer list only
    if (dropTarget.classList.contains("answer-list")) {
        dropTarget.appendChild(document.getElementById(data));
    } else if (dropTarget.classList.contains("reorder-answers")) {
        dropTarget.appendChild(document.getElementById(data));
    }
}

function addOption(categoryId) {
    const answerList = document.getElementById(categoryId);
    const newOption = document.createElement('div');
    newOption.className = 'answer';
    newOption.draggable = true;
    newOption.ondragstart = dragAnswer;
    newOption.innerHTML = `
        <input type="text" class="answer-input" placeholder="Enter the answer option">
        <button class="remove-answer-btn" onclick="removeAnswer(this)">X</button>
    `;
    newOption.id = `answer${Math.random().toString(36).substring(2, 9)}`;
    answerList.appendChild(newOption);
}

function addCategory(questionId) {
    const categoriesContainer = document.getElementById(`categoriesContainer${questionId}`);
    const newCategoryId = `category${questionId}_${Math.random().toString(36).substring(2, 9)}`;

    const newCategory = document.createElement('div');
    newCategory.className = 'category';
    newCategory.innerHTML = `
        <input type="text" placeholder="Type category name" class="category-title">
        <div class="answer-list" id="${newCategoryId}" ondrop="dropAnswer(event)" ondragover="allowDrop(event)"></div>
        <button class="add-option" onclick="addOption('${newCategoryId}')">+ Add answer option</button>
        <button class="delete-category" onclick="removeCategory(this)">Delete Category</button>
    `;

    categoriesContainer.appendChild(newCategory);
}

// Remove a category
function removeCategory(button) {
    const category = button.closest('.category');
    category.remove();
}

// Drag and Drop Functions for Sorting Questions
function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.closest('.question-block').id);
    e.currentTarget.style.opacity = '0.5';
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text');
    const draggableElement = document.getElementById(id);
    const dropzone = e.target.closest('.question-block');
    dropzone.parentNode.insertBefore(draggableElement, dropzone.nextSibling);
    e.currentTarget.style.opacity = '1';
}

function dragEnd(e) {
    e.currentTarget.style.opacity = '1';
}

 
function createReorderQuestion(questionId) {
    return `
        <div class="question">
            <label for="reorderQuestion${questionId}">Reorder Question</label>
            <input type="text" id="reorderQuestion${questionId}" name="reorderQuestion${questionId}" placeholder="Enter your question here">
        </div>
        <div class="reorder-answers" id="reorderAnswers${questionId}">
            <div class="reorder-answer" draggable="true" ondragstart="dragAnswer(event)" id="reorderAnswer${questionId}_1">
                <input type="text" placeholder="Your answer here">
                <button onclick="moveAnswerUp(this)">&#8679;</button>
                <button onclick="moveAnswerDown(this)">&#8681;</button>
                <button onclick="removeAnswer(this)">X</button>
            </div>
            <div class="add-more" onclick="addReorderAnswer(${questionId})">Add more</div>
        </div>
    `;
}

// Function to add reorder answer dynamically
function addReorderAnswer(questionId) {
    const reorderAnswersContainer = document.getElementById(`reorderAnswers${questionId}`);
    const newAnswer = document.createElement('div');
    newAnswer.className = 'reorder-answer';
    newAnswer.draggable = true;
    newAnswer.ondragstart = dragAnswer;
    newAnswer.innerHTML = `
        <input type="text" placeholder="Your answer here">
        <button onclick="moveAnswerUp(this)">&#8679;</button>
        <button onclick="moveAnswerDown(this)">&#8681;</button>
        <button onclick="removeAnswer(this)">X</button>
    `;
    newAnswer.id = `reorderAnswer${questionId}_${Math.random().toString(36).substring(2, 9)}`;
    reorderAnswersContainer.insertBefore(newAnswer, reorderAnswersContainer.querySelector('.add-more'));
}

// Function to move answer up
function moveAnswerUp(button) {
    const answerDiv = button.parentElement;
    const previousAnswer = answerDiv.previousElementSibling;
    if (previousAnswer && !previousAnswer.classList.contains('add-more')) {
        answerDiv.parentNode.insertBefore(answerDiv, previousAnswer);
    }
}

// Function to move answer down
function moveAnswerDown(button) {
    const answerDiv = button.parentElement;
    const nextAnswer = answerDiv.nextElementSibling;
    if (nextAnswer && !nextAnswer.classList.contains('add-more')) {
        answerDiv.parentNode.insertBefore(nextAnswer, answerDiv);
    }
}

function getQuestionTitle(type) {
    if (type === 'choice') return 'Choice Question';
    if (type === 'fillgap') return 'Fill-in-the-Blank Question';
    if (type === 'categorize') return 'Categorize Question';
    if (type === 'reorder') return 'Reorder Question';
}

function getQuestionContent(type, questionId) {
    if (type === 'choice') return createChoiceQuestion(questionId);
    if (type === 'fillgap') return createFillGapQuestion(questionId);
    if (type === 'categorize') return createCategorizeQuestion(questionId);
    if (type === 'reorder') return createReorderQuestion(questionId);
}

function saveQuiz() {
    const quizData = [];
    const questions = document.querySelectorAll('.question-block');

    questions.forEach(question => {
        const questionType = question.getAttribute('data-type');
        const questionTitle = question.querySelector('.question-title').innerText.trim();
        const pointsInput = question.querySelector(`#points${question.id.split('-')[1]}`);
        const durationInput = question.querySelector(`#duration${question.id.split('-')[1]}`);
        const mandatoryInput = question.querySelector(`#mandatory${question.id.split('-')[1]}`);
        const points = pointsInput ? pointsInput.value : 1; // Default to 1 if not found
        const duration = durationInput ? durationInput.value : 60; // Default to 60 if not found
        const mandatory = mandatoryInput ? mandatoryInput.checked : false; // Default to false if not found
        let questionContent = {};

        if (questionType === 'choice') {
            const questionTextInput = question.querySelector('input[name^="question"]');
            const multipleAnswersCheckbox = question.querySelector('input[type="checkbox"]');
            questionContent = {
                question: questionTextInput ? questionTextInput.value : '',
                multipleAnswers: multipleAnswersCheckbox ? multipleAnswersCheckbox.checked : false,
                answers: Array.from(question.querySelectorAll('.choices .choice input[type="text"]')).map(input => input.value),
                correctAnswers: Array.from(question.querySelectorAll('.choices .choice.selected')).map(selected => {
                    const selectedInput = selected.querySelector('input[type="text"]');
                    return selectedInput ? selectedInput.value : '';
                })
            };
        } else if (questionType === 'fillgap') {
            questionContent = {
                questionText: question.querySelector('.fill-gap-text') ? question.querySelector('.fill-gap-text').innerHTML : '',
                correctAnswers: Array.from(question.querySelectorAll('.fill-gap-text input.blank')).map(input => input.value),
                incorrectAnswers: Array.from(question.querySelectorAll('.incorrect-answer-item')).map(item => item.textContent.trim().replace('Remove', '').trim())
            };
        } else if (questionType === 'categorize') {
            questionContent = {
                categories: Array.from(question.querySelectorAll('.category')).map(category => ({
                    name: category.querySelector('.category-title') ? category.querySelector('.category-title').value : '',
                    answers: Array.from(category.querySelectorAll('.answer')).map(answer => {
                        const answerInput = answer.querySelector('.answer-input');
                        return answerInput ? answerInput.value : ''; // Correctly select answer input value
                    })
                }))
            };
        } else if (questionType === 'reorder') {
            questionContent = {
                question: question.querySelector('input[name^="reorderQuestion"]').value,
                answers: Array.from(question.querySelectorAll('.reorder-answer input[type="text"]')).map(input => input.value)
            };
        }

        quizData.push({
            type: questionType,
            title: questionTitle,
            points: points,
            duration: duration,
            mandatory: mandatory,
            content: questionContent
        });
    });

    const quizJSON = JSON.stringify(quizData, null, 2);
    console.log(quizJSON);
    alert('Quiz data has been generated in JSON format. Check the console.');
}

