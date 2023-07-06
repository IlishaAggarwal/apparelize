import React, { useEffect, useState } from 'react';

function OrderList() {
  const [orderIds, setOrderIds] = useState([]);

  useEffect(() => {
    fetch('https://2bb4-140-82-222-70.ngrok-free.app/api/orders') // replace with your actual server URL
      .then(response => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        console.log('Orders here:')
        console.log(response)
        return response.json();
      })
      .then(data => {
        const ids = data.map(order => order.id);
        setOrderIds(ids);
      })
      .catch(function() {
        console.log("An error occurred while fetching the order IDs.");
      });
  }, []);

  return (
    <div>
      <h1>Order IDs</h1>
      <ul>
        {orderIds.map(id => <li key={id}>{id}</li>)}
      </ul>
    </div>
  );
}

export default OrderList;
