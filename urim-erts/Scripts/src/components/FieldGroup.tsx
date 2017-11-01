import * as React from 'react'
import { observer } from 'mobx-react';
import {
    Form,
    FormControl,
    ControlLabel,
    FormGroup,
    Col
} from 'react-bootstrap'

// for text areas, the default style is overridden if the text has more than 3 lines
const getTextAreaStyle = (value) => value && value.split(/\r\n|\r|\n/).length > 3 ? { height: 300 } : null

export const FieldGroup = observer((props: any) => {
    if(props.type === 'text') {
        return (
            <Col lg={props.span} md={props.span} sm={props.span}>
                <FormGroup className={props.className} controlId={props.id} validationState={props.validation ? props.validation(props.id, props.value) : null}>
                    <ControlLabel>{props.label}</ControlLabel>
                    <FormControl readOnly={props.readOnly} value={props.value} onChange={(e) => props.onChange(props.id, e.target.value)} type='text' placeholder={props.placeholder} />
                    <FormControl.Feedback />
                </FormGroup>
            </Col>
        )
    } else if(props.type === 'select') {
        return (
            <Col lg={props.span} md={props.span} sm={props.span}>
                <FormGroup className={props.className} controlId={props.id}>
                    <ControlLabel>{props.label}</ControlLabel>
                        <FormControl readOnly={props.readOnly} value={props.value} onChange={(e) => props.onChange(props.id, e.target.value)} componentClass="select" placeholder={props.placeholder}>
                            {
                                props.options && props.options.map((option, index) => (
                                    <option value={option} key={index}>{option}</option>
                                ))
                            }
                        </FormControl>
                </FormGroup>
            </Col>
        )
    } else if(props.type === 'textarea') {
        return (
            <Col lg={props.span} md={props.span} sm={props.span}>
                <FormGroup className={props.className} controlId={props.id} validationState={props.validation ? props.validation(props.id, props.value) : null}>
                    <ControlLabel>{props.label}</ControlLabel>
                    <FormControl readOnly={props.readOnly} style={getTextAreaStyle(props.value)} value={props.value} onChange={(e) => props.onChange(props.id, e.target.value)} componentClass='textarea' placeholder={props.placeholder} />
                    <FormControl.Feedback />
                </FormGroup>
            </Col>
        )
    }

})
