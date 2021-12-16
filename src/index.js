
import { h, render } from 'preact';
import App from '@/components/Widget';

window.onload = function init () {
    const constraints = { audio: true, video: false };
    let initCb = (app) => {};
    let autoStart = false;
    let parentNode = 'body';
    window[window.g_voicefeedback].q.forEach((item) => {
        if (item[0] === 'initCb') {
            initCb = item[1];
        }

        if (item[0] === 'autoStart') {
            autoStart = item[1];
        }

        if (item[0] === 'parentNode') {
            parentNode = item[1];
        }
    });

    // console.log(document.querySelector(parentNode), parentNode);

    window.URL = window.URL || window.webkitURL;
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            const AudioContext = window.AudioContext;
            const context = new AudioContext();
            const audioInput = context.createMediaStreamSource(stream);
            window.elmofeedback = render((<App audioSource={ audioInput } fixed={parentNode === 'body'} autoStart={autoStart} initCb={initCb} />), document.querySelector(parentNode));
        })
        .catch(function (err) { console.log(err.name + ': ' + err.message); });
};
