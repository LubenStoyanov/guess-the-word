"use strict";
const loss = document.querySelector(".loss");
const invalidWord = document.querySelector(".invalid-word");
const loading = document.querySelector(".lds-roller");

const ANSWER_LENGTH = 5;
const MAX_GUESSES = 5;
const GET_WORD_URL = "https://words.dev-apis.com/word-of-the-day";
const VALIDATE_WORD_URL = "https://words.dev-apis.com/validate-word";

async function main() {
    let currentRound = 0;
    let currentLetter = 0;
    let guessWord = "";
    let guessDiv;
    let letters = [];
    let word = "";
    let charAmount = {};

    const wordOfToday = async () => {
        try {
            loading.classList.remove("hidden");
            const promise = await fetch(GET_WORD_URL);
            const data = await promise.json();
            word = data.word;
            loading.classList.add("hidden");
        } catch (error) {
            console.error(error);
        }
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

    const getCharAmount = () => {
        guessWord.split("").forEach((c) => {
            if (charAmount[c]) {
                charAmount[c]++;
            } else {
                charAmount[c] = 0;
            }
        });
    };

    const guess = async () => {
        if (guessWord.length !== ANSWER_LENGTH) {
            return;
        }

        try {
            loading.classList.remove("hidden");
            const isValid = await isValidWord();
            invalidWord.hidden = isValid;
            loading.classList.add("hidden");
            if (!isValid) {
                return;
            }
        } catch (error) {
            console.error(error);
        }

        if (guessWord === word) {
            letters.forEach((l) => {
                guessDiv.classList.add("win");
            });
        } else {
            const guessWordArray = guessWord.split("");
            guessWordArray.forEach((l, i) => {
                if (l === word[i]) {
                    letters[i].classList.add("bg-limegreen");
                }
                if (!word.includes(l)) {
                    letters[i].classList.add("bg-lightgray");
                }
            });

            getCharAmount();
            guessWordArray.forEach((l, i) => {
                if (charAmount[l] !== 0 && word.includes(l)) {
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

    const eraseLastChar = () => {
        invalidWord.hidden = true;
        if (guessWord.length === 0) {
            return;
        }
        guessWord = guessWord.slice(0, guessWord.length - 1);
        currentLetter--;
        letters[currentLetter].innerText = "";
    };

    const handleLetter = (letter) => {
        console.log(letter);
        if (guessWord.length >= ANSWER_LENGTH) {
            return;
        }

        guessWord += letter;
        letters[currentLetter].innerText = letter;
        currentLetter++;

        if (letters[currentLetter] === undefined) {
            return;
        }
    };

    const currentRow = () => {
        const guessRow = document.querySelector(`.round-${currentRound}`);
        const lettersNodeList = guessRow.childNodes;
        const lettersArray = Array.from(lettersNodeList);
        letters = lettersArray.filter((letter) => letter.nodeName !== "#text");

        guessDiv = guessRow;
    };

    window.addEventListener("keydown", (event) => {
        if (event.key === "Backspace") {
            eraseLastChar();
        }
        if (event.key === "Enter") {
            guess();
        }
        if (isLetter(event.key)) {
            handleLetter(event.key);
        }
    });

    currentRow();
    wordOfToday();
}

main();
