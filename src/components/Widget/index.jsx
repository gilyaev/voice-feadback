import { h, Component } from 'preact';
import styles from './style.css';

export default class Widget extends Component {
    render () {
        return (
            <div className={ styles.container }>
                <div className={ styles.mediaRecorder }>
                    <div className={ styles.step0 }>
                        <p><strong>Is your microphone ready?</strong></p>
                        <a className={`${styles.btn} ${styles.btnMicrophone}`}>Leave Feedback</a>
                        <ul className={ styles.steps }>
                            <li>Record</li>
                            <li>Listen</li>
                            <li>Send</li>
                        </ul>
                    </div>
                    <div className={ styles.step1 }>
                        <p><strong>Speak now, your feedback is recording!</strong></p>
                        <a className={`${styles.btn} ${styles.btnStopRecording}`}>Stop Recording</a>
                        <ul className={styles.steps}>
                            <li className={ styles.active }>Record</li>
                            <li>Listen</li>
                            <li>Send</li>
                        </ul>
                    </div>
                    <div className={styles.step2}>
                        <p><strong>Your feeadback is ready to send!</strong></p>
                        <a className={`${styles.btn} ${styles.btnSendFile}`}>Send Feedback</a>
                        <ul className={styles.steps}>
                            <li>Record</li>
                            <li className={styles.active}>Listen</li>
                            <li>Send</li>
                        </ul>
                    </div>
                </div>
                <div className={ styles.avatar }></div>
            </div>
        );
    }
}
