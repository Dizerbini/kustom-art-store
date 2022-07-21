import Link from 'next/link';
import React from 'react';
import styles from '../styles/Card.module.css';

export default function ProductItem({ product }) {
  return (
    <div className={styles.card}>
      <Link href={`/product/${product.slug}`}>
        <a>
          <img
            src={product.image}
            alt={product.name}
            className={styles.cardimg}
          ></img>
        </a>
      </Link>
      <div className={styles.cardcontent}>
        <Link href={`/product/${product.slug}`}>
          <a>
            <h2>{product.name}</h2>
          </a>
        </Link>
        <p>{product.brand}</p>
        <p>R${product.price}</p>
        <button className={styles.btnpri}>Adicionar ao carrinho</button>
      </div>
    </div>
  );
}
