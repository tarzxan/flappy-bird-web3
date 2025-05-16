let sdk, contract;

function initThirdweb() {
    if (typeof Thirdweb === "undefined") {
        console.error("Thirdweb SDK not loaded");
        alert("Failed to load Thirdweb SDK. Please refresh the page.");
        return;
    }

    // Thirdweb Setup
    sdk = new ThirdwebSDK("base", {
        clientId: "7952e5b4a6378916d38711001f30c8c8" // Replace with your Thirdweb client ID
    });
    contract = sdk.getContract("0xcDCe80fEF5647D474efB39E9E43D209bd19c776f");

    setupWalletInteractions();
}

let walletAddress = "Not connected";
let pendingRewards = 0;
let connectedAccount = null;

function setupWalletInteractions() {
    async function connectWallet() {
        try {
            const wallet = await sdk.wallet.connect("coinbase");
            connectedAccount = wallet;
            walletAddress = `Connected: ${connectedAccount.slice(0, 6)}...`;
            document.getElementById("wallet-address").innerText = walletAddress;

            const rewards = await contract.call("pendingRewards", [connectedAccount]);
            pendingRewards = ethers.utils.formatEther(rewards);
            document.getElementById("pending-rewards").innerText = pendingRewards;
        } catch (error) {
            console.error("Wallet connection failed:", error);
            alert("Failed to connect wallet: " + error.message);
        }
    }

    const connectWalletBtn = document.getElementById("connect-wallet");
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener("click", connectWallet);
    } else {
        console.error("Connect wallet button not found");
    }

    const claimRewardsBtn = document.getElementById("claim-rewards");
    if (claimRewardsBtn) {
        claimRewardsBtn.addEventListener("click", async () => {
            if (!connectedAccount) {
                alert("Please connect wallet first!");
                return;
            }
            try {
                await contract.call("claimRewards");
                alert("Rewards claimed!");
                pendingRewards = 0;
                document.getElementById("pending-rewards").innerText = pendingRewards;
            } catch (error) {
                console.error("Error claiming rewards:", error);
                alert("Failed to claim rewards: " + error.message);
            }
        });
    } else {
        console.error("Claim rewards button not found");
    }
}

// Board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// Bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

// Pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// Physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;

window.onload = function() {
    console.log("Window loaded, initializing game");
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
    document.addEventListener("keydown", moveBird);
}

function update() {
    console.log("Update loop running");
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
            if (connectedAccount && pipe.img === topPipeImg && contract) {
                contract.call("passPipe", [connectedAccount]).then(() => {
                    contract.call("pendingRewards", [connectedAccount]).then(rewards => {
                        pendingRewards = ethers.utils.formatEther(rewards);
                        document.getElementById("pending-rewards").innerText = pendingRewards;
                    });
                }).catch(error => {
                    console.error("Error calling passPipe:", error);
                });
            }
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        velocityY = -6;

        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}