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

  /* ===== Countdown Timer ===== */
  var countdownTimer = document.getElementById('countdownTimer');
  if (countdownTimer) {
    var weddingDate = new Date('2027-03-26T14:00:00').getTime();

    function updateCountdown() {
      var now = new Date().getTime();
      var distance = weddingDate - now;

      if (distance <= 0) {
        document.getElementById('countDays').textContent = '00';
        document.getElementById('countHours').textContent = '00';
        document.getElementById('countMinutes').textContent = '00';
        document.getElementById('countSeconds').textContent = '00';
        return;
      }

      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      document.getElementById('countDays').textContent = days < 10 ? '0' + days : days;
      document.getElementById('countHours').textContent = hours < 10 ? '0' + hours : hours;
      document.getElementById('countMinutes').textContent = minutes < 10 ? '0' + minutes : minutes;
      document.getElementById('countSeconds').textContent = seconds < 10 ? '0' + seconds : seconds;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }
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

  /* Smooth scroll for anchor links */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="/#"]');
    if (!link) return;
    var id = link.getAttribute('href').replace('/#', '');
    var target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  /* Scroll to hash on load */
  if (window.location.hash) {
    setTimeout(function () {
      var target = document.getElementById(window.location.hash.replace('#', ''));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }

  /* Active nav link on scroll */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-link');
  if (sections.length && navLinks.length) {
    var scrollObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          var activeLink = document.querySelector('.nav-link[href="/#' + entry.target.id + '"]');
          if (activeLink) activeLink.classList.add('active');
        }
      });
    }, { threshold: 0.3 });
    sections.forEach(function (s) { scrollObserver.observe(s); });
  }

  var btn = document.getElementById('musicToggle');
  var icon = document.getElementById('musicIcon');
  var label = document.getElementById('musicLabel');
  var audio = document.getElementById('bgAudio');

  if (btn && audio) {
    audio.volume = 0.5;
    var playing = false;

    function startPlaying() {
      audio.volume = 0.5;
      audio.play().then(function () {
        playing = true;
        icon.className = 'fas fa-pause';
        label.textContent = 'Pause';
        removeInteractionListeners();
      }).catch(function () {});
    }

    function onFirstInteraction() {
      startPlaying();
    }

    function removeInteractionListeners() {
      document.removeEventListener('click', onFirstInteraction);
      document.removeEventListener('touchstart', onFirstInteraction);
      document.removeEventListener('scroll', onFirstInteraction);
      document.removeEventListener('mousemove', onFirstInteraction);
      document.removeEventListener('keydown', onFirstInteraction);
    }

    var playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(function () {
        playing = true;
        icon.className = 'fas fa-pause';
        label.textContent = 'Pause';
      }).catch(function () {
        playing = false;
        icon.className = 'fas fa-play';
        label.textContent = 'Play Music';
        document.addEventListener('click', onFirstInteraction);
        document.addEventListener('touchstart', onFirstInteraction);
        document.addEventListener('scroll', onFirstInteraction);
        document.addEventListener('mousemove', onFirstInteraction);
        document.addEventListener('keydown', onFirstInteraction);
      });
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      removeInteractionListeners();
      if (playing) {
        audio.pause();
        icon.className = 'fas fa-play';
        label.textContent = 'Play Music';
        playing = false;
      } else {
        startPlaying();
      }
    });
  }
});
