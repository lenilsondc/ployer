const audio = new AudioContext();
const audioElement = document.querySelector("#audio");
const source = audio.createMediaElementSource(audioElement);
const analyser = audio.createAnalyser();

const canvas = document.createElement("canvas");
const render = canvas.getContext("2d");
const appDiv = document.querySelector("#app");

window.addEventListener("resize", () => resizeContent());
window.addEventListener("load", () => resizeContent());

function resizeContent() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

appDiv.appendChild(canvas);

source.connect(analyser);
analyser.connect(audio.destination);

if (audio.state === "suspended") {
    audio.resume();
}

audioElement.play();

analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const timeData = new Uint8Array(bufferLength);
const freqData = new Uint8Array(bufferLength);

function paint() {
    const { width, height } = canvas;

    analyser.getByteTimeDomainData(timeData);
    analyser.getByteFrequencyData(freqData);

    render.fillStyle = "rgba(10, 10, 10, 1)";
    render.fillRect(0, 0, width, height);

    render.lineWidth = 2;
    render.strokeStyle = "#0dac9";

    render.save();
    render.translate(width / 2, height / 2);
    render.beginPath();

    const sliceWidth = (2 * Math.PI) / bufferLength;
    let r = 100;
    let theta = 0;

    for (let i = 0; i < bufferLength; i++) {
        let v = timeData[i] / 128.0;
        let y = (v * 100) / 2;

        let dx = (r + y) * Math.cos(theta);
        let dy = (r + y) * Math.sin(theta);

        if (i === 0) {
            render.moveTo(dx, dy);
        } else {
            render.lineTo(dx, dy);
        }

        theta += sliceWidth;
    }

    render.stroke();

    render.strokeStyle = "#3e50b4";

    let r2 = 50;
    let theta2 = 0;

    for (let i = 0; i < bufferLength; i++) {
        if (freqData[i] !== 0) {
            let v = freqData[i] / 128.0;
            let y = (v * 100) / 2;

            let dx = (r2 + y) * Math.cos(theta2);
            let dy = (r2 + y) * Math.sin(theta2);

            if (i === 0) {
                render.moveTo(dx, dy);
            } else {
                render.lineTo(dx, dy);
            }
        }

        theta2 += sliceWidth;
    }

    render.stroke();

    render.restore();
    requestAnimationFrame(paint);
}

requestAnimationFrame(paint);
