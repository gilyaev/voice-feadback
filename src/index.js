
import { h, render } from 'preact';
import Recorder from './recorder';
import App from '@/components/Widget';

window.onload = function init () {
    const constraints = { audio: true, video: false };
    window.URL = window.URL || window.webkitURL;

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            render((<App />), document.body);
            // const AudioContext = window.AudioContext;
            // const context = new AudioContext();
            // const audioInput = context.createMediaStreamSource(stream);

            // const recorder = new Recorder(audioInput);
            // setTimeout(() => {
            //     recorder.exportWAV(blob => {
            //         const url = URL.createObjectURL(blob);
            //         const au = document.createElement('audio');
            //         au.controls = true;
            //         au.src = url;
            //         document.body.appendChild(au);
            //     });
            // }, 10000);
        })
        .catch(function (err) { console.log(err.name + ': ' + err.message); });
};
