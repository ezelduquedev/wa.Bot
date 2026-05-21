// pages/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard'); // Redirección automática al entrar
  }, []);
  return null;
}