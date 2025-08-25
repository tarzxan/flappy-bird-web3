let web3;
let accounts;
let contract;
let isWalletConnected = false;
let pipesPassed = 0;

// ABI for FlappyBirdGameV2
const contractABI = [
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
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "reason",
				"type": "string"
			}
		],
		"name": "TransferFailed",
		"type": "event"
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
		"inputs": [],
		"name": "cooldownPeriod",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "lastPipePassTimestamp",
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
				"internalType": "uint256",
				"name": "pipeCount",
				"type": "uint256"
			}
		],
		"name": "passPipe",
		"outputs": [],
		"stateMutability": "nonpayable",
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
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newCooldown",
				"type": "uint256"
			}
		],
		"name": "setCooldownPeriod",
		"outputs": [],
		"stateMutability": "nonpayable",
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
	}
];

// Contract address for the new FlappyBirdGameV2
const contractAddress = "0x3cBc2d9f2cf1dD8BA52Fb7Cf5D1629aB629DD6D5";

let walletAddress = "Not connected";
let pendingRewards = 0;
let connectedAccount = null;

async function connectWallet() {
    try {
        if (typeof window.ethereum === "undefined") {
            alert("Please install or enable web 3 wallet extension!");
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
        pendingRewards = Number(web3.utils.fromWei(rewards, "ether"));
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

async function submitPipePasses() {
    if (!connectedAccount || pipesPassed === 0) return;

    try {
        console.log(`Submitting ${pipesPassed} pipes passed for player: ${connectedAccount}`);
        await contract.methods.passPipe(pipesPassed).send({ from: connectedAccount });
        console.log("Pipe passes submitted successfully");

        const rewards = await contract.methods.pendingRewards(connectedAccount).call();
        pendingRewards = Number(web3.utils.fromWei(rewards, "ether"));
        document.getElementById("pending-rewards").innerText = pendingRewards;
    } catch (error) {
        console.error("Error submitting pipe passes:", error);
        alert("Failed to submit pipe passes: " + error.message);
    }
}

function setupWalletInteractions() {
    const connectWalletBtn = document.getElementById("connect-wallet");
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener("click", connectWallet);
    } else {
        console.error("Connect wallet silly goose");
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
                alert(`Rewards claimed! You received ${pendingRewards} BirdDogTokens.`);
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

// Game logic
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

let birdWidth = 38;
let birdHeight = 28;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;
let backgroundImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

let pipeArray = [];
let pipeWidth = 50;
let pipeHeight = 508;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;
let jumpVelocity = -6;

let gameOver = false;
let score = 0;

// Frame rate control
const targetFPS = 60;
const frameTime = 1000 / targetFPS;
let lastTime = 0;

// Pipe spawning control
let lastPipeSpawnTime = 0;
const pipeSpawnInterval = 1500;

async function startGame() {
    console.log("Starting game");
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Load background image with error handling
    backgroundImg = new Image();
    backgroundImg.src = "./background.png";
    backgroundImg.onerror = function() {
        console.error("Background image failed to load, using fallback");
    };

    // Load bird image with error handling
    birdImg = new Image();
    birdImg.src = "./flappybirdm.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };
    birdImg.onerror = function() {
        console.error("Bird image failed to load, game may not render properly");
    };

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    pipesPassed = 0;
    lastTime = 0;
    lastPipeSpawnTime = 0;
    gameOver = false;
    score = 0;
    bird.y = birdY;
    velocityY = 0;

    // Add touch event listener for mobile
    board.addEventListener("touchstart", moveBirdTouch, { passive: false });

    document.removeEventListener("keydown", moveBird);
    document.addEventListener("keydown", moveBird);

    requestAnimationFrame(update);
}

async function update(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;

    if (deltaTime >= frameTime) {
        console.log("Update loop running");
        lastTime = timestamp - (deltaTime % frameTime);

        if (gameOver) {
            await submitPipePasses();
            return;
        }

        context.clearRect(0, 0, board.width, board.height);

        // Draw background only if image is loaded
        if (backgroundImg && backgroundImg.complete && backgroundImg.naturalHeight !== 0) {
            context.drawImage(backgroundImg, 0, 0, board.width, board.height);
        } else {
            context.fillStyle = "#87CEEB"; // Sky blue fallback
            context.fillRect(0, 0, board.width, board.height);
            console.log("Using fallback background due to image load failure");
        }

        // Draw bird only if image is loaded
        if (birdImg && birdImg.complete && birdImg.naturalHeight !== 0) {
            velocityY += gravity;
            bird.y = Math.max(bird.y + velocityY, 0);
            context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
        } else {
            console.log("Bird not rendered due to image load failure");
        }

        if (bird.y > board.height) {
            gameOver = true;
        }

        if (timestamp - lastPipeSpawnTime >= pipeSpawnInterval) {
            placePipes();
            lastPipeSpawnTime = timestamp;
        }

        for (let i = 0; i < pipeArray.length; i++) {
            let pipe = pipeArray[i];
            pipe.x += velocityX;
            if (topPipeImg && topPipeImg.complete && topPipeImg.naturalHeight !== 0) {
                context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
            }

            if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                score += 0.5;
                pipe.passed = true;
                if (pipe.img === topPipeImg) {
                    pipesPassed++;
                    console.log(`Pipe passed, total: ${pipesPassed}`);
                    pendingRewards = pipesPassed * 10;
                    document.getElementById("pending-rewards").innerText = pendingRewards;
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

function drawBackground() {
    if (backgroundImg && backgroundImg.complete && backgroundImg.naturalHeight !== 0) {
        context.drawImage(backgroundImg, 0, 0, board.width, board.height);
    } else {
        context.fillStyle = "#87CEEB"; // Sky blue fallback
        context.fillRect(0, 0, board.width, board.height);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

// Move bird with keyboard
function moveBird(e) {
    console.log("Key pressed:", e.code);

    if (!isWalletConnected) {
        alert("Please connect your wallet to play!");
        return;
    }

    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
        console.log("Jump triggered, setting velocityY to", jumpVelocity);
        velocityY = jumpVelocity;

        if (gameOver) {
            console.log("Game over, restarting game");
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            lastTime = 0;
            lastPipeSpawnTime = 0;
            startGame();
        }
    }
}

// Move bird with touch on mobile
function moveBirdTouch(e) {
    e.preventDefault(); // Prevent scrolling on touch
    console.log("Touch detected");

    if (!isWalletConnected) {
        alert("Please connect your wallet to play!");
        return;
    }

    console.log("Jump triggered, setting velocityY to", jumpVelocity);
    velocityY = jumpVelocity;

    if (gameOver) {
        console.log("Game over, restarting game");
        bird.y = birdY;
        pipeArray = [];
        score = 0;
        gameOver = false;
        lastTime = 0;
        lastPipeSpawnTime = 0;
        startGame();
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

window.onload = function () {
    console.log("Window loaded, setting up wallet interactions");
    setupWalletInteractions();
};
