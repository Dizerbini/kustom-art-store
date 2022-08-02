import { useRouter } from 'next/router';
import { useEffect, useReducer } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { getError } from '../../utils/error';
import styles from '../../styles/Order.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { toast } from 'react-toastify';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false, errorPay: action.payload };
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false, errorPay: '' };
    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true };
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false };
    case 'DELIVER_RESET':
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      };
    default:
      state;
  }
}

function OrderScheen() {
  const { data: session } = useSession();
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const { query } = useRouter();
  const orderId = query.id;

  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      loadingDeliver,
      successDeliver,
    },
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
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      dispatch({ type: 'PAY_RESET' });
    }
    if (successDeliver) {
      dispatch({ type: 'DELIVER_RESET' });
    } else {
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get('/api/keys/paypal');
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': clientId,
            currency: 'USD',
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      loadPaypalScript();
    }
  }, [order, orderId, paypalDispatch, successDeliver, successPay]);

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

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: totalPrice },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: 'PAY_REQUEST' });
        const { data } = await axios.put(
          `api/orders/${order._id}/pay`,
          details
        );
        dispatch({ type: 'PAY_SUCCESS', payload: data });
        toast.success('Parabéns, seu pagamento foi aprovado!');
      } catch (err) {
        dispatch({ type: 'PAY_FAIL', payload: getError(err) });
        toast.error(getError(err));
      }
    });
  }

  function onError(err) {
    toast.error(getError(err));
  }

  async function deliverOrderHandler() {
    try {
      dispatch({ type: 'DELIVER_REQUEST' });
      const { data } = await axios.put(
        `/api/admin/orders/${order._id}/deliver`,
        {}
      );
      dispatch({ type: 'DELIVER_SUCCESS', payload: data });
      toast.success('Order is delivered');
    } catch (err) {
      dispatch({ type: 'DELIVER_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  }

  return (
    <Layout title={`Order ${orderId}`}>
      <h1 className={styles.h1}>{`Pedido ${orderId}`}</h1>
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
                {!isPaid && (
                  <li>
                    {isPending ? (
                      <div>Carregando...</div>
                    ) : (
                      <div>
                        <PayPalButtons
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={onError}
                        ></PayPalButtons>
                      </div>
                    )}
                    {loadingPay && <div>Carregando...</div>}
                  </li>
                )}
                {session.user.isAdmin && order.isPaid && !order.isDelivered && (
                  <li>
                    {loadingDeliver && <div>Loading...</div>}
                    <button
                      className="primary-button w-full"
                      onClick={deliverOrderHandler}
                    >
                      Deliver Order
                    </button>
                  </li>
                )}
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
