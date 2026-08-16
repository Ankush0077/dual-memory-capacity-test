// --- STATE & DATA ---
const totalTrials = 10;
let currentTrial = 1;
const targetTrialIndex = 4;
let sequences = [];
let specialSequence = [];
let experimentResults = [];

// --- DEV MODE AUTOMATION ---
function debugSkipToEnd() {
    experimentResults = [];
    // Generate fake data for 42 questions
    for(let i = 0; i < 42; i++) {
        experimentResults.push({
            trial: 1, // mock
            isCorrect: Math.random() > 0.2, // 80% chance to be correct
            timeTakenMs: 800 + Math.floor(Math.random() * 1500) // Random time between 0.8s and 2.3s
        });
    }
    document.getElementById('phase-1').classList.add('hidden');
    // Call results function directly (assuming they passed LTM and passed Distractor)
    calculateAndShowResults(true, false);
}

// --- WORD GENERATOR ---
function generateWord(length) {
    const consonants = 'bcdfghjklmnprstvwz'.split('');
    const vowels = 'aeiou'.split('');
    const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    let word = '';
    if (length === 4) word = randomPick(consonants) + randomPick(vowels) + randomPick(consonants) + randomPick(consonants);
    else if (length === 5) word = randomPick(consonants) + randomPick(vowels) + randomPick(consonants) + randomPick(vowels) + randomPick(consonants);
    else word = randomPick(consonants) + randomPick(vowels) + randomPick(consonants) + randomPick(consonants) + randomPick(vowels) + randomPick(consonants);
    return word.toUpperCase();
}

function generateExperimentData() {
    const wordCounts = [3, 3, 4, 4, 4, 4, 5, 5, 5, 5];
    for (let i = 0; i < totalTrials; i++) {
        let seq = [];
        for (let w = 0; w < wordCounts[i]; w++) {
            seq.push(generateWord(Math.floor(Math.random() * 2) + 4));
        }
        sequences.push(seq);
    }
    specialSequence = sequences[targetTrialIndex - 1];
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- PHASE 1 & 2: EXPERIMENT LOGIC ---
document.getElementById('start-btn').addEventListener('click', async () => {
    generateExperimentData();
    document.getElementById('phase-1').classList.add('hidden');
    document.getElementById('phase-2').classList.remove('hidden');
    runTrial();
});

async function runTrial() {
    document.getElementById('trial-counter').innerText = `Trial ${currentTrial} / ${totalTrials}`;
    document.getElementById('mcq-section').classList.add('hidden');
    const wordDisplay = document.getElementById('word-display');
    wordDisplay.innerText = '';

    let isSpecial = (currentTrial === targetTrialIndex);
    let currentSequence = sequences[currentTrial - 1];

    await sleep(1000);
    if (isSpecial) {
        document.body.classList.add('alert-mode');
        document.getElementById('bell-warning').classList.remove('hidden');
        await sleep(3000);
        document.getElementById('bell-warning').classList.add('hidden');
        document.body.classList.remove('alert-mode');
        await sleep(500);
    }

    for (let word of currentSequence) {
        wordDisplay.innerText = word;
        await sleep(1500);
        wordDisplay.innerText = '';
        await sleep(250);
    }
    askQuestion(0);
}

let currentQuestionIndex = 0;
let questionStartTime = 0;

function askQuestion(wordIndex) {
    currentQuestionIndex = wordIndex;
    let currentSequence = sequences[currentTrial - 1];
    let correctWord = currentSequence[wordIndex];
    
    let options = [correctWord];
    while (options.length < 4) {
        let lure = generateWord(correctWord.length);
        if (!options.includes(lure) && !currentSequence.includes(lure)) options.push(lure);
    }
    options.sort(() => Math.random() - 0.5);

    document.getElementById('question-text').innerText = `What was word #${wordIndex + 1}?`;
    const container = document.getElementById('options-container');
    container.innerHTML = '';

    options.forEach(opt => {
        let btn = document.createElement('button');
        btn.innerText = opt;
        btn.className = 'btn';
        btn.style.width = '200px';
        btn.onclick = () => handleAnswer(opt, correctWord);
        container.appendChild(btn);
    });

    document.getElementById('mcq-section').classList.remove('hidden');
    questionStartTime = Date.now();
}

function handleAnswer(selectedWord, correctWord) {
    experimentResults.push({
        trial: currentTrial,
        wordPosition: currentQuestionIndex + 1,
        correctWord: correctWord,
        selectedWord: selectedWord,
        isCorrect: (selectedWord === correctWord),
        timeTakenMs: Date.now() - questionStartTime
    });

    let currentSequence = sequences[currentTrial - 1];
    if (currentQuestionIndex + 1 < currentSequence.length) {
        askQuestion(currentQuestionIndex + 1);
    } else {
        document.getElementById('mcq-section').classList.add('hidden');
        if (currentTrial < totalTrials) {
            currentTrial++;
            runTrial();
        } else {
            startDistractorTask();
        }
    }
}

// --- PHASE 3: DISTRACTOR TASK ---
let distractorScore = 0;
let distractorTimer = 20.0;
let distractorInterval;
const realWords = ["APPLE", "TRAIN", "HOUSE", "WATER", "BREAD", "GHOST", "CHAIR", "RIVER", "SNAKE", "CLOCK", "PAPER", "MONEY"];

function startDistractorTask() {
    document.getElementById('phase-2').classList.add('hidden');
    document.getElementById('phase-3').classList.remove('hidden');
    distractorScore = 0;
    distractorTimer = 20.0;
    document.getElementById('distractor-score').innerText = `Score: 0 / 7`;
    
    distractorInterval = setInterval(() => {
        distractorTimer -= 0.1;
        document.getElementById('timer-display').innerText = Math.max(0, distractorTimer).toFixed(1);
        if (distractorTimer <= 0) {
            clearInterval(distractorInterval);
            endDistractorTask();
        }
    }, 100);
    generateDistractorRound();
}

function generateDistractorRound() {
    let options = [...realWords].sort(() => Math.random() - 0.5).slice(0, 4);
    let target = options[Math.floor(Math.random() * options.length)];
    document.getElementById('target-word-display').innerText = `TARGET: ${target}`;
    
    const container = document.getElementById('distractor-options');
    container.innerHTML = '';
    options.forEach(word => {
        let btn = document.createElement('button');
        btn.innerText = word;
        btn.className = 'btn';
        btn.style.width = '200px';
        btn.onclick = () => {
            if (word === target) {
                distractorScore++;
                document.getElementById('distractor-score').innerText = `Score: ${distractorScore} / 7`;
                generateDistractorRound();
            } else {
                distractorTimer -= 1.0; 
                btn.style.backgroundColor = 'var(--danger-color)';
            }
        };
        container.appendChild(btn);
    });
}

function endDistractorTask() {
    document.getElementById('phase-3').classList.add('hidden');
    if (distractorScore >= 7) {
        startFinalTest();
    } else {
        document.getElementById('end-title').innerText = "Distractor Failed";
        document.getElementById('end-subtitle').innerText = "You did not achieve the required score on the Security Check. Here are your partial results:";
        calculateAndShowResults(false, true);
    }
}

// --- PHASE 4: FINAL LTM TEST ---
function startFinalTest() {
    document.getElementById('phase-4').classList.remove('hidden');
    
    let missingIndex = Math.floor(Math.random() * specialSequence.length);
    let correctWord = specialSequence[missingIndex];
    let displayStr = specialSequence.map((w, i) => i === missingIndex ? "______" : w).join(" - ");
    document.getElementById('final-sequence-display').innerText = displayStr;
    
    let options = [correctWord];
    while (options.length < 4) {
        let lure = generateWord(correctWord.length);
        if (!options.includes(lure) && !specialSequence.includes(lure)) options.push(lure);
    }
    options.sort(() => Math.random() - 0.5);
    
    const container = document.getElementById('final-options');
    container.innerHTML = '';
    let finalStartTime = Date.now();
    
    options.forEach(opt => {
        let btn = document.createElement('button');
        btn.innerText = opt;
        btn.className = 'btn';
        btn.style.width = '200px';
        btn.onclick = () => {
            experimentResults.push({
                trial: "FINAL_LTM_TEST",
                correctWord: correctWord,
                selectedWord: opt,
                isCorrect: (opt === correctWord),
                timeTakenMs: Date.now() - finalStartTime
            });
            calculateAndShowResults(opt === correctWord, false);
        };
        container.appendChild(btn);
    });
}

// --- PHASE 5: RESULTS CALCULATION ---
function calculateAndShowResults(ltmPassed, distractorFailed) {
    let wmTrials = experimentResults.filter(r => r.trial !== "FINAL_LTM_TEST");
    
    let correctCount = wmTrials.filter(r => r.isCorrect).length;
    let totalWMQs = wmTrials.length; 
    let accuracyPercent = totalWMQs > 0 ? Math.round((correctCount / totalWMQs) * 100) : 0;
    
    let correctTrials = wmTrials.filter(r => r.isCorrect);
    let totalTime = correctTrials.reduce((sum, r) => sum + r.timeTakenMs, 0);
    let avgTime = correctTrials.length > 0 ? Math.round(totalTime / correctTrials.length) : 0;
    
    let standingText = "";
    if (accuracyPercent >= 90) standingText = "🏆 Top 5%: You have an exceptional Working Memory capacity. You can hold complex information in your phonological loop much longer than average.";
    else if (accuracyPercent >= 70) standingText = "📈 Top 30%: Above average! Your working memory is solid and withstands moderate cognitive load.";
    else if (accuracyPercent >= 45) standingText = "📊 Average: You fall right in the middle of the bell curve. Your brain accurately processes 7(±2) items, but degrades naturally under pressure.";
    else standingText = "📉 Below Average: Your working memory experienced severe cognitive overload during the 5-word sequences. This is normal under high fatigue!";

    if (distractorFailed) standingText += " You failed the Security Check, meaning your brain couldn't handle the multi-tasking interference.";
    else if (ltmPassed) standingText += " Furthermore, your Executive Function successfully protected the Special Sequence from extreme interference!";
    else standingText += " However, the distractor successfully overwrote your Long-Term memory trace (which happens to 65% of participants).";

    document.getElementById('res-accuracy').innerText = `${correctCount} / ${totalWMQs} (${accuracyPercent}%)`;
    document.getElementById('res-rt').innerText = avgTime > 0 ? `${(avgTime / 1000).toFixed(2)} seconds` : "N/A";
    
    let ltmSpan = document.getElementById('res-ltm');
    if (distractorFailed) {
        ltmSpan.innerText = "N/A (Failed Security Check)";
        ltmSpan.style.color = "orange";
    } else if (ltmPassed) {
        ltmSpan.innerText = "PASSED (Memory Retained)";
        ltmSpan.style.color = "green";
    } else {
        ltmSpan.innerText = "FAILED (Memory Overwritten)";
        ltmSpan.style.color = "red";
    }

    document.getElementById('res-analysis').innerText = standingText;

    document.getElementById('phase-1').classList.add('hidden');
    document.getElementById('phase-2').classList.add('hidden');
    document.getElementById('phase-3').classList.add('hidden');
    document.getElementById('phase-4').classList.add('hidden');
    document.getElementById('phase-5').classList.remove('hidden');
}