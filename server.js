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
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.unsplash.com", "https://i.postimg.cc"],
      connectSrc: ["'self'", "https://api.whatsapp.com", "https://wa.me"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://api.whatsapp.com"],
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
    seconds: "Seconds",
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
    how_we_met: "How We Met",
    how_we_met_desc: "Long before they understood the meaning of love, their families had already tied their hearts together in a beautiful childhood engagement. They grew up as strangers, each following their own dreams and creating their own memories, completely unaware that destiny had already written their names beside each other.",
    beautiful_discovery: "The Beautiful Discovery",
    beautiful_discovery_desc: "Years passed, and life brought them together again. It was then that they learned a wonderful secret—that they had been engaged since childhood. What began as a surprising revelation soon felt like a story written by fate itself. Every conversation and every moment together seemed to confirm that some connections are meant to be.",
    the_wedding: "The Wedding",
    the_wedding_desc: "With hearts full of gratitude and excitement, they embraced the journey that had begun long ago without their knowledge. What was once a promise made by their families became a love they chose wholeheartedly. Today, they celebrate not only their wedding but also a beautiful destiny that patiently waited for them to discover each other.",
    gallery_coming_soon: "Gallery Coming Soon",
    gallery_coming_soon_desc: "We will be adding photos soon. Check back later!",
    enter_name: "Please enter your name.",
    select_attendance: "Please select your attendance status.",
    wedding_family: "Wedding Family",
    weds: "weds",
    countdown_title: "Forever Begins In",
    countdown_quote: "\"Two souls, one heart — a love story written in the stars.\"",
    countdown_date: "26th March 2027",
    family: "Family",
    friend: "Friend",
    colleague: "Colleague",
    invited_status: "Invited",
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
    seconds: "سیکنڈ",
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
    how_we_met: "ہم کیسے ملے",
    how_we_met_desc: "جب وہ محبت کا مطلب نہیں سمجھتے تھے، تو اس سے پہلے ہی ان کے خاندانوں نے ان کے دلوں کو ایک خوبصورت بچپن کی منگنی سے باندھ دیا تھا۔ وہ غریبوں کی طرح بڑھے، ہر ایک نے اپنے خوابوں کی پی کی اور اپنی یادیں بنائیں، بالکل اس بات سے بے خبر کہ قدر نے پہلے ہی ان کے ناموں کو ایک دوسرے کے ساتھ لکھ دیا تھا۔",
    beautiful_discovery: "خوبصورت دریافت",
    beautiful_discovery_desc: "سال گزر گئے، اور زندگی انہیں پھر سے ملائی۔ تب انہیں ایک شاندار راز معلوم ہوا کہ وہ بچپن سے منگی ہوئی تھیں۔ جو ایک حیرت انگیز انکشاف تھا وہ جلد ہی ایک ایسی کہانی لگ جسے خود قدر نے لکھا ہو۔ ہر گفتگو اور ہر ساتھ بیتا لمحہ جیسے تصدیق کر رہا تھا کہ کچھ رشتے مقدر میں لکھے ہوتے ہیں۔",
    the_wedding: "شادی",
    the_wedding_desc: "شکرگزاری اور خوشی سے بھرے دلوں کے ساتھ، انہوں نے اس سفر کو گلے لگایا جو ان کی جانے کے بہت پہلے شروع ہو چکا تھا۔ جو کبھی ان کے خاندانوں کا وعدہ تھا وہ اب ایک محبت بن گیا جسے انہوں نے دل سے منتخب کیا۔ آج وہ نہ صرف اپنی شادی منا رہے ہیں بلکہ ایک خوبصورت تقدیر کا جشن منا رہے ہیں جس نے صبر سے ان کا انتظار کیا تھا۔",
    gallery_coming_soon: "گیلری جلد آ رہی ہے",
    gallery_coming_soon_desc: "ہم جلد تصاویر شامل کریں گے۔ دوبارہ چیک کریں!",
    enter_name: "براہ کرم اپنا نام درج کریں۔",
    select_attendance: "براہ کرم اپنی حاضری کی حالت منتخب کریں۔",
    wedding_family: "شادی کا خاندان",
    weds: "ساتھ",
    countdown_title: "ہمیشہ شروع ہوتی ہے",
    countdown_quote: "\"دو دل، ایک دھڑکن — ستاروں میں لکھی اک محبت کی کہانی۔\"",
    countdown_date: "26 مارچ 2027",
    family: "خاندان",
    friend: "دوست",
    colleague: "ساتھی",
    invited_status: "مدعو",
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

var events = [
  {
    title_en: 'Mehndi',
    title_ur: 'مہندی',
    date: 'March 25, 2027',
    time: '7:00 PM',
    venue: 'House No 154/A, Street No 56/B, Near Syed Hostel, Abdali Chowk, Islampura, Lahore',
    description: 'A night of music, dance, and henna. Join us for a colorful evening of celebration!',
    description_ur: 'موسیقی، رقص اور مہندی کی رات۔ ہمارے رنگین جشن میں شامل ہوں!',
    icon: 'hand',
    guests_en: 'Awaiting Eyes',
    guests_ur: 'بے تابی سے انتظار',
    names: ['Washma Lodhi', 'Umama Lodhi', 'Rabia Nouman', 'Mirha Lodhi', 'Manha Lodhi', 'Paro Majid', 'Fatima Lodhi', 'Rumaisa Lodhi', 'Safa Lodhi', 'Eshmal Lodhi', 'Maryam Lodhi', 'Fatima Shahid'],
  },
  {
    title_en: 'Barat (Nikah)',
    title_ur: 'بارات (نکاح)',
    date: 'March 26, 2027',
    time: '2:00 PM',
    venue: 'Will be decided later',
    description: 'The main wedding ceremony. Nikah will be performed followed by dinner.',
    description_ur: 'مرکزی شادی کی تقریب۔ نکاح کی تقریب کے بعد رات کا کھانا پیش کیا جائے گا۔',
    icon: 'ring',
  },
  {
    title_en: 'Walima',
    title_ur: 'ولیمہ',
    date: 'March 27, 2027',
    time: '8:00 PM',
    venue: 'Will be decided later',
    description: 'The grand Walima reception dinner celebrating the union of two families.',
    description_ur: 'دو خاندانوں کے اتحاد کا جشن مناتا شاندار ولیمہ کا دعوت۔',
    icon: 'utensils',
  },
];

var galleryImages = [
  { url: '', caption: 'Your Image 1' },
  { url: '', caption: 'Your Image 2' },
  { url: '', caption: 'Your Image 3' },
  { url: '', caption: 'Your Image 4' },
  { url: '', caption: 'Your Image 5' },
  { url: '', caption: 'Your Image 6' },
];

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
    events: events,
    guests: guestList,
    images: galleryImages,
  });
});

app.get('/events', (req, res) => res.redirect('/#events'));
app.get('/guests', (req, res) => res.redirect('/#guests'));
app.get('/gallery', (req, res) => res.redirect('/#gallery'));
app.get('/rsvp', (req, res) => res.redirect('/#rsvp'));

app.post('/rsvp', apiLimiter, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters.').escape(),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('attending').isIn(['yes', 'no']).withMessage('Please select your attendance status.'),
  body('guests').optional().trim().isLength({ max: 500 }).escape(),
], (req, res) => {
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
  res.redirect('/#rsvp');
});

app.use((req, res) => {
  res.status(404).render('index', {
    title: '404 - Not Found',
    currentPage: 'home', days: 0, hours: 0, minutes: 0,
    whatsappNumber,
    events: events,
    guests: guestList,
    images: galleryImages,
  });
});

app.listen(PORT, () => {
  console.log(`Wedding website running at http://localhost:${PORT}`);
});
