window.onload = () => {
  const videoElement = document.getElementsByClassName("input_video")[0];
  const canvasElement = document.getElementsByClassName("output_canvas")[0];
  const canvasCtx = canvasElement.getContext("2d");
  const predictButton = document.getElementById("predictButton");
  const predictionResult = document.getElementById("predictionResult");

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
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  hands.onResults(onResults);

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
      // Perform prediction if hand landmarks are available
      if (combinedHandLandmarksArray.length > 0) {
        nn.classify(combinedHandLandmarksArray, (error, results) => {
          if (error) {
            console.error('Error during classification:', error);
            return;
          }
          // Update prediction result in the HTML
          if (results && results.length > 0) {
            predictionResult.innerText = `Prediction: ${results[0].label} with confidence ${results[0].confidence.toFixed(2)}`;
          } else {
            predictionResult.innerText = 'No prediction available!';
          }
        });
      } else {
        predictionResult.innerText = 'No hand detected!';
      }
    },
    width: 1280,
    height: 720,
  });

  camera.start();
  
  // Loading the trained model
  nn = ml5.neuralNetwork({ task: 'classification' }, () => {});

  nn.load('model.json', () => {
    console.log('Model is loaded');
  });
};
