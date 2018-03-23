import * as React from 'react'
import CurrentFormStore from '../stores/currentFormStore'
import { FieldGroup } from './FieldGroup'
import { Grid, Row, Col, Well, Button } from 'react-bootstrap'
import AppStore from "../stores/appStore";
import { observer } from 'mobx-react';
import { autobind } from 'core-decorators';

@autobind
@observer
export class BoxForm extends React.Component<any, undefined> {
    deleteBoxButtonStyle = {
        maxWidth: 50,
        whiteSpace: 'normal',
        paddingLeft: 2,
        paddingRight: 2,
        marginTop: 25,
        marginRight: 34,
        marginLeft: -20
    }

    validateComponent(componentId, value) {
        if(AppStore.getInstance().currentFormStore.isSubmissionAttempted) {
            if(componentId === 'retention') {
                return isNaN(value) ? 'error' : null
            } else if(componentId === 'beginningRecordsDate' || componentId === 'endRecordsDate') {
                return /^(0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])[\/\-]\d{4}$/.test(value) ? null : 'error'
            } else {
                return value ? null : 'error' // default validation - check not null
            }
        }
        return null
    }

    updateBoxFormComponent(id, value) {
        AppStore.getInstance().currentFormStore.updateFormSingleBoxData(id, value, this.props.index)
    }

    render() {
        return (
            <Grid>
                <Col lg={9} md={9} sm={9}>
                    <Well>
                        {/*Number of Boxes,    Beginning date of records,    Ending date of records*/}
                        <Row>
                            <FieldGroup id='boxNumber' type='text' label='Box No.*' span={3} value={this.props.box['boxNumber']}
                                placeholder='12' onChange={this.updateBoxFormComponent} validation={this.validateComponent} />
                            <FieldGroup id='beginningRecordsDate' type='text' label='Start date of records*' span={3} value={this.props.box['beginningRecordsDate']}
                                placeholder='mm/dd/yyyy' onChange={this.updateBoxFormComponent} validation={this.validateComponent} />
                            <FieldGroup type='text' label='End date of records*' span={3} placeholder='mm/dd/yyyy' value={this.props.box['endRecordsDate']}
                                id='endRecordsDate' onChange={this.updateBoxFormComponent} validation={this.validateComponent} />
                            <FieldGroup type='select' label='Retention Function' span={3} placeholder='' value={this.props.box['retentionFunction']}
                                id='retentionFunction' onChange={this.updateBoxFormComponent} options={AppStore.getInstance().currentFormStore.functionNames} />
                        </Row>
        
                        {/*Record Type,     Retention,     Destroy*/}
                        <Row>
                            <FieldGroup type='select' label='Retention Category' span={3} placeholder='financial' value={this.props.box['retentionCategory']}
                                options={AppStore.getInstance().currentFormStore.retentionCategoryNamesByFunction[this.props.box.retentionFunction]} id='retentionCategory' onChange={this.updateBoxFormComponent} />
                            <FieldGroup type='checkbox' label='Permanent' span={3} value={this.props.box['permanent'] === 'Yes'}
                                id='permanent' onChange={this.updateBoxFormComponent} />
                            {
                                this.props.box['permanent'] === 'Yes'
                                ? null
                                : ( <div>
                                        <FieldGroup type='text' label='Retention (years)' span={3} value={this.props.box['retention']}
                                            id='retention' onChange={this.updateBoxFormComponent} validation={this.validateComponent} />
                                        <FieldGroup type='text' label='Review Date' span={3} placeholder='' value={this.props.box['reviewDate']}
                                            id='reviewDate' onChange={ function(){} } /> {/* NOTE review date has dummy onChange function because it is a non-editable calculated value */}
                                    </div>
                                )
                            }
                        </Row>
        
                        {/* Description */}
                        <Row>
                            <FieldGroup type='textarea' label='Description*' span={12} placeholder='description' value={this.props.box['description']}
                                id='description' onChange={this.updateBoxFormComponent} validation={this.validateComponent} />
                        </Row>
                        <Row>
                            <Col lg={10} md={10} sm={10} />
                            <Col lg={1} md={1} sm={1}>
                                <Button style={this.deleteBoxButtonStyle} onClick={() => AppStore.getInstance().currentFormStore.removeBoxFromCurrentForm(this.props.index)} id='removeBoxButton' bsStyle='danger'>remove box</Button>
                            </Col>
                        </Row>
                    </Well>
                </Col>
                </Grid>
        )
    }
}
