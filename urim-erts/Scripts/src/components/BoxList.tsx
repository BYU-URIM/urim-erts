import * as React from 'react'
import { Panel, Button } from 'react-bootstrap'
import { BoxForm } from './BoxForm'
import AppStore from '../stores/appStore'

export const BoxList = (props) => {
    return (
        <div>
            <Button onClick={AppStore.getInstance().currentFormStore.toggleBoxListVisibility} className='boxListButton' >Show Boxes</Button>
            <Panel collapsible expanded={props.expanded} className='boxListPanel'>
                <div>
                    {
                        props.boxes.map((box, index) => (
                            <BoxForm key={index} box={box} index={index}></BoxForm>
                        ))
                    }
                </div>
            </Panel>
        </div>
    )
}
