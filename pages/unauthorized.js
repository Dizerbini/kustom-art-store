import { useRouter } from 'next/router';
import React from 'react';
import Layout from '../components/Layout';

export default function Unauthorized() {
  const router = useRouter();

  const { message } = router.query;

  return (
    <Layout title="Acesso não autorizado">
      <h1>Acesso Negado</h1>
      {message && <div>{message}</div>}
    </Layout>
  );
}
