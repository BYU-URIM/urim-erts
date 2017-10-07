import * as React from 'react'
import UserStore from '../stores/userStore'
import CurrentFormStore from '../stores/currentFormStore'
import { RequestsList } from '../components/RequestsList'
import { NewRequestModule } from '../components/NewRequestModule'
import { FormModal } from '../components/FormModal'
import { observer } from 'mobx-react';
import AppStore from '../stores/appStore';
import { autobind } from 'core-decorators';

@autobind
@observer
export class UserLayout extends React.Component<any, undefined> {

    private appStore = AppStore.getInstance()

    onSubmitCurrentForm() {
        if(!this.appStore.currentFormStore.isSubmissionAttempted) {
            this.appStore.currentFormStore.markSubmissionAttempted()
        }
        if(this.appStore.currentFormStore.canSubmit) {
            this.appStore.currentFormStore.submitCurrentFormForApproval()
        } else {
            // if unable to submit, find out why and post appropriate message
                // first check to see if its because no boxes were added
            if(!this.appStore.currentFormStore.formData.boxes.length) {
                this.appStore.currentFormStore.postFormFooterMessage('You need to add boxes to your request.  Fill out the template above and click \'Add Boxes\'', 'danger', 10000)
            } else {
                // if boxes are present, assume user is ubale to submit because not all fields are filled out
                this.appStore.currentFormStore.postFormFooterMessage('Fill out all of the required fields before submitting the form', 'danger', 5000)
            }

        }
    }

    render() {
        return (
            <div className='userLayout'>
                <div>{`Hello ${this.appStore.userStore.currentUser}`}</div>
                { // render requestsAwaitingReview if necessary
                    this.appStore.userStore.userRequestsAwaitingReview.length ?
                    (
                        <div>
                            <h2>Finished Requests <small>waiting on administrator approval</small></h2>
                            <div className='requestsListContainer'>
                                <RequestsList localList='user-awaiting' requests={this.appStore.userStore.userRequestsAwaitingReview} style='info' />
                            </div>
                        </div>
                    ) : null
                }
                { // render pending requests if necessary
                    this.appStore.userStore.userPendingRequests.length ?
                    (
                        <div>
                            <h2>Returned Requests <small>waiting on your revision</small></h2>
                            <div className='requestsListContainer'>
                                <RequestsList localList='user-pending' requests={this.appStore.userStore.userPendingRequests} />
                            </div>
                        </div>
                    ) : null
                }
                {/* always render the new request module  */}
                <div className='newRequestModuleContainer'>
                    <NewRequestModule userDepartments={this.appStore.userStore.userDepartments} isNewRequestDepartmentSelection={this.appStore.userStore.isNewRequestDepartmentSelection}
                        isAdmin={this.appStore.userStore.isAdmin} />
                </div>
                {/* Transfer Sheet Modal */}
                <FormModal type='user' show={this.appStore.currentFormStore.isDisplayForm} close={this.appStore.currentFormStore.clearCurrentForm} submit={this.onSubmitCurrentForm}
                    isSubmittingToServer={this.appStore.currentFormStore.isSubmittingToServer} formFooterMessage={this.appStore.currentFormStore.formFooterMessage} />
            </div>
        )
    }
}