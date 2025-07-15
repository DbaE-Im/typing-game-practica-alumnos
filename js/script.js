import { words as INITIAL_WORDS } from './data.js';

const $time = document.querySelector('time');
const $paragraph = document.querySelector('p');
const $input = document.getElementById('input'); // Se usó getElementById en lugar de querySelector por ser más directo y ligeramente más rápido.
const $game = document.querySelector('#game');
const $results = document.querySelector('#results');
const $exactitud = document.getElementById('results-exactitud'); // Mismo motivo, consistencia con $ppm.
const $ppm = document.getElementById('results-ppm'); // Se agregó para poder mostrar las palabras por minuto.
const $button = document.getElementById('reload-button'); // Se cambió a getElementById por claridad y rendimiento.

const INITIAL_TIME = 30;
let words = [];
let currentTime = INITIAL_TIME;

initGame();
initEvents();

function initGame() {
    $game.style.display = 'flex';
    $results.style.display = 'none'; // Oculta los resultados cuando inicia juego nuevo.
    $input.value = '';

    words = INITIAL_WORDS.toSorted(() => Math.random() - 0.5).slice(0, 60); 
    // Cambiado de `.slice(0, 0)` a `.slice(0, 20)` para que se vea palabras que escribir.

    currentTime = INITIAL_TIME;
    $time.textContent = currentTime;

    $paragraph.innerHTML = words.map(word => {
        const letters = word.split('');
        return `<word>${letters.map(letter => `<letter>${letter}</letter>`).join('')}</word>`;
    }).join('');

    const $firstWord = $paragraph.querySelector('word');
    $firstWord.classList.add('active');
    $firstWord.querySelector('letter').classList.add('active');

    const intervalId = setInterval(() => {
        currentTime--;
        $time.textContent = currentTime;

        if (currentTime === 0) {
            clearInterval(intervalId);
            gameOver();
        }
    }, 1000); // Cambiado de 10000 ms a 1000 ms para que cada segundo disminuya correctamente el tiempo.
}

function initEvents() {
    document.addEventListener('keydown', () => $input.focus());
    $input.addEventListener('keydown', onkeydown);
    $input.addEventListener('keyup', onkeyup); // Cambiado de 'key' a 'keyup', ya que 'key' no es un evento válido.
    $button.addEventListener('click', initGame);
}

function onkeydown(event) {
    const $currentWord = $paragraph.querySelector('word.active');
    const $currentLetter = $currentWord.querySelector('letter.active');
    const { key } = event;

    if (key === ' ') {
        event.preventDefault();

        const $nextWord = $currentWord.nextElementSibling;
        if (!$nextWord) return; // Validación para evitar error si no hay siguiente palabra.

        const $nextLetter = $nextWord.querySelector('letter');
        const hasMissedLetters = $currentWord.querySelectorAll('letter:not(.correct)').length > 0; 
        // Corregido de '.correcto' a '.correct' para coincidir con la clase que se usa en el código.

        $currentWord.classList.remove('active', 'marked'); // Corregido de market y merked a marked.
        $currentLetter.classList.remove('active');
        $currentWord.classList.add(hasMissedLetters ? 'marked' : 'correct');

        $nextWord.classList.add('active');
        $nextLetter.classList.add('active');
        $input.value = ''; // Limpia el input al pasar a la siguiente palabra.

        return;
    }

    if (key === 'Backspace') {
    const $prevLetter = $currentLetter.previousElementSibling;

        if ($prevLetter) {
            // Si hay una letra anterior, simplemente retrocede a ella
            $currentLetter.classList.remove('active');
            $prevLetter.classList.add('active');
            return;
        }

        // Si NO hay letra anterior, intenta volver a la palabra anterior
        const $prevWord = $currentWord.previousElementSibling;
        if (!$prevWord) return;

        event.preventDefault(); // Evitamos borrar el input normal

        const $lastLetterPrevWord = $prevWord.querySelector('letter:last-child');

        $currentWord.classList.remove('active');
        $currentLetter.classList.remove('active');

        $prevWord.classList.add('active');
        $lastLetterPrevWord.classList.add('active');

        $input.value = [...$prevWord.querySelectorAll('letter.correct, letter.incorrect')]
            .map($el => $el.classList.contains('correct') ? $el.innerText : '*')
            .join('');
    }
}

function onkeyup() {
    const $currentWord = $paragraph.querySelector('word.active');
    const $allLetters = $currentWord.querySelectorAll('letter');
    const currentWord = [...$allLetters].map($l => $l.textContent).join('');
    const input = $input.value;

    $input.maxLength = currentWord.length;

    $allLetters.forEach($letter => $letter.classList.remove('correct', 'incorrect'));

    input.split('').forEach((char, index) => {
        const $letter = $allLetters[index];
        if (!$letter) return; // Validación para evitar error si el input es más largo que la palabra.
        const letterToCheck = currentWord[index];
        const isCorrect = char === letterToCheck;
        $letter.classList.add(isCorrect ? 'correct' : 'incorrect');
    });

    const inputLength = input.length;
    $allLetters.forEach($l => $l.classList.remove('active', 'is-last'));
    if (inputLength < $allLetters.length) {
        $allLetters[inputLength].classList.add('active');
    } else {
        $allLetters[$allLetters.length - 1].classList.add('active', 'is-last');
    }
}

function gameOver() {
    $game.style.display = 'none';
    $results.style.display = 'flex';

    const correctWords = $paragraph.querySelectorAll('word.correct').length;
    const correctLetter = $paragraph.querySelectorAll('letter.correct').length;
    const incorrectLetter = $paragraph.querySelectorAll('letter.incorrect').length;
    const totalLetters = correctLetter + incorrectLetter;

    const exactitud = totalLetters > 0 ? (correctLetter / totalLetters) * 100 : 0;
    const ppm = correctWords * 10 / INITIAL_TIME; // Fórmula simple para obtener palabras por minuto (PPM).

    $ppm.textContent = ppm.toFixed(2); // Línea agregada para mostrar PPM al final.
    $exactitud.textContent = `${exactitud.toFixed(2)}%`;
}
