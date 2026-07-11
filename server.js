const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'rsvps.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://www.youtube.com", "https://s.ytimg.com", "https://*.ytimg.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.unsplash.com", "https://i.ytimg.com", "https://*.ytimg.com", "https://i.postimg.cc"],
      connectSrc: ["'self'", "https://api.whatsapp.com", "https://wa.me"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://api.whatsapp.com", "https://www.youtube.com", "https://*.youtube.com"],
    },
  },
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, please try again later.' },
});

const translations = {
  en: {
    site_title: "Safwan & Laiba's Wedding",
    home: "Home",
    events: "Events",
    rsvp: "RSVP",
    guests: "Guests",
    gallery: "Gallery",
    wedding: "Wedding",
    wedding_details: "Wedding Details",
    join_us: "Join us in celebrating our special day",
    date: "Date",
    time: "Time",
    venue: "Venue",
    our_story: "Our Story",
    will_you_join: "Will You Join Us?",
    confirm_presence: "Please confirm your presence by March 20, 2027",
    rsvp_now: "RSVP Now",
    invite_title: "You are cordially invited to the wedding of",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    guest_list: "Guest List",
    guest_subtitle: "Our honored guests",
    wedding_events: "Wedding Events",
    events_subtitle: "Three days of celebration",
    rsvp_title: "RSVP",
    rsvp_subtitle: "Kindly confirm your attendance",
    gallery_title: "Gallery",
    gallery_subtitle: "Memories in the making",
    quick_links: "Quick Links",
    contact: "Contact",
    our_wedding: "Our Wedding",
    footer_text: "Celebrating the union of two hearts, two families, and two destinies.",
    all_rights: "All rights reserved.",
    view_on_map: "View on Map",
    back_to_home: "Back to Home",
    submit_rsvp: "Submit RSVP",
    please_rsvp: "Please RSVP",
    rsvp_desc: "Fill out the form below to let us know if you'll be joining us.",
    full_name: "Full Name",
    email_address: "Email Address",
    attending: "Will you be attending?",
    joyfully_accept: "Joyfully Accept",
    regretfully_decline: "Regretfully Decline",
    additional_guests: "Additional Guests",
    guests_placeholder: "Names of any additional guests (e.g., +1, children)",
    rsvp_success: "Your RSVP has been received! Thank you.",
    rsvp_future: "We look forward to celebrating with you!",
    all: "All",
    confirmed: "Confirmed",
    invited: "Invited",
    pending: "Pending",
    guest: "guest(s)",
    bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    verse: "\"And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them, and He has put love and mercy between your hearts.\" — Quran 30:21",
    nikkah_time: "2:00 PM - Nikah",
    venue_tbd: "Will be decided later",
    lang_label: "English",
    music_play: "Play Music",
    music_pause: "Pause",
  },
  ur: {
    site_title: "صفوان اور لائبہ کی شادی",
    home: "ہوم",
    events: "تقریبات",
    rsvp: "تصدیق",
    guests: "مہمان",
    gallery: "گیلری",
    wedding: "شادی",
    wedding_details: "شادی کی تفصیلات",
    join_us: "ہمارے خاص دن میں شامل ہوں",
    date: "تاریخ",
    time: "وقت",
    venue: "مقام",
    our_story: "ہماری کہانی",
    will_you_join: "کیا آپ ہمارے ساتھ شامل ہوں گے؟",
    confirm_presence: "برائے مہربانی 20 مارچ 2027 تک تصدیق کریں",
    rsvp_now: "ابھی تصدیق کریں",
    invite_title: "آپ کو صفوان اور لائبہ کی شادی میں مدعو کیا جاتا ہے",
    days: "دن",
    hours: "گھنٹے",
    minutes: "منٹ",
    guest_list: "مہمانوں کی فہرست",
    guest_subtitle: "ہمارے معزز مہمان",
    wedding_events: "شادی کی تقریبات",
    events_subtitle: "تین دن کی خوشیاں",
    rsvp_title: "تصدیق",
    rsvp_subtitle: "برائے مہربانی اپنی حاضری کی تصدیق کریں",
    gallery_title: "گیلری",
    gallery_subtitle: "یادیں بن رہی ہیں",
    quick_links: "فوری لنکس",
    contact: "رابطہ",
    our_wedding: "ہماری شادی",
    footer_text: "دو دلوں، دو خاندانوں اور دو تقدیروں کے اتحاد کا جشن۔",
    all_rights: "جملہ حقوق محفوظ ہیں۔",
    view_on_map: "نقشہ دیکھیں",
    back_to_home: "ہوم پیج پر واپس جائیں",
    submit_rsvp: "تصدیق جمع کروائیں",
    please_rsvp: "برائے مہربانی تصدیق کریں",
    rsvp_desc: "ہمیں بتانے کے لیے نیچے دیے گئے فارم کو پر کریں کہ آپ شامل ہوں گے یا نہیں۔",
    full_name: "مکمل نام",
    email_address: "ای میل پتہ",
    attending: "کیا آپ شرکت کریں گے؟",
    joyfully_accept: "خوشی سے قبول ہے",
    regretfully_decline: "معذرت کے ساتھ انکار",
    additional_guests: "اضافی مہمان",
    guests_placeholder: "اضافی مہمانوں کے نام (مثلاً +1، بچے)",
    rsvp_success: "آپ کی تصدیق موصول ہو گئی ہے! شکریہ۔",
    rsvp_future: "ہم آپ کے ساتھ جشن منانے کے منتظر ہیں!",
    all: "تمام",
    confirmed: "تصدیق شدہ",
    invited: "مدعو",
    pending: "زیر التواء",
    guest: "مہمان",
    bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    verse: "\"اور اس کی نشانیوں میں سے ہے کہ اس نے تمہارے لیے تمہاری ہی جنس سے بیویاں پیدا کیں تاکہ تم ان کے ساتھ سکون حاصل کرو اور اس نے تمہارے درمیان محبت اور رحمت رکھ دی۔\" — القرآن 30:21",
    nikkah_time: "دو بجے دن - نکاح",
    venue_tbd: "مقام بعد میں طے ہوگا",
    lang_label: "اردو",
    music_play: "میوزک چلائیں",
    music_pause: "بند کریں",
  }
};

app.use((req, res, next) => {
  const lang = req.query.lang || req.cookies.lang || 'en';
  res.locals.lang = lang === 'ur' ? 'ur' : 'en';
  res.locals.t = (key) => translations[res.locals.lang]?.[key] || translations.en[key] || key;
  next();
});

app.get('/set-lang/:lang', (req, res) => {
  const lang = req.params.lang === 'ur' ? 'ur' : 'en';
  res.setHeader('Set-Cookie', `lang=${lang}; Path=/; Max-Age=${86400 * 365}`);
  res.redirect(req.get('Referer') || '/');
});

function readRSVPs() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeRSVPs(rsvps) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(rsvps, null, 2), 'utf8');
}

const guestList = [
  { name: 'Mr. Muhammad Rasheed', status: 'Invited', relation: 'Family' },
  { name: 'Muhammad Nouman Rasheed', status: 'Invited', relation: 'Family' },
  { name: 'Mrs. Rasheed', status: 'Invited', relation: 'Family' },
  { name: 'Grandfather & Grandmother', status: 'Invited', relation: 'Family' },
  { name: 'Chacha & Chachi', status: 'Invited', relation: 'Family' },
  { name: 'Mamu & Mami', status: 'Invited', relation: 'Family' },
  { name: 'Khalu & Khala', status: 'Invited', relation: 'Family' },
  { name: 'Taya & Tayi', status: 'Invited', relation: 'Family' },
  { name: 'Nana & Nani', status: 'Invited', relation: 'Family' },
  { name: 'Mama & Mami (Nani side)', status: 'Invited', relation: 'Family' },
  { name: 'Bhai & Bhabi', status: 'Invited', relation: 'Family' },
  { name: 'Apa & Jiju', status: 'Invited', relation: 'Family' },
  { name: 'Cousins (Taya side)', status: 'Invited', relation: 'Family' },
  { name: 'Cousins (Chacha side)', status: 'Invited', relation: 'Family' },
  { name: 'Cousins (Khalu side)', status: 'Invited', relation: 'Family' },
  { name: 'Neighbors & Friends', status: 'Invited', relation: 'Friend' },
  { name: 'Colleagues (Rasheed Sb)', status: 'Invited', relation: 'Colleague' },
  { name: 'Colleagues (Nouman)', status: 'Invited', relation: 'Colleague' },
];

const whatsappNumber = '923008548210';

app.get('/', (req, res) => {
  const eventDate = new Date('2027-03-26T14:00:00');
  const now = new Date();
  const diff = eventDate - now;
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));

  res.render('index', {
    title: res.locals.t('site_title'),
    currentPage: 'home',
    days, hours, minutes,
    whatsappNumber,
  });
});

app.get('/rsvp', (req, res) => {
  res.render('rsvp', {
    title: res.locals.t('site_title') + ' - ' + res.locals.t('rsvp'),
    currentPage: 'rsvp', errors: [], success: null, formData: null,
    whatsappNumber,
  });
});

app.post('/rsvp', apiLimiter, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters.').escape(),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('attending').isIn(['yes', 'no']).withMessage('Please select your attendance status.'),
  body('guests').optional().trim().isLength({ max: 500 }).escape(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('rsvp', {
      title: res.locals.t('site_title') + ' - ' + res.locals.t('rsvp'),
      currentPage: 'rsvp',
      errors: errors.array(),
      success: null,
      formData: req.body,
      whatsappNumber,
    });
  }

  const rsvps = readRSVPs();
  if (req.body.name) {
    rsvps.push({
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name: req.body.name,
      email: req.body.email || '',
      attending: req.body.attending || '',
      guests: req.body.guests || '',
      submittedAt: new Date().toISOString(),
    });
    writeRSVPs(rsvps);
  }

  res.render('rsvp', {
    title: res.locals.t('site_title') + ' - ' + res.locals.t('rsvp'),
    currentPage: 'rsvp',
    errors: [],
    success: res.locals.t('rsvp_success'),
    formData: null,
    whatsappNumber,
  });
});

app.get('/guests', (req, res) => {
  const filter = req.query.filter || 'all';
  let filtered = guestList;
  if (filter !== 'all') {
    filtered = guestList.filter(g => g.status.toLowerCase() === filter.toLowerCase());
  }

  res.render('guests', {
    title: res.locals.t('site_title') + ' - ' + res.locals.t('guests'),
    currentPage: 'guests',
    guests: filtered,
    activeFilter: filter,
  });
});

app.get('/events', (req, res) => {
  const events = [
    {
      title_en: 'Mehndi',
      title_ur: 'مہندی',
      date: 'March 25, 2027',
      time: '7:00 PM',
      venue: 'House No 154/A, Street No 56/B, Near Syed Hostel, Abdali Chowk, Islampura, Lahore',
      description: 'A night of music, dance, and henna. Join us for a colorful evening of celebration!',
      icon: 'hand',
    },
    {
      title_en: 'Barat (Nikah)',
      title_ur: 'بارات (نکاح)',
      date: 'March 26, 2027',
      time: '2:00 PM',
      venue: 'Will be decided later',
      description: 'The main wedding ceremony. Nikah will be performed followed by dinner.',
      icon: 'ring',
    },
    {
      title_en: 'Walima',
      title_ur: 'ولیمہ',
      date: 'March 27, 2027',
      time: '8:00 PM',
      venue: 'Will be decided later',
      description: 'The grand Walima reception dinner celebrating the union of two families.',
      icon: 'utensils',
    },
  ];

  res.render('events', {
    title: res.locals.t('site_title') + ' - ' + res.locals.t('events'),
    currentPage: 'events',
    events,
  });
});

app.get('/gallery', (req, res) => {
  const images = [
    { url: '', caption: 'Your Image 1' },
    { url: '', caption: 'Your Image 2' },
    { url: '', caption: 'Your Image 3' },
    { url: '', caption: 'Your Image 4' },
    { url: '', caption: 'Your Image 5' },
    { url: '', caption: 'Your Image 6' },
  ];

  res.render('gallery', {
    title: res.locals.t('site_title') + ' - ' + res.locals.t('gallery'),
    currentPage: 'gallery',
    images,
  });
});

app.use((req, res) => {
  res.status(404).render('index', {
    title: '404 - Not Found',
    currentPage: 'home', days: 0, hours: 0, minutes: 0,
    whatsappNumber,
  });
});

app.listen(PORT, () => {
  console.log(`Wedding website running at http://localhost:${PORT}`);
});
