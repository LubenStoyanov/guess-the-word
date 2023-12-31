"use strict";
import data from "../assets/validWords.js"; 
const germanWords = data.filter((word) => word.length === 5);

const loading = document.querySelector(".loading-spinner");
const optionBtnsWrapper = document.querySelector(".btns-language-wrapper");
const optionBtnsHammer = new Hammer(optionBtnsWrapper);
const optionBtns = document.querySelectorAll(".btn-language");
const keyboard = document.querySelector(".keyboard");
const keyboardHammer = new Hammer(keyboard);
const headerSmall = document.querySelector(".header__small");
const gameOver = document.querySelector(".game-over");
const gameOverHammer = new Hammer(gameOver);
const gameInfoClose = document.querySelector(".game-info__close");
const gameInfoCloseHammer = new Hammer(gameInfoClose);
const headerGameInfoIcon = document.querySelector(".header__game-info-modal");
const headerGameInfoIconHammer = new Hammer(headerGameInfoIcon);

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
                headerGameInfoIcon.classList.add("hidden");
                const promise = await fetch(GET_WORD_URL);
                const data = await promise.json();
                word = data.word.toLowerCase();
                loading.classList.add("hidden");
                headerGameInfoIcon.classList.remove("hidden");
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
        console.log(word)
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
            headerGameInfoIcon.classList.add("hidden");
            loading.classList.remove("hidden");
            const isValid = await isValidWord();
            loading.classList.add("hidden");
            headerGameInfoIcon.classList.remove("hidden");
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
            setTimeout(() => gameOverModal(), 1500);
            return;
        } else {
            const guessWordArray = guessWord.split("");
            guessWordArray.forEach((l, i) => {
                if (l === word[i]) {
                    letters[i].classList.add("bg-limegreen");
                    charAmount[l]--;
                }  
                if (!word.includes(l)) {
                    letters[i].classList.add("bg-lightgray");
                }
            });

            guessWordArray.forEach((l, i) => {
                if(l === word[i]){
                    return;
                }
                if (charAmount[l] !== 0 && word.includes(l)) {
                    letters[i].classList.add("bg-yellow");
                    charAmount[l]--;
                } else {
                    letters[i].classList.add("bg-lightgray");
                }
            });

            currentRound++;
            if (currentRound > MAX_GUESSES) {
                gameOver.firstElementChild.innerText = word;
                gameOverModal();
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

    const gameOverModal = () => {
        gameOverHammer.on("tap", (event) => {
            if (event.target.tagName !== "BUTTON") {
                return;
            }
            location.reload();
        })
        gameOver.classList.remove("hidden");
    }

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

    gameInfoCloseHammer.on("tap", () => {
        const gameInfo = document.querySelector(".game-info");
        gameInfo.classList.add("slide-out-down");
        gameInfo.classList.remove("slide-in-up");
    });
    
    headerGameInfoIconHammer.on("tap", () => {
        const gameInfo = document.querySelector(".game-info");
        gameInfo.classList.remove("slide-out-down");
        gameInfo.classList.add("slide-in-up");
    });
    setCurrentRow();
}
main();
