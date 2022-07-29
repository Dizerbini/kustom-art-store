import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import CheckoutWizard from '../components/CheckoutWizard';
import Layout from '../components/Layout';
import styles from '../styles/PlaceOrder.module.css';
import { Store } from '../utils/Store';
import { toast } from 'react-toastify';
import { getError } from '../utils/error';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function PlaceOrderScreen() {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { cartItems, shippingAddress, paymentMethod } = cart;
  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;

  const itemsPrice = round2(
    cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );

  const shippingPrice = itemsPrice < 200 ? 0 : 15;
  const taxPrice = round2(itemsPrice * 0.15);
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);
  useEffect(() => {
    if (!paymentMethod) {
      router.push('/payment');
    }
  }, [paymentMethod, router]);

  const [loading, setLoading] = useState(false);
  const placeOrderHandler = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/orders', {
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      });
      setLoading(false);
      dispatch({ type: 'CART_CLEAR_ITEMS' });
      Cookies.set(
        'cart',
        JSON.stringify({
          ...cart,
          cartItems: [],
        })
      );
      router.push(`/order/${data._id}`);
    } catch (err) {
      setLoading(false);
      toast.error(getError(err));
    }
  };

  return (
    <Layout title="Finalizar compra">
      <CheckoutWizard activeStep={3} />
      <h1 className={styles.h1}>Finalizar compra</h1>
      {cartItems.length === 0 ? (
        <div>
          Carrinho vazio. <Link href="/">Voltar para as compras</Link>
        </div>
      ) : (
        <div className={styles.orderbox}>
          <div className={styles.ordercontent}>
            <div className={styles.card}>
              <h2 className={styles.h2}>Endereço de envio</h2>
              <div>
                {shippingAddress.fullName} <br></br>
                {shippingAddress.address} - {shippingAddress.city}
                <br></br>
                {shippingAddress.postalCode}, {shippingAddress.country}
              </div>
              <div className={styles.btn}>
                <Link href="/shipping">Editar dados</Link>
              </div>
            </div>
            <div className={styles.card}>
              <h2 className={styles.h2}>Método de pagamento</h2>
              <div>{paymentMethod}</div>
              <div className={styles.btn}>
                <Link href="/payment">Alterar método</Link>
              </div>
            </div>
            <div className={styles.card}>
              <h2 className={styles.h2}>Items comprados</h2>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thstart}>Item</th>
                    <th className={styles.thmedium}>Quantidade</th>
                    <th className={styles.thmedium}>Preço</th>
                    <th className={styles.thend}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <Link href={`/product/${item.slug}`}>
                          <a className={styles.a}>
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
              <div className={styles.btn}>
                <Link href="/cart">Alterar pedido</Link>
              </div>
            </div>
          </div>
          <div>
            <div className={styles.card}>
              <h2>Resumo do pedido</h2>
              <ul className={styles.ul}>
                <li>
                  <div className={styles.summary}>
                    <div>Items</div>
                    <div>R${itemsPrice}</div>
                  </div>
                </li>
                <li>
                  <div className={styles.summary}>
                    <div>Tax</div>
                    <div>R${taxPrice}</div>
                  </div>
                </li>
                <li>
                  <div className={styles.summary}>
                    <div>Frete</div>
                    <div>R${shippingPrice}</div>
                  </div>
                </li>
                <li>
                  <div className={styles.summary}>
                    <div>Total</div>
                    <div>R${totalPrice}</div>
                  </div>
                </li>
                <li>
                  <button
                    disabled={loading}
                    onClick={placeOrderHandler}
                    className={styles.btn}
                  >
                    {loading ? 'Carregando...' : 'Enviar pedido'}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

PlaceOrderScreen.auth = true;
