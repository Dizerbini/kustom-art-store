import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import React, { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CheckoutWizard from '../components/CheckoutWizard';
import Layout from '../components/Layout';
import styles from '../styles/Shipping.module.css';
import { Store } from '../utils/Store';

export default function ShippingScreen() {
  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm();

  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { shippingAddress } = cart;
  const router = useRouter();

  useEffect(() => {
    setValue('fullName', shippingAddress.fullName);
    setValue('address', shippingAddress.address);
    setValue('city', shippingAddress.city);
    setValue('postalCode', shippingAddress.postalCode);
    setValue('country', shippingAddress.country);
  }, [setValue, shippingAddress]);

  const submitHandler = ({ fullName, address, city, postalCode, country }) => {
    dispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: { fullName, address, city, postalCode, country, location },
    });
    Cookies.set(
      'cart',
      JSON.stringify({
        ...cart,
        shippingAddress: {
          fullName,
          address,
          city,
          postalCode,
          country,
          location,
        },
      })
    );
    router.push('/payment');
  };

  return (
    <Layout title="Cadastre seu endereço">
      <CheckoutWizard activeStep={1} />
      <form className={styles.form} onSubmit={handleSubmit(submitHandler)}>
        <h1 className={styles.h1}>Endereço de entrega</h1>
        <div className={styles.formbox}>
          <label htmlFor="fullName">Nome completo</label>
          <input
            className={styles.input}
            id="fullName"
            autoFocus
            {...register('fullName', {
              required: 'Digite seu nome completo',
            })}
          ></input>
          {errors.fullName && (
            <div style="color:#ff0000">{errors.fullName.message}</div>
          )}
        </div>
        <div className={styles.formbox}>
          <label htmlFor="address">Endereço</label>
          <input
            className={styles.input}
            id="address"
            autoFocus
            {...register('address', {
              required: 'Digite seu endereço',
              minLength: { value: 3, message: 'Digite endereço correto' },
            })}
          ></input>
          {errors.address && (
            <div style="color:#ff0000">{errors.address.message}</div>
          )}
        </div>
        <div className={styles.formbox}>
          <label htmlFor="city">Cidade</label>
          <input
            className={styles.input}
            id="city"
            autoFocus
            {...register('city', {
              required: 'Digite a cidade',
            })}
          ></input>
          {errors.city && (
            <div style="color:#ff0000">{errors.city.message}</div>
          )}
        </div>
        <div className={styles.formbox}>
          <label htmlFor="postalCode">CEP</label>
          <input
            className={styles.input}
            id="postalCode"
            autoFocus
            {...register('postalCode', {
              required: 'Digite o CEP',
            })}
          ></input>
          {errors.postalCode && (
            <div style="color:#ff0000">{errors.postalCode.message}</div>
          )}
        </div>
        <div className={styles.formbox}>
          <label htmlFor="country">País</label>
          <input
            className={styles.input}
            id="country"
            autoFocus
            {...register('country', {
              required: 'Digite o país',
            })}
          ></input>
          {errors.country && (
            <div style="color:#ff0000">{errors.country.message}</div>
          )}
        </div>
        <div>
          <button className={styles.btn}>Próxima etapa</button>
        </div>
      </form>
    </Layout>
  );
}

ShippingScreen.auth = true;
