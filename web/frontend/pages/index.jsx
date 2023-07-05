import {
  Layout,
  Image,
  Link,
  Text,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";
import React, { useEffect, useState } from "react";
import { Page } from "@shopify/polaris";
import {Provider, ResourcePicker} from '@shopify/app-bridge-react';
// import ReactDOM from 'react-dom';
  


import { trophyImage } from "../assets";

import { ProductsCard } from "../components";


const productId = "11235813213455";
// `session` is built as part of the OAuth process
const client = new shopify.clients.Rest({session});
const product = await client.get({
  path: `products/${productId}`,
  query: {id: 1, title: "title"}
});


export default function HomePage() {
  const [open, setOpen] = useState(false);

  function handleSelection(resources) {
    const idsFromResources = resources.selection.map((product) => product.id);
    // Do something with the selected order ids
  }
  // const { t } = useTranslation();

  const fetchOrders = async () => {
    try {
      const orders = await shopify.order.list({ limit: 5 });
      console.log(orders);
    } catch (err) {
      console.error(err);
    }
  }
  
  fetchOrders();

  return (
    
    // <Page narrowWidth>
    //   <TitleBar title={t("HomePage.title")} primaryAction={null} />
    //   <Layout>
    //     <Layout.Section>
    //       <Card sectioned>
    //         <Stack
    //           wrap={false}
    //           spacing="extraTight"
    //           distribution="trailing"
    //           alignment="center"
    //         >
    //           <Stack.Item fill>
    //             <TextContainer spacing="loose">
    //               <Text as="h2" variant="headingMd">
    //                 {t("HomePage.heading")}
    //               </Text>
    //               <p>
    //                 <Trans
    //                   i18nKey="HomePage.yourAppIsReadyToExplore"
    //                   components={{
    //                     PolarisLink: (
    //                       <Link url="https://polaris.shopify.com/" external />
    //                     ),
    //                     AdminApiLink: (
    //                       <Link
    //                         url="https://shopify.dev/api/admin-graphql"
    //                         external
    //                       />
    //                     ),
    //                     AppBridgeLink: (
    //                       <Link
    //                         url="https://shopify.dev/apps/tools/app-bridge"
    //                         external
    //                       />
    //                     ),
    //                   }}
    //                 />
    //               </p>
    //               <p>{t("HomePage.startPopulatingYourApp")}</p>
    //               <p>
    //                 <Trans
    //                   i18nKey="HomePage.learnMore"
    //                   components={{
    //                     ShopifyTutorialLink: (
    //                       <Link
    //                         url="https://shopify.dev/apps/getting-started/add-functionality"
    //                         external
    //                       />
    //                     ),
    //                   }}
    //                 />
    //               </p>
    //             </TextContainer>
    //           </Stack.Item>
    //           <Stack.Item>
    //             <div style={{ padding: "0 20px" }}>
    //               <Image
    //                 source={trophyImage}
    //                 alt={t("HomePage.trophyAltText")}
    //                 width={120}
    //               />
    //             </div>
    //           </Stack.Item>
    //         </Stack>
    //       </Card>
    //     </Layout.Section>
    //     <Layout.Section>
    //       <ProductsCard />
    //     </Layout.Section>
    //   </Layout>
    // </Page>
   <div>
<h1>hello</h1>
  
    {/* <Provider config={config}>  */}
      <ResourcePicker resourceType="Order" open />
     {/* </Provider>  */}
    {/* <button type="button" onClick={() => setOpen(true)}>
        Select Orders
      </button>
      <ResourcePicker
        resourceType="Order"
        open={open}
        onCancel={() => setOpen(false)}
        onSelection={(resources) => handleSelection(resources)}
        showVariants={false}
      /> */}
   </div> 
    
    
  );
}



  