document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.nav-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
      menu.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });

    document.querySelectorAll('.nav-menu a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      });
    });
  }

  var navbar = document.querySelector('.navbar');
  var lastScroll = 0;

  window.addEventListener('scroll', function () {
    var currentScroll = window.pageYOffset;
    if (currentScroll > 100) {
      navbar.style.background = currentScroll > lastScroll
        ? 'linear-gradient(135deg, rgba(44,24,16,0.98), rgba(90,30,40,0.96))'
        : 'linear-gradient(135deg, rgba(44,24,16,0.95), rgba(90,30,40,0.93))';
    }
    lastScroll = currentScroll;
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.detail-card, .timeline-item, .event-card, .guest-card').forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  var btn = document.getElementById('musicToggle');
  var icon = document.getElementById('musicIcon');
  var label = document.getElementById('musicLabel');
  var audio = document.getElementById('bgAudio');

  if (btn && audio) {
    var playing = false;
    var savedTime = parseFloat(sessionStorage.getItem('audioTime')) || 0;
    var wasPlaying = sessionStorage.getItem('audioPlaying') === 'true';

    if (savedTime > 0) { audio.currentTime = savedTime; }

    function updateUI(isPlaying) {
      icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
      label.textContent = isPlaying ? 'Pause' : 'Play Music';
      playing = isPlaying;
    }

    function playAudio() {
      audio.play().then(function () {
        updateUI(true);
      }).catch(function () {
        updateUI(false);
      });
    }

    function pauseAudio() {
      audio.pause();
      updateUI(false);
    }

    playAudio();

    function firstTapHandler() {
      if (!playing) { playAudio(); }
      document.removeEventListener('click', firstTapHandler);
      document.removeEventListener('touchstart', firstTapHandler);
    }
    document.addEventListener('click', firstTapHandler, { once: true });
    document.addEventListener('touchstart', firstTapHandler, { once: true });

    setInterval(function () {
      sessionStorage.setItem('audioTime', audio.currentTime);
      sessionStorage.setItem('audioPlaying', playing ? 'true' : 'false');
    }, 500);

    window.addEventListener('beforeunload', function () {
      sessionStorage.setItem('audioTime', audio.currentTime);
      sessionStorage.setItem('audioPlaying', playing ? 'true' : 'false');
    });

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (playing) { pauseAudio(); }
      else { playAudio(); }
    });
  }
});
