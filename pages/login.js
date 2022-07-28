import Link from 'next/link';
import React, { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import Layout from '../components/Layout';
import styles from '../styles/Login.module.css';
import { getError } from '../utils/error';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

export default function LoginScreen() {
  const { data: session } = useSession();

  const router = useRouter();
  const { redirect } = router.query;

  useEffect(() => {
    if (session?.user) {
      router.push(redirect || '/');
    }
  }, [router, session, redirect]);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();
  const submitHandler = async ({ email, password }) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      if (result.error) {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error(getError(err));
    }
  };
  return (
    <>
      <Layout title="Login">
        <form className={styles.form} onSubmit={handleSubmit(submitHandler)}>
          <h1 className={styles.title}>Login</h1>
          <div className={styles.inputbox}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              {...register('email', {
                required: 'Insira o email cadastrado',
                pattern: {
                  value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/i,
                  message: 'Por favor, insira um email válido',
                },
              })}
              className={styles.input}
              id="email"
              autoFocus
            ></input>
            {errors.email && (
              <div className={styles.errormsg}>{errors.email.message}</div>
            )}
          </div>
          <div className={styles.inputbox}>
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              {...register('password', {
                required: 'Insira sua senha cadastrada',
                minLength: {
                  value: 6,
                  message: 'Senha deve conter no minimo 6 caracteres',
                },
              })}
              className={styles.input}
              id="password"
              autoFocus
            ></input>
            {errors.password && (
              <div className={styles.errormsg}>{errors.password.message}</div>
            )}
          </div>
          <div className={styles.inputbox}>
            <button className={styles.btn}>Login</button>
          </div>
          <div className={styles.inputbox}>
            Ainda não tem uma conta? &nbsp;
            <Link href="register">Crie sua conta</Link>
          </div>
        </form>
      </Layout>
    </>
  );
}
