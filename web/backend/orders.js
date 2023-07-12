import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import Shopify from 'shopify-api-node';
import ngrok from 'ngrok';
import axios from 'axios';
import xml2js from 'xml2js';
import { GraphQLClient, gql } from 'graphql-request';
import { Headers } from 'cross-fetch';

global.Headers = global.Headers || Headers;

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

  const endpoint = 'https://zatca.myshopify.com/admin/api/2023-07/graphql.json';

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': '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',
    },
  });

  const orderId = req.body.FulfillmentOrder.id;

  const query = gql`
  query getOrder($orderId: ID!) {
    order(id: $orderId) {
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
`;

  const order_Id = req.body.id;
  const created_at = req.body.created_at;
  const current_subtotal_price = req.body.current_subtotal_price;
  const billing_address = JSON.stringify(req.body.billing_address);
  const customer_id = req.body.customer.id;

  console.log('POST Fulfillment created:');
  console.log(`Fulfillment ID: ${order_Id}`);
  console.log(`Created_at: ${created_at}`);
  console.log(`Current_subtotal_price: ${current_subtotal_price}`);
  console.log(`Billing_address: ${billing_address}`);
  console.log(`Customer_id: ${customer_id}`);
  console.log(`************************************************************************************************`);

  try {
    const queryData = await graphQLClient.request(query, { orderId: orderId });
    const order = queryData.order;

    if (order) {
      const orderId = order.id;
      const metafields = order.metafields.edges;

      console.log('Order ID:', orderId);
      console.log('Metafields:');
      metafields.forEach((metafield) => {
        const { key, value } = metafield.node;
        console.log('Key:', key);
        console.log('Value:', value);
      });

      res.status(200).send('Webhook received successfully');
    } else {
      res.status(404).send('Order not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }


});

app.get('/webhook', (req, res) => {
  console.log("GET Webhook");
  res.status(200).send('This is the GET Webhook');// Respond with a success status code
});

app.listen(port, async () => {
  // const url = await ngrok.connect(port);
  console.log(`Server is running on ${port}`);
});




// var isFull = await client.query({
        
//   data: `{
//     product(id: "${shopifyId}") {
//        id
//        title
//        metafield(namespace:"custom", key:"myMetafield") {
//          value
//        }
//       }
//     }`
// });