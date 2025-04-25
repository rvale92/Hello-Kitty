document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const movesSpan = document.querySelector('.moves');
    const minutesSpan = document.querySelector('.minutes');
    const secondsSpan = document.querySelector('.seconds');
    const restartButton = document.querySelector('.restart-button');

    let cards = [];
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let moves = 0;
    let matches = 0;
    let timer;
    let seconds = 0;
    let minutes = 0;

    // Simple Sound System
    const createSound = (src) => {
        const sound = new Audio(src);
        sound.volume = 0.3;
        return sound;
    };

    const sounds = {
        flip: [
            createSound('Sounds/bubble-pop.mp3'),
            createSound('Sounds/bubble-pop.mp3'),
            createSound('Sounds/bubble-pop.mp3'),
            createSound('Sounds/bubble-pop.mp3')
        ],
        match: createSound('Sounds/victory.mp3'),
        victory: createSound('Sounds/victory.mp3')
    };

    let currentFlipSound = 0;

    function playSound(type) {
        try {
            if (type === 'flip') {
                // Use sound pool for flip sounds
                const sound = sounds.flip[currentFlipSound];
                sound.currentTime = 0;
                sound.play();
                currentFlipSound = (currentFlipSound + 1) % sounds.flip.length;
            } else {
                // For match and victory sounds
                const sound = sounds[type];
                sound.currentTime = 0;
                sound.play();
            }
        } catch (e) {
            console.log(`Error playing ${type} sound:`, e);
        }
    }

    // Card images
    const cardImages = [
        'Matching-Images/kitty1.png',
        'Matching-Images/kitty2.png',
        'Matching-Images/kitty3.png',
        'Matching-Images/kitty4.png',
        'Matching-Images/kitty5.png',
        'Matching-Images/kitty6.png',
        'Matching-Images/kitty7.png',
        'Matching-Images/kitty8.png'
    ];

    function createCard(image) {
        const card = document.createElement('div');
        card.classList.add('card');
        
        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        
        const img = document.createElement('img');
        img.src = image;
        img.alt = 'Hello Kitty';
        
        cardBack.appendChild(img);
        card.appendChild(cardFront);
        card.appendChild(cardBack);
        
        card.addEventListener('click', flipCard);
        return card;
    }

    function startGame() {
        const shuffledImages = [...cardImages, ...cardImages]
            .sort(() => Math.random() - 0.5);
        
        gameBoard.innerHTML = '';
        shuffledImages.forEach(image => {
            const card = createCard(image);
            gameBoard.appendChild(card);
        });

        moves = 0;
        matches = 0;
        movesSpan.textContent = moves;
        resetTimer();
        startTimer();
    }

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;

        playSound('flip');
        this.classList.add('flipped');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }

        secondCard = this;
        checkForMatch();
    }

    function checkForMatch() {
        moves++;
        movesSpan.textContent = moves;

        const isMatch = firstCard.querySelector('img').src === 
                       secondCard.querySelector('img').src;

        lockBoard = true; // Lock the board immediately

        if (isMatch) {
            setTimeout(() => {
                playSound('match');
                firstCard.classList.add('matched');
                secondCard.classList.add('matched');
                
                firstCard.classList.add('animate__animated', 'animate__bounce');
                secondCard.classList.add('animate__animated', 'animate__bounce');
                
                const handleAnimationEnd = (element) => {
                    element.classList.remove('animate__animated', 'animate__bounce');
                };

                firstCard.addEventListener('animationend', () => handleAnimationEnd(firstCard), { once: true });
                secondCard.addEventListener('animationend', () => handleAnimationEnd(secondCard), { once: true });

                disableCards();
                matches++;
                
                if (matches === cardImages.length) {
                    setTimeout(() => {
                        playSound('victory');
                        alert(`Congratulations! You won in ${moves} moves and ${minutes}:${seconds < 10 ? '0' : ''}${seconds} time!`);
                    }, 500);
                    clearInterval(timer);
                } else {
                    lockBoard = false; // Unlock board after match
                }
            }, 300);
        } else {
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                resetBoard();
            }, 1000);
        }
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        resetBoard();
    }

    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    function startTimer() {
        timer = setInterval(() => {
            seconds++;
            if (seconds === 60) {
                minutes++;
                seconds = 0;
            }
            minutesSpan.textContent = minutes;
            secondsSpan.textContent = seconds < 10 ? `0${seconds}` : seconds;
        }, 1000);
    }

    function resetTimer() {
        clearInterval(timer);
        seconds = 0;
        minutes = 0;
        minutesSpan.textContent = '0';
        secondsSpan.textContent = '00';
    }

    restartButton.addEventListener('click', startGame);
    startGame();
}); 