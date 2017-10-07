import { EventEmitter } from 'events'
import { EMPTY_REQUEST } from './storeConstants'
import UserStore from './userStore'
import AdminStore from '../stores/adminStore'
import AppStore from '../stores/appStore'
import { getFormattedDateToday, getFormattedDate, transformRequestToStagedBoxDTOs, generateFolderNameFromRequest } from '../utils/utils';
import SettingsStore from '../stores/settingsStore'
import { incrementObjectNumber, formatLongStringForSaveKey } from '../utils/utils'
import { observable, action, runInAction, computed } from 'mobx';
import { getCurrentUser } from '../dataAccess/dataAccess';
import * as dao from '../dataAccess/DataAccess'
import { StatusEnum, EMPTY_STAGED_BOX_DTO } from './storeConstants';
import { currentFormToPDF } from "../service/pdfService";
import { autobind } from 'core-decorators';
import { Request, IStagedBoxArchiveDTO, Box, IFullRetentionCategory, BoxGroupData } from '../model/model';

@autobind
export default class CurrentFormStore {
    constructor(appStore: AppStore) {
        this._appStore = appStore
    }

    private _appStore: AppStore

    @observable formData = EMPTY_REQUEST
    @observable isDisplayForm: boolean = false
    @observable isSubmissionAttempted: boolean = false
    @observable isAddBoxesAtttempted: boolean = false
    @observable isDisplayBoxList: boolean = false
    @observable canAdminReturnToUser: boolean = false
    @observable isDisplayCommentInput: boolean = false
    @observable uncachedAdminComments = null // store temporary input of admin comments
    @observable isSubmittingToServer: boolean = false
    @observable formFooterMessage: any = null
    @observable fullRetentionCategories: Array<IFullRetentionCategory> = []

    @action displayRequestForm(request) {
        this.isDisplayForm = true
        // the request is deep copied into form data so that editing does not change the request
        // once a request is submittied (not closed) the old request will be updated
        this.formData = Object.assign(new Request(), request, { boxGroupData: new BoxGroupData() }) // give each request a new boxGroupData since they aren't saved
        this.formData.boxGroupData.numberOfBoxes = 1
        this.isDisplayBoxList = this.formData.boxes.length === 1 // only display the box list by default if there is one box
    }

    @action displayNewRequestForm(departmentInfo?) {
        this.isDisplayForm = true
        this.formData = new Request()
        this.formData.batchData.prepPersonName = this._appStore.userStore.currentUser
        this.formData.batchData.submitterEmail = this._appStore.userStore.currentUserEmail
        this.formData.batchData.dateOfPreparation = getFormattedDateToday()
        this.formData.boxGroupData.numberOfBoxes = 1
        if(departmentInfo) {
            this.formData.batchData.departmentName = departmentInfo.departmentName
            this.formData.batchData.departmentNumber = departmentInfo.departmentNumber
            this.formData.batchData.departmentPhone = departmentInfo.departmentPhone
            this.formData.batchData.departmentAddress = departmentInfo.departmentAddress
            this.formData.batchData.responsablePersonName = departmentInfo.responsiblePersonName
            this.formData.batchData.departmentCollege = departmentInfo.departmentCollege
        }
    }

    @action displayCommentInput() {
        this.canAdminReturnToUser = true
        this.isDisplayCommentInput = true
    }

    @action clearCurrentForm() {
        this.formData = new Request()
        this.isDisplayForm = false
        this.isSubmissionAttempted = false
        this.isAddBoxesAtttempted = false
        this.isDisplayBoxList = false
        this.canAdminReturnToUser = false
        this.isDisplayCommentInput = false
        this.uncachedAdminComments = null
        this.isSubmittingToServer = false
        this.formFooterMessage = null
    }

    @action markSubmissionAttempted() {
        this.isSubmissionAttempted = true
    }

    @action markAddBoxesAttempted() {
        this.isAddBoxesAtttempted = true
    }

    @action updateFormBatchData(id: string, newValue: any) {
        this.formData.batchData[id] = newValue
    }

    @action updateFormBoxGroupData(id: string, newValue: any) {
        this.formData.boxGroupData[id] = newValue
        if(id === 'retention' || id === 'endRecordsDate') this._recalculateReviewDate(this.formData.boxGroupData)
        if(id === 'permanent') this._applyDispositionUpdate(this.formData.boxGroupData, newValue)
        if(id === 'retentionCategory') this._applyRetentionCategoryUpdate(this.formData.boxGroupData, newValue)
    }

    @action updateFormSingleBoxData(id: string, newValue: any, index: number) {
        this.formData.boxes[index][id] = newValue
        // specialized functions for if a value with dependend autocalculated values changes
        if(id === 'retention' || id === 'endRecordsDate') this._recalculateReviewDate(this.formData.boxes[index])
        if(id === 'permanent') this._applyDispositionUpdate(this.formData.boxes[index], newValue)
        if(id === 'retentionCategory') this._applyRetentionCategoryUpdate(this.formData.boxes[index], newValue)
    }

    @action removeBoxFromCurrentForm(index: number) {
        this.formData.boxes.splice(index, 1)
        this.isDisplayBoxList = this.formData.boxes.length === 1 // only display the box list by default if there is one box
    }

    @action updateFormAdminComments(id: string, newValue: any) {
        this.uncachedAdminComments = newValue
    }

    @action removeAdminComment() {
        this.formData.batchData.adminComments = null
    }

    @action toggleBoxListVisibility() {
        this.isDisplayBoxList = !this.isDisplayBoxList
    }

    @action addBoxesToRequest(number: number) {
        this._addBoxes(number)
    }

    @action postFormFooterMessage(text, style, duration = 3000) {
        // TODO form footer message type
        this.formFooterMessage = {
            text,
            style,
            duration
        }
    }

    @action clearFormFooterMessage() {
        this.formFooterMessage = null
    }

    @action cacheFullRetentionCategories(retentionCategoryList: Array<IFullRetentionCategory>) {
        this.fullRetentionCategories = retentionCategoryList
    }

    // BEGIN ASYNC METHODS
    @action async returnCurrentFormToUser() {
        this.formData.batchData.adminComments = this.uncachedAdminComments
        this.isSubmittingToServer = true

        this.postFormFooterMessage('Saving your changes ...', 'info')

        await dao.updateForm(this.formData, StatusEnum.NEEDS_USER_REVIEW)

        this.formData.status = StatusEnum.NEEDS_USER_REVIEW
        // admin store: remove stale request (since it needs user review, it will no longer be admin pending)
        this._appStore.adminStore.checkAndRemoveRequestById(this.formData.spListId)
        // remove stale request from user store and add to userRequestsAwaitingReview
        this._appStore.userStore.checkAndRemoveRequestById(this.formData.spListId)
        this._appStore.userStore.cacheUserPendingRequests([this.formData])

        this.clearFormFooterMessage()
        this.clearCurrentForm()
        this._appStore.postSuccessMessage()
    }

    // after admin review, this saves without changing position or status
    @action async saveCurrentFormInPlace_admin() {
        if(this.formData.status === StatusEnum.WAITING_ON_ADMIN_APPROVAL) {
            this.isSubmittingToServer = true
            this.postFormFooterMessage('Saving your changes ...', 'info')
            await dao.updateForm(this.formData, this.formData.status)
    
            // admin store: remove stale request and replace
            this._appStore.adminStore.checkAndRemoveRequestById(this.formData.spListId)
            this._appStore.adminStore.cacheAdminPendingRequests([this.formData])
            // remove stale request from user store and add to userRequestsAwaitingReview
            this._appStore.userStore.checkAndRemoveRequestById(this.formData.spListId)
            this._appStore.userStore.cacheUserRequestsAwaitingReview([this.formData])

            this.clearFormFooterMessage()
            this.clearCurrentForm()
            this._appStore.postSuccessMessage()
        }
    }

    @action async submitCurrentFormForApproval() {
        this.isSubmittingToServer = true
        this.postFormFooterMessage('Saving your changes ...', 'info')

        const persistorFunction = this.formData.status === StatusEnum.NEW_REQUEST ? dao.createForm : dao.updateForm
        await persistorFunction(this.formData, StatusEnum.WAITING_ON_ADMIN_APPROVAL)

        this.formData.status = StatusEnum.WAITING_ON_ADMIN_APPROVAL

        // admin store: remove stale form if necessary and replace
        this._appStore.adminStore.checkAndRemoveRequestById(this.formData.spListId)
        // since this form was submitted for approval, it needs to go into admin pending queue
        this._appStore.adminStore.cacheAdminPendingRequests([this.formData])

        // user store: remove stale form if necessary and replace
        this._appStore.userStore.checkAndRemoveRequestById(this.formData.spListId)
        // since this form was submitted for approval, it needs to go into requestsAwaitingReview
        this._appStore.userStore.cacheUserRequestsAwaitingReview([this.formData])

        this.clearFormFooterMessage()
        this.clearCurrentForm()
        this._appStore.postSuccessMessage()
    }

    @action async archiveCurrentForm() {
        this.isSubmittingToServer = true
        this.postFormFooterMessage('Archiving the form ...', 'info')
        this._prepFormForArchival()

        const pdfBuffers = await currentFormToPDF(this.formData);
        const stagedBoxDTOs = transformRequestToStagedBoxDTOs(this.formData)

        for(let i = 0; i < this.formData.boxes.length; i++) {
            const folderName = generateFolderNameFromRequest(this.formData)
            const fileName = `${this.formData.boxes[i].objectNumber}.pdf`
            await dao.saveFormPdfToSever(pdfBuffers[i], folderName, fileName)
            await dao.saveFinalFormMetadataToArchive(fileName, folderName, stagedBoxDTOs[i])
        }
    
        // after archiving the form pdf and metadata, delete the form from the pending requests lists
        await dao.deleteForm(this.formData)
    
        // after archiving the form, update the next object number for the next batch of submissions
        await this._appStore.settingsStore.saveNextObjectNumberToServer()

        // email the record liaison that their record is ready to be picked up
        // if that email fails, attempt to email the Records Manager 
        try {
            await dao.emailRecordLiaisonOnApproval(
                this.formData.batchData.submitterEmail,
                `https://urim-department.byu.edu/records_transfers/Records%20Transfer%20Sheets/${generateFolderNameFromRequest(this.formData)}`,
                this.formData.batchData.departmentName
            )
        } catch(error) {
            console.log('Email to record liaison failed, attempting to email Records Manager')
            try {
                await dao.emailRecordLiaisonOnApproval(
                    '',
                    `https://urim-department.byu.edu/records_transfers/Records%20Transfer%20Sheets/${generateFolderNameFromRequest(this.formData)}`,
                    this.formData.batchData.departmentName
                )
            } catch(error) {
                console.log('Email to record manager fialed. The SP email service is not functioning correctly. Archival process will proceed.')
            }
        }

    
        this.formData.status = StatusEnum.APPROVED
        this._appStore.adminStore.checkAndRemoveRequestById(this.formData.spListId)
        this._appStore.userStore.checkAndRemoveRequestById(this.formData.spListId)
    
        this.clearFormFooterMessage()
        this.clearCurrentForm()
        this._appStore.postSuccessMessage()
    }

    @action async deleteCurrentForm(formData) {
        await dao.deleteForm(formData)

        this._appStore.adminStore.checkAndRemoveRequestById(this.formData.spListId)
        this._appStore.userStore.checkAndRemoveRequestById(this.formData.spListId)

        this.clearFormFooterMessage()
        this.clearCurrentForm()
        this._appStore.postSuccessMessage()
    }
    // END ASYNC METHODS

    // accessors
    @computed get canSubmit(): boolean {
        const { batchData } = this.formData
        
            // first check to see if there are boxes added
            if(!this.formData.boxes.length) {
                return false
            }
    
            // next check to see if all required batch data filds are present
            if(!(batchData.departmentNumber && batchData.departmentName && batchData.departmentPhone && batchData.prepPersonName && batchData.departmentCollege
                && batchData.responsablePersonName && batchData.departmentAddress && CurrentFormStore._dateRegEx.test(batchData.dateOfPreparation))) {
                    return false
            }
    
            for(let box of this.formData.boxes) {
                if(!(box.boxNumber && box.description && CurrentFormStore._dateRegEx.test(box.beginningRecordsDate)
                    && CurrentFormStore._dateRegEx.test(box.endRecordsDate))) {
                    return false
                }
            }
    
            return true
    }

    @computed get canAddBoxes(): boolean {
        const { boxGroupData } = this.formData
        return !!(boxGroupData.numberOfBoxes && !isNaN(boxGroupData.numberOfBoxes) && boxGroupData.numberOfBoxes > 0 && CurrentFormStore._dateRegEx.test(boxGroupData.beginningRecordsDate)
            && CurrentFormStore._dateRegEx.test(boxGroupData.endRecordsDate) && boxGroupData.description)
    }

    @computed get functionNames(): Array<string> {
        const names = ['']
        names.push(...Object.keys(this.retentionCategoryNamesByFunction))
        return names
    }

    @computed get highestObjectNumber(): string {
        return this.formData.boxes[this.formData.boxes.length - 1].objectNumber
    }


    // returns an object
    @computed get retentionCategoryNamesByFunction() {
        const retentionCategoriesByFunction: {[retFunction: string]: Array<string>} = {} // ret categories keyed by function name
        return this.fullRetentionCategories
            .sort((a, b) => a.retentionCategory < b.retentionCategory ? -1 : 1)
            .reduce((accumulator, fullRetCat) => {
                // if array already doesn't exists for this function, create an array
                if(!accumulator[fullRetCat.retentionFunction]) {
                    accumulator[fullRetCat.retentionFunction] = [null]
                }
        
                // push ret cat onto function array
                accumulator[fullRetCat.retentionFunction].push(fullRetCat.retentionCategory)
                return accumulator
            }, retentionCategoriesByFunction)
    }



    // private methods and helper data
    private _addBoxes(number: number) {
        const nextBoxNumber = this._getNextHighestBoxNumber()
        for(let i = 0; i < number; i++) {
            const box: Box = new Box()
            box.beginningRecordsDate = this.formData.boxGroupData.beginningRecordsDate
            box.description = this.formData.boxGroupData.description
            box.endRecordsDate = this.formData.boxGroupData.endRecordsDate
            box.objectNumber = this.formData.boxGroupData.objectNumber
            box.permanent = this.formData.boxGroupData.permanent
            box.permanentReviewPeriod = this.formData.boxGroupData.permanentReviewPeriod
            box.retention = this.formData.boxGroupData.retention
            box.retentionCategory = this.formData.boxGroupData.retentionCategory
            box.retentionFunction = this.formData.boxGroupData.retentionFunction
            box.reviewDate = this.formData.boxGroupData.reviewDate
            box.boxNumber = nextBoxNumber + i
            this.formData.boxes.push(box)
        }
        this.isDisplayBoxList = this.formData.boxes.length === 1 // only display the box list by default if there is one box
    }

    private _getNextHighestBoxNumber() {
        if(!this.formData.boxes.length) {
            return 1
        } else {
            let highest = 1
            this.formData.boxes.forEach((box) => {
                if(box.boxNumber > highest) highest = box.boxNumber
            })
            return highest + 1
        }
    }

    private _prepFormForArchival() {
        let nextObjectNumber = this._appStore.settingsStore.nextObjectNumber
        const username = this._appStore.userStore.currentUser
        const date = getFormattedDateToday()
        
        this.formData.batchData.approver = username
        this.formData.batchData.approvalDate = date

        this.formData.boxes.forEach((box, index) => {
            box.objectNumber = nextObjectNumber
            nextObjectNumber = incrementObjectNumber(nextObjectNumber)
        })
    }

    private _recalculateReviewDate(box: Box) {
        if(box.retention && !isNaN(Number(box.retention))) {
            const date = new Date(box.endRecordsDate)
            date.setFullYear(date.getFullYear() + Number(box.retention))
            box.reviewDate = getFormattedDate(date)
        } else {
            box.reviewDate = null
        }
    }

    private _applyDispositionUpdate(box: Box, value: any) {
        if(box.retentionCategory) {
            const fullRetentionCategory = this.fullRetentionCategories.find(({ retentionCategory }) => retentionCategory === box.retentionCategory)
            if(value === 'Yes') {
                box.permanentReviewPeriod = fullRetentionCategory.permanentReviewPeriod
                box.retention = null
                box.reviewDate = null
            } else if(value === 'No') {
                box.retention = fullRetentionCategory.period
                this._recalculateReviewDate(box)
                box.permanentReviewPeriod = null
            } else { /* disposition is left blank, wipe all dependent fields */
                box.retention = null
                box.reviewDate = null
                box.permanentReviewPeriod = null
            }
        } else {
            box.retention = null
            box.permanentReviewPeriod = null
            box.reviewDate = null
        }
    }

    private _applyRetentionCategoryUpdate(box: Box, value) {
        const boxRetentionCategory = this.fullRetentionCategories.find(({ retentionCategory }) => retentionCategory === box.retentionCategory)
        if(boxRetentionCategory) {
            box.permanent = boxRetentionCategory.permanent
            box.retention = boxRetentionCategory.period
            box.permanentReviewPeriod = boxRetentionCategory.permanentReviewPeriod
            if(box.permanent === 'No') this._recalculateReviewDate(box)
        } else {
            box.permanent = ''
            box.retention = null
            box.permanentReviewPeriod = null
            box.reviewDate = null
        }
    }

    static readonly _dateRegEx = /^(0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])[\/\-](19|20)\d{2}$/
}
