

let hasBlackJack = false
let isAlive = true
let endOfGame = false

let message = ""
let sumPlayer = 0
let sumDealer = 0
let sumDealerPublic = 0
let cardArray = []
let cardArrayDealer = []

let startBtn = document.getElementById("start-btn")
startBtn.addEventListener("click", startGame)

let stopBtn = document.getElementById("stop-btn")
stopBtn.addEventListener("click", noAct)
let stopFlag = false


let messageEl = document.getElementById("message-el")
let cardPlayerEl = document.getElementById("card-player-el")
let sumPlayerEl = document.getElementById("sum-player-el")

let cardDealerEl = document.getElementById("card-dealer-el")
let sumDealerEl = document.getElementById("sum-dealer-el")


let cardContainer = document.querySelectorAll(".card-container")
let cardImgEl = document.querySelectorAll(".card-img-el")
let cardImgPlayerEl = document.querySelectorAll("#player .card-img-el")
let cardImgDealerEl = document.querySelectorAll("#dealer .card-img-el")

let chipsEl = document.getElementById("chips-el")
let betInputEl = document.getElementById("bet-input-el")
let betInputElValue = Number(betInputEl.value)

let deckArray = []
let chips = 50
chipsEl.textContent = "Owned chips: $" + chips


let smallBtns= document.querySelectorAll(".small-btn")
smallBtns.forEach( (elem) => {
    elem.addEventListener("click", function() {changePts(this)})
})

let resetBtn = document.getElementById("reset-btn")
resetBtn.addEventListener("click", resetChips)





// -------------------------------------- 1. Utility ----------------------------------------

// define Card Objects
function Card(suit, rank, value, link) {
    this.suit = suit // D, C, H, S
    this.rank = rank // 1 - 13
    this.value = value // 1 - 10
    this.link = link // ./image/_.png
}

// Based on the suitValue, determine whether its Diamond (D), Club (C), Heart (H) or Spade (S)
function findSuit(suitValue) {
    let suit = ""
    switch(suitValue) {
        case 0:
            suit = "D"
            break;
        case 1:
            suit = "C"
            break;
        case 2:
            suit = "H"
            break;
        case 3:
            suit = "S"
            break;
    }
    return suit
}

// function to run bet value by pressing buttons
function changePts(elem) {
    let sign = elem.textContent[0]
    let pts = Number(elem.textContent.slice(1))

    if (!betInputEl.hasAttribute("disabled")){
        if (sign === "+"){
            betInputElValue += pts
        } else {
            betInputElValue -= pts
        }
    }
    
    
    betInputEl.value = betInputElValue
}


// function to run to reveal dealer's hand
let tempReveal = function() {
    reveal()
}

function reveal(skipRender = false) {
    //endOfGame = true
    endOfGame = true

    // Draw 2nd Card
    let cardDrawn = getRandomCard()
    cardArrayDealer.push(cardDrawn)
    sumDealer = checkSum(cardArrayDealer)

    // Decide whether to draw third card
    if (sumDealer < 17 && isAlive) {
        let cardDrawn = getRandomCard()
        cardArrayDealer.push(cardDrawn)
        sumDealer = checkSum(cardArrayDealer)
    }

    cardDealerEl.textContent = "Dealer's Cards: " + displayCardText(cardArrayDealer)
    sumDealerEl.textContent = "Sum: " + sumDealer

    // This is for the edge case when 21 is scored but not blackjack
    if (!(skipRender)) {
        renderGame()
    }
}

// function to run when try to reveal dealer's card without starting the game
function noAct() {
    messageEl.innerText = "Please start the game first."
}


// compute sum with the consideration that ace can be 1 or 11 (either to maximize the sum)
function checkSum(cardArray) {
    let sum = 0

    function simpleSum() {
        sum = 0
        for (let card of cardArray){
            sum += card.value
        } 
    }


    // Do normal sum first
    simpleSum()
    
    // Set ace value to 1 if it exceeds 21
    if (sum>21) { 
        for(let i=0; i<cardArray.length; i++) {

            if (cardArray[i].rank === 1 && cardArray[i].value === 11) {
                cardArray[i].value = 1
                simpleSum()
                if (sum<21) {
                    break
                }
            }
        }
    }
    
    return sum
}

// Draw a new card
function getRandomCard() {

    //Create a random index
    let randomCardIdx = Math.floor( (Math.random() * deckArray.length) )

    // Find the value of that card
    let randomCardValue = deckArray[randomCardIdx]

    // Remove that card from the deckArray
    // Based on the card index, remove it from the deckArray
    deckArray.splice(randomCardIdx,1)


    // Create the logic to find the card identity based on its value
    // Card Suit
    let cardSuitValue = Math.floor( (randomCardValue-1) / 13)
    let cardSuit = findSuit(cardSuitValue)
    
    // Card Rank
    let cardRank = randomCardValue % 13
    if (cardRank === 0 ) {
        cardRank = 13
    }

    // Card Value
    cardValue = cardRank
    if (cardValue > 10) {
        cardValue = 10
    } else if ( cardValue === 1) {
        cardValue = 11
    }

    // Find the Card Images
    let cardImageLink = "./images/" + cardSuit + cardRank +".png"

    let cardDrawn = new Card(cardSuit, cardRank, cardValue, cardImageLink)

    return cardDrawn
}


// 2. -------------------------------------- Main Game Flow ----------------------------------------

// function to run when the start game button is pressed
function startGame() {
    betInputElValue = Number(betInputEl.value)
    // Check if there is a valid bet
    if (betInputElValue <= 0 || betInputElValue > chips || !(Number.isInteger(betInputElValue))) {
        message = "Invalid Bet!"
        messageEl.innerText = message
    } else {
        reset()

        //Update Chips
        chips -= betInputElValue
        chipsEl.textContent = "Owned chips: $" + chips

        //Draw initial cards for player and dealer
        for (let i=0;i<2;i++){

            // Deal card to player
            cardDrawn = getRandomCard()
            cardArray.push(cardDrawn)

            if (i===1) {
                break
            } // Only draw 2 player card and 1 dealer card
            
            // Deal card to dealer
            cardDrawn = getRandomCard()
            cardArrayDealer.push(cardDrawn)

        }

        sumPlayer = checkSum(cardArray)
        sumDealer = checkSum(cardArrayDealer)

        cardPlayerEl.textContent = "Player's Cards: " + displayCardText(cardArray)
        cardDealerEl.textContent = "Dealer's Cards: " + displayCardText(cardArrayDealer)
        sumPlayerEl.textContent = "Sum: " + sumPlayer
        sumDealerEl.textContent = "Sum: " + sumDealer

        renderGame()

    }
}

// Update game state and check result
function renderGame() {

    let reward = 0

    if (sumPlayer < 21) {
        message = "Do you want to draw a new card?"
    } else if (sumPlayer === 21) { 
        endOfGame = true

        if (cardArray.length === 2) {
            message = "You score a blackjack!"
            hasBlackJack = true
        } else {
            let skipRender = true
            reveal(skipRender)
        }
    } else {
        message = "You are out of the game!"
        isAlive = false
        endOfGame = true
    }

    if (endOfGame) {

        // Check rewards
        if (hasBlackJack) {
            reward = Math.floor(1.5 * betInputElValue)
        } else if (isAlive) {
            if (sumDealer > 21) {
                reward = 2 * betInputElValue
            } else if (sumPlayer > sumDealer) {
                reward = 2 * betInputElValue
            } else if (sumPlayer === sumDealer) {
                reward = betInputElValue
            }
        } 
        
        if (reward > betInputElValue) {
            let earn = reward - betInputElValue
            message = "YOU WIN! REWARDS: $" + earn
        } else if (reward === betInputElValue) {
            message = "EARN BACK THE INITIAL BET."
        }
        else {
            message = "YOU LOST! LOSS: $" + betInputElValue
        }

        // Update Rewards
        chips += reward
        chipsEl.textContent = "Owned chips: $" + chips

        // Reset Game State for another game start again

        // Put startBtn back to enable starting again
        startBtn.removeEventListener("click", newCard)
        startBtn.addEventListener("click", startGame)
        startBtn.textContent = "START GAME"

        //Disable the stopBtn
        stopBtn.removeEventListener("click", tempReveal)
        stopBtn.addEventListener("click", noAct)
        stopFlag = false

        //Allowing bet again
        betInputEl.removeAttribute("disabled")
    }

    displayCard()
    messageEl.textContent = message
    

}

// function to run when drawing new card
function newCard() {
    if (cardArray.length === 0) {
        startGame()
    } else if ((!hasBlackJack) && isAlive) {
        let cardDrawn = getRandomCard()
        cardArray.push(cardDrawn)
        sumPlayer = checkSum(cardArray)

        cardPlayerEl.textContent = "Player's Cards: " + displayCardText(cardArray)
        sumPlayerEl.textContent = "Sum: " + sumPlayer

        renderGame()
    }

}

// function to run when a round ends to prepare for next round
function reset() {
    cardArray = []
    cardArrayDealer = []
    deckArray = []

    // Re-create the deck to be drawn
    for (i=1; i<53 ; i++) {
        deckArray.push(i)
    }

    hasBlackJack = false
    isAlive = true
    endOfGame = false

    // Adjust Card Row's height
    cardContainer.forEach( (elem) => {elem.style.height = "200px"} )

    // Clear Card Display
    clearDisplay()

    // Remove Start Game button as a clickable option
    startBtn.removeEventListener("click", startGame)
    startBtn.addEventListener("click", newCard)
    startBtn.textContent = "NEW CARD"

    // Enable Stop & Reveal
    stopBtn.removeEventListener("click", noAct)
    stopBtn.addEventListener("click", tempReveal)
    stopFlag = true

    // Stop Allowing editing the bet
    betInputEl.setAttribute("disabled", "")
}


// function to run when reset game button is pressed
function resetChips() {
    if (chips <= 0) {        
        hardReset()
    } else {
        message = "You still have chips."
        messageEl.textContent = message
    }
}

// function to run when reset game button is pressed and chip is less than or equal to 0
function hardReset() {
    cardArray = []
    cardArrayDealer = []
    deckArray = []

    // Re-create the deck to be drawn
    for (i=1; i<53 ; i++) {
        deckArray.push(i)
    }

    hasBlackJack = false
    isAlive = true
    endOfGame = false

    // Clear Card Display
    clearDisplay()

    // Adjust Card Row's height
    cardContainer.forEach( (elem) => {elem.style.height = "0px"} )

    // Reimplement START GAME button instead of NEW CARD
    if (startBtn.textContent === "NEW CARD"){
        startBtn.removeEventListener("click", newCard)
        startBtn.addEventListener("click", startGame)
        startBtn.textContent = "START GAME"
    } 

    // Disable Stop & Reveal
    if (stopFlag) {
        stopBtn.removeEventListener("click", tempReveal)
        stopBtn.addEventListener("click", noAct)
        stopFlag = false
    }
    

    // Allowing bet editing again
    if (betInputEl.hasAttribute("disabled")) {
        betInputEl.removeAttribute("disabled")
    }

    // Update text
    cardPlayerEl.textContent = "Player's Cards: " + displayCardText(cardArray)
    cardDealerEl.textContent = "Dealer's Cards: " + displayCardText(cardArrayDealer)
    sumPlayerEl.textContent = "Sum: " 
    sumDealerEl.textContent = "Sum: " 
    message = "Want to play a round?"
    messageEl.textContent = message
    betInputElValue = 0
    betInputEl.value = 0
    chips = 50
    chipsEl.textContent = "Owned chips: $" + chips

}


// 3. -------------------------------------- Display-Relevant ----------------------------------------

// function to update text
function displayCardText(cardArray) {

    let displayText = ""

    for (let card of cardArray) {
        displayText += card.suit + card.rank + " "
    }

    return displayText
}


// function to show card
function displayCard() {
    cardImgPlayerEl.forEach( function(elem, idx, arr) {
        if (cardArray[idx]) {
            elem.src = cardArray[idx].link
        }    
    })

    cardImgDealerEl.forEach ( function(elem, idx, arr) {
        if (cardArrayDealer[idx]) {
            elem.src = cardArrayDealer[idx].link
        }
    })

    // If there isnt a second card yet in cardArrayDealer
    if (cardArrayDealer.length === 1) {
        dealerCard2 = document.getElementById("card-2-dealer")
        dealerCard2.src = "./images/back.png"
    }
}


// function to clear card
function clearDisplay() {
    cardImgEl.forEach( function(elem, idx, arr) {
        elem.src = ""
    })
}
