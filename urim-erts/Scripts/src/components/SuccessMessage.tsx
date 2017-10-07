import * as React from 'react'
import { Alert } from 'react-bootstrap'
import AppStore from "../stores/appStore";

export const SuccessMessage = (props) => {
    setTimeout(AppStore.getInstance().clearSuccessMessage, props.duration || 4000)

    return (
        <Alert bsStyle="success" >
            <strong>{props.messageText}</strong>
        </Alert>
    )
}
