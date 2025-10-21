// Accessible mobile nav toggle shared across pages
document.addEventListener('DOMContentLoaded', () => {
    // Support multiple nav toggles by using aria-controls -> id
    const toggles = Array.from(document.querySelectorAll('.nav-toggle'));

    // Debug helper: disabled by default
    const debugMode = false;
    let dbgEl = null;
    function dbg(msg){
        console.log('[nav-debug]', msg);
        if (!debugMode) return;
        if (!dbgEl){
            dbgEl = document.createElement('div');
            dbgEl.id = 'nav-debug';
            dbgEl.style.position = 'fixed';
            dbgEl.style.right = '8px';
            dbgEl.style.bottom = '8px';
                dbgEl.style.background = 'rgba(0,0,0,0.85)';
                dbgEl.style.color = 'white';
                dbgEl.style.padding = '12px 14px';
                dbgEl.style.fontSize = '14px';
                dbgEl.style.borderRadius = '10px';
            dbgEl.style.zIndex = '99999';
            dbgEl.style.maxWidth = '220px';
            dbgEl.style.lineHeight = '1.2';
                dbgEl.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
            document.body.appendChild(dbgEl);
        }
        dbgEl.textContent = String(msg).slice(0,200);
    }

    toggles.forEach((btn) => {
        const targetId = btn.getAttribute('aria-controls');
        const nav = targetId ? document.getElementById(targetId) : null;
        dbg(`toggle button found; aria-controls=${targetId}; navExists=${!!nav}`);
        if (!nav) return;

        btn.addEventListener('click', () => {
            dbg('toggle clicked');
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!expanded));
            if (!expanded) {
                // open: set inline max-height to scrollHeight for smooth expand
                nav.style.maxHeight = nav.scrollHeight + 'px';
                nav.classList.add('open');
                dbg('nav opened');
                // show computed styles to help diagnose visibility issues
                try {
                    const cs = window.getComputedStyle(nav);
                    dbg(`computed: display=${cs.display}; height=${cs.height}; max-height=${cs.maxHeight}; z-index=${cs.zIndex}; visibility=${cs.visibility}; pointer-events=${cs.pointerEvents}`);
                } catch (err) {
                    dbg('computed style read error');
                }
            } else {
                // close
                nav.style.maxHeight = null;
                nav.classList.remove('open');
                dbg('nav closed');
            }
        });
    });

    dbg(`toggles total: ${toggles.length}`);

    // Close any open navs with Escape
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        toggles.forEach((btn) => {
            const targetId = btn.getAttribute('aria-controls');
            const nav = targetId ? document.getElementById(targetId) : null;
            if (!nav) return;
            if (nav.classList.contains('open')) {
                nav.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
                btn.focus();
            }
        });
    });
});

/* Feedback carousel */
(() => {
    const items = Array.from(document.querySelectorAll('.fb-item'));
    if (!items.length) return;

    let current = 0;
    const show = (index) => {
        items.forEach((it, i) => it.classList.toggle('active', i === index));
    };

    show(current);

    const next = () => { current = (current + 1) % items.length; show(current); };
    const prev = () => { current = (current - 1 + items.length) % items.length; show(current); };

    const nextBtn = document.querySelector('.fb-next');
    const prevBtn = document.querySelector('.fb-prev');
    let timer = setInterval(next, 4000);

    if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetTimer(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetTimer(); });

    function resetTimer(){
        clearInterval(timer);
        timer = setInterval(next, 4000);
    }

    // pause on hover
    const wrapper = document.querySelector('.fb-item-wrapper');
    if (wrapper){
        wrapper.addEventListener('mouseenter', () => clearInterval(timer));
        wrapper.addEventListener('mouseleave', () => { resetTimer(); });
    }
})();

// Contact form handler: use Formspree when configured, otherwise fallback to mailto
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const formspreeId = form.getAttribute('data-formspree-id') || '';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        // If a Formspree ID is configured, submit using fetch
        if (formspreeId) {
            try {
                const res = await fetch(`https://formspree.io/f/${formspreeId.replace(/^f\//,'')}`, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: formData
                });

                if (res.ok) {
                    alert('Bedankt! Je bericht is verzonden.');
                    form.reset();
                } else {
                    const json = await res.json();
                    alert(json.error || 'Er is iets misgegaan bij het verzenden.');
                }
            } catch (err) {
                console.error(err);
                alert('Er is een verbindingsfout. Probeer het later opnieuw.');
            }

            return;
        }

        // No Formspree ID: fallback to mailto (opens user's email client)
        const name = formData.get('name') || '';
        const email = formData.get('email') || '';
        const subject = formData.get('subject') || '';
        const message = formData.get('message') || '';

        const to = 'vandegraafsteven@gmail.com';
        const body = encodeURIComponent(`Naam: ${name}\nEmail: ${email}\nOnderwerp: ${subject}\n\n${message}`);
        const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`;
        window.location.href = mailto;
    });
});
