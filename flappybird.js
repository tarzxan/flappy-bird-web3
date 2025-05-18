let web3;
let accounts;
let contract;
let isWalletConnected = false;
let pipesPassed = 0;

// Contract ABI
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "rewardType",
                "type": "uint256"
            }
        ],
        "name": "addCustomReward",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "claimRewards",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "depositTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tetraTokenAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "player",
                "type": "address"
            }
        ],
        "name": "passPipe",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "reward",
                "type": "uint256"
            }
        ],
        "name": "PipePassed",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "RewardClaimed",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPiggyBankBalance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "pendingRewards",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "playerScores",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "REWARD_PER_PIPE",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "tetraToken",
        "outputs": [
            {
                "internalType": "contract IERC20",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Contract address on Base mainnet
const contractAddress = "0xcDCe80fEF5647D474efB39E9E43D209bd19c776f";

let walletAddress = "Not connected";
let pendingRewards = 0;
let connectedAccount = null;

async function connectWallet() {
    try {
        if (typeof window.ethereum === "undefined") {
            alert("Please install MetaMask or another Web3 wallet!");
            return;
        }

        console.log("Attempting to connect wallet...");
        web3 = new Web3(window.ethereum);

        accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        connectedAccount = accounts[0];
        console.log("Wallet connected:", connectedAccount);

        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x2105" }],
        });

        walletAddress = `Connected: ${connectedAccount.slice(0, 6)}...`;
        document.getElementById("wallet-address").innerText = walletAddress;

        contract = new web3.eth.Contract(contractABI, contractAddress);

        console.log("Fetching pending rewards for:", connectedAccount);
        const rewards = await contract.methods.pendingRewards(connectedAccount).call();
        pendingRewards = web3.utils.fromWei(rewards, "ether");
        document.getElementById("pending-rewards").innerText = pendingRewards;

        isWalletConnected = true;
        document.getElementById("wallet-prompt").style.display = "none";
        document.getElementById("game-container").style.display = "block";

        startGame();
    } catch (error) {
        console.error("Wallet connection failed:", error);
        alert("Failed to connect wallet: " + error.message);
    }
}

async function submitPipesPassed() {
    if (!connectedAccount || pipesPassed === 0) return;

    try {
        console.log(`Submitting ${pipesPassed} pipes passed for player: ${connectedAccount}`);
        for (let i = 0; i < pipesPassed; i++) {
            await contract.methods.passPipe(connectedAccount).send({ from: connectedAccount });
            console.log(`passPipe ${i + 1}/${pipesPassed} submitted`);
        }
        const rewards = await contract.methods.pendingRewards(connectedAccount).call();
        pendingRewards = web3.utils.fromWei(rewards, "ether");
        document.getElementById("pending-rewards").innerText = pendingRewards;
        console.log("All pipes passed submitted, updated rewards:", pendingRewards);
    } catch (error) {
        console.error("Error submitting pipes passed:", error);
        alert("Failed to submit pipes passed: " + error.message);
    }
}

function setupWalletInteractions() {
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
                console.log("Claiming rewards...");
                await contract.methods.claimRewards().send({ from: connectedAccount });
                console.log("Rewards claimed!");
                alert("Rewards claimed!");
                pendingRewards = 0;
                pipesPassed = 0;
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

// Game logic with frame rate control
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

let birdWidth = 34;
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

let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// Adjusted physics for slower gameplay
let velocityX = -1.5; // Slower pipe movement (was -2)
let velocityY = 0;
let gravity = 0.3; // Reduced gravity for slower fall (was 0.4)
let jumpVelocity = -5; // Slightly reduced jump height (was -6)

let gameOver = false;
let score = 0;

// Frame rate control
const targetFPS = 60;
const frameTime = 1000 / targetFPS;
let lastTime = 0;

async function startGame() {
    console.log("Starting game");
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

    pipesPassed = 0;
    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
    document.addEventListener("keydown", moveBird);
}

async function update(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;

    // Only update if enough time has passed for the target FPS
    if (deltaTime >= frameTime) {
        console.log("Update loop running");
        lastTime = timestamp - (deltaTime % frameTime);

        if (gameOver) {
            await submitPipesPassed();
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
                if (pipe.img === topPipeImg) {
                    pipesPassed++;
                    console.log(`Pipe passed, total: ${pipesPassed}`);
                    contract.methods.REWARD_PER_PIPE().call()
                        .then(rewardPerPipe => {
                            const reward = web3.utils.fromWei(rewardPerPipe, "ether");
                            pendingRewards = Number(pendingRewards) + Number(reward);
                            document.getElementById("pending-rewards").innerText = pendingRewards.toFixed(2);
                        })
                        .catch(error => {
                            console.error("Error fetching REWARD_PER_PIPE:", error);
                            pendingRewards += 1;
                            document.getElementById("pending-rewards").innerText = pendingRewards.toFixed(2);
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

    requestAnimationFrame(update);
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
    if (!isWalletConnected) {
        alert("Please connect your wallet to play!");
        return;
    }

    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        velocityY = jumpVelocity;

        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            lastTime = 0; // Reset frame timing
            startGame();
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

window.onload = function() {
    console.log("Window loaded, setting up wallet interactions");
    setupWalletInteractions();
};