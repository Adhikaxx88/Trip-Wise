import { jsPDF, GState } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ItineraryActivity, ItineraryDay, TransportOption, TripPackage, TripPreferences } from '../types';
import { formatIDR, dailyTransportCostIDR } from './tripMedia';
import { formatDateRange, addDaysIso } from './dates';
import { getCityImage, isFallbackImage } from '../data/getImage';

// ---------------------------------------------------------------------------
// Layout constants (A4 portrait, pt) and brand palette (mirrors src/index.css)
// ---------------------------------------------------------------------------

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 40;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_SPACE = 34;
const CONTENT_BOTTOM = PAGE_H - FOOTER_SPACE;
const HERO_H = 220;

type RGB = [number, number, number];

const COLOR = {
  oceanDeepest: [0, 23, 42] as RGB,
  oceanDeep: [10, 70, 107] as RGB,
  oceanMid: [23, 103, 138] as RGB,
  oceanCard: [37, 115, 164] as RGB,
  oceanLight: [63, 113, 148] as RGB,
  gold: [255, 218, 97] as RGB,
  goldDeep: [255, 173, 41] as RGB,
  goldTint: [255, 246, 219] as RGB,
  ink: [13, 27, 30] as RGB,
  grey: [107, 122, 128] as RGB,
  lightGrey: [227, 234, 237] as RGB,
  paleTint: [232, 240, 244] as RGB,
  white: [255, 255, 255] as RGB,
};

// ---------------------------------------------------------------------------
// Text sanitization — jsPDF's built-in Helvetica only supports the WinAnsi
// (cp1252) encoding. Characters like the arrow "→" or "★" silently break
// whole lines (jsPDF falls back to spacing every glyph out). Every string
// handed to jsPDF/autotable goes through sanitizePdfText first.
// ---------------------------------------------------------------------------

const PDF_TEXT_REPLACEMENTS: Record<string, string> = {
  '→': ' to ', // →
  '⇒': ' to ', // ⇒
  '←': ' from ', // ←
  '★': '*', // ★
  '☆': '*', // ☆
  '✓': 'OK', // ✓
  '✔': 'OK', // ✔
  '✗': 'x', // ✗
  '✘': 'x', // ✘
  ' ': ' ', // nbsp
};

// Extra Unicode code points that WinAnsi (cp1252) *does* support even though
// they sit outside the Latin-1 supplement block (curly quotes, dashes, etc).
const WINANSI_SAFE_EXTRA = new Set<string>([
  '‘',
  '’',
  '‚',
  '“',
  '”',
  '„',
  '–',
  '—',
  '…',
  '•',
  '‹',
  '›',
  'ˆ',
  '˜',
  '†',
  '‡',
  '‰',
  'Œ',
  'œ',
  'Ÿ',
  'Ž',
  'ž',
  'Š',
  'š',
  'ƒ',
]);

/** Strips/maps any character jsPDF's built-in Helvetica (WinAnsi) can't render. */
export function sanitizePdfText(input: string | null | undefined): string {
  if (!input) return '';
  let text = String(input);
  for (const [char, replacement] of Object.entries(PDF_TEXT_REPLACEMENTS)) {
    if (text.includes(char)) text = text.split(char).join(replacement);
  }
  let out = '';
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if ((code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || WINANSI_SAFE_EXTRA.has(ch)) {
      out += ch;
    }
  }
  return out.replace(/[ \t]+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// Activity time parsing / sorting
// ---------------------------------------------------------------------------

/** Parses "9:00 AM" or "09:00" into minutes since midnight, or null if unparseable. */
function parseActivityTime(time: string | undefined): number | null {
  if (!time) return null;
  const raw = time.trim();

  const h24 = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    const h = parseInt(h24[1], 10);
    const min = parseInt(h24[2], 10);
    if (h >= 0 && h <= 23 && min >= 0 && min <= 59) return h * 60 + min;
  }

  const h12 = raw.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (h12) {
    let h = parseInt(h12[1], 10);
    const min = parseInt(h12[2], 10);
    const period = h12[3].toUpperCase();
    if (h >= 1 && h <= 12 && min >= 0 && min <= 59) {
      if (period === 'AM') h = h === 12 ? 0 : h;
      else h = h === 12 ? 12 : h + 12;
      return h * 60 + min;
    }
  }

  return null;
}

/**
 * Sorts activities by parsed time. Activities with no parseable time keep
 * their position relative to the item preceding them (a stable "anchor +
 * trailing untimed items" grouping), rather than jumping to the start/end.
 */
export function sortActivitiesByTime(activities: ItineraryActivity[]): ItineraryActivity[] {
  const segments: { time: number | null; order: number; items: ItineraryActivity[] }[] = [];
  for (const activity of activities) {
    const time = parseActivityTime(activity.time);
    if (time !== null || segments.length === 0) {
      segments.push({ time, order: segments.length, items: [activity] });
    } else {
      segments[segments.length - 1].items.push(activity);
    }
  }

  const sorted = [...segments].sort((a, b) => {
    if (a.time === null && b.time === null) return a.order - b.order;
    if (a.time === null) return -1;
    if (b.time === null) return 1;
    return a.time - b.time || a.order - b.order;
  });

  return sorted.flatMap((seg) => seg.items);
}

// ---------------------------------------------------------------------------
// Image loading: fetch → blob → decode → downscaled JPEG dataURL, with a
// timeout and graceful null-on-failure (external hosts may be unreachable).
// ---------------------------------------------------------------------------

interface LoadedImage {
  dataUrl: string;
  width: number;
  height: number;
}

interface LoadImageOptions {
  /** Downscale so the output is at most this wide, px. */
  maxWidth?: number;
  /** JPEG quality 0..1. */
  quality?: number;
  /** Abort the fetch after this many ms. */
  timeoutMs?: number;
  /** If set, crops the source (centered) to this width/height ratio before resizing, i.e. "cover" fit. */
  coverAspect?: number;
}

function bitmapSize(bitmap: ImageBitmap | HTMLImageElement): { width: number; height: number } {
  if ('naturalWidth' in bitmap && bitmap.naturalWidth) {
    return { width: bitmap.naturalWidth, height: bitmap.naturalHeight };
  }
  return { width: bitmap.width, height: bitmap.height };
}

async function decodeImageBlob(blob: Blob): Promise<ImageBitmap | HTMLImageElement | null> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(blob);
    } catch {
      // Some browsers can't decode every format via createImageBitmap; fall through.
    }
  }
  return await new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
    img.src = objectUrl;
  });
}

async function loadImageForPdf(url: string | null | undefined, opts: LoadImageOptions = {}): Promise<LoadedImage | null> {
  const { maxWidth = 1200, quality = 0.8, timeoutMs = 4000, coverAspect } = opts;
  if (!url || isFallbackImage(url)) return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let blob: Blob;
    try {
      const res = await fetch(url, { mode: 'cors', signal: controller.signal });
      if (!res.ok) return null;
      blob = await res.blob();
    } finally {
      clearTimeout(timer);
    }

    const bitmap = await decodeImageBlob(blob);
    if (!bitmap) return null;

    const { width: srcW, height: srcH } = bitmapSize(bitmap);
    if (!srcW || !srcH) return null;

    let sx = 0;
    let sy = 0;
    let sw = srcW;
    let sh = srcH;
    if (coverAspect) {
      const srcAspect = srcW / srcH;
      if (srcAspect > coverAspect) {
        sw = srcH * coverAspect;
        sx = (srcW - sw) / 2;
      } else {
        sh = srcW / coverAspect;
        sy = (srcH - sh) / 2;
      }
    }

    const scale = Math.min(1, maxWidth / sw);
    const outW = Math.max(1, Math.round(sw * scale));
    const outH = Math.max(1, Math.round(sh * scale));

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(bitmap as CanvasImageSource, sx, sy, sw, sh, 0, 0, outW, outH);

    if ('close' in bitmap && typeof bitmap.close === 'function') bitmap.close();

    return { dataUrl: canvas.toDataURL('image/jpeg', quality), width: outW, height: outH };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Small drawing helpers
// ---------------------------------------------------------------------------

function setFill(doc: jsPDF, color: RGB) {
  doc.setFillColor(color[0], color[1], color[2]);
}
function setDraw(doc: jsPDF, color: RGB) {
  doc.setDrawColor(color[0], color[1], color[2]);
}
function setText(doc: jsPDF, color: RGB) {
  doc.setTextColor(color[0], color[1], color[2]);
}

/** Adds a page and resets the cursor to the top margin if `needed` pt won't fit before the footer. */
function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > CONTENT_BOTTOM) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function money(amount: number): string {
  return `$${Math.round(amount).toLocaleString()}`;
}

function pluralize(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

function fitSingleLine(doc: jsPDF, text: string, maxWidth: number, startSize: number, minSize = 8): string {
  let size = startSize;
  doc.setFontSize(size);
  while (doc.getTextWidth(text) > maxWidth && size > minSize) {
    size -= 0.5;
    doc.setFontSize(size);
  }
  if (doc.getTextWidth(text) <= maxWidth) return text;
  // Still too long even at minSize: truncate with an ellipsis.
  let truncated = text;
  while (truncated.length > 1 && doc.getTextWidth(`${truncated}...`) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}...`;
}

// ---------------------------------------------------------------------------
// Filename helpers (unchanged behaviour)
// ---------------------------------------------------------------------------

function slugify(value: string): string {
  return value.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function todayFilenameDate(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ---------------------------------------------------------------------------
// Transition-day transport info
// ---------------------------------------------------------------------------

interface TransitionInfo {
  modeLabel: string;
  costPerPerson: number;
}

function isTravelDay(day: ItineraryDay): boolean {
  return day.type === 'transition' || day.title.toLowerCase().includes('travel day');
}

function transitionInfo(day: ItineraryDay): TransitionInfo | null {
  const options = day.transportOptions;
  const selected: TransportOption | undefined = options?.[day.selectedTransportIndex ?? 0];
  if (selected) {
    return { modeLabel: selected.name, costPerPerson: selected.costPerPerson };
  }
  const activity = day.activities[0];
  if (activity) {
    return { modeLabel: activity.name, costPerPerson: activity.price ?? 0 };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function exportItineraryToPdf(pkg: TripPackage, preferences: TripPreferences): Promise<void> {
  const groupSize = preferences.groupSize ?? 1;
  const cities = pkg.cities && pkg.cities.length > 0 ? pkg.cities : [pkg.destination.split(',')[0].trim()];
  const nights = Math.max(1, pkg.itinerary.length - 1);

  const sortedItinerary: ItineraryDay[] = pkg.itinerary.map((day) => ({
    ...day,
    activities: sortActivitiesByTime(day.activities),
  }));

  // ---- Preload every image used on the page, in parallel, before drawing ----
  const dayCities = Array.from(
    new Set(
      sortedItinerary
        .map((day) => day.city ?? (day.type === 'transition' ? day.toCity : undefined))
        .filter((c): c is string => !!c),
    ),
  );

  const [heroImage, ...cardImages] = await Promise.all([
    loadImageForPdf(cities[0] ? getCityImage(cities[0], 'hero') : null, {
      coverAspect: PAGE_W / HERO_H,
      maxWidth: 1600,
    }),
    ...dayCities.map((city) => loadImageForPdf(getCityImage(city, 'card'), { coverAspect: 96 / 60, maxWidth: 400 })),
  ]);
  const cardImageByCity = new Map(dayCities.map((city, i) => [city, cardImages[i]]));

  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  doc.setFont('helvetica', 'normal');

  // ===========================================================================
  // Cover / page-1 hero
  // ===========================================================================

  if (heroImage) {
    doc.addImage(heroImage.dataUrl, 'JPEG', 0, 0, PAGE_W, HERO_H, undefined, 'FAST');
  } else {
    setFill(doc, COLOR.oceanDeepest);
    doc.rect(0, 0, PAGE_W, HERO_H, 'F');
  }

  // Dark gradient overlay so white title text stays legible over any photo.
  const gradientSlices = 24;
  for (let i = 0; i < gradientSlices; i++) {
    const sliceH = HERO_H / gradientSlices;
    const t = i / (gradientSlices - 1);
    const opacity = 0.12 + t * 0.68;
    doc.saveGraphicsState();
    doc.setGState(new GState({ opacity }));
    setFill(doc, COLOR.oceanDeepest);
    doc.rect(0, i * sliceH, PAGE_W, sliceH + 0.5, 'F');
    doc.restoreGraphicsState();
  }

  // Wordmark
  setText(doc, COLOR.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Trip', MARGIN, 40);
  const tripW = doc.getTextWidth('Trip');
  setText(doc, COLOR.gold);
  doc.text('Wise', MARGIN + tripW, 40);

  // Destination (large)
  const destinationLabel = sanitizePdfText(cities.join(' · ')) || sanitizePdfText(pkg.destination);
  setText(doc, COLOR.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  const destLines: string[] = doc.splitTextToSize(destinationLabel, CONTENT_W).slice(0, 2);
  let destY = 118;
  for (const line of destLines) {
    doc.text(line, MARGIN, destY);
    destY += 32;
  }

  // Meta line: dates · duration · travellers
  // Derive the end date from the itinerary length so the cover matches the per-day dates
  // (multi-city trips can add travel days beyond the originally picked range).
  const tripEndDate = preferences.startDate
    ? addDaysIso(preferences.startDate, pkg.itinerary.length - 1)
    : preferences.endDate;
  const dateRangeLabel = formatDateRange(preferences.startDate, tripEndDate);
  const durationLabel = `${pluralize(pkg.itinerary.length, 'day')} · ${pluralize(nights, 'night')}`;
  const travellersLabel = pluralize(groupSize, 'traveller');
  const metaLine = sanitizePdfText([dateRangeLabel, durationLabel, travellersLabel].filter(Boolean).join('   ·   '));
  setText(doc, COLOR.paleTint);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11.5);
  doc.text(metaLine, MARGIN, Math.max(destY + 6, 178));

  let y = HERO_H + 30;

  // ===========================================================================
  // Trip-at-a-glance stat boxes
  // ===========================================================================

  const grandTotalActivitiesPerPerson = sortedItinerary.reduce(
    (sum, day) => sum + day.activities.reduce((s, a) => s + (a.price ?? 0), 0),
    0,
  );
  const activitiesTotal = grandTotalActivitiesPerPerson * groupSize;
  const grandTotal = activitiesTotal + pkg.costBreakdown.hotel.cost + pkg.costBreakdown.flight.cost;
  const localTransportTotalIDR = sortedItinerary.reduce(
    (sum, day) => sum + dailyTransportCostIDR(pkg.id, day.day),
    0,
  );

  const stats: { label: string; value: string; accent?: RGB }[] = [
    { label: 'Duration', value: `${pkg.itinerary.length}d / ${nights}n` },
    { label: 'Cities', value: String(cities.length) },
    { label: 'Travellers', value: String(groupSize) },
    { label: 'Est. total', value: money(grandTotal), accent: COLOR.goldDeep },
  ];

  const statGap = 12;
  const statW = (CONTENT_W - statGap * (stats.length - 1)) / stats.length;
  const statH = 60;
  stats.forEach((stat, i) => {
    const x = MARGIN + i * (statW + statGap);
    setFill(doc, COLOR.paleTint);
    doc.roundedRect(x, y, statW, statH, 8, 8, 'F');
    setDraw(doc, COLOR.lightGrey);
    doc.setLineWidth(0.75);
    doc.roundedRect(x, y, statW, statH, 8, 8, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setText(doc, COLOR.grey);
    doc.text(sanitizePdfText(stat.label).toUpperCase(), x + 10, y + 20);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    setText(doc, stat.accent ?? COLOR.oceanDeep);
    doc.text(sanitizePdfText(stat.value), x + 10, y + 42);
  });
  y += statH + 26;

  // ===========================================================================
  // Cost breakdown table
  // ===========================================================================

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  setText(doc, COLOR.oceanDeep);
  doc.text('Cost breakdown', MARGIN, y);
  y += 16;

  const activityCount = sortedItinerary.reduce((sum, day) => sum + day.activities.length, 0);

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN, bottom: FOOTER_SPACE },
    head: [['Item', 'Details', 'Cost']],
    body: [
      [
        'Hotel',
        sanitizePdfText(`${pkg.costBreakdown.hotel.name} · ${pluralize(nights, 'night')}`),
        money(pkg.costBreakdown.hotel.cost),
      ],
      ['Flight', sanitizePdfText(pkg.costBreakdown.flight.name), money(pkg.costBreakdown.flight.cost)],
      [
        'Activities',
        sanitizePdfText(`${pluralize(activityCount, 'activity').replace('activitys', 'activities')} across ${pluralize(pkg.itinerary.length, 'day')}`),
        `${money(activitiesTotal)} (${money(grandTotalActivitiesPerPerson)}/person)`,
      ],
      [
        'Local transport (est.)',
        sanitizePdfText(`Daily estimate × ${pluralize(pkg.itinerary.length, 'day')} — not included in total`),
        formatIDR(localTransportTotalIDR),
      ],
    ],
    foot: [
      ['Total', groupSize > 1 ? sanitizePdfText(`For ${pluralize(groupSize, 'traveller')}`) : '', money(grandTotal)],
      ['Total per person', '', money(grandTotal / groupSize)],
    ],
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 9.5, cellPadding: 7, textColor: COLOR.ink, lineColor: COLOR.lightGrey, lineWidth: 0.5 },
    headStyles: { fillColor: COLOR.oceanDeep, textColor: COLOR.white, fontStyle: 'bold', lineWidth: 0 },
    footStyles: { fillColor: COLOR.gold, textColor: COLOR.oceanDeepest, fontStyle: 'bold', lineWidth: 0 },
    alternateRowStyles: { fillColor: COLOR.paleTint },
    columnStyles: { 0: { cellWidth: 130 }, 2: { cellWidth: 130, halign: 'right' } },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;

  // ===========================================================================
  // Hotel & flight cards
  // ===========================================================================

  y = ensureSpace(doc, y, 90);
  const cardGap = 16;
  const cardW = (CONTENT_W - cardGap) / 2;
  const cardH = 78;

  const drawBookableCard = (
    x: number,
    title: string,
    subtitle: string,
    cost: number,
    bookingUrl: string | undefined,
  ) => {
    setFill(doc, COLOR.white);
    doc.roundedRect(x, y, cardW, cardH, 8, 8, 'F');
    setDraw(doc, COLOR.lightGrey);
    doc.setLineWidth(0.75);
    doc.roundedRect(x, y, cardW, cardH, 8, 8, 'S');
    setFill(doc, COLOR.oceanMid);
    doc.rect(x, y, 4, cardH, 'F');

    const textX = x + 16;
    const textMaxW = cardW - 32;
    doc.setFont('helvetica', 'bold');
    setText(doc, COLOR.ink);
    const titleLine = fitSingleLine(doc, sanitizePdfText(title), textMaxW, 11);
    doc.text(titleLine, textX, y + 24);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setText(doc, COLOR.grey);
    const subtitleLine = fitSingleLine(doc, sanitizePdfText(subtitle), textMaxW, 8.5);
    doc.text(subtitleLine, textX, y + 38);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    setText(doc, COLOR.oceanDeep);
    doc.text(money(cost), textX, y + 60);

    if (bookingUrl) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      setText(doc, COLOR.oceanMid);
      const linkLabel = 'View booking';
      doc.textWithLink(linkLabel, x + cardW - 16 - doc.getTextWidth(linkLabel), y + 60, { url: bookingUrl });
    }
  };

  drawBookableCard(
    MARGIN,
    pkg.costBreakdown.hotel.name,
    'Hotel',
    pkg.costBreakdown.hotel.cost,
    pkg.costBreakdown.hotel.bookingUrl,
  );
  drawBookableCard(
    MARGIN + cardW + cardGap,
    pkg.costBreakdown.flight.name,
    'Flight',
    pkg.costBreakdown.flight.cost,
    pkg.costBreakdown.flight.bookingUrl,
  );
  y += cardH + 28;

  // ===========================================================================
  // Day-by-day itinerary
  // ===========================================================================

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  setText(doc, COLOR.oceanDeep);
  y = ensureSpace(doc, y, 24);
  doc.text('Day-by-day itinerary', MARGIN, y);
  y += 20;

  for (const day of sortedItinerary) {
    const travelDay = isTravelDay(day);
    const city = day.city ?? (day.type === 'transition' ? day.toCity : undefined);
    const thumb = city ? cardImageByCity.get(city) ?? null : null;

    const dateLabel = preferences.startDate
      ? new Date(`${addDaysIso(preferences.startDate, day.day - 1)}T00:00:00`).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      : null;
    const barH = thumb ? 62 : dateLabel ? 50 : 40;

    // Keep a day's header, transport box, table and note on one page when they fit.
    const rowCount = Math.max(day.activities.length, 1);
    const dayBlockH = barH + 10 + (travelDay ? 36 : 0) + 24 + rowCount * 22 + 32;
    y = ensureSpace(doc, y, Math.min(dayBlockH, CONTENT_BOTTOM - MARGIN));

    setFill(doc, travelDay ? COLOR.goldDeep : COLOR.oceanMid);
    doc.roundedRect(MARGIN, y, CONTENT_W, barH, 8, 8, 'F');

    const thumbW = 84;
    if (thumb) {
      const thumbH = barH - 12;
      doc.addImage(
        thumb.dataUrl,
        'JPEG',
        MARGIN + CONTENT_W - thumbW - 6,
        y + 6,
        thumbW,
        thumbH,
        undefined,
        'FAST',
      );
    }

    const headerMaxW = CONTENT_W - 24 - (thumb ? thumbW + 10 : 0);
    const dayLabel = sanitizePdfText(`DAY ${day.day} · ${day.title}`);
    setText(doc, travelDay ? COLOR.oceanDeepest : COLOR.white);
    doc.setFont('helvetica', 'bold');
    const fitted = fitSingleLine(doc, dayLabel, headerMaxW, 12);
    doc.text(fitted, MARGIN + 14, dateLabel ? y + 22 : y + barH / 2 + 4);

    if (dateLabel) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      setText(doc, travelDay ? COLOR.oceanDeepest : COLOR.paleTint);
      doc.text(sanitizePdfText(dateLabel), MARGIN + 14, y + 38);
    }

    y += barH + 10;

    // Highlighted transport box for travel/transition days.
    if (travelDay) {
      const info = transitionInfo(day);
      if (info) {
        y = ensureSpace(doc, y, 34);
        setFill(doc, COLOR.goldTint);
        doc.roundedRect(MARGIN, y, CONTENT_W, 26, 6, 6, 'F');
        setDraw(doc, COLOR.goldDeep);
        doc.setLineWidth(0.75);
        doc.roundedRect(MARGIN, y, CONTENT_W, 26, 6, 6, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        setText(doc, COLOR.oceanDeepest);
        doc.text(sanitizePdfText(`Transport: ${info.modeLabel}`), MARGIN + 12, y + 17);

        const costText =
          info.costPerPerson > 0
            ? `${money(info.costPerPerson * groupSize)} total (${money(info.costPerPerson)}/person)`
            : 'Free';
        const costW = doc.getTextWidth(costText);
        doc.text(costText, MARGIN + CONTENT_W - 12 - costW, y + 17);
        y += 26 + 10;
      }
    }

    // Activities table.
    const rows =
      day.activities.length > 0
        ? day.activities.map((activity) => {
            const time = activity.time ? sanitizePdfText(activity.time) : '—';
            const price = activity.price ?? 0;
            const cost = price > 0 ? money(price) : 'Free';
            return [time, sanitizePdfText(activity.name), cost];
          })
        : [['—', 'No activities planned', '—']];

    y = ensureSpace(doc, y, 50);
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN, bottom: FOOTER_SPACE },
      head: [['Time', 'Activity', 'Cost']],
      body: rows,
      theme: 'plain',
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 6, textColor: COLOR.ink, lineColor: COLOR.lightGrey, lineWidth: 0.4 },
      headStyles: { fillColor: COLOR.oceanCard, textColor: COLOR.white, fontStyle: 'bold', lineWidth: 0 },
      alternateRowStyles: { fillColor: COLOR.paleTint },
      columnStyles: { 0: { cellWidth: 60 }, 2: { cellWidth: 70, halign: 'right' } },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

    // Local transport note.
    const transportCost = dailyTransportCostIDR(pkg.id, day.day);
    y = ensureSpace(doc, y, 16);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    setText(doc, COLOR.grey);
    doc.text(sanitizePdfText(`Estimated local transport: ${formatIDR(transportCost)}`), MARGIN, y + 10);
    y += 26;
  }

  // ===========================================================================
  // Footers on every page
  // ===========================================================================

  const totalPages = doc.getNumberOfPages();
  const footerDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    setDraw(doc, COLOR.lightGrey);
    doc.setLineWidth(0.75);
    doc.line(MARGIN, PAGE_H - FOOTER_SPACE + 4, PAGE_W - MARGIN, PAGE_H - FOOTER_SPACE + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setText(doc, COLOR.grey);
    doc.text(`Generated by TripWise · ${footerDate}`, MARGIN, PAGE_H - FOOTER_SPACE + 18);

    const pageLabel = `Page ${p} of ${totalPages}`;
    const pageLabelW = doc.getTextWidth(pageLabel);
    doc.text(pageLabel, PAGE_W - MARGIN - pageLabelW, PAGE_H - FOOTER_SPACE + 18);
  }

  const filenameDest = slugify(pkg.destination);
  const filename = `TripWise-${filenameDest}-${todayFilenameDate()}.pdf`;
  doc.save(filename);
}
