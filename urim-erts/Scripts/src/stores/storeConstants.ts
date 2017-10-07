import { BatchData, Box, Request, BoxGroupData, IStagedBoxArchiveDTO } from '../model/model';

const EMPTY_BATCH_DATA: BatchData = {
    prepPersonName: null,
    departmentName: null,
    dateOfPreparation: null,
    departmentNumber: null,
    departmentPhone: null,
    responsablePersonName: null,
    departmentAddress: null,
    submitterEmail: null,
    departmentCollege: null
}

const EMPTY_BOX: Box = {
    boxNumber: null,
    beginningRecordsDate: null,
    endRecordsDate: null,
    retentionCategory: null,
    retention: null,
    permanent: null,
    description: null
}

const EMPTY_BOX_GROUP_DATA: BoxGroupData = Object.assign({}, EMPTY_BOX, {
    numberOfBoxes: null
})

export const EMPTY_REQUEST: Request = {
    batchData: EMPTY_BATCH_DATA,
    boxGroupData: EMPTY_BOX_GROUP_DATA,
    boxes: [],
    status: 'new request',
    spListId: null
}

export const EMPTY_STAGED_BOX_DTO: IStagedBoxArchiveDTO = {
    Dept_x0020__x0023_: null,
    Department_x0020_name: null,
    Department_x0020_Phone_x0020_Number: null,
    Name_x0020_of_x0020_Person_x0020_Preparing_x0020_Records_x0020_for_x0020_Storage: null,
    Name_x0020_of_x0020_Person_x0020_Responsable_x0020_for_x0020_Records_x0020_in_x0020_the_x0020_Department: null,
    Department_x0020_Address: null,
    Department_x0020_College: null,
    Date_x0020_of_x0020_Prep_x002e_: null,
    Special_x0020_Pickup_x0020_Instructions: null,
    Department_x0020_Info_x0020_Needs_x0020_Update: null,
    Object_x0020_Number: null,
    Box_x0020_Number: null,
    Date_x0020_From: null,
    Date_x0020_To: null,
    Retention_x0020_Category: null,
    Permanent: null,
    Permanent_x0020_Review_x0020_Period: null,
    Retention: null,
    Review_x0020_Date: null,
    Description0: null,
    Submitter_x0020_Email: null
}

export const StatusEnum = {
    NEW_REQUEST: 'new request',
    WAITING_ON_ADMIN_APPROVAL: 'waiting on admin approval',
    NEEDS_USER_REVIEW: 'needs user review',
    APPROVED: 'approved'
}

export const DEFAULT_OBJECT_NUMBER = '10000'
