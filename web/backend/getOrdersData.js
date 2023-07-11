import { GraphQLClient, gql } from 'graphql-request';
import { Headers } from 'cross-fetch';

global.Headers = global.Headers || Headers;

export async function getOrdersData() {
  const endpoint = 'https://zatca.myshopify.com/admin/api/2023-07/graphql.json';

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': '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',
    },
  });

  const query = gql`
    query {
      orders(first: 10) {
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

  // const queryData = await graphQLClient.request(query);
  // console.log(queryData)
  // return queryData; // Return the JSON data instead of logging it

  try {
    const queryData = await graphQLClient.request(query);
    const orders = queryData.orders.edges;

    // Loop through the orders and access the values
    orders.forEach((order) => {
      const orderId = order.node.id;
      const metafields = order.node.metafields.edges;

      console.log('Order ID:', orderId);
      console.log('Metafields:', metafields);
    });

    return queryData;
  } catch (error) {
    console.error(error);
    throw error;
  }

}
getOrdersData();