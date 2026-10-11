/**
 * VAIBHAV RAJ (VAYBHAV) — Interactive Client Engine
 * Ambient Three.js particles, cursor tracking, mobile nav, GSAP scroll reveals
 */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover:none),(pointer:coarse)').matches;
  var isMobile = window.innerWidth < 860;

  if (isTouch) {
    document.body.classList.add('no-cursor');
  }

  /* ---------- LOADER ---------- */
  window.addEventListener('load', function () {
    var loader = document.getElementById('loader');
    if (loader) {
      setTimeout(function () {
        loader.classList.add('done');
        document.body.classList.remove('lock');
      }, reduceMotion ? 120 : 700);
    } else {
      document.body.classList.remove('lock');
    }
  });

  /* ---------- CUSTOM CURSOR ---------- */
  if (!isTouch) {
    var dot = document.getElementById('cursor-dot');
    if (dot) {
      window.addEventListener('mousemove', function (e) {
        dot.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%,-50%)';
      });

      // Scale cursor slightly on hover over interactive elements
      document.querySelectorAll('a, button, .stat-card, .project-card, .client-card, .blog-card, .service-card').forEach(function (el) {
        el.addEventListener('mouseenter', function () {
          dot.style.width = '14px';
          dot.style.height = '14px';
          dot.style.background = 'var(--purple)';
          dot.style.boxShadow = '0 0 16px var(--purple)';
        });
        el.addEventListener('mouseleave', function () {
          dot.style.width = '6px';
          dot.style.height = '6px';
          dot.style.background = 'var(--blue)';
          dot.style.boxShadow = '0 0 12px var(--blue)';
        });
      });
    }
  }

  /* ---------- MOBILE NAV ---------- */
  var menuBtn = document.getElementById('mobile-menu-btn');
  var mnav = document.getElementById('mobile-nav');
  if (menuBtn && mnav) {
    menuBtn.addEventListener('click', function () {
      var open = mnav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
      menuBtn.textContent = open ? '✕' : '☰';
      if (open) {
        document.body.classList.add('lock');
      } else {
        document.body.classList.remove('lock');
      }
    });

    mnav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mnav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.textContent = '☰';
        document.body.classList.remove('lock');
      });
    });
  }

  /* ---------- CASE STUDY / DETAILS TOGGLE ---------- */
  document.querySelectorAll('.details-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('data-case');
      var panel = document.getElementById('case-' + targetId);
      if (panel) {
        var isOpen = panel.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen);
        btn.textContent = isOpen ? 'Hide details' : 'View details';
      }
    });
  });

  /* ---------- CONTACT REVEAL ---------- */
  var cta = document.getElementById('build-cta');
  var reveal = document.getElementById('contact-reveal');
  if (cta && reveal) {
    cta.addEventListener('click', function () {
      reveal.hidden = false;
      var firstLink = reveal.querySelector('a');
      if (firstLink) firstLink.focus();
    });

    if (!isTouch && !reduceMotion) {
      cta.addEventListener('mousemove', function (e) {
        var r = cta.getBoundingClientRect();
        cta.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22) + 'px)';
      });
      cta.addEventListener('mouseleave', function () {
        cta.style.transform = 'translate(0,0)';
      });
    }
  }

  /* ---------- 3D CARD TILT ---------- */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll('.stat-card, .shortcut-card, .spec-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(600px) rotateX(' + (-py * 7) + 'deg) rotateY(' + (px * 7) + 'deg) translateY(-2px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ---------- GSAP SCROLL REVEALS ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll('.reveal').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: reduceMotion ? 0 : 26 },
        {
          opacity: 1,
          y: 0,
          duration: reduceMotion ? 0.01 : 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%'
          }
        }
      );
    });
  } else {
    // Fallback if GSAP is not loaded
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.style.opacity = '1';
    });
  }

  /* ---------- 3D BACKGROUND PARTICLES (THREE.JS) ---------- */
  var canvas = document.getElementById('bg-canvas') || document.getElementById('robot-canvas');
  if (canvas && window.THREE) {
    try {
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0.2, 5.2);

      var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      var pCount = reduceMotion ? 0 : (isMobile ? 110 : 360);
      var positions = new Float32Array(pCount * 3);
      for (var i = 0; i < pCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 11;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
      }

      var pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      var pMat = new THREE.PointsMaterial({
        size: 0.038,
        color: 0x88aaff,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      var particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);

      var clock = new THREE.Clock();

      function animate() {
        requestAnimationFrame(animate);
        var t = clock.getElapsedTime();
        if (!reduceMotion) {
          camera.position.x = Math.sin(t * 0.15) * 0.18;
          camera.position.y = 0.2 + Math.cos(t * 0.2) * 0.06;
          camera.lookAt(isMobile ? 0 : 0.6, -0.1, 0);
          particles.rotation.y = t * 0.022;
        }
        renderer.render(scene, camera);
      }

      animate();

      window.addEventListener('resize', function () {
        isMobile = window.innerWidth < 860;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    } catch (e) {
      console.warn('WebGL/Three.js initialization skipped:', e);
    }
  }

})();
