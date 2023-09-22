"use strict";
import data from "./assets/dwds.json" assert { type: "json" };
const germanWords = data.filter((word) => word.length === 5);

const loss = document.querySelector(".loss");
const invalidWord = document.querySelector(".invalid-word");
const loading = document.querySelector(".loading-spinner");
const optionBtnsWrapper = document.querySelector(".btns-language-wrapper");
const optionBtns = document.querySelectorAll(".btn-language");

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
    let guessDiv;
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
        console.log(word);
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

    optionBtnsWrapper.addEventListener("click", (event) => {
        console.log(event.target.dataset.language)
        if (!event.target.dataset.language) {
            return;
        }

        optionBtns.forEach((btn) => {
            if (btn.name === event.target.dataset.language) {
                btn.classList.add("language-selected");
            } else {
                btn.classList.remove("language-selected");
            }
        });
        lang = event.target.dataset.language;
        wordOfToday();
    });

    currentRow();
}

main();

(function (a) {
    if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
            a
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
            a.substr(0, 4)
        )
    ) {
        const supportInfo = document.querySelector(".support-info");
        supportInfo.classList.add("show");
    }
})(navigator.userAgent || window.opera);
