import * as React from 'react'
import AppStore from '../stores/appStore'
import { Alert } from 'react-bootstrap'

export const ErrorMessage = (props) => {
    setTimeout(AppStore.getInstance().clearUserPermissionError, props.duration || 4000)

    return (
        <Alert bsStyle="warning" id='userPermissionError'>
            <strong>{props.errorText}</strong>
        </Alert>
    )
}
