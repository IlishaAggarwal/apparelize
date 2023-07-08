import React, { useEffect, useState } from 'react';
import { getOrdersData } from '../backend/'; // Update the import path based on your folder structure

const ParentComponent = () => {
  const [ordersData, setOrdersData] = useState(null);

  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        const data = await getOrdersData(); // Call the exported API function
        console.log(data)
        setOrdersData(data);
      } catch (error) {
        console.error('Error fetching orders data:', error);
      }
    };

    fetchOrdersData();
  }, []);

  return (
    <div>
      {ordersData ? (
        <div>
          <h2>Orders</h2>
          {ordersData.orders.edges.map((edge) => {
            const order = edge.node;
            const orderId = order.id;
            const metafields = order.metafields.edges;

            return (
              <div key={orderId}>
                <h3>Order ID: {orderId}</h3>
                <ul>
                  {metafields.map((metafield) => {
                    const { key, value } = metafield.node;
                    return (
                      <li key={key}>
                        Key: {key}, Value: {value}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ParentComponent;


// import React, { useEffect, useState } from 'react';

// function OrderList() {
//   const [orderIds, setOrderIds] = useState([]);

//   useEffect(() => {
//     fetch('https://2bb4-140-82-222-70.ngrok-free.app/api/orders') // replace with your actual server URL
//       .then(response => {
//         if (!response.ok) {
//           throw new Error("HTTP error " + response.status);
//         }
//         console.log('Orders here:')
//         console.log(response)
//         return response.json();
//       })
//       .then(data => {
//         const ids = data.map(order => order.id);
//         setOrderIds(ids);
//       })
//       .catch(function() {
//         console.log("An error occurred while fetching the order IDs.");
//       });
//   }, []);

//   return (
//     <div>
//       <h1>Order IDs</h1>
//       <ul>
//         {orderIds.map(id => <li key={id}>{id}</li>)}
//       </ul>
//     </div>
//   );
// }

// export default OrderList;
