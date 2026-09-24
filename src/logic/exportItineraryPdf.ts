import { jsPDF } from 'jspdf';
import type { TripPackage, TripPreferences } from '../types';
import { formatIDR, dailyTransportCostIDR } from './tripMedia';

function slugify(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function todayFilenameDate(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function exportItineraryToPdf(pkg: TripPackage, preferences: TripPreferences): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 56;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 40) {
      doc.addPage();
      y = 56;
    }
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('TripWise Itinerary', marginX, y);
  y += 28;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text(pkg.destination, marginX, y);
  y += 20;

  doc.setFontSize(10);
  doc.setTextColor(90);
  const dateLine =
    preferences.startDate && preferences.endDate
      ? `${preferences.startDate} - ${preferences.endDate}`
      : `${pkg.itinerary.length} days`;
  doc.text(dateLine, marginX, y);
  y += 24;
  doc.setTextColor(0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Cost breakdown', marginX, y);
  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Hotel: ${pkg.costBreakdown.hotel.name} — $${pkg.costBreakdown.hotel.cost.toLocaleString()}`, marginX, y);
  y += 14;
  doc.text(`Flight: ${pkg.costBreakdown.flight.name} — $${pkg.costBreakdown.flight.cost.toLocaleString()}`, marginX, y);
  y += 14;
  doc.text(`Estimated total: $${pkg.estimatedCost.toLocaleString()}`, marginX, y);
  y += 26;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Day-by-day itinerary', marginX, y);
  y += 18;

  for (const day of pkg.itinerary) {
    ensureSpace(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Day ${day.day}: ${day.title}`, marginX, y);
    y += 16;

    const transportCost = dailyTransportCostIDR(pkg.id, day.day);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(90);
    doc.text(`Estimated local transport: ${formatIDR(transportCost)}`, marginX + 8, y);
    y += 14;
    doc.setTextColor(0);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    for (const activity of day.activities) {
      ensureSpace(16);
      const time = activity.time ? `${activity.time} — ` : '';
      const price = typeof activity.price === 'number' && activity.price > 0 ? ` ($${activity.price})` : '';
      const line = `${time}${activity.name}${price}`;
      const wrapped = doc.splitTextToSize(line, pageWidth - marginX * 2 - 12);
      doc.text(wrapped, marginX + 12, y);
      y += 12 * wrapped.length + 2;
    }
    y += 10;
  }

  const filenameDest = slugify(pkg.destination);
  const filename = `TripWise-${filenameDest}-${todayFilenameDate()}.pdf`;
  doc.save(filename);
}
