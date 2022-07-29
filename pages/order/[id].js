import { useRouter } from 'next/router';
import { useEffect, useReducer } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { getError } from '../../utils/error';
import styles from '../../styles/Order.module.css';
import Link from 'next/link';
import Image from 'next/image';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      state;
  }
}

function OrderScheen() {
  // order/:id
  const { query } = useRouter();
  const orderId = query.id;

  const [
    { loading, error, order, successPay, loadingDeliver, successDeLiver },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    if (!order._id || (order._id && order._id !== orderId)) {
      fetchOrder();
    }
  }, [order, orderId]);

  const {
    shippingAddress,
    paymentMethod,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
  } = order;

  return (
    <Layout title={`Order ${orderId}`}>
      <h1 className={styles.h1}>{`Order ${orderId}}`}</h1>
      {loading ? (
        <div>Carregando...</div>
      ) : error ? (
        <div className={styles.alert}>{error}</div>
      ) : (
        <div className={styles.ordercontainer}>
          <div className={styles.ordercontent}>
            <div className={styles.card}>
              <h2 className={styles.h1}>Endereço de entrega</h2>
              <div>
                {shippingAddress.fullName}, {shippingAddress.address},{''}
                {shippingAddress.city}, {shippingAddress.postalCode},{''}
                {shippingAddress.country}
              </div>
              {isDelivered ? (
                <div className={styles.success}>
                  Seu pedido foi enviado {deliveredAt}
                </div>
              ) : (
                <div className={styles.alert}>
                  Seu pedido será enviado após confirmação do pagamento
                </div>
              )}
            </div>
            <div className={styles.card}>
              <h2 className={styles.h1}>Método de pagamento</h2>
              <div>{paymentMethod}</div>
              {isPaid ? (
                <div className={styles.success}>Pago em {paidAt}</div>
              ) : (
                <div className={styles.alert}>Pagamento não efetuado</div>
              )}
            </div>
            <div className={styles.card}>
              <h2 className={styles.h1}>Items comprados</h2>
              <table className={styles.table}>
                <thead className={styles.tableborder}>
                  <tr>
                    <th className={styles.thstart}>Item</th>
                    <th className={styles.thmedium}>Quantidade</th>
                    <th className={styles.thmedium}>Preço</th>
                    <th className={styles.thend}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item) => (
                    <tr key={item._id} className={styles.tbstart}>
                      <td>
                        <Link href={`/product/${item.slug}`}>
                          <a className={styles.avatar}>
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={100}
                              height={100}
                            ></Image>
                            &nbsp;
                            {item.name}
                          </a>
                        </Link>
                      </td>
                      <td className={styles.tbstart}>{item.quantity}</td>
                      <td className={styles.tbmedium}>R${item.price}</td>
                      <td className={styles.tbend}>
                        ${item.quantity * item.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div className={styles.card}>
              <h2 className={styles.h1}>Resumo do pedido</h2>
              <ul className={styles.list}>
                <li>
                  <div className={styles.details}>
                    <div>Items</div>
                    <div>R${itemsPrice}</div>
                  </div>
                </li>
                <li>
                  <div className={styles.details}>
                    <div>Tax</div>
                    <div>R${taxPrice}</div>
                  </div>
                </li>
                <li>
                  <div className={styles.details}>
                    <div>Frete</div>
                    <div>R${shippingPrice}</div>
                  </div>
                </li>
                <li>
                  <div className={styles.details}>
                    <div>Total</div>
                    <div>R${totalPrice}</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

OrderScheen.auth = true;
export default OrderScheen;
