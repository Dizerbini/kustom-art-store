import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import CheckoutWizard from '../components/CheckoutWizard';
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import styles from '../styles/Payment.module.css';

export default function PaymentScreen() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { shippingAddress, paymentMethod } = cart;

  const router = useRouter();

  const submitHandler = (e) => {
    e.preventDefault();
    if (!selectedPaymentMethod) {
      return toast.error('Selecione um método de pagamento');
    }
    dispatch({ type: 'SAVE_PAYMENT_METHOD', payload: selectedPaymentMethod });
    Cookies.set(
      'cart',
      JSON.stringify({
        ...cart,
        paymentMethod: selectedPaymentMethod,
      })
    );
    router.push('/placeorder');
  };

  useEffect(() => {
    if (!shippingAddress.address) {
      return router.push('/shipping');
    }
    setSelectedPaymentMethod(paymentMethod || '');
  }, [paymentMethod, router, shippingAddress.address]);

  return (
    <Layout>
      <CheckoutWizard activeStep={2} />
      <form className={styles.form} onSubmit={submitHandler}>
        <h1 className={styles.h1}>Escolha como quer pagar</h1>
        {['Paypal', 'Pagseguro'].map((payment) => (
          <div key={payment} className={styles.formbox}>
            <input
              name="paymentMethod"
              className={styles.input}
              id={payment}
              type="radio"
              checked={selectedPaymentMethod === payment}
              onChange={() => setSelectedPaymentMethod(payment)}
            />
            <label className={styles.label} htmlFor={payment}>
              {payment}
            </label>
          </div>
        ))}
        <div className={styles.back}>
          <button
            className={styles.btn}
            onClick={(e) => {
              e.preventDefault;
              router.push('/shipping');
            }}
          >
            Voltar
          </button>
          <button className={styles.btn}>Finalizar compra</button>
        </div>
      </form>
    </Layout>
  );
}

PaymentScreen.auth = true;
