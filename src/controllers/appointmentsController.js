const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendBookingEmail } = require('../utils/mailer');

exports.createAppointment = async (req, res) => {
  try {
    const { serviceId, date, notes } = req.body;
    const userId = req.user.userId;

    // Eenvoudige beschikbaarheidscheck: gelijke timestamp nog niet in DB
    const dt = new Date(date);
    const existing = await prisma.appointment.findFirst({
      where: {
        serviceId: Number(serviceId),
        date: dt
      }
    });
    if (existing) return res.status(400).json({ error: 'Tijdslot al bezet' });

    const appt = await prisma.appointment.create({
      data: {
        userId,
        serviceId: Number(serviceId),
        date: dt,
        notes
      }
    });

    // E-mail notificaties (klant en admin)
    const user = await prisma.user.findUnique({ where: { id: userId }});
    const service = await prisma.service.findUnique({ where: { id: Number(serviceId) }});
    const subject = 'Bevestiging afspraak bij Ayis Beauty';
    const html = `<p>Beste ${user.name || user.email},</p>
      <p>Je afspraak voor <strong>${service.title}</strong> op <strong>${dt.toLocaleString()}</strong> is geregistreerd.</p>`;

    // stuur naar klant en admin (asynchroon)
    sendBookingEmail(user.email, subject, html).catch(console.error);
    sendBookingEmail(process.env.ADMIN_EMAIL, 'Nieuwe afspraak aangemaakt', `Nieuwe afspraak: ${user.email} - ${service.title} - ${dt.toISOString()}`).catch(console.error);

    res.json({ appointment: appt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kon afspraak niet aanmaken' });
  }
};

exports.listAppointments = async (req, res) => {
  // Als admin: alle afspraken, anders alleen van gebruiker
  const isAdmin = req.user.role === 'admin';
  if (isAdmin) {
    const all = await prisma.appointment.findMany({ include: { user: true, service: true }, orderBy: { date: 'asc' }});
    return res.json({ appointments: all });
  } else {
    const mine = await prisma.appointment.findMany({ where: { userId: req.user.userId }, include: { service: true }, orderBy: { date: 'asc' }});
    return res.json({ appointments: mine });
  }
};

exports.updateAppointment = async (req, res) => {
  // Admin kan status of details veranderen
  const id = Number(req.params.id);
  const data = req.body;
  const updated = await prisma.appointment.update({ where: { id }, data });
  res.json({ appointment: updated });
};
