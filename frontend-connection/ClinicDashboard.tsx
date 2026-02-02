import React from 'react';
import { usePatients, useDoctors, useAppointments } from './hooks';

export const ClinicDashboard: React.FC = () => {
  const { patients, loading: patientsLoading } = usePatients();
  const { doctors, loading: doctorsLoading } = useDoctors();
  const { appointments, loading: appointmentsLoading } = useAppointments();

  if (patientsLoading || doctorsLoading || appointmentsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Clinic Dashboard</h1>
      
      <section>
        <h2>Patients ({patients.length})</h2>
        {patients.map(patient => (
          <div key={patient.id}>{patient.name} - {patient.email}</div>
        ))}
      </section>

      <section>
        <h2>Doctors ({doctors.length})</h2>
        {doctors.map(doctor => (
          <div key={doctor.id}>{doctor.name} - {doctor.specialty}</div>
        ))}
      </section>

      <section>
        <h2>Appointments ({appointments.length})</h2>
        {appointments.map(appointment => (
          <div key={appointment.id}>{appointment.date} {appointment.time} - {appointment.status}</div>
        ))}
      </section>
    </div>
  );
};