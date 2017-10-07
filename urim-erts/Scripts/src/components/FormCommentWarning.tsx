import * as React from 'react'
import { Alert, Button } from 'react-bootstrap'
import AppStore from "../stores/appStore";

export const FormCommentWarning = (props) => {
    const headerText = props.type === 'admin' ? 'Your Previous Comment' : 'URIM administrators have requested that you fix the following:'

    return (
        <Alert bsStyle='danger'>
            <h4>{headerText}</h4>
            <p>{AppStore.getInstance().currentFormStore.formData.batchData.adminComments}</p>
            {
                props.type === 'admin'
                ? (<Button id='removeCommentButton' bsStyle='danger' onClick={AppStore.getInstance().currentFormStore.removeAdminComment}>Remove comment</Button>)
                : null
            }
        </Alert>
    )
}
