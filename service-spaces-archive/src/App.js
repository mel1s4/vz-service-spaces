import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import './App.scss';

function App() {
  const [blogUrl, setBlogUrl] = useState('http://localhost');
  const [nonce, setNonce] = useState('');
  const [serviceSpaces, setServiceSpaces] = useState([]);
  const [keepUpdating, setKeepUpdating] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(null);
  const [previousServiceSpaces, setPreviousServiceSpaces] = useState([]);
  async function api(method, endpoint, data = {}) {
    console.log(blogUrl);
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
    if (response.status === 'success') {
      setServiceSpaces(response.service_spaces);
    } else {
      console.error('Error fetching service spaces');
    }
  }


  useEffect(() => {
    if (window.vz_service_spaces) {
      setServiceSpaces(window.vz_service_spaces);
    }
    if (window.vz_nonce) {
      setNonce(window.vz_nonce);
    }
    if (window.vz_blog_url) {
      setBlogUrl(window.vz_blog_url);
    }
  }, []);

  useEffect(() => {
    if (keepUpdating) {
      setUpdateInterval(setInterval(fetchServiceSpaces, 2000));
    } else {
      clearInterval(updateInterval);
    }
  }, [keepUpdating]);

  function twoObjectsAreEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  function newOrdersDetected(nOrders, old) {
    if (!nOrders.length || !old.length) {
      return false;
    }
    for (let i = 0; i < nOrders.length; i++) {
      if (nOrders[i].orders.length !== old[i].orders.length) {
        return true;
      }
    }
    return false;
  }

  useEffect(() => {
    if (twoObjectsAreEqual(serviceSpaces, previousServiceSpaces)) {
      return;
    } else {
      setPreviousServiceSpaces(serviceSpaces);
      if (newOrdersDetected(serviceSpaces, previousServiceSpaces)) playSound();
    }
  }, [serviceSpaces, previousServiceSpaces]);
  

  async function playSound() {
    let audio = null;
    if (window.vz_bell_url) {
      audio = new Audio(window.vz_bell_url);
    } else {
      audio = new Audio('bell.mp3');      
    }
    const pAudio = audio.play();  
    try {
      await pAudio;
    } catch (error) {
      console.error(error);
    }
  }

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
    const time = visits[0].time;
    const date = new Date(time * 1000);
    return date.toLocaleString();
  }

  function toggleUpdate() {
    setKeepUpdating(!keepUpdating);
  }

  return (
    <div className="App">
      <header className="vz-ss__header">
       <h1> Mesas </h1>
       <button onClick={() => toggleUpdate()} className={keepUpdating ? '--active' : ''}>
        {keepUpdating ? 'Parar actualizacion' : 'Actualizacion automatica'}
       </button>
      </header>
      <main className="vz-service-spaces__archive">
        <ul className="vz-ss__list">
          {serviceSpaces.map((serviceSpace, index) => (
            <li key={index} className="vz-ss__item">
              <div className="vz-ss__card">
                <h2 className="vz-ss__card-title">{serviceSpace.space_title}</h2>
                <p className="visits">
                  <strong>Visits:</strong> {serviceSpace.visits.length}
                </p>
                <p className="orders">
                  <strong>Orders:</strong> {serviceSpace.orders.length}
                </p>
                <p className="items">
                  <strong>Items:</strong> {vzDeliveredItems(serviceSpace.delivered_products)} / {vzTotalItems(serviceSpace.orders)}
                </p>
                  <p className="login"> Iniciaron: { vzGetFirstLogIn(serviceSpace.visits)}</p>                
                <a className="vz-ss__view-space" href={serviceSpace.url} target="_blank" rel="noopener noreferrer">
                  Ver Mesa
                </a>
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
