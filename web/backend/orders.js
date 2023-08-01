import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import { GraphQLClient, gql } from 'graphql-request';
import { Headers } from 'cross-fetch';
import FormData from 'form-data';
import * as fs from 'fs';
import { promises as fsp } from 'fs';
import { createReadStream } from 'fs';
import pdfFonts from "pdfmake/build/vfs_fonts.js";
import nodemailer from "nodemailer";
import { Buffer } from "buffer";
import pkg from 'pdf-lib';
const { PDFDocument, PDFEmbeddedFile } = pkg;
import pdfMake from 'pdfmake/build/pdfmake.js';
import vfsFonts from 'pdfmake/build/vfs_fonts.js';

const { vfs } = vfsFonts.pdfMake;
pdfMake.vfs = vfs;


global.Headers = global.Headers || Headers;

const shopName = 'zatca';
const apiKey = '7bab45f566f95032d9612d70f6ae3fb8';
const password = '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';

const app = express();

app.use(bodyParser.json());

const port = 3001;
const endpoint = 'https://zatca.myshopify.com/admin/api/2023-07/graphql.json';
const headers = {
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': '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',
  'Accept': 'application/json'
};
const graphQLClient = new GraphQLClient(endpoint, { headers });

// Order Fulfillment 
app.post('/fulfillment', async (req, res) => {
  // Get the current date and time
  const currentDate = new Date();

  // Extracting individual components from the Date object
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // Note: Months are 0-indexed, so we add 1 to get the correct month (January is 0, February is 1, and so on).
  const day = currentDate.getDate();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();

  // Store the current date and time in separate variables
  const currentDateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  const currentTimeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // console.log("Current Date:", currentDateStr);
  // console.log("Current Time:", currentTimeStr);

  //actual delivery date
  const timestamp = req.body.closed_at;

  // Create a Date object from the timestamp string
  const dateObj = new Date(timestamp);

  // Extracting date and time from the Date object
  const date = dateObj.toISOString().substring(0, 10); // "2023-07-31"

  console.log(req.body, '\n');

  const jsonData =
  {
    "Invoice": {
      "Uniquekey": 9897634121,
      "InvoiceNo": req.body.id,
      "InvoiceDate": currentDateStr,
      "InvoiceTime": currentTimeStr,
      "InvoiceTypeCode": 2,
      "IsThirdPartyInvoice": 0,
      "IsNominalInvoice": 0,
      "IsExportInvoice": 0,
      "IsSummaryInvoice": 0,
      "IsSelfBilledInvoice": 0,
      "Remarks": "VAT-C1-VAT-C1-1172187349-0 Due Date 15-03-2022 /Installments SC-",
      "InvoiceCurrencyCode": "SAR",
      "TaxCurrencyCode": "SAR",
      "PONumber": 1172187349,
      "Reference": {
        "OriginalInvoiceNumber": 123,
        "OriginalInvoiceDate": "",
        "InstructionNote": "DFF"
      },
      "ContractNumber": 114409666,
      "SellerID": "",
      "SellerIDType": "VAT",
      "SellerGroupVatNo": "",
      "SellerStreetName": "Thumamah Road",
      "SellerAdditionalStreetName": "King Abdallah Road",
      "SellerBuildingNumber": 1234,
      "SellerPlotIdentification": 6771,
      "SellerCityName": "Riyadh",
      "SellerPostalZone": 11517,
      "SellerCountrySubentity": "Saudi Arabia",
      "SellerCitySubdivisionName": "Thumamah",
      "SellerCountryCode": "SA",
      "SellerVatNumber": 300189262500003,
      "SellerRegistrationName": "Vestige Marketing Pvt. Ltd.",
      "BuyerIDType": "",
      "BuyerGroupVatNo": "123",
      "BuyerAdditionalStreetName": "-",
      "BuyerBuildingNumber": "-",
      "BuyerPlotIdentification": 1234,
      "BuyerCityName": "Riyadh",
      "BuyerPostalZone": 96325,
      "BuyerCountrySubentity": "SA",
      "BuyerCitySubdivisionName": "-",
      "BuyerCountryCode": "SA",
      "BuyerVATNumber": 323456789123453,
      "BuyerRegistrationName": req.body.customer.first_name,
      "ConversionRate": 0,
      "Delivery": {
        "ActualDeliveryDate": date,
        "LatestDeliveryDate": "2022-03-10"
      },
      "PaymentMeans": {
        "PaymentMeansCode": 25,
        "PaymentNote": "Certified cheque"
      },
      "InvoiceDeductions": {
        "AllowanceChargeReason": "",
        "Amount": req.body.total_discounts,
        "BaseAmount": 0,
        "Percent": 0,
        "TaxCategoryCode": "",
        "TaxPercent": ""
      },
      "InvoiceLine": {
        "Sno": 1,
        "Quantity": 1,
        "UoM": "EA",
        "LineAmountWithoutVAT": 0,
        "ItemName": "Premium القـسـط",
        "SellerItemCode": "",
        "BuyerItemCode": "",
        "StandardItemCode": "",
        "TaxCategoryCode": "S",
        "TaxExemptionReasonCode": "",
        "Percent": 15,
        "ItemPrice": 0,
        "ItemBaseQuantity": 1,
        "ItemBaseUoM": "EA",
        "Deductions": {
          "Percent": 0,
          "Amount": 0,
          "BaseAmount": "",
          "AllowanceChargeReason": ""
        },
        "Tax": {
          "TaxAmount": req.body.total_tax
        },
        "ItemDeductions": {
          "Percent": 0,
          "Amount": 0,
          "BaseAmount": 0,
          "AllowanceChargeReason": ""
        }
      }
    }
  }
    ;

  console.log(jsonData)

  try {
    // Make the KSA API request using the relevant data
    const response = await axios.post('http://103.181.108.101/ksa/v1.01/GenEinvoice?mappingName=KSAEInvoiceMapping&getXML=1&getQRImage=1', jsonData, { headers });

    // console.log('API Response', response.data);
    console.log('KSA API Response:', response.data), '\n';

    const base64 = response.data.Data.QRString
    const qrCodeDataURL = "data:image/png;base64," + base64;

    const buffer = Buffer.from(base64, "base64");


    const order_id_qrimage_file = response.data.Data.InvoiceID
    const qrFile_path = order_id_qrimage_file + "_order_fulfillment.jpg";
    fs.writeFileSync(qrFile_path, buffer);

    const file = await fsp.readFile(qrFile_path); // filename to a staged target.
    const fileSize = fs.statSync(qrFile_path).size;

    const STAGED_UPLOADS_CREATE = gql`
  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        resourceUrl
        url
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
    const stagedVariable = {
      "input": [
        {
          "filename": qrFile_path,
          "mimeType": "image/jpg",
          "httpMethod": "POST",
          "resource": "FILE"
        },
      ]
    }


    const fileCreate = gql`
mutation fileCreate($files: [FileCreateInput!]!) {
fileCreate(files: $files) {
  files {
    alt
    createdAt
    id
  }
  userErrors {
      field
      message
    }
}
}
`
    const mutation = gql`
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
    metafields {
      key
      namespace
      value
      createdAt
      updatedAt
    }
    userErrors {
      field
      message
      code
    }
  }
}
`;

    try {
      const stagedUploadsQueryResult = await graphQLClient.request(STAGED_UPLOADS_CREATE, stagedVariable);

      const target =
        stagedUploadsQueryResult.stagedUploadsCreate.stagedTargets[0];
      const params = target.parameters; // Parameters contain all the sensitive info we'll need to interact with the aws bucket.
      const url = target.url; // This is the url you'll use to post data to aws or google. It's a generic s3 url that when combined with the params sends your data to the right place.
      const resourceUrl = target.resourceUrl; // This is the specific url that will contain your image data after you've uploaded the file to the aws staged target.

      // Generate a form, add the necessary params and append the file.
      // Must use the FormData library to create form data via the server.
      const form = new FormData();

      // Add each of the params we received from Shopify to the form. this will ensure our ajax request has the proper permissions and s3 location data.
      params.forEach(({ name, value }) => {
        form.append(name, value);
      });

      // Add the file to the form.
      form.append("file", file);

      // Headers
      const headers = {
        ...form.getHeaders(), // Pass the headers generated by FormData library. It'll contain content-type: multipart/form-data. It's necessary to specify this when posting to aws.
      };
      if (url.includes("amazon")) {
        // Need to include the content length for Amazon uploads. If uploading to googleapis then the content-length header will break it.
        headers["Content-Length"] = fileSize + 5000; // AWS requires content length to be included in the headers. This may not be automatically passed so you'll need to specify. And ... add 5000 to ensure the upload works. Or else there will be an error saying the data isn't formatted properly.
      }
      await axios.post(url, form, {
        headers
      });


      const createFileVariables = {
        files: {
          alt: "QR Image",
          contentType: "IMAGE",
          originalSource: resourceUrl, // Pass the resource url we generated above as the original source. Shopify will do the work of parsing that url and adding it to files.
        },
      };

      const fileCreateData = await graphQLClient.request(fileCreate, createFileVariables);
      // console.log("THISISFILEBODY");
      // console.log(JSON.stringify(fileCreateData))
      const variables = {
        "metafields": [
          {
            "key": "qr_image",
            "namespace": "custom",
            "ownerId": `${req.body.admin_graphql_api_id}`,
            // "type": "file",
            "value": fileCreateData.fileCreate.files[0].id

          }, {
            "key": "qr_code",
            "namespace": "custom",
            "ownerId": `${req.body.admin_graphql_api_id}`,
            // "type": "single_line_text_field",
            "value": `${response.data.Data.QRString}`
          },
          {
            "key": "invoice_id",
            "namespace": "custom",
            "ownerId": `${req.body.admin_graphql_api_id}`,
            // "type": "single_line_text_field",
            "value": `${response.data.Data.InvoiceID}`
          }
        ]
      }

      const graphqlResponse = await graphQLClient.request(mutation, variables);
      // console.log(JSON.stringify(graphqlResponse))
      let invoiceData = req.body;

      const invoice = {
        invoiceID: invoiceData.id,
        invoiceDate: invoiceData.created_at,
        dueDate: invoiceData.closed_at,
        customerID: invoiceData.customer.id,
        customerName: invoiceData.customer.first_name + ' ' + invoiceData.customer.last_name,
        customerEmail: invoiceData.customer.email,
        billingAddress: {
          streetAddress: invoiceData.billing_address.address1,
          city: invoiceData.billing_address.city,
          state: invoiceData.billing_address.province,
          country: invoiceData.billing_address.country,
          postalCode: invoiceData.billing_address.zip,
        },
        shippingAddress: {
          streetAddress: invoiceData.shipping_address.address1,
          city: invoiceData.shipping_address.city,
          state: invoiceData.shipping_address.province,
          country: invoiceData.shipping_address.country,
          postalCode: invoiceData.shipping_address.zip,
        },
        invoiceTotal: invoiceData.total_price,
        currency: invoiceData.currency,
        items: invoiceData.line_items.map(item => ({
          productID: item.product_id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: (item.quantity * item.price).toFixed(2),
        })),
        qrCodeBase64: qrCodeDataURL

      };
      let xmlData = `<?xml version="1.0" encoding="UTF-8"?>
      <invoice>
          <invoiceID>12345</invoiceID>
          <customerID>98765</customerID>
      </invoice>`;

      // console.log(invoice)
      console.log("Trying to send Email!")
      // console.log(req.body)
      generateAndSendInvoice(invoice, xmlData).catch(console.error);

      // return;

    } catch (error) {
      console.error('Error updating metafield:', error);
    }
    // finally {
    res.sendStatus(200);

    // }


  } catch (ksaError) {
    console.error('Error making the KSA API request:', ksaError);
    res.sendStatus(500);
  }
});

//Refund created
app.post('/refund', async (req, res) => {

  const jsonData =
  {
    "Invoice": {
      "Uniquekey": 9897634121,
      "InvoiceNo": req.body.id,
      "InvoiceDate": "2023-04-20",
      "InvoiceTime": "23:50:09",
      "InvoiceTypeCode": 6,
      "IsThirdPartyInvoice": 0,
      "IsNominalInvoice": 0,
      "IsExportInvoice": 0,
      "IsSummaryInvoice": 0,
      "IsSelfBilledInvoice": 0,
      "Remarks": "VAT-C1-VAT-C1-1172187349-0 Due Date 15-03-2022 /Installments SC-",
      "InvoiceCurrencyCode": "SAR",
      "TaxCurrencyCode": "SAR",
      "PONumber": 1172187349,
      "Reference": {
        "OriginalInvoiceNumber": 123,
        "OriginalInvoiceDate": "",
        "InstructionNote": "DFF"
      },
      "ContractNumber": 114409666,
      "SellerID": "",
      "SellerIDType": "VAT",
      "SellerGroupVatNo": "",
      "SellerStreetName": "Thumamah Road",
      "SellerAdditionalStreetName": "King Abdallah Road",
      "SellerBuildingNumber": 1234,
      "SellerPlotIdentification": 6771,
      "SellerCityName": "Riyadh",
      "SellerPostalZone": 11517,
      "SellerCountrySubentity": "Saudi Arabia",
      "SellerCitySubdivisionName": "Thumamah",
      "SellerCountryCode": "SA",
      "SellerVatNumber": 300189262500003,
      "SellerRegistrationName": "Vestige Marketing Pvt. Ltd.",
      "BuyerIDType": "",
      "BuyerGroupVatNo": "",
      "BuyerStreetName": "123 Refund Street",
      "BuyerAdditionalStreetName": "-",
      "BuyerBuildingNumber": "-",
      "BuyerPlotIdentification": 1234,
      "BuyerCityName": "Riyadh",
      "BuyerPostalZone": 12345,
      "BuyerCountrySubentity": "SA",
      "BuyerCitySubdivisionName": "-",
      "BuyerCountryCode": "SA",
      "BuyerVATNumber": 323456789123453,
      "BuyerRegistrationName": "Alia",
      "ConversionRate": 0,
      "Delivery": {
        "ActualDeliveryDate": "2022-03-09",
        "LatestDeliveryDate": "2022-03-10"
      },
      "PaymentMeans": {
        "PaymentMeansCode": 25,
        "PaymentNote": "Certified cheque"
      },
      "InvoiceDeductions": {
        "AllowanceChargeReason": "",
        "Amount": 0,
        "BaseAmount": 0,
        "Percent": 0,
        "TaxCategoryCode": "",
        "TaxPercent": ""
      },
      "InvoiceLine": {
        "Sno": 1,
        "Quantity": 1,
        "UoM": "EA",
        "LineAmountWithoutVAT": 0,
        "ItemName": "Premium القـسـط",
        "SellerItemCode": "",
        "BuyerItemCode": "",
        "StandardItemCode": "",
        "TaxCategoryCode": "S",
        "TaxExemptionReasonCode": "",
        "Percent": 15,
        "ItemPrice": 0,
        "ItemBaseQuantity": 1,
        "ItemBaseUoM": "EA",
        "Deductions": {
          "Percent": 0,
          "Amount": 0,
          "BaseAmount": "",
          "AllowanceChargeReason": ""
        },
        "Tax": {
          "TaxAmount": 0
        },
        "ItemDeductions": {
          "Percent": 0,
          "Amount": 0,
          "BaseAmount": 0,
          "AllowanceChargeReason": ""
        }
      }
    }
  }
    ;

  try {
    // Make the KSA API request using the relevant data
    const response = await axios.post('http://103.181.108.101/ksa/v1.01/GenEinvoice?mappingName=KSAEInvoiceMapping&getXML=1&getQRImage=1', jsonData, { headers });

    // console.log('API Response', response.data);
    console.log('KSA API Respons:', response), '\n';

    const base64 = response.data.Data.QRString
    const buffer = Buffer.from(base64, "base64");
    console.log(`Buffer ${buffer}`)
    const order_id_qrimage_file = response.data.Data.InvoiceID
    const qrFile_path = order_id_qrimage_file + "_order_refund.jpg";
    fs.writeFileSync(qrFile_path, buffer);

    const file = await fsp.readFile(qrFile_path); // filename to a staged target.
    const fileSize = fs.statSync(qrFile_path).size;

    const STAGED_UPLOADS_CREATE = gql`
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          resourceUrl
          url
          parameters {
            name
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
    const stagedVariable = {
      "input": [
        {
          "filename": qrFile_path,
          "mimeType": "image/jpg",
          "httpMethod": "POST",
          "resource": "FILE"
        },
      ]
    }


    const fileCreate = gql`
  mutation fileCreate($files: [FileCreateInput!]!) {
  fileCreate(files: $files) {
    files {
      alt
      createdAt
      id
    }
    userErrors {
        field
        message
      }
  }
  }
  `
    const mutation = gql`
      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
      metafields {
        key
        namespace
        value
        createdAt
        updatedAt
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  `;

    try {
      const stagedUploadsQueryResult = await graphQLClient.request(STAGED_UPLOADS_CREATE, stagedVariable);

      const target =
        stagedUploadsQueryResult.stagedUploadsCreate.stagedTargets[0];
      const params = target.parameters; // Parameters contain all the sensitive info we'll need to interact with the aws bucket.
      const url = target.url; // This is the url you'll use to post data to aws or google. It's a generic s3 url that when combined with the params sends your data to the right place.
      const resourceUrl = target.resourceUrl; // This is the specific url that will contain your image data after you've uploaded the file to the aws staged target.

      // Generate a form, add the necessary params and append the file.
      // Must use the FormData library to create form data via the server.
      const form = new FormData();

      // Add each of the params we received from Shopify to the form. this will ensure our ajax request has the proper permissions and s3 location data.
      params.forEach(({ name, value }) => {
        form.append(name, value);
      });

      // Add the file to the form.
      form.append("file", file);

      // Headers
      const headers = {
        ...form.getHeaders(), // Pass the headers generated by FormData library. It'll contain content-type: multipart/form-data. It's necessary to specify this when posting to aws.
      };
      if (url.includes("amazon")) {
        // Need to include the content length for Amazon uploads. If uploading to googleapis then the content-length header will break it.
        headers["Content-Length"] = fileSize + 5000; // AWS requires content length to be included in the headers. This may not be automatically passed so you'll need to specify. And ... add 5000 to ensure the upload works. Or else there will be an error saying the data isn't formatted properly.
      }
      await axios.post(url, form, {
        headers
      });


      const createFileVariables = {
        files: {
          alt: "QR Image",
          contentType: "IMAGE",
          originalSource: resourceUrl, // Pass the resource url we generated above as the original source. Shopify will do the work of parsing that url and adding it to files.
        },
      };

      const fileCreateData = await graphQLClient.request(fileCreate, createFileVariables);
      // console.log("THISISFILEBODY");
      // console.log(JSON.stringify(fileCreateData))
      const variables = {
        "metafields": [
          {
            "key": "qr_image",
            "namespace": "custom",
            "ownerId": `${req.body.admin_graphql_api_id}`,
            // "type": "file",
            "value": fileCreateData.fileCreate.files[0].id
          }, {
            "key": "qr_code",
            "namespace": "custom",
            "ownerId": `${req.body.admin_graphql_api_id}`,
            // "type": "single_line_text_field",
            "value": `${response.data.Data.QRString}`
          },
          {
            "key": "invoice_id",
            "namespace": "custom",
            "ownerId": `${req.body.admin_graphql_api_id}`,
            // "type": "single_line_text_field",
            "value": `${response.data.Data.InvoiceID}`
          }
        ]
      }

      const graphqlResponse = await graphQLClient.request(mutation, variables);
      console.log(JSON.stringify(graphqlResponse))
      // console.log('Metafield successfully updated:', graphqlResponse.metafieldUpsert.metafield);

      return;

    } catch (error) {
      console.error('Error updating metafield:', error);
    }
    generateAndSendInvoice().catch(console.error);
    res.sendStatus(200);

  } catch (ksaError) {
    console.error('Error making the KSA API request:', ksaError);
    res.sendStatus(500);
  }

});










async function generateInvoicePdf(invoice, xmlData) {

  let docDefinition = {
    content: [
      {
        columns: [
          [
            { text: `Invoice ID: ${invoice.invoiceID}`, style: 'header' },
            { text: `Date: ${invoice.invoiceDate}` },
            { text: `Due: ${invoice.dueDate}` },
            { text: '\n' },
            { text: `Customer ID: ${invoice.customerID}` },
            { text: `Customer: ${invoice.customerName}` },
            { text: `Email: ${invoice.customerEmail}` },
            { text: '\n' },
            { text: 'Billing Address:', style: 'subheader' },
            { text: `${invoice.billingAddress.streetAddress}` },
            { text: `${invoice.billingAddress.city}` },
            { text: `${invoice.billingAddress.state}` },
            { text: `${invoice.billingAddress.country}` },
            { text: `${invoice.billingAddress.postalCode}` },
            { text: '\n' },
            { text: 'Shipping Address:', style: 'subheader' },
            { text: `${invoice.shippingAddress.streetAddress}` },
            { text: `${invoice.shippingAddress.city}` },
            { text: `${invoice.shippingAddress.state}` },
            { text: `${invoice.shippingAddress.country}` },
            { text: `${invoice.shippingAddress.postalCode}` },
          ],
          { image: invoice.qrCodeBase64, width: 130, margin: [0, 0, 20, 0], alignment: 'right' }
        ],
        columnGap: 10
      },
      { text: '\n' },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*', '*'],
          body: [
            ['Product ID', 'Product Name', 'Quantity', 'Price', 'Total Price'],
            ...invoice.items.map(item => [item.productID, item.productName, item.quantity, item.price, item.totalPrice]),
            ['', '', '', 'Total', invoice.invoiceTotal]
          ]
        },
        layout: 'lightHorizontalLines'
      }
    ],

    styles: {
      header: {
        fontSize: 18,
        bold: true
      },
      subheader: {
        fontSize: 15,
        bold: true
      }
    }
  };



  const pdfDocGenerator = pdfMake.createPdf(docDefinition);

  return new Promise((resolve, reject) => {
    pdfDocGenerator.getBase64(async function (base64String) {
      try {
        // Load the PDF created by pdfmake with pdf-lib
        const pdfBuffer = Buffer.from(base64String, 'base64');
        const pdfDoc = await PDFDocument.load(pdfBuffer);

        // Embed the XML data as an attachment
        //     let xmlData = `<?xml version="1.0" encoding="UTF-8"?>
        // <root>
        //     <element1>Text1</element1>
        //     <element2>Text2</element2>
        //     <element3>Text3</element3>
        // </root>`;

        // // Embed the XML data as an attachment
        // const xmlBuffer = Buffer.from(xmlData);
        // const xmlFile = PDFEmbeddedFile.from(pdfDoc, xmlBuffer, {
        //     fileName: 'data.xml',
        //     description: 'Some XML data',
        //     mimeType: 'application/xml',
        // });
        // pdfDoc.attach(xmlFile);

        // Save the modified PDF to a Buffer
        const modifiedPdfBuffer = await pdfDoc.save();
        resolve(modifiedPdfBuffer);
      } catch (error) {
        console.error('Error embedding XML:', error);
        reject(error);
      }
    });
  });
}


// Function to send the invoice PDF by email
async function sendInvoiceEmail(pdfBuffer, recipientEmail) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'aggarwalkartik55@gmail.com',
      pass: 'wnrrujfcllbseweo'
    }
  });

  let info = await transporter.sendMail({
    from: 'Apparelize Shopify Store',
    to: recipientEmail,
    subject: 'Your Invoice for your purchase at the Apparelize Shopify store',
    text: 'Please find attached your invoice.',
    attachments: [
      {
        filename: 'invoice.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  });

  console.log(`Message sent: ${info.messageId}`);
}


// Usage example
async function generateAndSendInvoice(invoiceData) {

  const recipientEmail = 'ilisha.aggarwal30@gmail.com';

  // Generate the invoice PDF
  const pdfBuffer = await generateInvoicePdf(invoiceData);

  // Send the invoice PDF by email
  await sendInvoiceEmail(pdfBuffer, recipientEmail);

  console.log('Invoice sent successfully');
}

// // Customer
// app.post('/customer', async (req, res) => {
//   const { customer } = req.body;
//   console.log(req.body)
//   const vatNumber = customer.metafields.custom.vat_number;
//   try {
//     const customer_creation = gql`
//     mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
//     metafieldsSet(metafields: $metafields) {
//     metafields {
//       key
//       namespace
//       value
//       createdAt
//       updatedAt
//     }
//     userErrors {
//       field
//       message
//       code
//     }
//   }
// }
// `;
//     const variables = {
//       "metafields": [
//         {
//           "key": "vat_number",
//           "namespace": "custom",
//           "ownerId": customer.id,
//           "value": vatNumber
//         }
//       ]
//     }
//     const graphqlResponse = await graphQLClient.request(customer_creation, variables);
//     // console.log(JSON.stringify(graphqlResponse))
//     res.sendStatus(200);
//   } catch (e) {
//     console.error('Error making the update request:', e);
//     res.sendStatus(500);
//   }
// });




app.listen(port, async () => {
  // const url = await ngrok.connect(port);
  console.log(`Server is running on ${port} `);
});