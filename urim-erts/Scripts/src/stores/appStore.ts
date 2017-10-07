import { EventEmitter } from 'events'
import { autobind } from 'core-decorators';
import { observable, computed, action, runInAction, extendObservable } from 'mobx'
import AdminStore from './adminStore';
import CurrentFormStore from './currentFormStore';
import SettingsStore from './settingsStore';
import UserStore from './userStore';
import * as dao from '../dataAccess/DataAccess'
import * as utils from '../utils/utils'
import { DEFAULT_OBJECT_NUMBER } from './storeConstants';
import { Request, BatchData } from '../model/model';
import { generateFolderNameFromRequest } from '../utils/utils';
import * as React from 'react';


@autobind
export default class AppStore {
    // Singleton boilerplate: only one instance of all stores should exist so that stores will
    // single source of truth for the app
    private constructor() { }
    private static instance: AppStore =  new AppStore()
    static getInstance(): AppStore { return this.instance }

    // app wide data
    @observable userPermissionError: string
    @observable isShowingSuccessMessage: boolean

    // child store instances
    adminStore: AdminStore = new AdminStore(this)
    currentFormStore: CurrentFormStore = new CurrentFormStore(this)
    settingsStore: SettingsStore = new SettingsStore(this)
    userStore: UserStore = new UserStore(this)

    @action
    postSuccessMessage() {
        this.isShowingSuccessMessage = true
    }

    @action
    clearSuccessMessage() {
        this.isShowingSuccessMessage = false
    }

    @action
    postUserPermissionError(errorMessage: string) {
        this.userPermissionError = errorMessage
    }

    @action
    clearUserPermissionError() {
        this.userPermissionError = null
    }

    @action
    async fetchStartupData() { 
        // fetch the username
        const userData = await dao.getCurrentUser()
        const username = userData.d.Title // extract name from user info
        this.userStore.cacheCurrentUsername(username)
        const identifier = this.extractUsernameFromLoginName(userData.d.LoginName)
        this.userStore.cacheCurrentUserIdentifier(identifier)
    
        // fetch the administrative status of the user
        const adminData = await dao.searchUserInAdminList(username)
            // if a filtered query of the username in the admin list has no results, the user is not an admin
        const adminStatus = adminData.d.results && adminData.d.results.length
        this.userStore.cacheCurrentAdminStatus(adminStatus)
    
        // fetch the departments for which the user is a record liaison (form presets)
        const userDepartmentData = await dao.getUserDepartments(identifier, adminStatus)
        userDepartmentData.d.results.forEach((element, index) => {
            this.userStore.cacheUserDepartment(utils.transformDepDtoToFullDepData(element))
        })

        if(userDepartmentData.d.results && userDepartmentData.d.results.length) {
            // store the email from the department info table 
            this.userStore.cacheCurrentUserEmail(userDepartmentData.d.results[0].Record_x0020_Liaison_x0020_Email)
        }
    
        // fetch the record category info for the retention drop down on the form (form preset)
        const retentionCategoryData = await dao.getRetentionCategoryData()
        this.currentFormStore.cacheFullRetentionCategories(utils.transformRetCatDtosToFullRetCats(retentionCategoryData))
    
        // fetch user specific pending requests
        const userPendingrequests = await dao.fetchUserPendingRequests(username)
        this.userStore.cacheUserPendingRequests(userPendingrequests)
    
        const userRequestsAwaitingReview = await dao.fetchUserRequestsAwaitingReview(username)
        this.userStore.cacheUserRequestsAwaitingReview(userRequestsAwaitingReview)
    
        // for admins, fetch all requests awaiting approval and admin metadata (lastArchivedObjectNumber)
        if(adminStatus) {
            // admin pending requests
            const adminPendingRequests: Request[] = await dao.fetchAdminPendingRequests()
            this.adminStore.cacheAdminPendingRequests(adminPendingRequests)
    
            // last archived object number
            const objectNumberData = await dao.fetchNextArchivedObjectNumber()
            const nextArchivedObjectNumber = objectNumberData.d.results[0] ? objectNumberData.d.results[0].Title : DEFAULT_OBJECT_NUMBER
            this.settingsStore.cacheNextObjectNumber(nextArchivedObjectNumber)

            // archive folder does not exist error checking
            for(let adminRequest of adminPendingRequests) {
                const foldername = generateFolderNameFromRequest(adminRequest)
                const folderStatus = await dao.checkIfFolderExistsInArchive(foldername)

                if(!folderStatus) {
                    const errorString = `warning: the archive folder named '${foldername}' does not exist`
                    this.adminStore.cachePreArchiveError(errorString)
                }
            }
        }
    }

    private extractUsernameFromLoginName(loginName) {
        if(loginName.includes("\\")) {
            return loginName.split("\\")[1]
        } else if(loginName.includes("|")) {
            return loginName.split("|")[1]
        } else return ""
    }
}