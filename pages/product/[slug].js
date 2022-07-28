import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext } from 'react';
import Layout from '../../components/Layout';
import styles from '../../styles/Product.module.css';
import { Store } from '../../utils/Store';
import db from '../../utils/db';
import Product from '../../models/Product';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ProductScreen(props) {
  const { product } = props;
  const { state, dispatch } = useContext(Store);
  const router = useRouter();
  if (!product) {
    return (
      <Layout title="Produto não encontrado">Produto não encontrado</Layout>
    );
  }

  const addToCartHandler = async () => {
    const existItem = state.cart.cartItems.find((i) => i.slug === product.slug);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      return toast.error('Esse produto esgotou.');
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

export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;

  await db.connect();
  const product = await Product.findOne({ slug }).lean();
  await db.disconnect();
  return {
    props: {
      product: product ? db.convertDocToObj(product) : null,
    },
  };
}
