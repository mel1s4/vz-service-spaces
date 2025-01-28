import {useState, useEffect} from 'react';
import './App.scss';

function App() {
  const [userIsAdmin, setUserIsAdmin] = useState(true);
  const [spaceUid, setSpaceUid] = useState('initial');
  const [spaceTitle, setSpaceTitle] = useState('initial');
  const [spaceId, setSpaceId] = useState('initial');
  const [pendingPayment, setPendingPayment] = useState('initial');
  const [visitors, setVisitors] = useState([
    {
      visitor: 'initial',
      time: 'initial',
    },
  ]);
  const [orders, setOrders] = useState([
    {
      order_id: 'initial',
      order_time: 'initial',
      order_total: 'initial',
      items: [
        {
          item_id: 'initial',
          item_name: 'initial',
          item_price: 'initial',
          item_qty: 'initial',
        },
      ],
    }
  ]);
  const [blogUrl, setBlogUrl] = useState('http://localhost/');

  function qrCode() {
      const spaceLoginUrl = `${blogUrl}?vz_space_uid=${spaceUid}`;
      const qrCodeApi = 'https://api.qrserver.com/v1/create-qr-code/';
      const args = {
        size: '150x150',
        data: spaceLoginUrl
      };
      const qrcode = `${qrCodeApi}?size=${args.size}&data=${args.data}`;
      return qrcode;
  }

  async function copyInviteToClipboard(e) {
    e.target.classList.toggle('--active');
    const spaceLoginUrl = `${blogUrl}?vz_space_uid=${spaceUid}`;
    await navigator.clipboard.writeText(spaceLoginUrl);
    setTimeout(() => {
      e.target.classList.toggle('--active');
    }, 1000);
  }

  function spaceUidReadable() {
    return spaceUid.replace(/(.{4})/g, '$1-').slice(0, -1);
  }

  useEffect(() => {
    if (window) {
      if (window.vz_service_space_values) {
        setOrders(window.vz_service_space_values.orders);
        setVisitors(window.vz_service_space_values.visits);
        setSpaceTitle(window.vz_service_space_values.space_title);
        setPendingPayment(window.vz_service_space_values.pending_payment);
      }
      if (window.vz_service_space_uid) {
        setSpaceUid(window.vz_service_space_uid);
      }
      if (window.vz_service_space_is_admin) {
        setUserIsAdmin(window.vz_service_space_is_admin);
      }
    }
  }, [window]);

  async function toggleDeliveryState(e) {
    const result = await fetch(`${blogUrl}wp-json/vz-ss/v1/service_space/${spaceUid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const spaceInfoJson = await spaceInfo.json();
    console.log(spaceInfoJson);
    e.target.classList.add('--delivered');
  }

  function formatTime(time) {
    const timeNow = new Date();
    const timeThen = new Date(time);
    console.log(timeNow, timeThen);
    const timeDifference = timeNow - timeThen;
    const timeSeconds = timeDifference / 1000;
    const timeMinutes = timeSeconds / 60;
    const timeHours = timeMinutes / 60;
    const timeDays = timeHours / 24;
    const timeWeeks = timeDays / 7;
    const timeMonths = timeDays / 30;
    const timeYears = timeDays / 365;

    if (timeSeconds < 60) {
      return `${Math.round(timeSeconds)} seconds ago`;
    }
    if (timeMinutes < 60) {
      return `${Math.round(timeMinutes)} minutes ago`;
    }
    if (timeHours < 24) {
      return `${Math.round(timeHours)} hours ago`;
    }
    if (timeDays < 7) {
      return `${Math.round(timeDays)} days ago`;
    }
    if (timeWeeks < 4) {
      return `${Math.round(timeWeeks)} weeks ago`;
    }
    if (timeMonths < 12) {
      return `${Math.round(timeMonths)} months ago`;
    }
    return `${Math.round(timeYears)} years ago`;
  }

  function toggleSelf(e) {
    e.target.classList.toggle('--active');
  }

  function resetServiceSpace() {

  }

  return (
    <div className="App">
      <header className="vz-ss__login">
        <h1>{spaceTitle}</h1>
        <div className="img">
          <img src={qrCode()} alt="QR Code" />
        </div>
        <p>
          {spaceUidReadable()}
        </p>
        <button onClick={(e) => copyInviteToClipboard(e)}>Copy to Clipboard</button>
      </header>
      <section className='vz-ss__visitors'>
        <h2>Visits</h2>
        <ul>
          {visitors.map((visitor, index) => (
            <li key={index}>
              <article className="vz-ss__visit">
                <p className="visitor">{visitor.visitor}</p>
                <p className="time">{formatTime(visitor.time)}</p>
              </article>
            </li>
          ))}
        </ul>
      </section>
      <section className='vz-ss__orders'>
        <h2>Orders</h2>
        <ul className="vz-ss__order-list">
          {orders.map((order, index) => (
            <li key={index}>
              <aricle className="vz-ss__order">
                <div className="vz-ss__order-header" onClick={(e) => toggleSelf(e)}>
                  <div className='user-details'>
                    <p className="username">{order.user_login}</p>
                    <p className="billing-name">{order.billing_name}</p>
                  </div>
                  <div className="date-total">
                    <p className="order-status">{order.order_status}</p>
                    <p className="order-date">{order.order_date}</p>
                    <p className="order-total">Total ${order.order_total}</p>
                  </div>
                </div>
                <ol className="vz-ss__product-list">
                  {order.items.map((item, index) => (
                    <li key={index}>
                      <article className="vz-ss__product-card">
                        <a href={item.product_permalink} className="product_name">{item.product_name}</a>
                        <p className="quantity">{item.quantity} x</p>
                        <p className="product_price">${item.product_price}</p>
                        {userIsAdmin && ( 
                          <button className="delivered-button" onClick={toggleDeliveryState}> Delivered </button>
                        )}
                        {!userIsAdmin && ( 
                          <p className="delivered-mark"> Delivered </p>
                        )}
                      </article>
                    </li>
                  ))}
                </ol>
              </aricle>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <p className="vz-ss__pending-payment">
          Pending Payment: ${pendingPayment}
        </p>
        <button className="vz-ss__reset-space" onClick={() => resetServiceSpace()}>
          Reset Service Space
        </button>
      </section>
    </div>
  );
}

export default App;
