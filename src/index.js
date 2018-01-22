
const constraints = { audio: true, video: false };

navigator.mediaDevices.getUserMedia(constraints)
    .then(initializeRecorder)
    .catch(function (err) { console.log(err.name + ': ' + err.message); });

function initializeRecorder (stream) {
    const AudioContext = window.AudioContext;
    const context = new AudioContext();
    const audioInput = context.createMediaStreamSource(stream);
    const bufferSize = 2048;
    // create a javascript node
    const recorder = context.createScriptProcessor(bufferSize, 1, 1);

    console.log(context);

    // specify the processing function
    recorder.onaudioprocess = recorderProcess;
    // connect stream to our recorder
    audioInput.connect(recorder);
    // connect our recorder to the previous destination
    recorder.connect(context.destination);
}

function recorderProcess (e) {
    const left = e.inputBuffer.getChannelData(0);
    // console.log(left);
    // console.log(convertFloat32ToInt16(left));
}

function convertFloat32ToInt16 (buffer) {
    let l = buffer.length;
    const buf = new Int16Array(l);
    while (l--) {
        buf[l] = Math.min(1, buffer[l]) * 0x7FFF;
    }
    return buf.buffer;
}
