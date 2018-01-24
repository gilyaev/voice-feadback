import { h, Component } from 'preact';
import styles from './style.css';

export default class Widget extends Component {
    render () {
        return (
            <div className={ styles.container }>
                <div className={ styles.mediaRecorder }>
                    <p><strong>Is your microphone ready?</strong></p>
                    <a className={ `${styles.btn}`}>Leave Feedback</a>
                    <ul className={ styles.steps }>
                        <li>Record</li>
                        <li>Listen</li>
                        <li>Send</li>
                    </ul>
                </div>
                <div className={ styles.avatar }></div>
            </div>
        );
    }
}
