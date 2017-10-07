import * as React from 'react'
import { EventEmitter } from 'events'
import CurrentFormStore from '../stores/currentFormStore.js'
import { StatusEnum } from '../stores/storeConstants.js'
import { observable, computed, action, runInAction, extendObservable } from 'mobx'
import { autobind } from 'core-decorators'
import AppStore from './appStore';
import { Request } from '../model/model';


@autobind
export default class AdminStore {
    constructor(appStore: AppStore) {
        this._appStore = appStore
    }

    private _appStore: AppStore

    @observable
    adminPendingRequests: Array<Request> = []

    @observable
    preArchiveErrors: Array<string> = [] // maps department names to error strings describing potential archiving errors

    @action
    cacheAdminPendingRequests(requests: Array<Request>): void {
        this.adminPendingRequests.push(...requests)
    }

    @action
    cachePreArchiveError(error: string) {
        this.preArchiveErrors.push(error)
    }
    @action
    removePreArchiveError(error: string) {
        this.preArchiveErrors.push(error)
    }

    // checks for request in adminPendingRequests and removes it if found
    @action checkAndRemoveRequestById(id: number) {
        let indexToRemove = Number.MAX_SAFE_INTEGER // init the indexToRemove as the max number so that if it is not replaced, it won't remove anything from the list
        this.adminPendingRequests.forEach((request, index) => {
            if(request.spListId === id) {
                indexToRemove = index
            }
        })
        this.adminPendingRequests.splice(indexToRemove, 1)
    }
}
