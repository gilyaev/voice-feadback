import { bind } from 'decko';
import { h, Component } from 'preact';

import Recorder from '@/recorder';
import styles from './style.css';

export default class Widget extends Component {
    constructor (props) {
        super(props);

        this.state = {
            stage: 3,
            open: true,
            timer: 0,
            timerId: null,
            maxDuration: 5,
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
        this.setState({ open: !this.state.open });
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
        recorder.destructor();

        const timerId = setInterval(() => {
            let { maxDuration, timerId, stage } = this.state;
            if (timer === maxDuration) {
                this.processStage();
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
        recorder.exportWAV(blob => {
            const feedback = URL.createObjectURL(blob);
            recorder.destructor();
            this.setState({ feedback });
        });
    }

    componentDidMount () {
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
                <p><strong>Speak now, your feedback is recording!</strong></p>
                <p className={ styles.progress }><span>Recording:</span> { duration }</p>
                <p className={ styles.duration }>Max duration <span>{ maxDuration }</span> seconds</p>
                <a
                    className={`${styles.btn} ${styles.btnStopRecording}`}
                    onclick={ this.processStage }
                >
                    Stop Recording
                </a>
                <ul className={ styles.steps }>
                    <li className={ styles.active }>Record</li>
                    <li>Listen</li>
                    <li>Send</li>
                </ul>
            </div>;
            break;
        case 2:
            stageBlock = <div className={ styles.step2 }>
                <p><strong>Your feeadback is ready to send!</strong></p>
                <div>
                    <audio src={ feedback } controls="controls"/>
                </div>
                <a className={`${styles.btn} ${styles.btnReplay}`} onclick={this.replayFeedback}>Replay</a>
                <div className={ styles.or }>OR</div>
                <div className={ styles.feedbackForm }>
                    <input type="text" name="name"  placeholder="Your name (optional)"/>
                    <input type="email" name="email" placeholder="Your email (optional)"/>
                    <input type="phone" name="phone" placeholder="Your phone (optional)"/>
                    <a className={`${styles.btn} ${styles.btnSendFile}`} onclick={this.processStage}>Send Feedback</a>
                </div>
                <ul className={ styles.steps }>
                    <li>Record</li>
                    <li className={ styles.active }>Listen</li>
                    <li>Send</li>
                </ul>
            </div>;
            break;
        case 3:
            stageBlock = <div className={styles.step3}>
                <div>
                    <strong>Your feadback has been sent. Thank you.</strong>
                    <img src={require('../../assets/img/yswd.png')} width="200"/>
                    <a className={`${styles.btn} ${styles.btnMicrophone}`} onclick={this.replayFeedback}>Leave Another Feedback</a>
                </div>
            </div>;
            break;
        default:
            stageBlock = <div className={ styles.step0 }>
                <p><strong>Is your microphone ready?</strong></p>
                <a className={`${styles.btn} ${styles.btnMicrophone}`} onclick={ this.processStage }>Leave Feedback</a>
                <ul className={ styles.steps }>
                    <li>Record</li>
                    <li>Listen</li>
                    <li>Send</li>
                </ul>
            </div>;
            break;
        }

        return (
            <div className={ styles.container } data-open={ open ? 'true' : 'false' }>
                <div className={ styles.mediaRecorder }>
                    { stageBlock }
                </div>
                <div className={ styles.avatar } onClick={ this.toggle }></div>
            </div>
        );
    }
}
