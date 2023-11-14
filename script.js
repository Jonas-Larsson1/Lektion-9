const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const timerElement = document.getElementById('timer')
const scoreElement = document.getElementById('score')
const highScoresElement = document.getElementById('high-scores')

canvas.width = 512
canvas.height = 512

let score
let lastTick
let spawnTimer = 0
// let elapsedTime
let timeLimit
let mousePosX
let player = {
    width: 70,
    height: 50,
    x: canvas.width / 2,
    y: canvas.height - 50,
    velX: 0,
    color: "brown",
}

let apples = [];


function Apple() {
    this.color = "red";
    this.x = Math.random() * canvas.width;
    this.y = 0;
    this.radius = 10;
    this.width = 10;
    this.height = 10;
    // this.speed = Math.random() * 2 + 1; 
    const minSpeed = 0.1
    const maxSpeed = 0.3
    this.speed = Math.random() * (maxSpeed - minSpeed) + minSpeed; 
}

function drawApple(apple){
    ctx.beginPath();
    ctx.arc(apple.x, apple.y, apple.radius, 0, Math.PI * 2);
    ctx.fillStyle = apple.color;
    ctx.fill();
    ctx.closePath();
}

// function updateApples(){
//     for (let i = 0; i < apples.length; i++) {
//         let apple = apples[i];
//         // apple.y += apple.speed;
//     }
// }

const spawnApple = () => {
    apples.push(new Apple())
}

function drawApples(){
    // if (Math.random() < 0.01 && apples.length < 3  ) {
    //     apples.push(new Apple());
    // }

    // updateApples();
    for (let i = 0; i < apples.length; i++) {
        drawApple(apples[i]);
    }
   
}   


// drawApples();

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height)
}

const movePlayer = () => {

    const lerp = (a, b, t) => (1 - t) * a + t * b
    const targetVelX = (mousePosX - player.x) * 0.01
    
    const maxVelX = 0.25
    player.velX = lerp(player.velX, targetVelX, 0.1)
    player.velX = Math.max(-maxVelX, Math.min(maxVelX, player.velX))
    
    const threshold = 0.5

    if (Math.abs(mousePosX - player.x) <= threshold) {
        player.velX = 0;
    }

    if (player.x < 0) {
        player.x = 0
        player.velX = 0
    } else if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width
        player.velX = 0
    }
}


const startButton = document.getElementById('start')
startButton.addEventListener('click', () => {
  startGame()
})

document.addEventListener('mousemove', (event) => {
    mousePosX = (event.clientX - canvas.getBoundingClientRect().left) - (player.width / 2)
})

const startGame = () => {
    player.x = canvas.width / 2
    score = 0
    apples = []
    startButton.innerText = 'Restart?'
    timeLimit = 30.0
    // elapsedTime = 0
    lastTick = Date.now()
    requestAnimationFrame(tick)
}

const checkCollision = (item1, item2) => {
    if (
        item1.x < item2.x + item2.width &&
        item1.x + item1.width > item2.x &&
        item1.y < item2.y + item2.height &&
        item1.y + item1.height > item2.y
      ) {
        return true;
      } else {
        return false;
      }
}

const gameOver = () => {
    startButton.innerText = 'Start'
    scoreElement.innerText = `Final score: ${score}`
    timerElement.innerText = `Time's up!`

    const playerName = prompt('Enter name').toUpperCase()

    if (playerName) {
        localStorage.setItem(`playerName_${playerName}`, score)
        getAndDisplayScores()
    }
}

const clearButton = document.getElementById('clear')
let confirmation = false

clearButton.addEventListener('click', event => {
    if (confirmation) {
        const allKeys = Object.keys(localStorage)
        const allPlayerKeys = []
        
        allKeys.forEach(key => {
            if (key.includes('playerName_')) {
                allPlayerKeys.push(key)
            }
        })
        
        allPlayerKeys.forEach(playerKey => {
            localStorage.removeItem(playerKey)
        })

        getAndDisplayScores()
        
        clearButton.innerText = 'Clear scores'
        confirmation = false
    } else {
        clearButton.innerText = 'Are you sure?'
        confirmation = true
    }
})

const getAndDisplayScores = () => {
    highScoresElement.innerHTML = ''

    const allKeys = Object.keys(localStorage)
    const allPlayerKeys = []

    allKeys.forEach(key => {
        if (key.includes('playerName_')) {
            allPlayerKeys.push(key)
        }
    })

    const playerScores = allPlayerKeys.map(playerKey => {
        const playerName = playerKey.replace('playerName_', '')
        const playerScore = parseInt(localStorage.getItem(playerKey))
        return { playerName, playerScore }
    }) 

    playerScores.sort((a,b) => b.playerScore - a.playerScore)

    playerScores.forEach(element => {
        const row = document.createElement('tr')
        const playerCell = document.createElement('td')
        const scoreCell = document.createElement('td')
        // scoreCell.classList.add('score-cell')
        playerCell.innerText = element.playerName 
        scoreCell.innerText = element.playerScore

        row.append(playerCell,scoreCell)

        highScoresElement.append(row)
        // let scoreElement = document.createElement('li')
        // scoreElement.innerText = `Player: '${playerName}' Score: ${playerScore}`
        // highScoresElement.append(scoreElement)
    })
}

const tick = () => {
    if (timeLimit > 0.0) {
        let currentTick = Date.now()
        const deltaTime = (currentTick - lastTick)
        lastTick = currentTick
        spawnTimer += deltaTime
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        timeLimit -= (deltaTime / 1000)
        timerElement.innerText = timeLimit.toFixed(1)
        scoreElement.innerText = `Score: ${score}`
        
        player.x += player.velX * deltaTime

        apples.forEach((apple, index) => {
            apple.y += apple.speed * deltaTime

            if (checkCollision(apple, player)) {
                apples.splice(index, 1)
                score += 1
            } else if (apple.y > canvas.height) {
                score -= 1
                apples.splice(index, 1)
            }
            
        })
        
        if (spawnTimer > 1000) {
            spawnApple()
            spawnTimer = 0
        } 

        movePlayer()
        drawPlayer()
        drawApples()
   
        requestAnimationFrame(tick)
    } else {
        gameOver()
    }
}


getAndDisplayScores()