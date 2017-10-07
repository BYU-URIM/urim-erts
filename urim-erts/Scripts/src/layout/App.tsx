import * as React from 'react'
import { Button, PageHeader } from 'react-bootstrap';
import { AppNavigation } from '../components/AppNavigation'
import { ErrorMessage } from '../components/ErrorMessage'
import UserStore from '../stores/userStore'
import { observer } from 'mobx-react';
import AppStore from '../stores/appStore'
import { SuccessMessage } from '../components/SuccessMessage'
import { autobind } from 'core-decorators';

@autobind
@observer
export class App extends React.Component<any, undefined> {
    private appStore = AppStore.getInstance()

    static contextTypes = { router: React.PropTypes.object.isRequired }

    render() {
        return (
            <div className='appContainer'>
                <AppNavigation
                    isAdminLoggedIn={this.appStore.userStore.isAdmin}
                    router={this.context.router}
                    displayedSubPath={this.props.location.pathname}
                 />
                {this.appStore.userPermissionError && <ErrorMessage errorText={this.appStore.userPermissionError} />}
                {this.appStore.isShowingSuccessMessage && <SuccessMessage messageText='Changes successfully saved' />}
                {this.props.children}
                <Button className='homeLink' href="https://urim-department.byu.edu/records_transfers">Return to Records Transfers Home</Button>
            </div>
        )
    }
}
