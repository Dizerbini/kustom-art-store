import Layout from '../components/Layout';
import Link from 'next/link';
import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import { Store } from '../utils/Store';
import Image from 'next/image';
import { TiDelete } from 'react-icons/ti';
import styles from '../styles/Cart.module.css';
import dynamic from 'next/dynamic';

function CartScreen() {
  const { state, dispatch } = useContext(Store);
  const router = useRouter();
  const {
    cart: { cartItems },
  } = state;

  const removeItemHandler = (item) => {
    dispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };

  const updateCartHandler = (item, qty) => {
    const quantity = Number(qty);
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...item, quantity } });
  };

  return (
    <Layout title="Carrinho">
      <h1 className={styles.title}>Carrinho</h1>
      {cartItems.length === 0 ? (
        <div>
          Carrinho esta vazio.
          <Link href="/">Voltar para loja.</Link>
        </div>
      ) : (
        <div className={styles.cartcontainer}>
          <div className={styles.tablecontainer}>
            <table className={styles.table}>
              <thead className={styles.tableborder}>
                <tr>
                  <th className={styles.thstart}>Item</th>
                  <th className={styles.thmedium}>Quantidade</th>
                  <th className={styles.thmedium}>Preço</th>
                  <th className={styles.thend}>Item</th>
                </tr>
              </thead>

              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.slug}>
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
                    <td className={styles.tbstart}>
                      <select
                        className={styles.select}
                        value={item.quantity}
                        onChange={(e) =>
                          updateCartHandler(item, e.target.value)
                        }
                      >
                        {[...Array(item.countInStock).keys()].map((i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className={styles.tbstart}>{item.quantity}</td>
                    <td className={styles.tbmedium}>${item.price}</td>
                    <td className={styles.tbend}>
                      <button
                        className={styles.delete}
                        onClick={() => removeItemHandler(item)}
                      >
                        <TiDelete className={styles.icon} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.card}>
            <ul className={styles.list}>
              <li>
                <div className={styles.total}>
                  Total ({cartItems.reduce((a, c) => a + c.quantity, 0)}) R$
                  {cartItems.reduce((a, c) => a + c.quantity * c.price, 0)}
                </div>
              </li>
              <li>
                <button
                  onClick={() => router.push('login?redirect=/shipping')}
                  className={styles.btn}
                >
                  Finalizar compra
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default dynamic(() => Promise.resolve(CartScreen), { ssr: false });
