const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.listServices = async (req, res) => {
  const services = await prisma.service.findMany({ orderBy: { price: 'asc' }});
  res.json({ services });
};

exports.createService = async (req, res) => {
  const { title, description, price, durationMinutes } = req.body;
  const s = await prisma.service.create({
    data: { title, description, price: Number(price), durationMinutes: Number(durationMinutes) }
  });
  res.json({ service: s });
};

exports.updateService = async (req, res) => {
  const id = Number(req.params.id);
  const fields = req.body;
  const s = await prisma.service.update({ where: { id }, data: { ...fields, price: fields.price ? Number(fields.price) : undefined }});
  res.json({ service: s });
};

exports.deleteService = async (req, res) => {
  const id = Number(req.params.id);
  await prisma.service.delete({ where: { id }});
  res.json({ message: 'Verwijderd' });
};
