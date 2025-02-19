import React from 'react';
import './OrderCard.scss';
import { api } from '../functions.js';

const OrderCard = ({
  order,
  woo_status,
  orderStateSuccess
}) => {


  function formatDate(dte) {
    // 2025-01-30 20:09:59
    const [nDate, time] = dte.split(' ');
    const [year, month, day] = nDate.split('-');
    const [hour, minute, second] = time.split(':');

    // hoy, ayer, anteayer, o la fecha exacta
    const today = new Date();
    const orderDate = new Date(year, month - 1, day);
    const diff = today - orderDate;
    const diffDays = diff / (1000 * 60 * 60 * 24);
    let formattedDate = '';
    if (diffDays === 0) {
      formattedDate = 'hoy';
    } else if (diffDays === 1) {
      formattedDate = 'ayer';
    } else if (diffDays === 2) {
      formattedDate = 'anteayer';
    } else {
      formattedDate = `${day}/${month}/${year}`;
    }

    // si es hoy, mostrar "hace X horas con X minutos"
    if (formattedDate === 'hoy') {
      const diffHours = today.getHours() - hour;
      const diffMinutes = today.getMinutes() - minute;
      formattedDate = `hace ${diffHours} horas con ${diffMinutes} minutos`;
    } else {
      formattedDate = `${formattedDate} a las ${hour}:${minute
        .split('')
        .slice(0, 2)
        .join('')}`;
    }
    return formattedDate;
  }
  async function updateOrderState(orderId, status) {
    try {
      const response = await api('POST', 'update_order_state', {
        order_id: orderId,
        status,
      });
      if (response.status === 'success') {
        orderStateSuccess(orderId, status);
      } else {
        alert('Error actualizando el estado de la orden');
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <article className="vz-ss__order-card">
      <div className={`order-status --${order.status}`}>
        <select value={`wc-${order.status}`} onChange={(e) => updateOrderState(order.id, e.target.value)}>
          {woo_status.map((status) => (
            <option value={status.value}
                    key={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
      <div className="vz-ss__order-card__header">
        <p className="order-id">
          #{order.id}
        </p>
        <p className="customer">
          {order.customer}
        </p>
      </div>
    
      <p className="order-date">
        {formatDate(order.date)}
      </p>
      <p className="order-total">
        <strong>Total:</strong> {order.total}
      </p>
      <p className={`delivery-location --${order.location.delivery ?? 'local'}`}>
        <strong>
          {
            order.location.delivery
              ? 'Enviar a'
              : 'Entregar en'
          }
        </strong> {order.location.address}
      </p>
      <div className="vz-ss-order-items">
        <ul>
          {order && order.items && order.items.map((item, index) => (
            <li key={item.id}>
              <article className="vz-ss__order-item__card">
                <p className="title">
                  {item.name}
                </p>
                <p className="quantity">
                  x{item.quantity}
                </p>
                <p className="price">
                  ${item.price}/u
                </p>
                <p className="total">
                  ${item.total}
                </p>
              </article>
            </li>
          ))}
          {/* {order.items.length === 0 && (
            <li>
              <p className="no-items">No hay articulos en esta orden</p>
            </li>
          )} */}
        </ul>
      </div>
      {order.notes && (
        <p className="order-notes">
          <strong>Notas:</strong> {order.notes}
        </p>
      )}
    </article>
  );
};

export default OrderCard;