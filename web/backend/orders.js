import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import { GraphQLClient, gql } from 'graphql-request';
import { Headers } from 'cross-fetch';
import FormData from 'form-data';
import * as fs from 'fs';
import { promises as fsp } from 'fs';
import { createReadStream } from 'fs';

global.Headers = global.Headers || Headers;

const app = express();

app.use(bodyParser.json());

const port = 3000;
const endpoint = 'https://zatca.myshopify.com/admin/api/2023-07/graphql.json';
const headers = {
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': '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',
  'Accept': 'application/json'
};
const graphQLClient = new GraphQLClient(endpoint, { headers });

// Order Fulfillment 
app.post('/fulfillment', async (req, res) => {
  // console.log(req.body, '\n');

  const jsonData =
  {
    "Invoice": {
      "Uniquekey": 9897634121,
      "InvoiceNo": req.body.id,
      "InvoiceDate": "2023-04-20",
      "InvoiceTime": "23:50:09",
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
      "BuyerRegistrationName": "BRName",
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
    console.log('KSA API Response, Invoice ID:', response.data.Data.InvoiceID), '\n';

    const base64 = response.data.Data.QRString
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
      console.log("THISISFILEBODY");
      console.log(JSON.stringify(fileCreateData))
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

  } catch (ksaError) {
    console.error('Error making the KSA API request:', ksaError);
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
      console.log('KSA API Response, Invoice ID:', response.data.Data.InvoiceID), '\n';
  
      const base64 = response.data.Data.QRString
      const buffer = Buffer.from(base64, "base64");
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
        console.log("THISISFILEBODY");
        console.log(JSON.stringify(fileCreateData))
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
  
    } catch (ksaError) {
      console.error('Error making the KSA API request:', ksaError);
    }
});


app.listen(port, async () => {
  // const url = await ngrok.connect(port);
  console.log(`Server is running on ${port} `);
});