const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        });

        console.log("Email sent successfully");
    } catch (error) {
        console.error("Email error:", error);
    }
};

const notifyAdminNewAppointment = (adminEmail, patientName) =>
    sendEmail(adminEmail, 'New Appointment Request', `New appointment request submitted by ${patientName}`);

const notifyDoctorAssigned = (doctorEmail) =>
    sendEmail(doctorEmail, 'New Consultation Assigned', 'A new consultation has been assigned to you');

const notifyPatientApproved = (patientEmail) =>
    sendEmail(patientEmail, 'Appointment Approved', 'Your appointment has been approved');

const notifyPatientRejected = (patientEmail) =>
    sendEmail(patientEmail, 'Appointment Request Rejected', 'Your appointment request was rejected');

const notifyPatientReminder = (patientEmail) =>
    sendEmail(patientEmail, 'Appointment Reminder', 'Reminder: Your consultation is scheduled for tomorrow');

module.exports = { sendEmail, notifyAdminNewAppointment, notifyDoctorAssigned, notifyPatientApproved, notifyPatientRejected, notifyPatientReminder };