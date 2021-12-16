import { bind } from 'decko';
import { h, Component } from 'preact';

import { default as Recorder,
    RECORD_STATUS_PAUSE,
    RECORD_STATUS_SILENCE,
    RECORD_STATUS_RECORDING
} from '@/recorder';

import styles from './style.css';

export default class Widget extends Component {
    constructor (props) {
        super(props);

        this.state = {
            stage: 0,
            open: false,
            timer: 0,
            timerId: null,
            maxDuration: 30,
            recorder: null,
            feedback: null
        };
    }

    @bind
    processStage () {
        let { stage } = this.state;
        stage = (stage < 3) ? ++stage : 0;
        this.setState({ stage });

        if (stage === 1) {
            return this.startRecording();
        }

        if (stage === 2) {
            return this.stopRecording();
        }
    }

    @bind
    toggle () {
        let { stage, open, recorder } = this.state;
        const newOpen = !this.state.open;

        if (
            stage === 1 &&
            !newOpen &&
            recorder &&
            recorder.status === RECORD_STATUS_RECORDING
        ) {
            recorder.pause();
        }

        if (recorder &&
            recorder.status === RECORD_STATUS_PAUSE &&
            newOpen
        ) {
            recorder.resume();
        }

        if (stage === 2) {
            this.feedbackAudio.pause();
        }

        if (stage === 3 && !newOpen) {
            stage = 0;
        }

        this.setState({ open: newOpen, stage });
    }

    @bind
    replayFeedback () {
        const { recorder } = this.state;
        this.setState({ stage: 1 });
        this.startRecording();
    }

    startRecording () {
        let timer = 0;
        let { recorder } = this.state;

        recorder = recorder || new Recorder(this.props.audioSource);
        recorder.start();

        const timerId = setInterval(() => {
            let { maxDuration, timerId, stage } = this.state;
            if (timer === maxDuration) {
                this.processStage();
                return;
            }

            if (recorder.status === RECORD_STATUS_PAUSE) {
                return;
            }

            ++timer;
            this.setState({ timer: timer });
        }, 1000);
        this.setState({ timerId, recorder, timer });
    }

    stopRecording () {
        const { recorder, timerId } = this.state;
        window.clearInterval(timerId);
        recorder.stop(blob => {
            const feedback = URL.createObjectURL(blob);
            this.setState({ feedback });
        });
    }

    componentDidMount () {
        this.props.initCb(this);
        if (this.props.autoStart) {
            setTimeout(() => {
                this.toggle();
                this.audioManager.play();
            }, 2000);
        }
    }

    render ({ }, { maxDuration, stage, open, timer, feedback }) {
        let stageBlock;
        let duration = ((s) => {
            let min = (s - (s %= 60)) / 60;
            let sec = (s > 9 ? ':' : ':0') + s;
            return ((min < 10) ? '0' + min : min) + sec;
        })(timer);

        switch (stage) {
        case 1:
            stageBlock = <div className={ styles.step1 }>
                <h3>Speak now, your feedback is recording!</h3>
                <p className={ styles.progress }><span>Recording:</span> { duration }</p>
                <p className={ styles.duration }>Max duration <span>{ maxDuration }</span> seconds</p>
                <a
                    className={`${styles.btn} ${styles.btnStopRecording}`}
                    onclick={ this.processStage }
                >
                    Stop Recording
                </a>
                {/* <ul className={ styles.steps }>
                    <li className={ styles.active }>Record</li>
                    <li>Listen</li>
                    <li>Send</li>
                </ul> */}
            </div>;
            break;
        case 2:
            stageBlock = <div className={ styles.step2 }>
                <h3>Your feeadback is ready to send!</h3>
                <div>
                    <audio src={feedback} ref={audioManager => this.feedbackAudio = audioManager} controls="controls"/>
                </div>
                <a className={`${styles.btn} ${styles.btnReplay}`} onclick={this.replayFeedback}>Replay</a>
                <div className={ styles.or }>OR</div>
                <div className={ styles.feedbackForm }>
                    <input type="text" name="name" placeholder="Your name (optional)"/>
                    <input type="email" name="email" placeholder="Your email (optional)"/>
                    <input type="phone" name="phone" placeholder="Your phone (optional)"/>
                    <a className={`${styles.btn} ${styles.btnSendFile}`} onclick={this.processStage}>Send Feedback</a>
                </div>
                {/* <ul className={ styles.steps }>
                    <li>Record</li>
                    <li className={ styles.active }>Listen</li>
                    <li>Send</li>
                </ul> */}
            </div>;
            break;
        case 3:
            stageBlock = <div className={styles.step3}>
                <div>
                    <h3>Your feadback has been sent. Thank you.</h3>
                    <img src={require('../../assets/img/yswd.png')} width="200"/>
                    <a className={`${styles.btn} ${styles.btnMicrophone}`} onclick={this.replayFeedback}>Leave Another Feedback</a>
                </div>
            </div>;
            break;
        default:
            stageBlock = <div className={ styles.step0 }>
                <h3>Leave feedback</h3>
                <p>Your feedback is important to us. Do three simple steps to delivery it to us.</p>
                <ul className={ styles.steps }>
                    <li>Record</li>
                    <li>Listen</li>
                    <li>Send</li>
                </ul>
                <h3>Is your microphone ready?</h3>
                <a className={`${styles.btn} ${styles.btnMicrophone}`} onclick={ this.processStage }>Start recording</a>
            </div>;
            break;
        }

        return (
            <div className={ `${styles.container} ${this.props.fixed && styles.containerFixed}`} data-open={ open ? 'true' : 'false' }>
                <audio src={require('../../assets/sounds/popup.wav')} autostart="true" ref={ audioManager => this.audioManager = audioManager }></audio>
                <div className={ styles.mediaRecorder }>
                    { stageBlock }
                </div>
                {/*<div className={ styles.avatar } onClick={ this.toggle }></div>*/}
            </div>
        );
    }
}
