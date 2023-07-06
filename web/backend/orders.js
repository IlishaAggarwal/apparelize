import express from 'express';
import cors from 'cors';
import Shopify from 'shopify-api-node';
import ngrok from 'ngrok';

const app = express();


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

const port = 3000;
app.listen(port, async () => {
  const url = await ngrok.connect(port);
  console.log(`Server is running on ${url}`);
});
