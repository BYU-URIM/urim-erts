import * as React from 'react'
import { Panel, Button } from 'react-bootstrap'
import { BoxForm } from './BoxForm'
import AppStore from '../stores/appStore'

export const BoxList = (props) => {
    return (
        <div>
        {
            props.boxes.map((box, index) => (
                <BoxForm key={index} box={box} index={index}></BoxForm>
            ))
        }
        </div>
    )
}
