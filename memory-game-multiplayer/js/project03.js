const gameGrid = document.getElementById("gameGrid");
const moveCounter = document.getElementById("moveCounter");
const timer = document.getElementById("timer");
const restartBtn = document.getElementById("restartBtn");
const startGameBtn = document.getElementById("startGameBtn");
const gridRowsInput = document.getElementById("gridRows");
const gridColsInput = document.getElementById("gridCols");
const welcomeContainer = document.querySelector(".welcome-container");
const gameContainer = document.querySelector(".game-container");

// Multiplayer elements
const player1ScoreSpan = document.getElementById("player1Score");
const player2ScoreSpan = document.getElementById("player2Score");
const currentPlayerDisplay = document.getElementById("currentPlayerDisplay");

let cards = [];
let flippedCards = [];
let moves = 0;
let timerInterval = null;
let timeElapsed = 0;
let gridRows = 4;
let gridCols = 4;

// Multiplayer variables
let currentPlayer = 1;
let playerScores = [0, 0];

// List of animal image filenames
const animalImages = [
  "cat.png", "dog.png", "elephant.png", "fox.png", "lion.png",
  "monkey.png", "panda.png", "rabbit.png", "tiger.png", "zebra.png"
];

startGameBtn.addEventListener("click", () => {
  gridRows = parseInt(gridRowsInput.value);
  gridCols = parseInt(gridColsInput.value);
  const totalCards = gridRows * gridCols;

  // Validate input - must be even number of total cards
  if (
    gridRows >= 2 && gridRows <= 10 &&
    gridCols >= 2 && gridCols <= 10 &&
    totalCards % 2 === 0
  ) {
    welcomeContainer.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    initializeGame();
  } else {
    alert(
      "Invalid grid size! Ensure the total number of cards is even and values are between 2 and 10."
    );
  }
});

function initializeGame() {
  const totalCards = gridRows * gridCols;
  const uniquePairs = totalCards / 2;

  // Pick enough images for the pairs
  const selectedImages = [];
  for (let i = 0; i < uniquePairs; i++) {
    selectedImages.push(animalImages[i % animalImages.length]);
  }

  // Duplicate and shuffle
  const cardPairs = [...selectedImages, ...selectedImages];
  cards = shuffleArray(cardPairs);

  createGrid();
  resetGameInfo();
  startTimer();
}

// Fisher-Yates shuffle
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createGrid() {
  gameGrid.innerHTML = "";
  gameGrid.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;

  cards.forEach((image) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.symbol = image; // Using image filename for matching
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back"><img src="images/${image}" alt="Animal"></div>
      </div>
    `;
    card.addEventListener("click", handleCardClick);
    gameGrid.appendChild(card);
  });
}

function handleCardClick(e) {
  const clickedCard = e.currentTarget;

  // Ignore if card is already flipped/matched or if two cards are already chosen
  if (
    clickedCard.classList.contains("flipped") ||
    clickedCard.classList.contains("matched") ||
    flippedCards.length === 2
  ) {
    return;
  }

  flippedCards.push(clickedCard);
  clickedCard.classList.add("flipped");

  if (flippedCards.length === 2) {
    moves++;
    moveCounter.textContent = moves;
    checkForMatch();
  }
}

function checkForMatch() {
  const [card1, card2] = flippedCards;

  // Compare symbols (image filenames)
  if (card1.dataset.symbol === card2.dataset.symbol) {
    card1.classList.add("matched");
    card2.classList.add("matched");
    
    // Update the current player's score
    if (currentPlayer === 1) {
      playerScores[0]++;
      player1ScoreSpan.textContent = playerScores[0];
    } else {
      playerScores[1]++;
      player2ScoreSpan.textContent = playerScores[1];
    }

    flippedCards = [];

    // Check for win condition
    if (document.querySelectorAll(".card.matched").length === cards.length) {
      endGame();
    }
    // Optional rule: current player goes again if matched
    // If you want to alternate anyway, uncomment the line below
    // switchPlayer(); 
  } else {
    // Not a match: flip back the cards and switch player
    setTimeout(() => {
      card1.classList.remove("flipped");
      card2.classList.remove("flipped");
      flippedCards = [];
      switchPlayer();
    }, 1000);
  }
}

function switchPlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  currentPlayerDisplay.textContent = `Current Player: ${currentPlayer}`;
}

function startTimer() {
  timeElapsed = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeElapsed++;
    timer.textContent = formatTime(timeElapsed);
  }, 1000);
}

function formatTime(seconds) {
  return new Date(seconds * 1000).toISOString().substr(14, 5);
}

function resetGameInfo() {
  moves = 0;
  moveCounter.textContent = moves;
  clearInterval(timerInterval);
  timer.textContent = "00:00";

  // Reset scores and current player
  currentPlayer = 1;
  playerScores = [0, 0];
  player1ScoreSpan.textContent = "0";
  player2ScoreSpan.textContent = "0";
  currentPlayerDisplay.textContent = `Current Player: 1`;
}

function endGame() {
  clearInterval(timerInterval);

  const finalTime = formatTime(timeElapsed);
  const finalMoves = moves;
  const [p1Score, p2Score] = playerScores;

  let resultMessage = `Game complete in ${finalMoves} moves and ${finalTime}!\n\n`;
  resultMessage += `Player 1 score: ${p1Score}\n`;
  resultMessage += `Player 2 score: ${p2Score}\n`;

  if (p1Score > p2Score) {
    resultMessage += `Player 1 wins!`;
  } else if (p2Score > p1Score) {
    resultMessage += `Player 2 wins!`;
  } else {
    resultMessage += `It's a tie!`;
  }

  alert(resultMessage);
}

restartBtn.addEventListener("click", () => {
  gameContainer.classList.add("hidden");
  welcomeContainer.classList.remove("hidden");
  clearInterval(timerInterval);
  resetGameInfo();
});
