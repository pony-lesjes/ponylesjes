// Accessible mobile nav toggle shared across pages
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('.nav-toggle');
    const nav = document.getElementById('primary-navigation');

    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true' || false;
        btn.setAttribute('aria-expanded', !expanded);
        nav.classList.toggle('open');
    });

    // Close menu with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('open')){
            nav.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
            btn.focus();
        }
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
