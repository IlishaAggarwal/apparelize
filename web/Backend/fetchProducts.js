import Shopify from 'shopify-api-node';



const shopify = new Shopify({
  shopName: shopName,
  apiKey: apiKey,
  password: password
});

const fetchProductDetails = async () => {
  try {
    const products = await shopify.product.list();
    console.log(products);
  } catch (err) {
    console.error(err);
  }
};
  
  fetchProductDetails();
