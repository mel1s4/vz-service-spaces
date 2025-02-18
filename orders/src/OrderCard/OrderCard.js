import React from 'react';
import './OrderCard.scss';
import { api } from '../functions.js';

const OrderCard = ({
  order,
  woo_status,
  orderStateSuccess
}) => {

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
        <strong>Fecha:</strong> {order.date}
      </p>
      <p className="order-total">
        <strong>Total:</strong> {order.total}
      </p>
      <p className={`delivery-location --${order.location.delivery ?? 'local'}`}>
        <strong>Entrega:</strong> {order.location.address}
      </p>
      <div className="vz-ss-order-items">
        <ul>
          {order.items.map((item, index) => (
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