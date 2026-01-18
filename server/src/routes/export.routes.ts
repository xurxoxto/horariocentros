import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import PDFDocument from 'pdfkit';
import ical from 'ical-generator';

const router = Router();

router.get('/pdf/:id', authenticate, (req, res) => {
  const doc = new PDFDocument();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=timetable-${req.params.id}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).text('School Timetable', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Timetable ID: ${req.params.id}`);
  doc.moveDown();

  // Add timetable content here
  doc.fontSize(10).text('Monday - Friday');
  doc.text('Period 1: 8:00 - 9:00');
  doc.text('Period 2: 9:00 - 10:00');
  doc.text('Period 3: 10:00 - 11:00');
  doc.text('Break: 11:00 - 11:15');
  doc.text('Period 4: 11:15 - 12:15');
  doc.text('Period 5: 12:15 - 13:15');

  doc.end();
});

router.get('/ical/:id', authenticate, (req, res) => {
  const calendar = ical({ name: 'School Timetable' });

  // Add events
  calendar.createEvent({
    start: new Date(),
    end: new Date(Date.now() + 3600000),
    summary: 'Math Class',
    description: 'Weekly math class',
  });

  res.setHeader('Content-Type', 'text/calendar');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=timetable-${req.params.id}.ics`
  );
  res.send(calendar.toString());
});

export default router;
