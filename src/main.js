"use strict";
import data from "../assets/dwds.js"; // assert { type: json } maybe stopped click event on iPhone, maybe Hammer.js helped as well
const germanWords = data.filter((word) => word.length === 5);

const loading = document.querySelector(".loading-spinner");
const optionBtnsWrapper = document.querySelector(".btns-language-wrapper");
const optionBtnsHammer = new Hammer(optionBtnsWrapper);
const optionBtns = document.querySelectorAll(".btn-language");
const keyboard = document.querySelector(".keyboard");
const keyboardHammer = new Hammer(keyboard);
const answer = document.querySelector(".answer");
const headerSmall = document.querySelector(".header__small");

const ANSWER_LENGTH = 5;
const MAX_GUESSES = 5;
const GET_WORD_URL = "https://words.dev-apis.com/word-of-the-day?random=1";
const VALIDATE_WORD_URL = "https://words.dev-apis.com/validate-word";
const regexAlphabet = /^[a-zA-Z]{5}$/;
let lang = navigator.language;

async function main() {
    let currentRound = 0;
    let currentLetter = 0;
    let guessWord = "";
    let currentRow;
    let letters = [];
    let word = "";
    let charAmount = {};
    let validGermanWord = false;

    const wordOfToday = async () => {
        if (lang.startsWith("en")) {
            try {
                loading.classList.remove("hidden");
                const promise = await fetch(GET_WORD_URL);
                const data = await promise.json();
                word = data.word.toLowerCase();
                loading.classList.add("hidden");
            } catch (error) {
                console.error(error);
            }
        } else {
            while (!validGermanWord) {
                let candidate =
                    germanWords[
                        Math.floor(Math.random() * germanWords.length - 1)
                    ];
                if (regexAlphabet.test(candidate)) {
                    word = candidate.toLowerCase();
                    validGermanWord = true;
                }
            }
            validGermanWord = false;
        }
    };

    const isValidWord = async () => {
        if (lang.startsWith("en")) {
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
        } else {
            return germanWords.some(
                (word) => word.toLowerCase() === guessWord.toLowerCase()
            );
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
            loading.classList.add("hidden");
            if (!isValid) {
                currentRow.classList.add("invalid-word");
                setTimeout(() => {
                    currentRow.classList.remove("invalid-word");
                }, 300);
                return;
            }
        } catch (error) {
            console.error(error);
        }

        getCharAmount();

        if (guessWord === word) {
            currentRow.classList.add("win");
            return;
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
                answer.innerText = word;
                answer.classList.remove("hidden");
                return;
            }
            if (guessWord.length >= ANSWER_LENGTH) {
                currentLetter = 0;
                guessWord = "";
                charAmount = {};
            }
            setCurrentRow();
        }
    };

    const eraseLastChar = () => {
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

    const setCurrentRow = () => {
        const guessRow = document.querySelector(`.round-${currentRound}`);
        const lettersNodeList = guessRow.childNodes;
        const lettersArray = Array.from(lettersNodeList);
        letters = lettersArray.filter((letter) => letter.nodeName !== "#text");

        currentRow = guessRow;
    };

    window.addEventListener("keydown", (event) => {
        if (!word) {
            return;
        }

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

    optionBtnsHammer.on("tap", (event) => {
        optionBtns.forEach((btn) => {
            if (btn.name === event.target.dataset.language) {
                btn.classList.add("language-selected");
            } else {
                btn.classList.remove("language-selected");
            }
        });
        lang = event.target.dataset.language;
        wordOfToday();
        headerSmall.classList.add("invisible");
    });

    keyboardHammer.on("tap", (event) => {
        if (
            event.target.tagName !== "BUTTON" &&
            event.target.tagName !== "SPAN"
        ) {
            return;
        }

        if (!word) {
            return;
        }

        const key = event.target.dataset.key;
        if (key === "backspace") {
            eraseLastChar();
        }

        if (key === "enter") {
            guess();
        }

        if (isLetter(key)) {
            handleLetter(key);
        }
    });

    setCurrentRow();
}

main();
