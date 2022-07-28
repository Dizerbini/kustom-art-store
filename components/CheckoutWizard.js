import React from 'react';
import styles from '../styles/CheckoutWizard.module.css';

export default function CheckoutWizard() {
  return (
    <div className={styles.checkoutcontainer}>
      {[
        'Usuario logado',
        'Cadastrar endereço',
        'Método de pagamento',
        'Finalizar compra',
      ].map((step) => (
        <div key={step} className={styles.box}>
          {step}
        </div>
      ))}
    </div>
  );
}
