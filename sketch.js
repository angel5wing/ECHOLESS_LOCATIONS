// motion detection and audio playback variables
let cameraFeed, preFrame;
let threshold = 650;
let scaler = 10;
let leftMotionDetected = false;
let rightMotionDetected = false;
let readyToDetect = false;

// sound file storage
let firstTransmission, secondTransmission;

// tracks audio playback
let audioStarted = false;

function preload() {
    firstTransmission = loadSound('firstTransmission.wav');
    secondTransmission = loadSound('secondTransmission.wav');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    let button = createButton('Start');
    button.position(20, height);
    button.mousePressed(startAudio); // prevents AudioContext errors from generating
    cameraFeed = createCapture(VIDEO);
    cameraFeed.size(width, height);
    cameraFeed.hide();
    preFrame = createImage(cameraFeed.width, cameraFeed.height);
}

function draw() {
    if (!readyToDetect) {
        return;
    }
    background(220);
    image(cameraFeed, 0, 0);
    detectMotion();
    preFrame.copy(cameraFeed, 0, 0, cameraFeed.width, cameraFeed.height, 0, 0, cameraFeed.width, cameraFeed.height);
}

function detectMotion() {
    background(220);
    image(cameraFeed, 0, 0);
    cameraFeed.loadPixels();
    preFrame.loadPixels();

    for (let x = 0; x < width; x += scaler) {
        for (let y = 0; y < height; y += scaler) {
            let index = (x + y * width) * 4;

            // extracts RGB values from current and previous frames
            let r = cameraFeed.pixels[index];
            let g = cameraFeed.pixels[index + 1];
            let b = cameraFeed.pixels[index + 2];

            let pr = preFrame.pixels[index];
            let pg = preFrame.pixels[index + 1];
            let pb = preFrame.pixels[index + 2];

            // calculates the difference
            let rDiff = r > pr ? r - pr : pr - r;
            let gDiff = g > pg ? g - pg : pg - g;
            let bDiff = b > pb ? b - pb : pb - b;

            let diff = rDiff + gDiff + bDiff;

            if (diff > threshold) {
                fill(255, 0, 0);
                handleMotion(x);
            } else {
                fill(0);
            }
            ellipse(x, y, scaler);
        }
    }
    preFrame.copy(cameraFeed, 0, 0, cameraFeed.width, cameraFeed.height, 0, 0, cameraFeed.width, cameraFeed.height);
}

function handleMotion(x) {
    let leftSection = width / 3;
    if (x < leftSection) {
        // handles left side motion
        if (leftMotionDetected) {
            firstTransmission.stop(); // stop if already playing
        } else {
            firstTransmission.play(); // play if not already playing
        }
        leftMotionDetected = !leftMotionDetected; // toggle the state
        rightMotionDetected = false; // reset the state of right side
    } else {
        // handles right side motion
        if (rightMotionDetected) {
            secondTransmission.stop(); // stop if already playing
        } else {
            secondTransmission.play(); // play if not already playing
        }
        rightMotionDetected = !rightMotionDetected; // toggle the state
        leftMotionDetected = false; // reset the state of left side
    }
}

function startAudio() {
    if (!audioStarted) {
        userStartAudio().then(() => {
            console.log('Audio context is running');
            readyToDetect = true;
        }).catch((e) => {
            console.error('The audio context could not be resumed:', e);
        });
        audioStarted = true;
    }
}

function toggleAudio(transmission, side) {
    if (side === 'left') {
        if (!leftMotionDetected) {
            transmission.play();
            leftMotionDetected = true;
        } else {
            transmission.pause();
            leftMotionDetected = false;
        }
    } else { 
        if (!rightMotionDetected) {
            transmission.play();
            rightMotionDetected = true;
        } else {
            transmission.pause();
            rightMotionDetected = false;
        }
    }
}
