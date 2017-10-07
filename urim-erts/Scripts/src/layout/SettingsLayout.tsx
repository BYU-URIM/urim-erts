import * as React from 'react'
import SettingsStore from '../stores/settingsStore'
import { PageHeader, Button, InputGroup, FormGroup, FormControl } from 'react-bootstrap'
import { observer } from 'mobx-react'
import AppStore from '../stores/appStore';
import { autobind } from 'core-decorators';

@autobind
@observer
export class SettingsLayout extends React.Component<any, undefined> {

    private appStore = AppStore.getInstance()

    private onSaveChanges() {
        if(this.appStore.settingsStore.isInputValid) {
            AppStore.getInstance().settingsStore.saveNextObjectNumberToServer(this.appStore.settingsStore.objectNumberInputVal)
        }
    }

    render() {
        return (
            <div className='settingsLayout'>
                <PageHeader>Settings <small>manage transfer request settings</small></PageHeader>
                <div id='nextObjectNumberContainer' >
                    <h3>Next Object Number</h3>
                    <FormGroup validationState={this.appStore.settingsStore.isInputValid ? null : 'error'}>
                        <InputGroup>
                            <FormControl onChange={this.appStore.settingsStore.processNewInput} type='text' value={this.appStore.settingsStore.objectNumberInputVal} />
                            {
                                this.appStore.settingsStore.objectNumberInputVal === this.appStore.settingsStore.nextObjectNumber
                                ? null
                                : (
                                    <InputGroup.Button>
                                        <Button disabled={!this.appStore.settingsStore.isInputValid} onClick={this.onSaveChanges}>Save Changes</Button>
                                    </InputGroup.Button>
                                )
                            }
                        </InputGroup>
                    </FormGroup>
                </div>
            </div>
        )
    }
}