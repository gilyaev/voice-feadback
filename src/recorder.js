const RECORD_STATUS_PAUSE = 0;
const RECORD_STATUS_SILENCE = -1;
const RECORD_STATUS_RECORDING = 1;

let status = 0;
let recLength = 0;
let recBuffersL = [];
let recBuffersR = [];
let sampleRate;

function exportWAV (type) {
    let bufferL = mergeBuffers(recBuffersL, recLength);
    let bufferR = mergeBuffers(recBuffersR, recLength);
    let interleaved = interleave(bufferL, bufferR);
    let dataview = encodeWAV(interleaved);
    let audioBlob = new Blob([dataview], { type: type });

    return audioBlob;
}

function clear () {
    recLength = 0;
    recBuffersL = [];
    recBuffersR = [];
}

function mergeBuffers (recBuffers, recLength) {
    let result = new Float32Array(recLength);
    let offset = 0;
    for (var i = 0; i < recBuffers.length; i++) {
        result.set(recBuffers[i], offset);
        offset += recBuffers[i].length;
    }
    return result;
}

function interleave (inputL, inputR) {
    let length = inputL.length + inputR.length;
    let result = new Float32Array(length);

    let index = 0;
    let inputIndex = 0;

    while (index < length) {
        result[index++] = inputL[inputIndex];
        result[index++] = inputR[inputIndex];
        inputIndex++;
    }
    return result;
}

function floatTo16BitPCM (output, offset, input) {
    for (var i = 0; i < input.length; i++, offset += 2) {
        var s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
}

function writeString (view, offset, string) {
    for (var i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function encodeWAV (samples) {
    let buffer = new ArrayBuffer(44 + samples.length * 2);
    let view = new DataView(buffer);

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * 2, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, 2, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 4, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, 4, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true);

    floatTo16BitPCM(view, 44, samples);

    return view;
}

export default class Recorder {
    constructor (source, config = {}) {
        const bufferLen = config.bufferLen || 4096;

        this.source = source;
        this.context = source.context;
        this.node = this.context.createScriptProcessor(bufferLen, 2, 2);

        source.connect(this.node);
        this.node.connect(this.context.destination);
        this.node.onaudioprocess = this.onRecord;

        sampleRate = this.context.sampleRate;
    }

    /**
     * The onaudioprocess event handler of the ScriptProcessorNode interface represents the EventHandler
     * to be called for the audioprocess event that is dispatched to ScriptProcessorNode node types.
     * An event of type AudioProcessingEvent will be dispatched to the event handler.
     *
     * @param {Object} e The Web Audio API AudioProcessingEvent represents events that occur
     *                   when a ScriptProcessorNode input buffer is ready to be processed.
     */
    onRecord (e) {
        if (status !== RECORD_STATUS_RECORDING) return;
        recBuffersL.push(new Float32Array(e.inputBuffer.getChannelData(0)));
        recBuffersR.push(new Float32Array(e.inputBuffer.getChannelData(1)));
        recLength += e.inputBuffer.getChannelData(0).length;
    }

    /**
     * Start recording voice:
     * - change status to recording
     * - clear the voice that  can be written before
     */
    start () {
        status = RECORD_STATUS_RECORDING;
        clear();
    }

    /**
     * Set recording on ppause.
     */
    pause () {
        status = RECORD_STATUS_PAUSE;
    }

    /**
     * Stop recording and export result.
     *
     * @param {function} cb The callback that be call when recorded audio will be readdy
     * @param {string} type A type of audio file
     */
    stop (cb = () => { }, type = 'audio/wav') {
        status = RECORD_STATUS_SILENCE;
        setTimeout(() => {
            cb(exportWAV(type));
        }, 0);
    }
}
