window.onload = () => {
  const videoElement = document.getElementsByClassName("input_video")[0];
  const canvasElement = document.getElementsByClassName("output_canvas")[0];
  const canvasCtx = canvasElement.getContext("2d");
  const playButton = document.getElementById("playButton");
  const predictionResult = document.getElementById("predictionResult");
  const randomOutput = document.getElementById("randomOutput")
  const gameResult = document.getElementById("gameResults");

  let combinedHandLandmarksArray = [];
  let nn;

  function onResults(results) {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      combinedHandLandmarksArray = [];
      for (const landmarks of results.multiHandLandmarks) {
        for (const landmark of landmarks) {
          combinedHandLandmarksArray.push(landmark.x);
          combinedHandLandmarksArray.push(landmark.y);
        }
      }
    }
  }

  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.5,
  });

  hands.onResults(onResults);

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
      // Perform prediction if hand landmarks are available
      if (combinedHandLandmarksArray.length > 0) {
        nn.classify(combinedHandLandmarksArray, (error, results) => {
          if (results && results.length > 0) {
            const predictedLabel = results[0].label;
            checkGameResult(predictedLabel);
          }
        });
      }
    },
    width: 1280,
    height: 720,
  });


  // Laad het getrainde model
  nn = ml5.neuralNetwork({ task: 'classification' }, () => { });

  nn.load('model.json', () => {
    console.log('Model is loaded');
  });

  playButton.addEventListener('click', () => {
    camera.start();
    addRandomGame();
    gameResult.innerHTML = ""
    playButton.style.display = "none"
  });
  // Functie om willekeurige HTML-tekst toe te voegen
  function addRandomGame() {
    const choices = ['rock', 'paper', 'scissors'];
    const randomRPS = choices[Math.floor(Math.random() * choices.length)];
    randomOutput.innerText = `${randomRPS}`;
    gameResult.displaynone
  }

  function checkGameResult(predictedLabel) {
    const randomRPS = randomOutput.innerText; // Corrected the variable name
    if (predictedLabel === randomRPS) {
      gameResult.innerHTML = "Its a tie";
      playButton.style.display = "block"
      playButton.innerHTML = "PLAY AGAIN"
    } else if (
      (predictedLabel === "scissors" && randomRPS === "rock") ||
      (predictedLabel === "rock" && randomRPS === "paper") ||
      (predictedLabel === "paper" && randomRPS === "scissors")
    ) {
      gameResult.innerHTML = "You Lost :(";
      playButton.style.display = "block"
      playButton.innerHTML = "PLAY AGAIN"
    } else {
      gameResult.innerHTML = "You Won!";
      playButton.style.display = "block"
      playButton.innerHTML = "PLAY AGAIN"

    }
  }


};
