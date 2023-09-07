"use strict";
const loss = document.querySelector(".loss");
const invalidWord = document.querySelector(".invalid-word");
const loading = document.querySelector(".lds-roller");
let currentRound = 0;
let currentLetter = 0;
let guessWord = "";
let guessDiv;
let letters = [];
let word = "";
const ANSWER_LENGTH = 5;
const MAX_GUESSES = 5;
const GET_WORD_URL = "https://words.dev-apis.com/word-of-the-day";
const VALIDATE_WORD_URL = "https://words.dev-apis.com/validate-word";

async function main() {
    const wordOfToday = async () => {
        loading.classList.remove("hidden");
        try {
            const promise = await fetch(GET_WORD_URL);
            const data = await promise.json();
            word = data.word;
        } catch (error) {
            console.error(error);
        }
        loading.classList.add("hidden");
    };

    const isValidWord = async () => {
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

    const isLetter = (letter) => {
        return /^[a-zA-Z]$/.test(letter);
    };

    const handleGuess = async () => {
        loading.classList.remove("hidden");
        let isValid;
        try {
            isValid = await isValidWord();
        } catch (error) {
            console.error(error);
        }
        loading.classList.add("hidden");

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
                    letters[i].classList.add("bg-limegreen");
                } else if (word.includes(l)) {
                    letters[i].classList.add("bg-yellow");
                }
            });
            currentRound++;
            if (currentRound > MAX_GUESSES) {
                loss.hidden = false;
                return;
            }
            if (guessWord.length >= ANSWER_LENGTH) {
                currentLetter = 0;
                guessWord = "";
            }
            currentRow();
        }
    };

    const handleKeyDown = (event) => {
        switch (event.key) {
            case "Backspace":
                invalidWord.hidden = true;
                if (guessWord.length === 0) {
                    return;
                }
                guessWord = guessWord.slice(0, guessWord.length - 1);
                currentLetter--;
                letters[currentLetter].innerText = "";
                break;
            case "Enter":
                if (guessWord.length !== ANSWER_LENGTH) {
                    break;
                }
                handleGuess();
                break;
        }
    };

    const handleKeyUp = (event) => {
        if (!isLetter(event.key) || guessWord.length >= ANSWER_LENGTH) {
            return;
        }

        guessWord += event.key;
        letters[currentLetter].innerText = event.key;
        currentLetter++;

        if (letters[currentLetter] === undefined) {
            return;
        }
        letters[currentLetter].focus();
    };

    const currentRow = () => {
        const guessRow = document.querySelector(`.round-${currentRound}`);
        const lettersNodeList = guessRow.childNodes;
        const lettersArray = Array.from(lettersNodeList);
        letters = lettersArray.filter((letter) => letter.nodeName !== "#text");
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        guessDiv = guessRow;
    };

    currentRow();
    wordOfToday();
}

main();
