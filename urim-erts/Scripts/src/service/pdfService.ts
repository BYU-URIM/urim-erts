import * as createPdf from 'pdfmake-browserified'
import { Box, Request } from '../model/model';

declare const $: any

// returns an ArrayBuffer of the current form pdf
export async function currentFormToPDF(formData) {
    const docList = createDocList(formData)
    const bufferList = []
    for(let i = 0; i < docList.length; i++) {
        bufferList[i] = await getArrayBufferFromPDF(docList[i])
    }

    return bufferList;
}

function createDocList(form: Request) {
    return form.boxes.map((box: Box) => {

        // for each box, create a custom document definition and map the box to a pdf document object
        const docDefinition = {
            content: [
                        { text: 'Record Transfer Sheet', bold: true, alignment: 'center', margin: [0, 10, 0, 30], fontSize: 25 },
                        {
                            style: 'depInfoHeader',
                            columns: [
                                {text: 'University Records and Information Management', width: '33%', alignment: 'center'},
                                {text: '801-422-2828', width: '33%', alignment: 'center'},
                                {text: 'urim.byu.edu', width: '33%', alignment: 'center'}
                            ]
                        },
                        { text: 'Department Information', style: 'subheader' },
                        {
                            style: 'tableExample',
                            table: {
                                    widths: [120, 251, 120],
                                    body: [
                                            // row 1
                                            [
                                                {
                                                    stack: [
                                                        {text: 'Department Number', style: 'tableHeader'},
                                                        {text: `${form.batchData.departmentNumber}`, style: 'tableEntry' }
                                                    ]
                                                },
                                                {
                                                    stack: [
                                                        {text: 'Department Name', style: 'tableHeader'},
                                                        {text: `${form.batchData.departmentName}`, style: 'tableEntry' }
                                                    ]
                                                },
                                                {
                                                    stack: [
                                                        {text: 'Dep. Phone #', style: 'tableHeader'},
                                                        {text: `${form.batchData.departmentPhone}`, style: 'tableEntry' }
                                                    ]
                                                },
                                            ],
                                    ]
                            }
                        },
                        {
                            table: {
                                widths: [250, 250],
                                body: [
                                        // row 1
                                        [
                                            {
                                                stack: [
                                                    {text: 'Person Preparing Records for Storage', style: 'tableHeader'},
                                                    {text: `${form.batchData.prepPersonName}`, style: 'tableEntry' }
                                                ]
                                            },
                                            {
                                                stack: [
                                                    {text: 'Person Responsible for Records', style: 'tableHeader'},
                                                    {text: `${form.batchData.responsablePersonName}`, style: 'tableEntry' }
                                                ]
                                            },
                                        ],
                                ]
                            }
                        },
                        {
                            table: {
                                widths: [164, 163, 164],
                                body: [
                                        // row 1
                                        [
                                            {
                                                stack: [
                                                    {text: 'Department Address', style: 'tableHeader'},
                                                    {text: `${form.batchData.departmentAddress}`, style: 'tableEntry' }
                                                ]
                                            },
                                            {
                                                stack: [
                                                    {text: 'College / Division', style: 'tableHeader'},
                                                    {text: `${form.batchData.departmentCollege}`, style: 'tableEntry' }
                                                ]
                                            },
                                            {
                                                stack: [
                                                    {text: 'Date of Preparation', style: 'tableHeader'},
                                                    {text: `${form.batchData.dateOfPreparation}`, style: 'tableEntry' }
                                                ]
                                            },
                                        ],
                                ]
                            }
                        },

                        // box info tables
                        { text: 'Box Information', style: 'subheader', margin: [0, 35, 0, 5] },
                        {
                            style: 'tableExample',
                            table: {
                                    widths: [164, 163, 164],
                                    body: [
                                            // row 1
                                            [
                                                // {
                                                //     stack: [
                                                //         {text: 'Object #', style: 'tableHeader'},
                                                //         {text: `${box.objectNumber}`, style: 'tableEntry' }
                                                //     ]
                                                // },
                                                {
                                                    columns: [
                                                        { text: 'Object #', width: '35%', style: 'tableHeader' },
                                                        { text: `${box.objectNumber}`, style: 'largeTableEntry' }
                                                    ]
                                                },
                                                {
                                                    stack: [
                                                        {text: 'Beginning Date of Records', style: 'tableHeader'},
                                                        {text: `${box.beginningRecordsDate}`, style: 'tableEntry' }
                                                    ]
                                                },
                                                {
                                                    stack: [
                                                        {text: 'Ending Date of Records', style: 'tableHeader'},
                                                        {text: `${box.endRecordsDate}`, style: 'tableEntry' }
                                                    ]
                                                },
                                            ],
                                    ]
                            }
                        },
                        {
                            table: {
                                    widths: [164, 163, 164],
                                    body: [
                                            // row 1
                                            [
                                                {
                                                    stack: [
                                                        {text: 'Record Category', style: 'tableHeader'},
                                                        {text: `${box.retentionCategory || ' '}`, style: 'tableEntry' }
                                                    ]
                                                },
                                                {
                                                    stack: [
                                                        {text: 'Retention (years)', style: 'tableHeader'},
                                                        {text: `${box.retention || ' '}`, style: 'tableEntry' }
                                                    ]
                                                },
                                                {
                                                    stack: [
                                                        {text: 'Review Date', style: 'tableHeader'},
                                                        {text: `${box.reviewDate || ' '}`, style: 'tableEntry' }
                                                    ]
                                                },
                                            ],
                                    ]
                            }
                        },
                        {
                            style: 'tableExample',
                            table: {
                                    widths: [164, 163, 164],
                                    body: [
                                            // row 1
                                            [
                                                {
                                                    stack: [
                                                        {text: 'Permanent', style: 'tableHeader'},
                                                        {text: `${box.permanent || ' '}`, style: 'tableEntry' }
                                                    ]
                                                },
                                                {
                                                    stack: [
                                                        {text: 'Permanent Review Period', style: 'tableHeader'},
                                                        {text: `${box.permanentReviewPeriod || ' '}`, style: 'tableEntry' }
                                                    ]
                                                },
                                                {
                                                    stack: [
                                                        {text: 'Department Box Number', style: 'tableHeader'},
                                                        {text: `${box.boxNumber}`, style: 'tableEntry' }
                                                    ]
                                                }
                                            ],
                                    ]
                            }
                        },
                        {
                            table: {
                                widths: [509],
                                body: [
                                        // row 1
                                        [
                                            {
                                                stack: [
                                                    {text: 'Submitter Signature and Date', style: 'tableHeader'},
                                                    {text: `Digitally signed by ${form.batchData.prepPersonName} on ${form.batchData.dateOfPreparation}`, style: 'tableEntry' }
                                                ]
                                            }
                                        ],
                                ]
                            }
                        },
                        {
                            table: {
                                widths: [509],
                                body: [
                                        // row 1
                                        [
                                            {
                                                stack: [
                                                    {text: 'Approver Signature and Date', style: 'tableHeader'},
                                                    {text: `Digitally signed by ${form.batchData.approver} on ${form.batchData.approvalDate}`, style: 'tableEntry' }
                                                ]
                                            }
                                        ],
                                ]
                            }
                        },

                        // box description
                        { text: 'Box Description', bold: true, margin: [0, 20, 0, 5], fontSize: 14 },
                        { text: `${box.description}`, color: '#9D9D9D', bold: true },

            ],
            styles: {
                subheader: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 10, 0, 7]
                },
                tableHeader: {
                    bold: true,
                    fontSize: 11,
                },
                tableEntry: {
                    color: '#7F7D7D',
                    bold: true,
                    margin: [0, 4, 0, 0]
                },
                largeTableEntry: {
                    color: '#7F7D7D',
                    bold: true,
                    margin: [0, 0, 0, 0],
                    fontSize: 22
                },
                depInfoHeader: {
                    margin: [0, 10, 0, 10]
                }
            },
        }


        // each box maps to a document object
        return createPdf(docDefinition)
    })
}

function getArrayBufferFromPDF(docObject) {
    let bufferPromise = $.Deferred()

    docObject.getBuffer((bufferView) => {
        let buffer = bufferView.toArrayBuffer()
        buffer.byteLength ? bufferPromise.resolve(buffer) : bufferPromise.reject('error retrieving array buffer')
    })

    return bufferPromise.promise();
}
