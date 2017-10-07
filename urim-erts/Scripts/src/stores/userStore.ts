import { EventEmitter } from 'events'
import CurrentFormStore from '../stores/currentFormStore.js'
import { StatusEnum } from '../stores/storeConstants.js'
import { observable, action, runInAction } from 'mobx';
import AppStore from "./appStore";
import { autobind } from 'core-decorators';
import { Request, IFullDepartmentData } from '../model/model';

@autobind
export default class UserStore {
    constructor(appStore: AppStore) {
        this._appStore = appStore
    }

    private _appStore: AppStore

   @observable currentUser: string = ""
   @observable currentUserEmail: string = ""
   @observable currentUserIdentifier: string = ""
   @observable isAdmin: boolean = false
   @observable userPendingRequests: Array<Request> = []  // holds requests that are pending user action (need user review)
   @observable userRequestsAwaitingReview: Array<Request> = [] // holds requests that are pending admin action (awaiting admin approval)
   @observable userDepartments: Array<IFullDepartmentData> = [] // holds the department numbers of each department for which the user is a record liaison
   @observable isNewRequestDepartmentSelection: boolean = false

   @action cacheCurrentUsername(username: string) {
       this.currentUser = username
   }

   @action cacheCurrentUserEmail(email: string) {
       this.currentUserEmail = email
   }

   @action cacheCurrentUserIdentifier(identifier: string) {
       this.currentUserIdentifier = identifier
   }

   @action cacheCurrentAdminStatus(adminStatus: boolean) {
       this.isAdmin = adminStatus
   }

   @action cacheUserPendingRequests(requests: Array<any>) {
       this.userPendingRequests.push(...requests)
   }

   @action cacheUserRequestsAwaitingReview(requests: Array<any>) {
       this.userRequestsAwaitingReview.push(...requests)
   }

   @action cacheUserDepartment(department: IFullDepartmentData) {
       this.userDepartments.push(department)
   }

   @action openNewRequestDepartmentSelection() {
       this.isNewRequestDepartmentSelection = true
   }

   @action closeNewRequestDepartmentSelection() {
       this.isNewRequestDepartmentSelection = false
   }

   // removes stale request by checking both pendingRequests AND requestsAwaitingReview, removes nothing if request is not
   // already in one of this store's lists
   @action checkAndRemoveRequestById(id: number) {
       // init the indexToRemove as the max number so that if it is not replaced, it won't remove anything from the list
        let indexToRemove = Number.MAX_SAFE_INTEGER
        this.userPendingRequests.forEach((request, index) => {
            if(request.spListId === id) {
                indexToRemove = index
            }
        })
        this.userPendingRequests.splice(indexToRemove, 1)

        indexToRemove = Number.MAX_SAFE_INTEGER
        this.userRequestsAwaitingReview.forEach((request, index) => {
            if(request.spListId === id) {
                indexToRemove = index
            }
        })
        this.userRequestsAwaitingReview.splice(indexToRemove, 1)
   }
}
