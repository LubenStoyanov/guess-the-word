let numberOfGuesses = 0;
let currentLetter = 0;
let guessWord = "";
let letters = [];
let word = "";

const wordOfToday = async () => {
    const promise = await fetch("https://words.dev-apis.com/word-of-the-day");
    const data = await promise.json();
    console.log(data);
    return data.word;
};

(async () => {
    word = await wordOfToday();
})();

const isLetter = (letter) => {
    return /^[a-zA-Z]$/.test(letter);
};

const handleInput = (letter) => {
    if (guessWord.length >= 5) {
        return;
    }
    console.log(letters[currentLetter]);
    guessWord += letter;
    currentLetter++;
    if (letters[currentLetter] === undefined) {
        return;
    }
    letters[currentLetter].focus();
};

(() => {
    const guessDiv = document.querySelector(`.guess-${numberOfGuesses}`);
    const lettersNodeList = guessDiv.childNodes;
    const lettersArray = Array.from(lettersNodeList);

    letters = lettersArray.filter((letter) => letter.nodeName !== "#text");
    letters[currentLetter].focus();

    guessDiv.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "Backspace":
                console.log("Backspace");
                break;
            case "Enter":
                console.log("Enter");
                console.log(guessWord, word);
                if (guessWord.length !== 5) {
                    break;
                }

                if (guessWord === word) {
                    console.log("You won.");
                }
                break;
            default:
                if (!isLetter(event.key)) {
                    event.preventDefault();
                }
        }
    });

    guessDiv.addEventListener("keyup", (event) => {
        const key = event.key;
        if (!isLetter(key)) {
            return;
        }
        handleInput(event.target.value);
    });

    // TODO prevent focus next input if non-letter input
})();
