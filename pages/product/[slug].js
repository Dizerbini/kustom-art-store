import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext } from 'react';
import Layout from '../../components/Layout';
import data from '../../utils/data';
import styles from '../../styles/Product.module.css';
import { Store } from '../../utils/Store';

export default function ProductScreen() {
  const { state, dispatch } = useContext(Store);
  const router = useRouter();
  const { query } = useRouter();
  const { slug } = query;
  const product = data.products.find((i) => i.slug === slug);
  if (!product) {
    return <div>Product Not Found</div>;
  }

  const addToCartHandler = () => {
    const existItem = state.cart.cartItems.find((i) => i.slug === product.slug);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    if (product.countInStock < quantity) {
      alert('Este produto esgotou.');
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    router.push('/cart');
  };

  return (
    <>
      <Layout title={product.name}>
        <div className={styles.backbtn}>
          <Link href="/">Voltar</Link>
        </div>
        <div className={styles.content1}>
          <div className={styles.details}>
            <Image
              src={product.image}
              alt={product.name}
              width={640}
              height={640}
              layout="responsive"
            ></Image>
          </div>
          <div>
            <ul className={styles.infos}>
              <li>
                <h1>{product.name}</h1>
              </li>
              <li>Category: {product.category}</li>
              <li>Brand: {product.brand}</li>
              <li>
                {product.rating} of {product.numReviews} reviews
              </li>
              <li>Description: {product.description}</li>
            </ul>
          </div>
          <div className={styles.cardcontent}>
            <div>
              <div>Valor</div>
              <div>R${product.price}</div>
            </div>
            <div>
              <div>Status</div>
              <div>
                {product.countInStock > 0 ? 'Em estoque' : 'Indisponível'}
              </div>
            </div>
            <button className={styles.btn} onClick={addToCartHandler}>
              Adicionar ao carrinho
            </button>
          </div>
        </div>
      </Layout>
    </>
  );
}
