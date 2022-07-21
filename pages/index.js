import Layout from '../components/Layout';
import styles from '../styles/Collection.module.css';
import ProductItem from '../components/ProductItem';
import data from '../utils/data';

export default function Home() {
  return (
    <>
      <Layout title="Home Page">
        <div className={styles.collection}>
          {data.products.map((product) => (
            <ProductItem product={product} key={product.slug}></ProductItem>
          ))}
        </div>
      </Layout>
    </>
  );
}
