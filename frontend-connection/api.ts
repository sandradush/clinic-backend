const API_BASE_URL = 'http://localhost:3001/api';

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    return response.json();
  }

  // Patients
  getPatients = () => this.request<Patient[]>('/patients');
  createPatient = (patient: Omit<Patient, 'id'>) => 
    this.request<Patient>('/patients', { method: 'POST', body: JSON.stringify(patient) });

  // Doctors
  getDoctors = () => this.request<Doctor[]>('/doctors');
  createDoctor = (doctor: Omit<Doctor, 'id'>) => 
    this.request<Doctor>('/doctors', { method: 'POST', body: JSON.stringify(doctor) });

  // Appointments
  getAppointments = () => this.request<Appointment[]>('/appointments');
  createAppointment = (appointment: Omit<Appointment, 'id'>) => 
    this.request<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(appointment) });
}

export const api = new ApiService();