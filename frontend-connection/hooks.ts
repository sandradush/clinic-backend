import { useState, useEffect } from 'react';
import { api, Patient, Doctor, Appointment } from './api';

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPatients().then(setPatients).finally(() => setLoading(false));
  }, []);

  return { patients, loading, refetch: () => api.getPatients().then(setPatients) };
};

export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDoctors().then(setDoctors).finally(() => setLoading(false));
  }, []);

  return { doctors, loading, refetch: () => api.getDoctors().then(setDoctors) };
};

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAppointments().then(setAppointments).finally(() => setLoading(false));
  }, []);

  return { appointments, loading, refetch: () => api.getAppointments().then(setAppointments) };
};