import * as React from 'react'
import {
    Jumbotron,
    ListGroup,
    ListGroupItem
} from 'react-bootstrap'
import { Button } from 'react-bootstrap'
import AppStore from '../stores/appStore'
import CurrentFormStore from '../stores/currentFormStore'
import { FieldGroup } from './FieldGroup'
import { IFullDepartmentData } from '../model/model';

const handleNewRequestClick = (props) => {
    if(!props.userDepartments.length) {
        AppStore.getInstance().postUserPermissionError('You must be the record liaison for a department to request a record transfer')
    } else if(props.userDepartments.length === 1) {
        AppStore.getInstance().currentFormStore.displayNewRequestForm(props.userDepartments[0])
    } else {
        // launch new Request department selection
        AppStore.getInstance().userStore.openNewRequestDepartmentSelection()
    }
}



export const NewRequestModule = (props) => {

    const handleDepartmentSelection = (department: IFullDepartmentData) => {
        AppStore.getInstance().userStore.closeNewRequestDepartmentSelection()
        AppStore.getInstance().currentFormStore.displayNewRequestForm(department)
    }
    
    // note: encodedDepName refers to string being passed in with `<depNumber> - <depName>` encoding, to get the the true department
    // name it needs to be extracted from the concatenated string
    const handleDepartmentSelectionFromAdminDropdown = (encodedDepName: string) => {
        const depNumber = encodedDepName.split(' ').length ? encodedDepName.split(' ')[0] : encodedDepName
        const fullDepartment: IFullDepartmentData = props.userDepartments.find(dep => dep.departmentNumber === depNumber)
        AppStore.getInstance().userStore.closeNewRequestDepartmentSelection()
        AppStore.getInstance().currentFormStore.displayNewRequestForm(fullDepartment)
    }

    return (
        <Jumbotron>
            <h2>New Record Transfer Request</h2>
            <div>
                Fill out the provided form and press submit to create a new record transfer request.
                It will then be sent to an administrator for their approval before your request is fufilled.
            </div>
            <div>
            {
                props.isNewRequestDepartmentSelection
                ? (
                    props.isAdmin
                    ? <FieldGroup type='select' label='Select a Department' span={6} placeholder='select y/n' options={props.userDepartments.map((dep: IFullDepartmentData) => `${dep.departmentNumber} - ${dep.departmentName}`).sort()}
                        id='departmentSelect' onChange={(id: string, value: string) => handleDepartmentSelectionFromAdminDropdown(value)} className='newRequestAdminDropdown' />

                    : <ListGroup id='newRequestItemSelectionList'>
                        {
                            props.userDepartments.map((department, index) => (
                                <ListGroupItem bsStyle='info' key={index} onClick={() => handleDepartmentSelection(department)}>{'Start request for '}<strong>{`${department.departmentName}`}</strong></ListGroupItem>
                            ))
                        }
                    </ListGroup>

                ) : (<Button onClick={() => handleNewRequestClick(props)} id='newRequestButton' bsStyle='primary'>new request</Button>)
            }
            </div>
        </Jumbotron>
    )

}
