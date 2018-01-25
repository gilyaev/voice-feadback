
import { h, render } from 'preact';
import App from '@/components/Widget';

window.onload = function init () {
    const constraints = { audio: true, video: false };
    window.URL = window.URL || window.webkitURL;
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            const AudioContext = window.AudioContext;
            const context = new AudioContext();
            const audioInput = context.createMediaStreamSource(stream);
            render((<App audioSource={ audioInput } />), document.body);
        })
        .catch(function (err) { console.log(err.name + ': ' + err.message); });
    render((<App />), document.body);
};
