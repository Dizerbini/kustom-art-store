import axios from 'axios';
import React, { useEffect, useReducer } from 'react';
import Layout from '../components/Layout';
import { getError } from '../utils/error';
import styles from '../styles/History.module.css';
import Link from 'next/link';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SECCESS':
      return { ...state, loading: false, orders: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

function OrdersHistoryScreen() {
  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    orders: [],
    error: '',
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`api/orders/history`);
        dispatch({ type: 'FETCH_SECCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchOrders();
  }, []);
  return (
    <Layout title="Histórico de pedidos">
      <h1 className={styles.h1}>Histórico de pedidos</h1>
      {loading ? (
        <div>Carregando...</div>
      ) : error ? (
        <div className={styles.alert}>{error}</div>
      ) : (
        <div className={styles.historycontent}>
          <table className={styles.table}>
            <thead className={styles.card}>
              <tr>
                <th className={styles.thend}>ID</th>
                <th className={styles.thend}>DATA</th>
                <th className={styles.thend}>TOTAL</th>
                <th className={styles.thend}>PAGAMENTO</th>
                <th className={styles.thend}>ENTREGA</th>
                <th className={styles.thend}>STATUS</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {orders.map((order) => (
                <tr key={order._id} className={styles.tbstart}>
                  <td className={styles.tbstart}>
                    {order._id.substring(20, 24)}
                  </td>
                  <td className={styles.tbstart}>
                    {order.createdAt.substring(0, 10)}
                  </td>
                  <td className={styles.tbstart}>{order.totalPrice}</td>
                  <td className={styles.tbstart}>
                    {order.isPaid
                      ? `${order.paidAt.substring(0, 10)}`
                      : 'Pagamento não realizado'}
                  </td>
                  <td className={styles.tbstart}>
                    {order.isDelivered
                      ? `${order.deliveredAt.substring(0, 10)}`
                      : 'Produto não enviado'}
                  </td>
                  <td className={styles.tbstart}>
                    <Link href={`/order/${order._id}`} passHref>
                      <a>Detalhes</a>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

OrdersHistoryScreen.auth = true;
export default OrdersHistoryScreen;
