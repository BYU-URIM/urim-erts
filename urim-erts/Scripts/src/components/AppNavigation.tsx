import * as React from 'react'
import { Nav, NavItem } from 'react-bootstrap'
import AppStore from '../stores/appStore'

const handleSelect = (eventKey, props) => {
    switch(eventKey) {
        case 1:
            props.router.push('/')
            break
        case 2:
            props.isAdminLoggedIn ? props.router.push('admin') : AppStore.getInstance().postUserPermissionError('You must be an administrator to access this page')
            break
        case 3:
            props.isAdminLoggedIn ? props.router.push('settings') : AppStore.getInstance().postUserPermissionError('You must be an administrator to access this page')
            break
    }
}

const determineActiveTabFromPath = (path = '/') => {
    let activeTabKey = 1
    switch(path) {
        case '/':
            activeTabKey = 1
            break
        case '/admin':
            activeTabKey = 2
            break
        case '/settings':
            activeTabKey = 3
            break
    }
    return activeTabKey
}

export const AppNavigation = (props) => (
    <Nav bsStyle='tabs'
        activeKey={determineActiveTabFromPath(props.displayedSubPath)}
        onSelect={(eventKey) => handleSelect(eventKey, props)}
    >
        <NavItem eventKey={1}>Manage Records</NavItem>
        <NavItem eventKey={2}>Admin</NavItem>
        <NavItem eventKey={3}>Settings</NavItem>
    </Nav>
)
