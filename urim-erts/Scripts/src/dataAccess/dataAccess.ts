import {
    getQueryStringParameter,
    transformBatchesDataToBatchesDtoList,
    transformBoxesDataToBoxesDtoList,
    generateQueryFilterString
 } from '../utils/utils'
import CurrentFormStore from '../stores/currentFormStore'
import { StatusEnum } from '../stores/storeConstants'
import { IStagedBoxArchiveDTO, Request, Box, BatchData, IStagedBoxRecentQueueDTO, IStagedBoxPendingArchivalDTO } from '../model/model';

export const hostWebUrl = decodeURIComponent(getQueryStringParameter('SPHostUrl'));
const appWebUrl = getQueryStringParameter('SPAppWebUrl');
const archiveLibraryUrl = '/records_transfers/Records Transfer Sheets'
const REQUEST_BATCH_LIST_NAME = 'Request_Box_Objects_Host'
const REQUEST_BOX_LIST_NAME = 'Request_Box_Objects'
const ADMIN_LIST_NAME = 'Transfer Request Administrators'
const DEP_INFO_LIST_NAME = 'Department Information'
const RECORD_LIAISON_COLUMN_NAME = 'Record_x0020_Liaison'
const RECORD_LIAISON_EMAIL_COLUMN_NAME = 'Record_x0020_Liaison_x0020_Email'
const RECORD_LIAISON_NET_ID_COLUMN_NAME = "Record_x0020_Liaison_x0020_Net_x"
const DEPARTMENT_NUMBER_COLUMN_NAME = 'Department Number'
const GENERAL_RETENTION_SCHEDULE_LIB = 'General Retention Schedule'
const RECENTLY_SUBMITTED_QUEUE_LIST_NAME = 'Recently Submitted Queue'

declare const $: any
declare const jQuery: any

export function getCurrentUser() {
    return $.ajax({
        url: '../_api/web/currentuser',
        method: 'GET',
        headers: { 'Accept': 'application/json; odata=verbose' },
    })
}

export function fetchNextArchivedObjectNumber() {
    return $.ajax({
        url: `../_api/web/lists/getbytitle('Object_Number_Log')/items?$select=Title`,
        method: 'GET',
        headers: { 'Accept': 'application/json; odata=verbose' },
    })
}

export function saveNextObjectNumberToServer(objectNumber: string) {
    return $.ajax({
        url: '../_api/web/lists/getbytitle(\'Object_Number_Log\')/items',
        method: 'POST',
        contentType: 'application/json; odata=verbose',
        headers: {
            'Accept': 'application/json; odata=verbose',
            'X-RequestDigest': $('#__REQUESTDIGEST').val(),
            'contentType': 'application/json; odata=verbose'
        },
        data : JSON.stringify({
            __metadata: {'type': 'SP.Data.Object_x005f_Number_x005f_LogListItem'},
            Title: objectNumber
        })
    })
}

export function updateNextObjectNumberOnServer(objectNumber: string) {
    return $.ajax({
        url: `../_api/web/lists/getbytitle('Object_Number_Log')/items(1)`,
        method: 'POST',
        contentType: 'application/json; odata=verbose',
        headers: {
            'Accept': 'application/json; odata=verbose',
            'X-RequestDigest': $('#__REQUESTDIGEST').val(),
            'contentType': 'application/json; odata=verbose',
            'X-HTTP-Method': 'MERGE',
            'IF-MATCH': '*'
        },
        data : JSON.stringify({
            __metadata: {'type': 'SP.Data.Object_x005f_Number_x005f_LogListItem'},
            Title: objectNumber
        })
    })
}

export function searchUserInAdminList(userName: string) {
    return $.ajax({
        url: `../_api/SP.AppContextSite(@target)/web/lists/getbytitle('${ADMIN_LIST_NAME}')/items?$filter=Title eq '${userName}'&@target='${hostWebUrl}'`,
        method: 'GET',
        headers: { 'Accept': 'application/json; odata=verbose' },
    })
}

export function getUserDepartments(userIdentifier: string, adminStatus: boolean) {
    // if the user is an admin, this function will fetch all departments (empty filter string), otherwise, it will filter out only the user's department
    const filterString = adminStatus ? '' : `$filter=${RECORD_LIAISON_NET_ID_COLUMN_NAME} eq '${userIdentifier}'&`
    return $.ajax({
        url: `../_api/SP.AppContextSite(@target)/web/lists/getbytitle('${DEP_INFO_LIST_NAME}')/items?${filterString}&$top=1000&@target='${hostWebUrl}'`,
        method: 'GET',
        headers: { 'Accept': 'application/json; odata=verbose' },
    })
}

export function saveFormPdfToSever(pdfArrayBuffer, fileName: string, folderName?: string) {
    const folderPath = folderName ? '/' + folderName : null
    return $.ajax({
        url: `../_api/SP.AppContextSite(@target)/web/getfolderbyserverrelativeurl('${archiveLibraryUrl}${folderPath}')/files/add(overwrite=true,url='${fileName}')?@target='${hostWebUrl}'`,
        type: 'POST',
        processData: false,
        headers: {
           'accept': 'application/json;odata=verbose',
           'X-RequestDigest': jQuery('#__REQUESTDIGEST').val(),
            'contentType': 'application/json; odata=verbose'
        },
        data: pdfArrayBuffer
    })
}

// saves form metadata to archive library as file metadata for the generated pdf file
export function saveFinalFormMetadataToArchive(fileName: string, folderName: string, data: IStagedBoxArchiveDTO) {
    const listReadyFormData = Object.assign({}, data, { __metadata: {'type': 'SP.Data.Records_x0020_Transfer_x0020_SheetsItem'} })
    return $.ajax({
        url: `../_api/SP.AppContextSite(@target)/web/getfilebyserverrelativeurl('${archiveLibraryUrl}/${folderName}/${fileName}')/listitemallfields?@target='${hostWebUrl}'`,
        type: 'POST',
        contentType: 'application/json; odata=verbose',
        headers: {
           'accept': 'application/json;odata=verbose',
           'X-RequestDigest': jQuery('#__REQUESTDIGEST').val(),
            'contentType': 'application/json; odata=verbose',
            'X-HTTP-Method': 'MERGE',
            'IF-MATCH': '*'
        },
        data: JSON.stringify(listReadyFormData)
    })
}

export function saveFinalFormMetadataToRecentQueue(data: IStagedBoxRecentQueueDTO) {
    const listReadyFormData = Object.assign({}, data, { __metadata: {'type': 'SP.Data.Records_x0020_Transfer_x0020_SheetsItem'} })
    return $.ajax({
        url: `../_api/SP.AppContextSite(@target)//web/lists/getbytitle('${RECENTLY_SUBMITTED_QUEUE_LIST_NAME}')/items?@target='${hostWebUrl}'`,
        type: 'POST',
        contentType: 'application/json; odata=verbose',
        headers: {
           'accept': 'application/json;odata=verbose',
           'X-RequestDigest': jQuery('#__REQUESTDIGEST').val(),
            'contentType': 'application/json; odata=verbose',
            'X-HTTP-Method': 'MERGE',
            'IF-MATCH': '*'
        },
        data: JSON.stringify(listReadyFormData)
    })
}

export function saveFinalFormMetadataToPendingArchival(data: IStagedBoxPendingArchivalDTO, filename: string) {
    const listReadyFormData = Object.assign({}, data, { __metadata: {'type': 'SP.Data.Records_x0020_Transfer_x0020_SheetsItem'} })
    return $.ajax({
        url: `../_api/SP.AppContextSite(@target)/web/getfilebyserverrelativeurl('${archiveLibraryUrl}/${filename}')/listitemallfields?@target='${hostWebUrl}'`,
        type: 'POST',
        contentType: 'application/json; odata=verbose',
        headers: {
           'accept': 'application/json;odata=verbose',
           'X-RequestDigest': jQuery('#__REQUESTDIGEST').val(),
            'contentType': 'application/json; odata=verbose',
            'X-HTTP-Method': 'MERGE',
            'IF-MATCH': '*'
        },
        data: JSON.stringify(listReadyFormData)
    })
}

// high level data access function that updates a previously saved form to the server
export async function updateForm(formData: Request, intendedStatus: string) {
    await updateFormBatchData(formData.batchData, formData.spListId, intendedStatus, formData.boxes)
}

// helper function coupled with updateFormToServer
function updateFormBatchData(batchData: BatchData, spListId: number, intendedStatus: string, boxes: Array<Box>) {
    const boxString = JSON.stringify(boxes)
    return $.ajax({
        url: `../_api/SP.AppContextSite(@target)/web/lists/getbytitle(\'${REQUEST_BATCH_LIST_NAME}\')/items(${spListId})?@target='${hostWebUrl}'`,
        method: 'POST',
        contentType: 'application/json; odata=verbose',
        headers: {
            'Accept': 'application/json; odata=verbose',
            'X-RequestDigest': $('#__REQUESTDIGEST').val(),
            'contentType': 'application/json; odata=verbose',
            'X-HTTP-Method': 'MERGE',
            'IF-MATCH': '*'
        },
        data : JSON.stringify({
            __metadata: {'type': 'SP.Data.Request_x005f_Box_x005f_Objects_x005f_HostListItem'},
            Title: '_',
            prepPersonName: batchData.prepPersonName,
            departmentName: batchData.departmentName,
            dateOfPreparation: batchData.dateOfPreparation,
            departmentNumber: batchData.departmentNumber,
            departmentPhone: batchData.departmentPhone,
            responsablePersonName: batchData.responsablePersonName,
            departmentAddress: batchData.departmentAddress,
            departmentCollege: batchData.departmentCollege,
            pickupInstructions: batchData.pickupInstructions,
            adminComments: batchData.adminComments,
            status: intendedStatus,
            boxes: boxString,
            departmentInfoChangeFlag: batchData.departmentInfoChangeFlag,
            submitterEmail: batchData.submitterEmail
        })
    })
}


// high level data access function that saves a new form to the server
export async function createForm(formData: Request, intendedStatus: string) {
    const spBatchData = await createFormBatchObject(formData.batchData, intendedStatus, formData.boxes)
    formData.spListId = spBatchData.d.Id
}

// lower level helper function
function createFormBatchObject(batchData: BatchData, intendedStatus: string, boxes: Array<Box>) {
    const boxString = JSON.stringify(boxes)
    return $.ajax({

        url: `../_api/SP.AppContextSite(@target)/web/lists/getbytitle(\'${REQUEST_BATCH_LIST_NAME}\')/items?@target='${hostWebUrl}'`,
        method: 'POST',
        contentType: 'application/json; odata=verbose',
        headers: {
            'Accept': 'application/json; odata=verbose',
            'X-RequestDigest': $('#__REQUESTDIGEST').val(),
            'contentType': 'application/json; odata=verbose'
        },
        data : JSON.stringify({
            __metadata: {'type': 'SP.Data.Request_x005f_Box_x005f_Objects_x005f_HostListItem'},
            Title: '_',
            prepPersonName: batchData.prepPersonName,
            departmentName: batchData.departmentName,
            dateOfPreparation: batchData.dateOfPreparation,
            departmentNumber: batchData.departmentNumber,
            departmentPhone: batchData.departmentPhone,
            responsablePersonName: batchData.responsablePersonName,
            departmentAddress: batchData.departmentAddress,
            departmentCollege: batchData.departmentCollege,
            pickupInstructions: batchData.pickupInstructions,
            adminComments: batchData.adminComments,
            status: intendedStatus,
            boxes: boxString,
            departmentInfoChangeFlag: batchData.departmentInfoChangeFlag,
            submitterEmail: batchData.submitterEmail
        })
    })
}


export async function deleteForm(formData: Request) {
    await deleteFormComponent(REQUEST_BATCH_LIST_NAME, formData.spListId)
}

function deleteFormComponent(listToDeleteFrom: string, spListId: number) {
    return $.ajax({
        url: `../_api/SP.AppContextSite(@target)/web/lists/getbytitle('${listToDeleteFrom}')/items(${spListId})?@target='${hostWebUrl}'`,
        method: 'POST',
        headers: {
            'X-RequestDigest': $('#__REQUESTDIGEST').val(),
            'X-HTTP-Method': 'DELETE',
            'IF-MATCH': '*'
        }
    })
}


export async function fetchUserPendingRequests(username: string) {
    // construct the field value pairs necessary for generating a filter string to fetch the specified elements
    const batchFieldValuePairs = [
        {field: 'prepPersonName', value: username},
        {field: 'status', value: StatusEnum.NEEDS_USER_REVIEW}
    ]

    // fetch the users batches that have the status 'needs user review' to populate the user pending requests list
    const rawBatchesData = await fetchHostWebListItemsByFieldVal(REQUEST_BATCH_LIST_NAME, batchFieldValuePairs)
    const batchesDtoList = transformBatchesDataToBatchesDtoList(rawBatchesData)
    for(let i = 0; i < batchesDtoList.length; i++) {
        const boxesDtoList = JSON.parse(rawBatchesData.d.results[i].boxes)
        batchesDtoList[i].boxes = boxesDtoList
    }
    return batchesDtoList
}

export async function fetchUserRequestsAwaitingReview(username: string) {
    // construct the field value pairs necessary for generating a filter string to fetch the specified elements
    const batchFieldValuePairs = [
        {field: 'prepPersonName', value: username},
        {field: 'status', value: StatusEnum.WAITING_ON_ADMIN_APPROVAL}
    ]

    // fetch the users batches that have the status 'needs user review' to populate the user pending requests list
    const rawBatchesData = await fetchHostWebListItemsByFieldVal(REQUEST_BATCH_LIST_NAME, batchFieldValuePairs)
    const batchesDtoList = transformBatchesDataToBatchesDtoList(rawBatchesData)
    for(let i = 0; i < batchesDtoList.length; i++) {
        const boxesDtoList = JSON.parse(rawBatchesData.d.results[i].boxes)
        batchesDtoList[i].boxes = boxesDtoList
    }
    return batchesDtoList
}

// high level fetch function
export async function fetchAdminPendingRequests() {
    // fetch the users batches that have the status 'needs user review' to populate the user pending requests list
    const rawBatchesData = await fetchHostWebListItemsByFieldVal(REQUEST_BATCH_LIST_NAME, [{field: 'status', value: StatusEnum.WAITING_ON_ADMIN_APPROVAL}])
    const batchesDtoList = transformBatchesDataToBatchesDtoList(rawBatchesData)
    for(let i = 0; i < batchesDtoList.length; i++) {
        const boxesDtoList = JSON.parse(rawBatchesData.d.results[i].boxes)
        batchesDtoList[i].boxes = boxesDtoList
    }
    return batchesDtoList
}

// low level fetch function
function fetchHostWebListItemsByFieldVal(listName: string, fieldValPairArray: Array<any>) {
    const filterString = generateQueryFilterString(fieldValPairArray)
    return $.ajax({
        url: `../_api/SP.AppContextSite(@target)/web/lists/getbytitle('${listName}')/items?$filter=${filterString}&@target='${hostWebUrl}'`,
        method: 'GET',
        headers: { 'Accept': 'application/json; odata=verbose' },
    })
}

export function getRetentionCategoryData() {
    return $.ajax({
        url: `../_api/SP.AppContextSite(@target)/web/lists/getbytitle('${GENERAL_RETENTION_SCHEDULE_LIB}')/items?&$top=1000&@target='${hostWebUrl}'`,
        method: 'GET',
        headers: { 'Accept': 'application/json; odata=verbose' },
    })
}

// high level async
export async function checkIfFolderExistsInArchive(foldername: string): Promise<boolean> {
    try {
        await fetchFolder(foldername)
        return true
    } catch(error) {
        return false
    }
}

// helper for checkIfFolderExists
function fetchFolder(foldername: string) {
    return $.ajax({
        url: `../_api/SP.AppContextSite(@target)/web/getfolderbyserverrelativeurl('${archiveLibraryUrl}/${foldername}')?@target='${hostWebUrl}'`,
        type: 'GET',
        headers: {
           'accept': 'application/json;odata=verbose',
           'X-RequestDigest': jQuery('#__REQUESTDIGEST').val(),
            'contentType': 'application/json; odata=verbose'
        }
    })
}

export async function emailRecordLiaisonOnApproval(address: string, archiveUrl: string, departmentName: string) {
    await sendEmail(
        address,
        'Approved Record Transfer Form',
        `Dear Record Liaison,<br /><br />
        
        Thank you for submitting a record transfer form.  The box or boxes have been approved and will be picked up no later than 
        the end of the next business day.  Follow this link to see a digital copy of the approved form.<br /><br />
        
        <a href="${archiveUrl}">Records Transfer Sheet Archive</a><br /><br />
        University Records and Information Management Department<br />
        OIT-Support Services<br />
        801-422-2828<br />
        Urim@byu.edu<br /><br /><br />
        Please do not reply to this email.
        `,
    )
}

function sendEmail(address: string, subject: string, body: string) {
    return $.ajax({
        url: '../_api/SP.Utilities.Utility.SendEmail',
        method: 'POST',
        contentType: "application/json; odata=verbose",
        headers: {
            "Accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": jQuery('#__REQUESTDIGEST').val()
        },
        data: JSON.stringify({
            'properties': {
                '__metadata': {
                    'type': 'SP.Utilities.EmailProperties'
                },
                'From': 'LTPSC SharePoint Workflows',
                'To': {
                    'results': [address]
                },
                'Body': body,
                'Subject': subject
            }
        })
    }) 
}
