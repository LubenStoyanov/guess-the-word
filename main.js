"use strict";
// import data from './assets/German-words-1600000-words.json' assert { type: 'json' };
import data from "./assets/dwds.json" assert { type: "json" };
const germanWords = data.filter((word) => word.length === 5);

const loss = document.querySelector(".loss");
const invalidWord = document.querySelector(".invalid-word");
const loading = document.querySelector(".lds-roller");
const optionBtnsElement = document.querySelector(".btns-language-wrapper");

const ANSWER_LENGTH = 5;
const MAX_GUESSES = 5;
const GET_WORD_URL = "https://words.dev-apis.com/word-of-the-day?random=1";
const VALIDATE_WORD_URL = "https://words.dev-apis.com/validate-word";
let lang = "en";
let validGermanWord = false;
const regexAlphabet = /^[a-zA-Z]{5}$/;

async function main() {
    let currentRound = 0;
    let currentLetter = 0;
    let guessWord = "";
    let guessDiv;
    let letters = [];
    let word = "";
    let charAmount = {};

    const wordOfToday = async () => {
        if (lang === "en") {
            try {
                loading.classList.remove("hidden");
                const promise = await fetch(GET_WORD_URL);
                const data = await promise.json();
                word = data.word;
                loading.classList.add("hidden");
            } catch (error) {
                console.error(error);
            }
        } else {
            while (!validGermanWord) {
                let candidate = germanWords[Math.floor(Math.random() * germanWords.length - 1)];
                if (regexAlphabet.test(candidate)) {
                    validGermanWord = true;
                    word = candidate;
                }
            } 
            validGermanWord = false;
        }

        console.log(word);
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
        word.split("").forEach((c) => {
            if (charAmount[c]) {
                charAmount[c]++;
            } else {
                charAmount[c] = 1;
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
        getCharAmount();

        if (guessWord === word) {
            guessDiv.classList.add("win");
        } else {
            const guessWordArray = guessWord.split("");
            guessWordArray.forEach((l, i) => {
                if (l === word[i]) {
                    letters[i].classList.add("bg-limegreen");
                    charAmount[l]--;
                } else if (!word.includes(l)) {
                    letters[i].classList.add("bg-lightgray");
                }
            });

            guessWordArray.forEach((l, i) => {
                if (charAmount[l] !== 0 && word.includes(l)) {
                    letters[i].classList.add("bg-yellow");
                    charAmount[l]--;
                } else if (!letters[i].classList.contains("bg-limegreen")) {
                    letters[i].classList.add("bg-lightgray");
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
                charAmount = {};
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

    optionBtnsElement.addEventListener("click", (event) => {
        lang = event.target.name;
        wordOfToday();
    });

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
