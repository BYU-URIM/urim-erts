import {
    getQueryStringParameter,
    transformBatchesDataToBatchesDtoList,
    transformBoxesDataToBoxesDtoList,
    generateQueryFilterString
 } from '../utils/utils'
import CurrentFormStore from '../stores/currentFormStore'
import { StatusEnum } from '../stores/storeConstants'
import { IStagedBoxArchiveDTO, Request, Box, BatchData, IStagedBoxRecentQueueDTO, IStagedBoxPendingArchivalDTO, IStagedRequestDTO, SpIdentifiableDto } from '../model/model';
import { transformRequestToStagedRequestDto } from '../utils/utils';

export const hostWebUrl = decodeURIComponent(getQueryStringParameter('SPHostUrl'));
const appWebUrl = getQueryStringParameter('SPAppWebUrl');
const archiveLibraryUrl = '/records_transfers/Records Transfer Sheets'
export const REQUEST_HOST_LIST_NAME = 'Request_Box_Objects_Host'
const REQUEST_BOX_LIST_NAME = 'Request_Box_Objects'
const ADMIN_LIST_NAME = 'Transfer Request Administrators'
const DEP_INFO_LIST_NAME = 'Department Information'
const RECORD_LIAISON_COLUMN_NAME = 'Record_x0020_Liaison'
const RECORD_LIAISON_EMAIL_COLUMN_NAME = 'Record_x0020_Liaison_x0020_Email'
const RECORD_LIAISON_NET_ID_COLUMN_NAME = "Record_x0020_Liaison_x0020_Net_x"
const DEPARTMENT_NUMBER_COLUMN_NAME = 'Department Number'
export const GENERAL_RETENTION_SCHEDULE_LIB = 'General Retention Schedule'
export const RECENTLY_SUBMITTED_QUEUE_LIST_NAME = 'Recently Submitted Queue'
export const PENDING_ARCHIVAL_LIBRARY_NAME = "Pending Archival"
export const ARCHIVE_LIBRARY_NAME = "Records Transfer Sheets"

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

export function createFormMetadataInHostList<T>(formData: T, listName: string) {
    const listReadyFormData = Object.assign({}, formData, { __metadata: {'type': getMetadataAttributeForList(listName)} })
    return $.ajax({
        url: `../_api/SP.AppContextSite(@target)//web/lists/getbytitle('${listName}')/items?@target='${hostWebUrl}'`,
        type: 'POST',
        contentType: 'application/json; odata=verbose',
        headers: {
            'Accept': 'application/json; odata=verbose',
            'X-RequestDigest': $('#__REQUESTDIGEST').val(),
            'contentType': 'application/json; odata=verbose'
        },
        data: JSON.stringify(listReadyFormData)
    })
}

export function updateFormMetadataInHostList<T extends SpIdentifiableDto>(formData: T, listName: string) {
    const listReadyFormData = Object.assign({}, formData, { __metadata: {'type': getMetadataAttributeForList(listName)} })
    return $.ajax({
        url: `../_api/SP.AppContextSite(@target)/web/lists/getbytitle('${listName}')/items(${formData.Id})?@target='${hostWebUrl}'`,
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

// note: does not need to be generic becuase it always receives a pdf array buffer regardless of metadata type
export function createFormPdfInHostLibrary(pdfArrayBuffer, fileName: string, libraryName: string, folderName?: string) {
    const folderPath = folderName ? '/' + folderName : ''
    return $.ajax({
        url: `../_api/SP.AppContextSite(@target)/web/getfolderbyserverrelativeurl('/records_transfers/${libraryName}${folderPath}')/files/add(overwrite=true,url='${fileName}')?@target='${hostWebUrl}'`,
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

export function updateFormMetadataInHostLibrary<T extends SpIdentifiableDto>(data: T, library: string, fileName: string, folderName?: string) {
    const folderPath = folderName ? '/' + folderName : ''
    const listReadyFormData = Object.assign({}, data, { __metadata: {'type': getMetadataAttributeForList(library)} })
    return $.ajax({
        url: `../_api/SP.AppContextSite(@target)/web/getfilebyserverrelativeurl('/records_transfers/${library}${folderPath}/${fileName}')/listitemallfields?@target='${hostWebUrl}'`,
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
    await updateFormMetadataInHostList<IStagedRequestDTO>(transformRequestToStagedRequestDto(formData, intendedStatus), REQUEST_HOST_LIST_NAME)
}

// high level data access function that saves a new form to the server
export async function createForm(formData: Request, intendedStatus: string) {
    const spBatchData = await createFormMetadataInHostList<IStagedRequestDTO>(transformRequestToStagedRequestDto(formData, intendedStatus), REQUEST_HOST_LIST_NAME)
    formData.spListId = spBatchData.d.Id
}

export async function deleteForm(formData: Request) {
    await deleteFormComponent(REQUEST_HOST_LIST_NAME, formData.spListId)
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
    const rawBatchesData = await fetchHostWebListItemsByFieldVal(REQUEST_HOST_LIST_NAME, batchFieldValuePairs)
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
    const rawBatchesData = await fetchHostWebListItemsByFieldVal(REQUEST_HOST_LIST_NAME, batchFieldValuePairs)
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
    const rawBatchesData = await fetchHostWebListItemsByFieldVal(REQUEST_HOST_LIST_NAME, [{field: 'status', value: StatusEnum.WAITING_ON_ADMIN_APPROVAL}])
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

function getMetadataAttributeForList(listName: string): string {
    switch(listName) {
        case ARCHIVE_LIBRARY_NAME: return "SP.Data.Records_x0020_Transfer_x0020_SheetsItem"
        case PENDING_ARCHIVAL_LIBRARY_NAME: return "SP.Data.Pending_x0020_ArchivalItem"
        case REQUEST_HOST_LIST_NAME: return "SP.Data.Request_x005f_Box_x005f_Objects_x005f_HostListItem"
        case RECENTLY_SUBMITTED_QUEUE_LIST_NAME: return "SP.Data.Recently_x0020_Submitted_x0020_QueueListItem"
        default: throw new Error(`no metadata type for list ${listName} - look up the ListItemEntityTypeFullName attribute of the list and add it here`)
    }
}
