import * as React from 'react'
import AppStore from '../stores/appStore'
import CurrentFormStore from '../stores/currentFormStore'
import { RequestsList } from '../components/RequestsList'
import { FormModal } from '../components/FormModal'
import { observer } from 'mobx-react'
import { autobind } from 'core-decorators';
import { Alert } from 'react-bootstrap'

@autobind
@observer
export class AdminLayout extends React.Component<any, undefined> {
    
    private appStore = AppStore.getInstance()

    onReturnCurrentForm() {
        if(this.appStore.currentFormStore.canSubmit) {
            this.appStore.currentFormStore.returnCurrentFormToUser()
        }
    }

    onApproveCurrentForm() {
        if(this.appStore.currentFormStore.canSubmit) {
            this.appStore.currentFormStore.archiveCurrentForm()
        }
    }

    render() {
        return (
          <div className='adminLayout'>
              <div>Transfer Request Administration</div>
              { /* render any pre archive error messages */
                this.appStore.adminStore.preArchiveErrors.length ?
                (
                    <div>
                        {
                            this.appStore.adminStore.preArchiveErrors.map((error, index) => (
                                <Alert key={index} className='preArchiveError' bsStyle="warning">{error}</Alert>
                            ))
                        }
                    </div>
                ) : null
              }
              { /* render admin pending requests */
                  this.appStore.adminStore.adminPendingRequests.length ?
                  (
                      <div>
                          <h2>Pending Requests <small>approve or reject submitted requests</small></h2>
                          <div className='requestsListContainer'>
                              <RequestsList localList='admin-pending' requests={this.appStore.adminStore.adminPendingRequests} style='info' />
                          </div>
                      </div>
                  ) : (
                      <h2>No Pending Requests</h2>
                  )
              }

              <FormModal type='admin' show={this.appStore.currentFormStore.isDisplayForm} close={this.appStore.currentFormStore.clearCurrentForm} formFooterMessage={this.appStore.currentFormStore.formFooterMessage}
                canAdminReturnToUser={this.appStore.currentFormStore.canAdminReturnToUser} approve={this.onApproveCurrentForm} return={this.onReturnCurrentForm} addComments={this.appStore.currentFormStore.displayCommentInput}
                isSubmittingToServer={this.appStore.currentFormStore.isSubmittingToServer} saveInPlace={this.appStore.currentFormStore.saveCurrentFormInPlace_admin} />
          </div>
        )
    }
}