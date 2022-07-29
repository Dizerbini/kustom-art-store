import Link from 'next/link';
import React, { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import Layout from '../components/Layout';
import styles from '../styles/Login.module.css';
import { getError } from '../utils/error';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import axios from 'axios';

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
    getValues,
    formState: { errors },
  } = useForm();
  const submitHandler = async ({ name, email, password }) => {
    try {
      await axios.post('/api/auth/signup', {
        name,
        email,
        password,
      });

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
      <Layout title="Crie sua conta">
        <form className={styles.form} onSubmit={handleSubmit(submitHandler)}>
          <h1 className={styles.title}>Login</h1>

          <div className={styles.inputbox}>
            <label htmlFor="email">Name</label>
            <input
              type="text"
              {...register('name', {
                required: 'Insira seu nome completo',
                minLength: 8,
              })}
              className={styles.input}
              id="name"
              autoFocus
            ></input>
            {errors.name && (
              <div className={styles.errormsg}>{errors.name.message}</div>
            )}
          </div>

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
            <label htmlFor="password">Insira uma Senha</label>
            <input
              type="password"
              {...register('password', {
                required: 'Insira uma senha válida',
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
            <label htmlFor="confirmPassword">Confirmar senha</label>
            <input
              type="password"
              {...register('confirmPassword', {
                required: 'Confirme sua senha',
                validate: (value) => value === getValues('password'),
                minLength: {
                  value: 6,
                  message: 'Senha deve conter no minimo 6 caracteres',
                },
              })}
              className={styles.input}
              id="confirmPassword"
              autoFocus
            ></input>
            {errors.confirmPassword && (
              <div className={styles.errormsg}>
                {errors.confirmPassword.message}
              </div>
            )}
            {errors.confirmPassword &&
              errors.confirmPassword.type === 'validate' && (
                <div className={styles.errormsg}>As senhas não conferem</div>
              )}
          </div>

          <div className={styles.inputbox}>
            <button className={styles.btn}>Criar minha conta</button>
          </div>
          <div className={styles.inputbox}>
            Ainda não tem uma conta? &nbsp;
            <Link href={`/register?redirect=${redirect || '/'}`}>
              Crie sua conta
            </Link>
          </div>
        </form>
      </Layout>
    </>
  );
}
