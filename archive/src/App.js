import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import './App.scss';

function App() {
  const [blogUrl, setBlogUrl] = useState('http://localhost');
  const [nonce, setNonce] = useState('');
  const [serviceSpaces, setServiceSpaces] = useState([]);
  const [keepUpdating, setKeepUpdating] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(null);
  async function api(method, endpoint, data = {}) {
    console.log(blogUrl);
    try {
      const response = await axios({
        method: method,
        url: `${blogUrl}/wp-json/vz-ss/v1/${endpoint}`,
        data: data,
        headers: {
          'X-WP-Nonce': nonce
        }
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

  function vzGetFirstLogIn(visits) {
    if (!visits || visits.length == 0) {
      return '';
    }
    visits.sort((a, b) => b.time - a.time);
    const time = visits[0].time;
    const date = new Date(time * 1000);
    const locale = date.toLocaleDateString();
    const [month, day, year] = locale.split('/');
    const weekday = date.toLocaleDateString('es-ES', { weekday: 'long' });
    const months = "Enero Febrero Marzo Abril Mayo Junio Julio Agosto Septiembre Octubre Noviembre Diciembre".split(" ");
    const M = months[parseInt(month) - 1];
    const [hour, minute] = date.toLocaleTimeString().split(':');
    let meridian = 'am';
    if (hour > 12) {
      hour -= 12;
      meridian = 'pm';
    }
    const today = new Date();
    if (date.toDateString() == today.toDateString()) {
      return `Hoy a las ${hour}:${minute} ${meridian}`;
    }
    return `${weekday} ${day} de ${M}, ${year} a las ${hour}:${minute} ${meridian}`;
  }

  function toggleUpdate() {
    setKeepUpdating(!keepUpdating);
  }

  return (
    <div className="App">
      <header className="vz-ss__header">
       <h1> Mesas </h1>
       <div className="vz-ss__header-actions">
        <a href={`${blogUrl}/ordenes/`} rel="noopener noreferrer">
            Ver Ordenes
          </a>
        <button onClick={() => toggleUpdate()} className={keepUpdating ? '--active' : ''}>
          {keepUpdating ? 'Detener' : 'Actualizar'}
        </button>
       </div>
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
                  <strong>Items:</strong> {vzTotalItems(serviceSpace.orders)}
                </p>
                  <p className="login"> Iniciaron: { vzGetFirstLogIn(serviceSpace.visits)}</p>                
                <a className="vz-ss__view-space" href={serviceSpace.url} rel="noopener noreferrer">
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
