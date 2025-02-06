import React, { useState, useEffect, use } from 'react';
import Select from 'react-select';
import axios from 'axios';
import './App.scss';

function App() {
  const [blogUrl, setBlogUrl] = useState('http://localhost');
  const [nonce, setNonce] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [keepUpdating, setKeepUpdating] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(null);
  const [previousOrders, setPreviousOrders] = useState([]);

  const [productCategories, setProductCategories] = useState([
    { value: '1', label: 'Categoria 1' },
    { value: '2', label: 'Categoria 2' },
    { value: '3', label: 'Categoria 3' },
    
  ]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [productTags, setProductTags] = useState([
    { value: '1', label: 'Etiqueta 1' },
    { value: '2', label: 'Etiqueta 2' },
    { value: '3', label: 'Etiqueta 3' },
  ]);
  const [selectedTags, setSelectedTags] = useState([]);

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

  async function fetchOrders() {
    const response = await api('POST', 'orders', {
      categories: selectedCategories.map((cat) => cat.value),
      tags: selectedTags.map((tag) => tag.value),
      ordersPerPage,
      currentPage,
    });
    if (response.status === 'success') {
      setOrders(response.orders);
      setProductCategories(response.categories);
      setProductTags(response.tags);
    } else {
      console.error('Error fetching service spaces');
    }
  }


  useEffect(() => {
    if (window.localStorage.getItem('vz-ss-filters')) {
      const filters = JSON.parse(window.localStorage.getItem('vz-ss-filters'));
      setSelectedCategories(filters.categories);
      setSelectedTags(filters.tags);
    }
    if (window.vz_service_spaces) {
      setOrders(window.vz_service_spaces);
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
      setUpdateInterval(setInterval(fetchOrders, 2000));
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
    if (twoObjectsAreEqual(orders, previousOrders)) {
      return;
    } else {
      setPreviousOrders(orders);
      if (newOrdersDetected(orders, previousOrders)) playSound();
    }
  }, [orders, previousOrders]);
  

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

  function toggleUpdate() {
    setKeepUpdating(!keepUpdating);
  }

  function saveFilters() {
    window.localStorage.setItem('vz-ss-filters', JSON.stringify({
      categories: selectedCategories,
      tags: selectedTags,
    }));
  }

  return (
    <div className="App">
      <header className="vz-ss__header">
       <h1> Órdenes </h1>
       <div className="actions">
        <button className="vz-ss__save-filters" onClick={() => saveFilters()}>
            Guardar Filtros
        </button>
        <button onClick={() => toggleUpdate()} className={keepUpdating ? '--active' : ''}>
          {keepUpdating ? 'Parar actualizacion' : 'Actualizacion automatica'}
        </button>
       </div>
      </header>
      <section className="vz-ss__order-filters">
        <div className="vz-ss__filter">
          <label> Categorias de Producto </label>
          <Select
            options={productCategories}
            isMulti
            value={selectedCategories}
            onChange={setSelectedCategories}
          />
        </div>
        <div className="vz-ss__filter">
          <label> Etiquetas de Producto </label>
          <Select
            options={productTags}
            isMulti
            value={selectedTags}
            onChange={setSelectedTags}
          />
        </div>
        <div className="vz-ss__filter">
          <label>
            Ordenes Por Pagina
          </label>
          <input
            type="number"
            value={ordersPerPage}
            onChange={(e) => setOrdersPerPage(e.target.value)}
          />
        </div>
        <div className="vz-ss__filter">
          <label>
            Pagina Actual
          </label>
          <input
            type="number"
            value={currentPage}
            onChange={(e) => setCurrentPage(e.target.value)}
          />
        </div>
      </section>
      <main className="vz-service-spaces__orders">
        <ul className="vz-ss__orders__list">
          {orders.map((order) => (
            <li key={order.id} className="vz-ss__order">
              <article className="vz-ss__order-card">
                <p className="order-id">
                  <strong>Orden:</strong> #{order.id}
                </p>
                <p className="customer">
                  <strong>Cliente:</strong> {order.customer}
                </p>
                <p className="order-status">
                  <strong>Estado:</strong> {order.status}
                </p>
                <p className="order-date">
                  <strong>Fecha:</strong> {order.date}
                </p>
                <p className="order-total">
                  <strong>Total:</strong> {order.total}
                </p>
                <p className="order-items">
                  <strong>Articulos:</strong>
                  <ul>
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.name} - {item.quantity} * ${item.price} = ${item.total}
                      </li>
                    ))}
                  </ul>
                </p>
              </article>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default App;
