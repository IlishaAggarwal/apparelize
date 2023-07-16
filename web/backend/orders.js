import express from 'express';
import bodyParser from 'body-parser';
import Shopify from 'shopify-api-node';
import axios from 'axios';
import { GraphQLClient, gql } from 'graphql-request';
import { Headers } from 'cross-fetch';
import * as fs from 'fs';

global.Headers = global.Headers || Headers;

const app = express();

app.use(bodyParser.json());

const port = 3000;
const shopName = 'zatca';
const apiKey = '7bab45f566f95032d9612d70f6ae3fb8';
const password = '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';
const endpoint = 'https://zatca.myshopify.com/admin/api/2023-07/graphql.json';
const headers = {
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': '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',
  'Accept': 'application/json'
};
const graphQLClient = new GraphQLClient(endpoint, { headers });

// Order Fulfillment Completed
app.post('/fulfillment', async (req, res) => {
  console.log(req.body, '\n');

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
    console.log('KSA API Response, Invoice ID:', response.data.Data.InvoiceID);

    const base64 = response.data.Data.QRString
    const buffer = Buffer.from(base64, "base64");
    const order_id_qrimage_file = response.data.Data.InvoiceID
    const qrFile_path = order_id_qrimage_file + "_order_fulfillment.jpg";
    fs.writeFileSync(qrFile_path, buffer);

    // Use the extracted data to construct the GraphQL mutation
    const metafieldKey = 'qr_code';
    const metafieldNamespace = 'custom'; // You can choose your desired namespace

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
    const variables = {
      "metafields": [
        {
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

    const query = gql`
    query {
      orders({id: "gid://shopify/Order/5363696894225" }: ID!) {
        edges {
          node {
            id
            metafields(first: 10) {
              edges {
                node {
                  namespace
                  key
                  value
                }
              }
            }
          }
        }
      }
    }
  `;

    // Perform the GraphQL mutation to update the order's metafield
    try {
      const graphqlResponse = await graphQLClient.request(mutation, variables);
      console.log(JSON.stringify(graphqlResponse))
      // console.log('Metafield successfully updated:', graphqlResponse.metafieldUpsert.metafield);
    } catch (error) {
      console.error('Error updating metafield:', error);
    }
  } catch (ksaError) {
    console.error('Error making the KSA API request:', ksaError);
  }
});

app.post('/refund', async (req, res) => {
  console.log(req.body);
  console.log(req.body.admin_graphql_api_id)

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
    console.log('KSA API Response, Invoice ID:', response.data.Data.InvoiceID);

    const base64 = response.data.Data.QRString
    const buffer = Buffer.from(base64, "base64");
    const order_id_qrimage_file = response.data.Data.InvoiceID
    const qrFile_path = order_id_qrimage_file + "_order_refund.jpg";
    fs.writeFileSync(qrFile_path, buffer);

    // Use the extracted data to construct the GraphQL mutation
    const metafieldKey = 'qr_image';
    const metafieldNamespace = 'custom'; // You can choose your desired namespace

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

    const variables = {
      "metafields": [
        {
          "key": "qr_image",
          "namespace": "custom",
          "ownerId": `${req.body.admin_graphql_api_id}`,
          // "type": "single_line_text_field",
          "value": qrFile_path
        },
        {
          "key": "invoice_id",
          "namespace": "custom",
          "ownerId": `${req.body.admin_graphql_api_id} `,
          // "type": "single_line_text_field",
          "value": `${response.data.Data.InvoiceID} `
        }
      ]
    }

    const query = gql`
    query {
    orders({ id: "gid://shopify/Order/5363696894225" }: ID!) {
        edges {
          node {
          id
          metafields(first: 10) {
              edges {
                node {
                namespace
                key
                value
              }
            }
          }
        }
      }
    }
  }
  `;

    // Perform the GraphQL mutation to update the order's metafield
    try {
      const graphqlResponse = await graphQLClient.request(mutation, variables);
      console.log(JSON.stringify(graphqlResponse))
      console.log('Metafield successfully updated:', graphqlResponse.metafieldUpsert.metafield);
    } catch (error) {
      console.error('Error updating metafield:', error);
    }
  } catch (ksaError) {
    // Handle the KSA API POST error
    console.error('Error making the KSA API request:', ksaError);
  }
});


app.listen(port, async () => {
  // const url = await ngrok.connect(port);
  console.log(`Server is running on ${port} `);
});