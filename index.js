const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");

const rockButton = document.getElementById("rock");
const paperButton = document.getElementById("paper");
const scissorButton = document.getElementById("scissor");
const saveButton = document.getElementById("save");

let combinedHandLandmarksArray = [];
let capturedPoses = [];

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
    );

    if (
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0
    ) {
        combinedHandLandmarksArray = [];
        for (const landmarks of results.multiHandLandmarks) {
            for (const landmark of landmarks) {
                combinedHandLandmarksArray.push(landmark.x);
                combinedHandLandmarksArray.push(landmark.y);
            }
        }
        // console.log(combinedHandLandmarksArray);
    }
    canvasCtx.restore();
}

const hands = new Hands({
    locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
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
    },
    width: 1280,
    height: 720,
});

camera.start();

function capturePose(label) {
    const data = {
        label: label,
        landmarks: combinedHandLandmarksArray.slice(),
    };

    capturedPoses.push(data);
    console.log(`Captured pose for ${label}:`, data);
}

function savePoses() {
    const jsonData = JSON.stringify(capturedPoses, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "captured_poses.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

rockButton.onclick = () => capturePose("rock");
paperButton.onclick = () => capturePose("paper");
scissorButton.onclick = () => capturePose("scissors");
saveButton.onclick = savePoses;