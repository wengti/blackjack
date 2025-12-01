

let hasBlackJack = false
let isAlive = true
let isStop = false
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


let messageEl = document.getElementById("message-el")
let cardPlayerEl = document.getElementById("card-player-el")
let sumPlayerEl = document.getElementById("sum-player-el")

let cardDealerEl = document.getElementById("card-dealer-el")
let sumDealerEl = document.getElementById("sum-dealer-el")


let cardContainer = document.querySelectorAll(".card-container")
let cardImgEl = document.querySelectorAll(".card-img-el")
let cardImgPlayerEl = document.querySelectorAll("#player .card-img-el")
let cardImgDealerEl = document.querySelectorAll("#dealer .card-img-el")

let chispEl = document.getElementById("chips-el")
let betInputEl = document.getElementById("bet-input-el")
let betInputElValue = Number(betInputEl.value)

let deckArray = []
let chips = 50
chispEl.textContent = "Remaining chips: $" + chips

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


function Card(suit, rank, value, link, isVisible=true) {
    this.suit = suit // D, C, H, S
    this.rank = rank // 1 - 13
    this.value = value // 1 - 10
    this.link = link // ./image/_.png
    this.isVisible = isVisible
}

function noAct() {
    messageEl.innerText = "Please start the game first."
}

function reveal() {
    //endOfGame = true
    endOfGame = true

    // Reveal the second card
    cardArrayDealer.at(-1).isVisible = true

    // Reevaluate the sum now with all the cards visible
    sumDealer = checkSum(cardArrayDealer)

    if (sumDealer < 17 && isAlive) {
        let cardDrawn = getRandomCard()
        cardArrayDealer.push(cardDrawn)
        sumDealer = checkSum(cardArrayDealer)
    }

    cardDealerEl.textContent = "Dealer's Cards: " + displayCardText(cardArrayDealer)
    sumDealerEl.textContent = "Sum: " + sumDealer

    renderGame()
}


// Draw a new card
function getRandomCard(isCardVisible = true) {

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

    let cardDrawn = new Card(cardSuit, cardRank, cardValue, cardImageLink, isCardVisible)

    return cardDrawn
}

function startGame() {
    betInputElValue = Number(betInputEl.value)
    // Check if there is a valid bet
    if (betInputElValue <= 0 || betInputElValue > chips) {
        message = "Invalid Bet!"
        messageEl.innerText = message
    } else {
        reset()

        //Update Chips
        chips -= betInputElValue
        chispEl.textContent = "Remaining chips: $" + chips

        //Draw initial cards for player and dealer
        for (let i=0;i<2;i++){
            let isCardVisible = true

            // Deal card to player
            cardDrawn = getRandomCard()
            cardArray.push(cardDrawn)
            
            // Second card of dealer should not be visible
            if (i === 1){
                isCardVisible = false
            }
            
            // Deal card to dealer
            cardDrawn = getRandomCard(isCardVisible)
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


function renderGame() {

    let reward = 0

    if (sumPlayer < 21) {
        message = "Do you want to draw a new card?"
    } else if (sumPlayer === 21) { 
        endOfGame = true

        if (cardArray.length === 2) {
            message = "You score a blackjack!"
            hasBlackJack = true
        }
        
        
    } else {
        message = "You are out of the game!"
        isAlive = false
        endOfGame = true
    }




    if (endOfGame) {

        // Check rewards
        if (hasBlackJack) {
            reward = 1.5 * betInputElValue
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
            message = "TIED! EARN THE INITIAL BET."
        }
        else {
            message = "YOU LOST! LOSS: $" + betInputElValue
        }

        // Update Rewards
        chips += reward
        chispEl.textContent = "Remaining chips: $" + chips

        // Reset Game State for another game start again

        // Put startBtn back to enable starting again
        startBtn.removeEventListener("click", newCard)
        startBtn.addEventListener("click", startGame)
        startBtn.textContent = "START GAME"

        //Disable the stopBtn
        stopBtn.removeEventListener("click", reveal)
        stopBtn.addEventListener("click", noAct)

        //Allowing bet again
        betInputEl.removeAttribute("disabled")
    }

    displayCard()
    messageEl.textContent = message
    

}


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
    isStop = false
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
    stopBtn.addEventListener("click", reveal)

    // Stop Allowing editing the bet
    betInputEl.setAttribute("disabled", "")
}

function checkSum(cardArray) {

    let sum = 0

    function simpleSum() {
        sum = 0
        for (let card of cardArray){
            if (card.isVisible) {
                sum += card.value
            }
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


function getSumDealerPublic() {
    let res = cardArrayDealer[0].value
    if (res === 1) {
        res = 11
    }
    return res
}



function displayCardText(cardArray) {

    let displayText = ""

    for (let card of cardArray) {
        if (card.isVisible) {
            displayText += card.suit + card.rank + " "
        }   
    }

    return displayText
}

function displayCard() {
    cardImgPlayerEl.forEach( function(elem, idx, arr) {
        if (cardArray[idx]) {
            elem.src = cardArray[idx].link
        }    
    })

    cardImgDealerEl.forEach ( function(elem, idx, arr) {
        if (cardArrayDealer[idx]) {
            if (!(cardArrayDealer[idx].isVisible)) {
                elem.src = "./images/back.png"
            } else {
                elem.src = cardArrayDealer[idx].link
            }
            
        }
    })
}

function clearDisplay() {
    cardImgEl.forEach( function(elem, idx, arr) {
        elem.src = ""
    })
}
