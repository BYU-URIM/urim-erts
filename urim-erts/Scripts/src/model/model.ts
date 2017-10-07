import { observable } from 'mobx';
import { StatusEnum } from '../stores/storeConstants';
// TODO permanent enum: delete | ?
// TODO status enum

// text fields that apply to each box
export class Box {
    @observable boxNumber: number
    @observable beginningRecordsDate: string
    @observable endRecordsDate: string
    @observable retentionCategory: string
    @observable retention: string
    @observable permanent: string
    @observable description: string
    @observable objectNumber?: string // will only be added once the form is archived
    @observable permanentReviewPeriod?: string
    @observable reviewDate?: string
    // will not be stored on the PDF or on the SP list item, consider it 'helper information' to narrow down record categories
    @observable retentionFunction?: string
}

// boxGroupData is the 'box template' portion of the form, contains metadata about pending box group to be added
export class BoxGroupData extends Box {
    constructor() { super() }
    @observable numberOfBoxes: number = 1
}

// text fields at the top of the form that apply request-wide to each box
export class BatchData {
    @observable prepPersonName: string
    @observable departmentName: string
    @observable dateOfPreparation: string
    @observable departmentNumber: number
    @observable departmentPhone: string
    @observable responsablePersonName: string
    @observable departmentAddress: string
    @observable submitterEmail: string
    @observable departmentCollege: string
    @observable approver?: string
    @observable approvalDate?: string
    @observable departmentInfoChangeFlag?: boolean
    @observable pickupInstructions?: string
    @observable adminComments?: string
}

// in addition to batch and box data (user visible data), the request also has the non user visible
// metadata: status and spListID
export class Request {
    @observable batchData: BatchData = new BatchData()
    @observable boxGroupData: BoxGroupData = new BoxGroupData()
    @observable boxes: Array<Box> = []
    @observable status: string = StatusEnum.NEW_REQUEST
    @observable spListId: number
}

// ARCHIVE DTO
// Staged Box is a box that has been combined with its batch info so that it is ready to be added as a single entry
// in the SP archive, DTO (data transfer object) refers to all of the fields corresponding to SP columns
export interface IStagedBoxArchiveDTO {
    Dept_x0020__x0023_: number
    Department_x0020_name: string
    Department_x0020_Phone_x0020_Number: string
    Name_x0020_of_x0020_Person_x0020_Preparing_x0020_Records_x0020_for_x0020_Storage: string
    Name_x0020_of_x0020_Person_x0020_Responsable_x0020_for_x0020_Records_x0020_in_x0020_the_x0020_Department: string
    Department_x0020_Address: string
    Department_x0020_College: string
    Date_x0020_of_x0020_Prep_x002e_: string
    Special_x0020_Pickup_x0020_Instructions: string
    Department_x0020_Info_x0020_Needs_x0020_Update: string
    Object_x0020_Number: string
    Box_x0020_Number: string
    Date_x0020_From: string
    Date_x0020_To: string
    Retention_x0020_Category: string
    Permanent: string
    Permanent_x0020_Review_x0020_Period: string
    Retention: string
    Review_x0020_Date: string
    Description0: string
    Submitter_x0020_Email: string
}

// Recently Submitted Queue DTO
// Staged Box is a box that has been combined with its batch info so that it is ready to be added as a single entry
// in the SP Recently Submitted Queue, DTO (data transfer object) refers to all of the fields corresponding to SP columns
export interface IStagedBoxRecentQueueDTO {
    Object_x0020_Number: string
    Box_x0020_Number: string
    Beginning_x0020_Date_x0020_of_x0020_Records: string
    Ending_x0020_Date_x0020_of_x0020: string
    Retention_x0020_Category: string
    Permanent: string
    Permanent_x0020_Review_x0020_Period: string
    Retention: string
    Department_x0020_Number: number
    Department_x0020_name: string
    Department_x0020_Phone_x0020_Number: string
    Name_x0020_of_x0020_Person_x0020_Preparing_x0020_Records_x0020_for_x0020_Storage: string
    Name_x0020_of_x0020_Person_x0020_Responsable_x0020_for_x0020_Records_x0020_in_x0020_the_x0020_Department: string
    Department_x0020_Address: string
    Department_x0020_College: string
    Date_x0020_of_x0020_Prep_x002e_: string
    Special_x0020_Pickup_x0020_Instructions: string
    Box_x0020_Description: string
    Review_x0020_Date: string
    Changed: string
}

export interface IStagedBoxPendingArchivalDTO {
    Box_x0020_Description: string
    Beginning_x0020_Date_x0020_of_x0020_Records: string
    Ending_x0020_Date_x0020_of_x0020_Records: string
    Retention_x0020_Category: string
    Department_x0020_name: string
    Expected_x0020_Archival_x0020_Status: string
}

export interface IFullRetentionCategory {
    id: number
    period: string
    permanent: string
    permanentReviewPeriod: string
    retentionCategory: string
    retentionFunction: string
    expectedArchivalStatus: string
}

export interface IFullRetentionCategoryDTO {
    Record_x0020_Category: string
    PERM: string
    Period: string
    Perm_x0020_Review_x0020_Period: string
    Record_x0020_Category_x0020_ID: number
    Function: string,
    Expected_x0020_Archival_x0020_St: string
}

export interface IDepartmentDataDTO {
    Department_x0020_Number: string
    Department_x0020_Name: string
    Department_x0020_Phone_x0020_Num: string
    Department_x0020_Address: string
    Department_x0020_College: string
    Person_x0020_Responsible_x0020_f: string
}

export interface IFullDepartmentData {
    departmentNumber: string
    departmentName: string
    departmentPhone: string
    departmentAddress: string
    departmentCollege: string
    responsiblePersonName: string
}
