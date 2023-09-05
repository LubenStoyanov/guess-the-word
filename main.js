let currentGuess = 0;
let currentLetter = 0;
let guessWord = "";
let guessDiv;
let letters = [];
let word = "";
const GET_WORD_URL = "https://words.dev-apis.com/word-of-the-day";
const VALIDATE_WORD_URL = "https://words.dev-apis.com/validate-word";
const loss = document.querySelector(".loss");
const invalidWord = document.querySelector(".invalid-word");

const wordOfToday = async () => {
    try {
        const promise = await fetch(GET_WORD_URL);
        const data = await promise.json();
        word = data.word;
    } catch (error) {
        console.error(error);
    }
};

const isLetter = (letter) => {
    return /^[a-zA-Z]$/.test(letter);
};

const isValidWord = async () => {
    console.log("invalid??");
    try {
        const response = await fetch(VALIDATE_WORD_URL, {
            method: "POST",
            body: JSON.stringify({ word: guessWord }),
        });
        const data = await response.json();
        return data.validWord;
    } catch (error) {
        console.error(error);
    }
};

const handleGuess = async () => {
    // logVariables();
    const isValid = await isValidWord();
    if (!isValid) {
        invalidWord.hidden = false;
        return;
    }
    if (guessWord === word) {
        letters.forEach((l) => {
            l.classList.add("win");
        });
    } else {
        guessWord.split("").forEach((l, i) => {
            if (!word.includes(l)) {
                letters[i].classList.add("bg-lightgray");
            }
            if (l === word[i]) {
                console.log(letters[i]);
                letters[i].classList.add("bg-limegreen");
            } else if (word.includes(l)) {
                letters[i].classList.add("bg-yellow");
            }
        });
        currentGuess++;
        if (currentGuess > 5) {
            console.log("You lost.");
            loss.hidden = false;
            return;
        }
        if (guessWord.length >= 5) {
            currentLetter = 0;
            guessWord = "";
        }
        getGuessDiv();
    }
};

const handleKeyDown = (event) => {
    switch (event.key) {
        case "Backspace":
            console.log("Backspace");
            // TODO: implement delete feature
            break;
        case "Enter":
            if (guessWord.length !== 5) {
                break;
            }
            handleGuess();
            break;
    }
};

const handleKeyUp = (event) => {
    if (!isLetter(event.key)) {
        return;
    }
    if (guessWord.length >= 5) {
        return;
    }

    guessWord += event.key;
    currentLetter++;

    if (letters[currentLetter] === undefined) {
        return;
    }
    letters[currentLetter].focus();
};

const getGuessDiv = () => {
    if (currentGuess > 0) {
        guessDiv.removeEventListener("keydown", handleKeyDown);
        guessDiv.removeEventListener("keyup", handleKeyUp);
    }

    guessDiv = document.querySelector(`.guess-${currentGuess}`);
    const lettersNodeList = guessDiv.childNodes;
    const lettersArray = Array.from(lettersNodeList);
    letters = lettersArray.filter((letter) => letter.nodeName !== "#text");
    letters[currentLetter].focus();
    guessDiv.addEventListener("keydown", handleKeyDown);
    guessDiv.addEventListener("keyup", handleKeyUp);

    return guessDiv;
};

const init = () => {
    guessDiv = getGuessDiv();
    wordOfToday();
};

init();

const logVariables = () => {
    console.log("guessWord", guessWord);
    console.log("currentGuess", currentGuess);
    console.log("guessdiv", guessDiv);
    console.log("currentLetter", currentLetter);
    console.log("letters", letters);
};
