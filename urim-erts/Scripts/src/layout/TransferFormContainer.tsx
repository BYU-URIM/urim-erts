import * as React from 'react'
import { FieldGroup } from '../components/FieldGroup'
import { Grid, Row, Col, Button, Checkbox } from 'react-bootstrap'
import CurrentFormStore from '../stores/currentFormStore';
import { FormCommentWarning } from '../components/FormCommentWarning'
import { BoxList } from '../components/BoxList'
import { StatusEnum } from '../stores/storeConstants'
import { observer } from 'mobx-react'
import AppStore from "../stores/appStore";
import { autobind } from 'core-decorators';

@autobind
@observer
export class TransferFormContainer extends React.Component<any, undefined> {
    private appStore = AppStore.getInstance()

    validateBoxGroupComponent(componentId, value) {
        if(this.appStore.currentFormStore.isAddBoxesAtttempted) {
            // first check for date inputs which require special validation
            if(componentId === 'beginningRecordsDate' || componentId === 'endRecordsDate') {
                return CurrentFormStore._dateRegEx.test(value) ? null : 'error'
            } else if(componentId === 'numberOfBoxes') {
                return isNaN(value) || value < 1 ? 'error' : null
            }
            // genereic input check, any value indicates valid input, empty value indicates error
            return value ? null : 'error'
        }
        // if no submission has been attempted, everything is valid
        return null
    }

    validateBatchComponent(componentId, value) {
        if(this.appStore.currentFormStore.isSubmissionAttempted) {
            if(componentId === 'dateOfPreparation') {
                return CurrentFormStore._dateRegEx.test(value) ? null : 'error'
            }
            return value ? null : 'error'
        }
        return null
    }


    onAddBoxes() {
        if(!this.appStore.currentFormStore.isAddBoxesAtttempted) {
            this.appStore.currentFormStore.markAddBoxesAttempted()
        }
        if(this.appStore.currentFormStore.canAddBoxes) {
            this.appStore.currentFormStore.addBoxesToRequest(this.appStore.currentFormStore.formData.boxGroupData.numberOfBoxes)
        }
    }

    render() {

        return (
            <Grid>
                {/* **** DEPARTMENT INFO **** */}
                { /* if there are any comments from the administrator, display them at the top of the form */
                    this.appStore.currentFormStore.formData.batchData.adminComments
                    ? (<Row><Col lg={7} md={7} sm={7} ><FormCommentWarning type={this.props.type} /></Col></Row>)
                    : null
                }

                {/*Dep. Number,     Dep. Name,      Dep. Phone*/}
                <Row><h3>Department Information</h3></Row>
                <Row>
                    <FieldGroup type='text' label='Department Number*' value={this.appStore.currentFormStore.formData.batchData['departmentNumber']} span={2} placeholder='9892'
                        id='departmentNumber' onChange={this.appStore.currentFormStore.updateFormBatchData} validation={this.validateBatchComponent} />
                    <FieldGroup type='text' label='Department Name*' value={this.appStore.currentFormStore.formData.batchData['departmentName']} span={5} placeholder='Records Management'
                        id='departmentName' onChange={this.appStore.currentFormStore.updateFormBatchData} validation={this.validateBatchComponent} />
                    <FieldGroup type='text' label='Department Phone # *' value={this.appStore.currentFormStore.formData.batchData['departmentPhone']} span={2} placeholder='801-555-5555 ext 3'
                        id='departmentPhone' onChange={this.appStore.currentFormStore.updateFormBatchData} validation={this.validateBatchComponent} />
                </Row>

                {/*Person Preparing Records,      Person Responsible for Records */}
                <Row>
                    <FieldGroup type='text' label='Name of Person Preparing Records for Storage*' value={this.appStore.currentFormStore.formData.batchData['prepPersonName']} span={4}
                        id='prepPersonName' onChange={this.appStore.currentFormStore.updateFormBatchData} validation={this.validateBatchComponent} />
                    <FieldGroup type='text' label='Name of Person Responsible for Records in the Department*' value={this.appStore.currentFormStore.formData.batchData['responsablePersonName']} span={5}
                        id='responsablePersonName' onChange={this.appStore.currentFormStore.updateFormBatchData} validation={this.validateBatchComponent} />
                </Row>

                {/*Dep address,  Dep College,    Date of preparation*/}
                <Row>
                    <FieldGroup type='text' label='Department Address*' span={3} placeholder='' value={this.appStore.currentFormStore.formData.batchData['departmentAddress']}
                        id='departmentAddress' onChange={this.appStore.currentFormStore.updateFormBatchData} validation={this.validateBatchComponent} />
                    <FieldGroup type='text' label='Department College*' span={3} placeholder='' value={this.appStore.currentFormStore.formData.batchData['departmentCollege']}
                        id='departmentCollege' onChange={this.appStore.currentFormStore.updateFormBatchData} validation={this.validateBatchComponent} />
                    <FieldGroup type='text' label='Date of Preparation*' span={3} placeholder='12/2/2015' value={this.appStore.currentFormStore.formData.batchData['dateOfPreparation']}
                        id='dateOfPreparation' onChange={this.appStore.currentFormStore.updateFormBatchData} validation={this.validateBatchComponent} />
                </Row>

                { /* Special Pickup Instructions */ }
                <Row>
                    <FieldGroup type='text' label='Special Pickup Instructions' span={5} placeholder='' value={this.appStore.currentFormStore.formData.batchData['pickupInstructions']}
                        id='pickupInstructions' onChange={this.appStore.currentFormStore.updateFormBatchData} />
                    <Col id='departmentInfoChangeFlag' sm={4} md={4} lg={4}>
                        <Checkbox onChange={(e) => this.appStore.currentFormStore.updateFormBatchData('departmentInfoChangeFlag', e.target.checked)} checked={this.appStore.currentFormStore.formData.batchData['departmentInfoChangeFlag']}>
                            select if changed
                        </Checkbox>
                    </Col>
                </Row>


                {/* *** BOXES REUESTED *** */}
                <Row><h3 id='boxesRequestedHeader'>{`Boxes Requested: ${this.appStore.currentFormStore.formData.boxes.length} in total`}</h3></Row>

                {
                    this.appStore.currentFormStore.formData.boxes.length ?
                    (
                        <Row>
                            <BoxList expanded={this.appStore.currentFormStore.isDisplayBoxList} boxes={this.appStore.currentFormStore.formData.boxes} />
                        </Row>
                    ) : null

                }

                {/* *** ADD BOXES *** */}
                {this.props.type !== 'admin' &&
                (<div>
                    <Row><h3 id='addBoxesHeader'>Add Boxes to Request</h3></Row>

                    {/*Number of Boxes,    Beginning date of records,    Ending date of records*/}
                    <Row>
                        <FieldGroup id='numberOfBoxes' type='text' label='Number of Boxes*' span={3} value={this.appStore.currentFormStore.formData.boxGroupData['numberOfBoxes']}
                            placeholder='12' onChange={this.appStore.currentFormStore.updateFormBoxGroupData} validation={this.validateBoxGroupComponent} />
                        <FieldGroup id='beginningRecordsDate' type='text' label='Beginning date of records*' span={3} value={this.appStore.currentFormStore.formData.boxGroupData['beginningRecordsDate']}
                            placeholder='mm/dd/yyyy' onChange={this.appStore.currentFormStore.updateFormBoxGroupData} validation={this.validateBoxGroupComponent} />
                        <FieldGroup type='text' label='Ending date of records*' span={3} placeholder='mm/dd/yyyy' value={this.appStore.currentFormStore.formData.boxGroupData['endRecordsDate']}
                            id='endRecordsDate' onChange={this.appStore.currentFormStore.updateFormBoxGroupData} validation={this.validateBoxGroupComponent} />
                    </Row>

                    {/*Record Type,     Retention,     Permanent*/}
                    <Row>
                        <FieldGroup type='select' label='Function' span={3} placeholder='Administrative' value={this.appStore.currentFormStore.formData.boxGroupData.retentionFunction}
                            options={this.appStore.currentFormStore.functionNames} id='retentionFunction' onChange={this.appStore.currentFormStore.updateFormBoxGroupData} />
                        <FieldGroup type='select' label='Record Category' span={3} placeholder='financial' value={this.appStore.currentFormStore.formData.boxGroupData['retentionCategory']} id='retentionCategory'
                            options={this.appStore.currentFormStore.retentionCategoryNamesByFunction[this.appStore.currentFormStore.formData.boxGroupData.retentionFunction]} onChange={this.appStore.currentFormStore.updateFormBoxGroupData} />
                        <FieldGroup type='select' label='Permanent' span={3} placeholder='select y/n' value={this.appStore.currentFormStore.formData.boxGroupData['permanent']}
                            options={['', 'No', 'Yes']} id='permanent' onChange={this.appStore.currentFormStore.updateFormBoxGroupData} />
                    </Row>

                    {/* Description */}
                    <Row>
                        <FieldGroup type='textarea' label='Description*' span={6} placeholder='description' value={this.appStore.currentFormStore.formData.boxGroupData['description']}
                            id='description' onChange={this.appStore.currentFormStore.updateFormBoxGroupData} validation={this.validateBoxGroupComponent} />
                        {
                            this.appStore.currentFormStore.formData.boxGroupData['permanent'] === 'Yes'
                            ? (
                                <FieldGroup type='text' label='Permanent Review Period (years)' span={3} value={this.appStore.currentFormStore.formData.boxGroupData['permanentReviewPeriod']}
                                    id='permanentReviewPeriod' onChange={this.appStore.currentFormStore.updateFormBoxGroupData} />
                            )
                            : (
                                <FieldGroup type='text' label='Retention (years)' span={3} value={this.appStore.currentFormStore.formData.boxGroupData['retention']}
                                    id='retention' onChange={this.appStore.currentFormStore.updateFormBoxGroupData} />
                            )
                        }
                    </Row>

                    <Row>
                        <Col lg={3} md={3} sm={3}></Col>
                        <Button onClick={this.onAddBoxes}>Add Boxes</Button>
                    </Row>
                </div>)}

                {/* **** ADMIN COMMENT INPUT *** (if applicable) */}
                {
                    this.appStore.currentFormStore.isDisplayCommentInput ?
                    (
                        <Row>
                            <FieldGroup validation={() => null}  type='textarea' value={this.appStore.currentFormStore.uncachedAdminComments}
                                onChange={this.appStore.currentFormStore.updateFormAdminComments} label='Add Comments for User Review' span={8} id='adminComments' />
                        </Row>
                    ) : null
                }

                {/* For all forms previously saved to the server (status != new form), a delete form button will appear */}
                {
                    this.appStore.currentFormStore.formData.status === StatusEnum.NEW_REQUEST ? null :
                    (
                        <Row>
                            <Button onClick={() => this.appStore.currentFormStore.deleteCurrentForm(this.appStore.currentFormStore.formData)} bsStyle='danger'>Delete Form</Button>
                        </Row>

                    )
                }
            </Grid>
        )
    }
}