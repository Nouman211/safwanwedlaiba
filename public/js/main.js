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
  var playerDiv = document.getElementById('youtubePlayer');

  if (btn && playerDiv) {
    var playing = false;
    var player = null;
    var playerReady = false;

    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(tag, firstScript);

    window.onYouTubeIframeAPIReady = function () {
      player = new YT.Player('youtubePlayer', {
        height: '1',
        width: '1',
        videoId: '8mYeTuzBQr4',
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: '8mYeTuzBQr4',
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          start: 3,
        },
        events: {
          onReady: function () {
            playerReady = true;
            player.setVolume(50);
            player.playVideo();
            playing = true;
            icon.className = 'fas fa-pause';
            label.textContent = 'Pause';
          },
        },
      });
    };

    function onUserInteraction() {
      if (player && playerReady && player.isMuted && player.isMuted()) {
        player.unMute();
      }
      document.removeEventListener('click', onUserInteraction);
      document.removeEventListener('touchstart', onUserInteraction);
    }
    document.addEventListener('click', onUserInteraction, { once: true });
    document.addEventListener('touchstart', onUserInteraction, { once: true });

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (player && playerReady) {
        if (playing) {
          player.pauseVideo();
          icon.className = 'fas fa-play';
          label.textContent = 'Play Music';
          playing = false;
        } else {
          player.playVideo();
          icon.className = 'fas fa-pause';
          label.textContent = 'Pause';
          playing = true;
        }
      }
    });
  }
});
