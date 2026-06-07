import { useState, useEffect } from 'react';
import { mesesAPI, resumenAPI } from '../services/api';

export function useMeses() {
  const [meses, setMeses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarMeses();
  }, []);

  const cargarMeses = async () => {
    try {
      setLoading(true);
      const res = await mesesAPI.list();
      setMeses(res.data.meses);
      setError(null);
    } catch (err) {
      setError('Error al cargar meses');
    } finally {
      setLoading(false);
    }
  };

  return { meses, loading, error, recargar: cargarMeses };
}

export function useResumenAnual(anio = 2026) {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!anio) return;
    (async () => {
      try {
        setLoading(true);
        const res = await resumenAPI.get(anio);
        setResumen(res.data);
      } catch (err) {
        console.error('Error cargando resumen:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [anio]);

  return { resumen, loading };
}

export function useMesData(anio, mes) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!anio || !mes) return;
    (async () => {
      try {
        setLoading(true);
        const res = await mesesAPI.get(anio, mes);
        setData(res.data);
      } catch (err) {
        console.error('Error cargando mes:', err);
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [anio, mes]);

  return { data, loading };
}