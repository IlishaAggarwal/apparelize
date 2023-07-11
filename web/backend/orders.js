import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import Shopify from 'shopify-api-node';
import ngrok from 'ngrok';
import axios from 'axios';
import xml2js from 'xml2js';

const app = express();
const port = 3000;

app.use(bodyParser.json());

const corsOptions = {
  origin: 'https://stated-comp-aquatic-chat.trycloudflare.com', // Replace with your frontend origin
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

const shopName = 'zatca';
const apiKey = '7bab45f566f95032d9612d70f6ae3fb8';
const password = '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';

const shopify = new Shopify({
  shopName: shopName,
  apiKey: apiKey,
  password: password
});

app.post('/webhook', async (req, res) => {
  try {
    const fulfillmentId = req.body.id;
    const created_at = req.body.created_at;
    const current_subtotal_price = req.body.current_subtotal_price;
    const billed_to = req.body.billing_address.first_name;
    const customer_id = req.body.customer.id;

    console.log('POST Fulfillment created:');
    console.log(`Fulfillment ID: ${fulfillmentId}`);
    console.log(`Created_at: ${created_at}`);
    console.log(`Current_subtotal_price: ${current_subtotal_price}`);
    console.log(`Billed_to: ${billed_to}`);
    console.log(`Customer_id: ${customer_id}`);
    // res.status(200).send(req.body);

    const xmlData =
      `<Invoice>
    <Uniquekey>9897634121</Uniquekey>
    <InvoiceNo>97654321221</InvoiceNo>
    <InvoiceDate>2023-04-20</InvoiceDate>
    <InvoiceTime>23:50:09</InvoiceTime>
    <InvoiceTypeCode>1</InvoiceTypeCode>
    <IsThirdPartyInvoice>0</IsThirdPartyInvoice>
    <IsNominalInvoice>0</IsNominalInvoice>
    <IsExportInvoice>0</IsExportInvoice>
    <IsSummaryInvoice>0</IsSummaryInvoice>
    <IsSelfBilledInvoice>0</IsSelfBilledInvoice>
    <Remarks>VAT-C1-VAT-C1-1172187349-0 Due Date 15-03-2022 /Installments SC-</Remarks>
    <InvoiceCurrencyCode>SAR</InvoiceCurrencyCode>
    <TaxCurrencyCode>SAR</TaxCurrencyCode>
    <PONumber>1172187349</PONumber>
    <Reference>
        <OriginalInvoiceNumber>123</OriginalInvoiceNumber>
        <OriginalInvoiceDate/>
        <InstructionNote>DFF</InstructionNote>
    </Reference>
    <ContractNumber>0114409666</ContractNumber>
    <SellerID></SellerID>
    <SellerIDType>VAT</SellerIDType>
    <SellerGroupVatNo></SellerGroupVatNo>
    <SellerStreetName>Thumamah Road</SellerStreetName>
    <SellerAdditionalStreetName>King Abdallah Road</SellerAdditionalStreetName>
    <SellerBuildingNumber>1234</SellerBuildingNumber>
    <SellerPlotIdentification>6771</SellerPlotIdentification>
    <SellerCityName>Riyadh</SellerCityName>
    <SellerPostalZone>11517</SellerPostalZone>
    <SellerCountrySubentity>Saudi Arabia</SellerCountrySubentity>
    <SellerCitySubdivisionName>Thumamah</SellerCitySubdivisionName>
    <SellerCountryCode>SA</SellerCountryCode>
    <SellerVatNumber>312345678900003</SellerVatNumber>
    <SellerRegistrationName>Vestige Marketing Pvt. Ltd.</SellerRegistrationName>
    <BuyerIDType></BuyerIDType>
    
    <BuyerGroupVatNo></BuyerGroupVatNo>
    <BuyerStreetName>24351,مكة</BuyerStreetName>
    <BuyerAdditionalStreetName>-</BuyerAdditionalStreetName>
    <BuyerBuildingNumber>-</BuyerBuildingNumber>
    <BuyerPlotIdentification>1234</BuyerPlotIdentification>
    <BuyerCityName>Riyadh</BuyerCityName>
    <BuyerPostalZone>12345</BuyerPostalZone>
    <BuyerCountrySubentity>SA</BuyerCountrySubentity>
    <BuyerCitySubdivisionName>-</BuyerCitySubdivisionName>
    <BuyerCountryCode>SA</BuyerCountryCode>
    <BuyerVATNumber>323456789123453</BuyerVATNumber>
    <BuyerRegistrationName>ALYA ABDELAZIZ</BuyerRegistrationName>
    <ConversionRate>0</ConversionRate>
    <Delivery>
        <ActualDeliveryDate>2022-03-09</ActualDeliveryDate>
        <LatestDeliveryDate>2022-03-10</LatestDeliveryDate>
    </Delivery>
    <PaymentMeans>
        <PaymentMeansCode>25</PaymentMeansCode>
        <PaymentNote>Certified cheque</PaymentNote>
    </PaymentMeans>
    <InvoiceDeductions>
        <AllowanceChargeReason/>
        <Amount>0</Amount>
        <BaseAmount>0</BaseAmount>
        <Percent>0</Percent>
        <TaxCategoryCode/>
        <TaxPercent/>
    </InvoiceDeductions>
    <InvoiceLine>
        <Sno>1</Sno>
        <Quantity>1</Quantity>
        <UoM>EA</UoM>
        <LineAmountWithoutVAT>0</LineAmountWithoutVAT>
        <ItemName>Premium القـسـط</ItemName>
        <SellerItemCode/>
        <BuyerItemCode/>
        <StandardItemCode/>
        <TaxCategoryCode>S</TaxCategoryCode>
        <TaxExemptionReasonCode/>
        <Percent>15</Percent>
        <ItemPrice>0</ItemPrice>
        <ItemBaseQuantity>1</ItemBaseQuantity>
        <ItemBaseUoM>EA</ItemBaseUoM>
        <Deductions>
            <Percent>0</Percent>
            <Amount>0</Amount>
            <BaseAmount/>
            <AllowanceChargeReason/>
        </Deductions>
        <Tax>
            <TaxAmount>0</TaxAmount>
        </Tax>
        <ItemDeductions>
            <Percent>0</Percent>
            <Amount>0</Amount>
            <BaseAmount>0</BaseAmount>
            <AllowanceChargeReason/>
        </ItemDeductions>
    </InvoiceLine>
</Invoice>`

    // Convert the XML data to string
    const xmlBuilder = new xml2js.Builder();
    const xmlString = xmlBuilder.buildObject(xmlData);

    // Set the headers to specify the content type as XML
    const headers = {
      'Content-Type': 'application/xml'
    };

    // Send the XML data to your API
    const response = await axios.post('http://103.181.108.101/ksa/v1.01/GenEinvoice?mappingName=KSAEInvoiceMapping&getXML=1&getQRImage=0', xmlString, { headers });

    console.log('API Response:', response.data);

    res.status(200).send(req.body);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/webhook', (req, res) => {


  // Handle the webhook event

  console.log();

  // Perform any desired actions with the order details

  res.status(200).send('This is the GET Webhook');// Respond with a success status code
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await shopify.order.list();
    // res.setHeader('Access-Control-Allow-Origin', '*'); // Set the CORS header
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred' });
  }
});


app.listen(port, async () => {
  // const url = await ngrok.connect(port);
  console.log(`Server is running on ${port}`);
});
