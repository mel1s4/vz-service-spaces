import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.scss';

function App() {
  const [blogUrl, setBlogUrl] = useState('http://localhost');
  const [nonce, setNonce] = useState('');
  const [serviceSpaces, setServiceSpaces] = useState([]);
  async function api(method, endpoint, data = {}) {
    try {
      const response = await axios({
        method: method,
        url: `${blogUrl}/wp-json/vz-ss/v1/${endpoint}`,
        data: data,
        // headers: {
        //   'X-WP-Nonce': nonce
        // }
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchServiceSpaces() {
    const response = await api('POST', 'service_spaces');
    console.log(response);
    if (response.status == 'success') {
      setServiceSpaces(response.service_spaces);
    }
  }

  useEffect(() => {
    fetchServiceSpaces();
  }, []);

  function vzTotalItems(orders) {
    let total = 0;
    if (!orders) {
      return total;
    }
    orders.forEach(order => {
      total += order.items.length;
    });
    return total;
  }

  function vzDeliveredItems(deliveredProducts) {
    let total = 0;
    if (!deliveredProducts) {
      return total;
    }
    Object.keys(deliveredProducts).forEach(key => {
      total += deliveredProducts[key].length;
    });
    return total;
  }

  function vzGetFirstLogIn(visits) {
    if (!visits || visits.length == 0) {
      return '';
    }
    visits.sort((a, b) => b.time - a.time);
    console.log(visits);
    return visits[0].time;
  }

  return (
    <div className="App">
      <header className="vz-ss__header">
       <h1> Service Spaces </h1>
      </header>
      <main className="vz-service-spaces__archive">
        <ul className="vz-ss__list">
          {serviceSpaces.map((serviceSpace, index) => (
            <li key={index} className="vz-ss__item">
              <div className="vz-ss__card">
                <h2>{serviceSpace.space_title}</h2>
                <p className="visits">
                  <strong>Visits:</strong> {serviceSpace.visits.length}
                </p>
                {serviceSpace.visits.length > 0 && (
                  <p> Logged at: { vzGetFirstLogIn(serviceSpace.visits)}</p>
                )}
                <p className="orders">
                  <strong>Orders:</strong> {serviceSpace.orders.length}
                </p>
                <p className="items">
                  <strong>Items:</strong> {vzDeliveredItems(serviceSpace.delivered_products)} / {vzTotalItems(serviceSpace.orders)}
                </p>
              </div>
            </li>
          ))}
          {serviceSpaces.length == 0 && (
            <li className="vz-ss__item">
              <div className="vz-ss__item">
                <p>No service spaces found.</p>
              </div>
            </li>
          )}
        </ul>
      </main>
    </div>
  );
}

export default App;
