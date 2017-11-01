import { IStagedBoxArchiveDTO, Request, IFullRetentionCategoryDTO, IFullRetentionCategory, IDepartmentDataDTO, IFullDepartmentData, IStagedBoxRecentQueueDTO, IStagedBoxPendingArchivalDTO, IStagedRequestDTO, ToBeArchivedOption } from '../model/model';
import { StatusEnum } from '../stores/storeConstants';
export function getQueryStringParameter(paramToRetrieve) {
    var params =
        document.URL.split("?")[1].split("&");
    var strParams = "";
    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0] == paramToRetrieve)
            return singleParam[1];
    }
}


// Transformer utilities
export function transformBatchesDataToBatchesDtoList(batchesData) {
    return batchesData.d.results.map((element, index) => {
        return {
            batchData: {
                prepPersonName: element.prepPersonName,
                submitterEmail: element.submitterEmail,
                departmentName: element.departmentName,
                dateOfPreparation: element.dateOfPreparation,
                departmentNumber: element.departmentNumber,
                departmentPhone: element.departmentPhone,
                responsablePersonName: element.responsablePersonName,
                departmentAddress: element.departmentAddress,
                departmentCollege: element.departmentCollege,
                pickupInstructions: element.pickupInstructions,
                departmentInfoChangeFlag: element.departmentInfoChangeFlag,
                adminComments: element.adminComments
            },
            boxGroupData: {},
            boxes: [],
            status: element.status,
            spListId: element.Id
        }
    })
}

export function transformBoxesDataToBoxesDtoList(boxesData) {
    return boxesData.d.results.map((element, index) => {
        return {
            boxNumber: element.boxNumber,
            beginningRecordsDate: element.beginningRecordsDate,
            endRecordsDate: element.endRecordsDate,
            retentionCategory: element.retentionCategory,
            retention: element.retention,
            permanentReviewPeriod: element.permanentReviewPeriod,
            permanent: element.permanent,
            description: element.description,
            spListId: element.Id
        }
    })
}

export function transformRequestToStagedBoxArchiveDTOs(request: Request): Array<IStagedBoxArchiveDTO> {
    return request.boxes.map(function(box, index) {
        return {
            Dept_x0020__x0023_: request.batchData.departmentNumber,
            Department_x0020_name: request.batchData.departmentName,
            Department_x0020_Phone_x0020_Number: request.batchData.departmentPhone,
            Name_x0020_of_x0020_Person_x0020_Preparing_x0020_Records_x0020_for_x0020_Storage: request.batchData.prepPersonName,
            Name_x0020_of_x0020_Person_x0020_Responsable_x0020_for_x0020_Records_x0020_in_x0020_the_x0020_Department: request.batchData.responsablePersonName,
            Department_x0020_Address: request.batchData.departmentAddress,
            Department_x0020_College: request.batchData.departmentCollege,
            Date_x0020_of_x0020_Prep_x002e_: request.batchData.dateOfPreparation,
            Special_x0020_Pickup_x0020_Instructions: request.batchData.pickupInstructions,
            Department_x0020_Info_x0020_Needs_x0020_Update: request.batchData.departmentInfoChangeFlag ? 'yes' : 'no',
            Object_x0020_Number: box.objectNumber,
            Box_x0020_Number: JSON.stringify(box.boxNumber),
            Date_x0020_From: box.beginningRecordsDate,
            Date_x0020_To: box.endRecordsDate,
            Retention_x0020_Category: box.retentionCategory,
            Permanent: box.permanent,
            Permanent_x0020_Review_x0020_Period: box.permanentReviewPeriod,
            Retention: box.retention,
            Review_x0020_Date: box.reviewDate,
            Description0: formatLongStringForSaveKey(box.description),
            Submitter_x0020_Email: request.batchData.submitterEmail,
            Id: request.spListId,
            To_x0020_Be_x0020_Archived: box.permanent.toLowerCase() === 'yes' ? 'Pending Decision' as ToBeArchivedOption : ''
        }
    })
}

export function transformArchiveDtoToRecentQueueDto(archiveDto: IStagedBoxArchiveDTO): IStagedBoxRecentQueueDTO {
    return {
        Object_x0020_Number: archiveDto.Object_x0020_Number,
        Box_x0020_Number: archiveDto.Box_x0020_Number,
        Beginning_x0020_Date_x0020_of_x0: archiveDto.Date_x0020_From,
        Ending_x0020_Date_x0020_of_x0020: archiveDto.Date_x0020_To,
        Retention_x0020_Category: archiveDto.Retention_x0020_Category,
        Permanent: archiveDto.Permanent,
        Permanent_x0020_Review_x0020_Per: archiveDto.Permanent_x0020_Review_x0020_Period,
        Retention: archiveDto.Retention,
        Department_x0020_Number: archiveDto.Dept_x0020__x0023_,
        Department_x0020_name: archiveDto.Department_x0020_name,
        Department_x0020_Phone_x0020_Num: archiveDto.Department_x0020_Phone_x0020_Number,
        Name_x0020_of_x0020_Person_x0020: archiveDto.Name_x0020_of_x0020_Person_x0020_Preparing_x0020_Records_x0020_for_x0020_Storage,
        Name_x0020_of_x0020_Person_x00200: archiveDto.Name_x0020_of_x0020_Person_x0020_Responsable_x0020_for_x0020_Records_x0020_in_x0020_the_x0020_Department,
        Department_x0020_Address: archiveDto.Department_x0020_Address,
        Department_x0020_College: archiveDto.Department_x0020_College,
        Date_x0020_of_x0020_Preparation: archiveDto.Date_x0020_of_x0020_Prep_x002e_,
        Special_x0020_Pickup_x0020_Instr: archiveDto.Special_x0020_Pickup_x0020_Instructions,
        Box_x0020_Description: archiveDto.Description0,
        Review_x0020_Date: archiveDto.Review_x0020_Date,
        Changed: archiveDto.Department_x0020_Info_x0020_Needs_x0020_Update === 'yes'? true : false
    }
}

export function transformArchiveDtoToPendingArchivalDto(archiveDto: IStagedBoxArchiveDTO, fullRetCat: IFullRetentionCategory): IStagedBoxPendingArchivalDTO {
    return {
        Box_x0020_Description: archiveDto.Description0,
        Beginning_x0020_Date_x0020_of_x0020_Records: archiveDto.Date_x0020_From,
        Ending_x0020_Date_x0020_of_x0020_Records: archiveDto.Date_x0020_To,
        Retention_x0020_Category: archiveDto.Retention_x0020_Category,
        Department_x0020_name: archiveDto.Department_x0020_name,
        Expected_x0020_Archival_x0020_Status: fullRetCat ? fullRetCat.expectedArchivalStatus : 'No',
        Id: archiveDto.Id,
        To_x0020_Be_x0020_Archived: archiveDto.Permanent.toLowerCase() === 'yes' ? 'Pending Decision' : ''
    }
}

export function generateQueryFilterString(filterPairArray) {
    return filterPairArray.reduce((accumulator, currentPair, index, array) => {
        accumulator += `(${currentPair.field} eq '${currentPair.value}')`
        if(index != array.length - 1) {
            accumulator += ' and '
        }
        return accumulator
    }, '')
}

export function transformDepDtoToFullDepData(rawDepData: IDepartmentDataDTO): IFullDepartmentData {
    return {
        departmentNumber: rawDepData.Department_x0020_Number,
        departmentName: rawDepData.Department_x0020_Name,
        departmentPhone: rawDepData.Department_x0020_Phone_x0020_Num,
        departmentAddress: rawDepData.Department_x0020_Address,
        departmentCollege: rawDepData.Department_x0020_College,
        responsiblePersonName: rawDepData.Person_x0020_Responsible_x0020_f
    }
}

export function transformRetCatDtosToFullRetCats(rawRetData): Array<IFullRetentionCategory> {
    return rawRetData.d.results.map((rawData: IFullRetentionCategoryDTO) => {
        return {
            retentionCategory: `${rawData.Record_x0020_Category_x0020_ID} - ${rawData.Record_x0020_Category}`,
            permanent: rawData.PERM,
            period: rawData.Period,
            permanentReviewPeriod: rawData.Perm_x0020_Review_x0020_Period,
            id: rawData.Record_x0020_Category_x0020_ID,
            retentionFunction: rawData.Function,
            expectedArchivalStatus: rawData.Expected_x0020_Archival_x0020_St
        }
    })
}

export function transformRequestToStagedRequestDto(request: Request, intendedStatus: string): IStagedRequestDTO {
    return {
        Title: '_',
        prepPersonName: request.batchData.prepPersonName,
        departmentName: request.batchData.departmentName,
        dateOfPreparation: request.batchData.dateOfPreparation,
        departmentNumber: request.batchData.departmentNumber,
        departmentPhone: request.batchData.departmentPhone,
        responsablePersonName: request.batchData.responsablePersonName,
        departmentAddress: request.batchData.departmentAddress,
        departmentCollege: request.batchData.departmentCollege,
        pickupInstructions: request.batchData.pickupInstructions,
        adminComments: request.batchData.adminComments,
        status: intendedStatus,
        boxes: JSON.stringify(request.boxes),
        departmentInfoChangeFlag: request.batchData.departmentInfoChangeFlag,
        submitterEmail: request.batchData.submitterEmail,
        Id: request.spListId
    }
}

export function getFormattedDate(date) {
    return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`
}

export function getFormattedDateToday() {
    const date = new Date()
    return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`
}

export function incrementObjectNumber(objectNumber) {
    // assumes object number is numeric string
    const temp = parseInt(objectNumber)
    return `${temp+1}` //increase numberic portion of object number by 1
}

// this function accepts a string of highly variable length and formats it into a short phrase key
// if the string is under a threshold length, it will not be changed, otherwise it will be trimmed
// to an appropriate length
export function formatLongStringForSaveKey(string) {
    // if the string is under 50 characters long, the whole string will be the phrase key
    if(string.length < 50) {
        return string
    } else if(string.split('\n').length < 50) {
        // if the  string has a newline character within the first characters, the first line of string
        // will be returned as the phrase key
        return string.split('\n')[0]
    } else {
        // otherwise the first 50 characters will be returned as the phrase key
        return string.substr(0, 49)
    }
}

export function generateFolderNameFromRequest(request: Request) {
    return `${request.batchData.departmentNumber} - ${request.batchData.departmentName}`
}