import * as React from 'react'
import { Alert } from 'react-bootstrap'
import AppStore from '../stores/appStore'

export const FormFooterMessage = (props) => {
    if(props.duration) {
            setTimeout(AppStore.getInstance().currentFormStore.clearFormFooterMessage, props.duration)
    }

    return (
        <Alert id='formFooterMessage' bsStyle={props.style}>
            {props.messageText}
        </Alert>
    )
}
