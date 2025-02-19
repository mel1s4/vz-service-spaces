import React, { useState, useEffect, use } from 'react';
import Select from 'react-select';
import './App.scss';
import OrderCard from './OrderCard/OrderCard';
import { api } from './functions.js';

function App() {
  const [blogUrl, setBlogUrl] = useState('http://localhost');
  const [nonce, setNonce] = useState('');
  const [hideEmpty, setHideEmpty] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [keepUpdating, setKeepUpdating] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(null);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [woo_status, setWooStatus] = useState([
    { value: 'processing', label: 'Procesando' },
    { value: 'completed', label: 'Completada' },
    { value: 'on-hold', label: 'En espera' },
  ]);
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
  const [selectedStatus, setSelectedStatus] = useState([]);

  function pauseInterval() {
    setKeepUpdating(false);
    clearInterval(updateInterval);
  }

  useEffect(() => {
    if (keepUpdating) {
      clearInterval(updateInterval);
      fetchOrders();
      setUpdateInterval(setInterval(fetchOrders, 5000));
    }
  }, 
  [selectedCategories, selectedTags, selectedStatus, ordersPerPage, currentPage, hideEmpty]);

  async function fetchOrders() {
    try {
      const response = await api('POST', 'orders', {
        categories: selectedCategories.map((cat) => cat.value),
        tags: selectedTags.map((tag) => tag.value),
        ordersPerPage,
        currentPage,
        hideEmpty,
        status: selectedStatus.map((status) => status.value),
      });
      if (response.status === 'success') {
        setOrders(response.orders);
      } else {
        console.error('Error fetching service spaces');
      }
    } catch (error) {
      console.error(error);
    }
  }


  useEffect(() => {
    if (window.localStorage.getItem('vz-ss-filters')) {
      const filters = JSON.parse(window.localStorage.getItem('vz-ss-filters'));
      setSelectedCategories(filters.categories);
      setSelectedTags(filters.tags);
      setSelectedStatus(filters.status);
      setOrdersPerPage(filters.ordersPerPage);
      console.log(filters, 'filters');
    }
    if (window.vz_ss_categories) {
      setProductCategories(window.vz_ss_categories);
    }
    if (window.vz_ss_tags) {
      setProductTags(window.vz_ss_tags);
    }
    if (window.vz_ss_woo_status) {
      setWooStatus(window.vz_ss_woo_status);
    }
  }, []);

  useEffect(() => {
    if (keepUpdating) {
      fetchOrders();
      setUpdateInterval(setInterval(fetchOrders, 5000));
    } else {
      clearInterval(updateInterval);
    }
  }, [keepUpdating]);

  function twoObjectsAreEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  function newOrdersDetected(nOrders, old) {
    console.log(nOrders, old);
    return false;
  }

  useEffect(() => {
    if (twoObjectsAreEqual(orders, previousOrders)) {
      return;
    } else {
      setPreviousOrders(orders);
      playSound();
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

  function orderStateSuccess(orderId, status) {
    const newOrders = orders.map((order) => {
      if (order.id === orderId) {
        return {
          ...order,
          status: status.replace('wc-', '')
        };
      }
      return order;
    });
    setOrders(newOrders);
  }

  function saveFilters() {
    window.localStorage.setItem('vz-ss-filters', JSON.stringify({
      categories: selectedCategories,
      tags: selectedTags,
      status: selectedStatus,
      ordersPerPage,
    }));
    console.log('saved!');
  }


  function toggleHideEmpty() {
    setHideEmpty(!hideEmpty);
  }

  function filteredOrders() {
    if (hideEmpty) {
      return orders.filter((order) => order.items.length > 0);
    }
    return orders;
  }

  return (
    <div className="vz-ss__orders-app">
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
          <label> Estado de la Orden </label>
          <Select
            options={woo_status}
            isMulti
            value={selectedStatus}
            onChange={setSelectedStatus}
          />
        </div>
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
        <div className="vz-ss__filter --results">
          <label>
            Resultados
          </label>
          <input
            type="number"
            value={ordersPerPage}
            onChange={(e) => setOrdersPerPage(e.target.value)}
          />
          <label>
            <input type="checkbox" 
                  checked={hideEmpty} 
                  onChange={() => toggleHideEmpty()} />
            Esconder Ordenes sin Productos
          </label>
        </div>
      </section>
      <main className="vz-service-spaces__orders">
        <ul className="vz-ss__orders__list">
          {filteredOrders().map((order) => (
            <li key={order.id} className="vz-ss__order">
              <OrderCard order={order}
                         woo_status={woo_status} 
                        orderStateSuccess={orderStateSuccess} />
            </li>
          ))}
          {orders.length === 0 && (
            <p className="vz-ss__no-orders">
              No se encontraron ordenes
            </p>
          )}
        </ul>
      </main>
    </div>
  );
}

export default App;
