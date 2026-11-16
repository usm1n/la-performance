import { config, esc, t, has, isPH, icon, pageHead, waLink, hasWhatsapp, igHandle, qs, qsa } from '../core/util.js';

export default async function render(main) {
  const F = config.form;
  const B = config.business;
  const L = config.pages.contact.labels;
  const preselect = new URLSearchParams(location.search).get('service') || '';
  const nextYear = new Date().getFullYear() + 1;
  const today = new Date().toISOString().slice(0, 10);
  const show = (v) => has(v) || (isPH(v) && config.devMode);

  const field = (name, input, { required = false, wide = false } = {}) => `
    <div class="field ${wide ? 'field--wide' : ''}">
      <label for="f-${name}">${t(F.fields[name])}${required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>
      ${input}
      <p class="field__err" id="e-${name}" role="alert"></p>
    </div>`;
  const attrs = (name, required) => `id="f-${name}" name="${name}" aria-describedby="e-${name}" ${required ? 'required aria-required="true"' : ''} ${F.placeholders[name] ? `placeholder="${esc(F.placeholders[name])}"` : ''}`;

  main.innerHTML = `
    ${pageHead('contact')}
    <section class="section section--tight">
      <div class="wrap contact__grid">
        <form class="form reveal" novalidate>
          ${!hasWhatsapp() && config.devMode ? `<p class="form__warn"><mark class="ph">${esc(F.noWhatsapp)}</mark></p>` : ''}
          <div class="form__grid">
            ${field('name', `<input type="text" autocomplete="name" ${attrs('name', true)}>`, { required: true })}
            ${field('phone', `<input type="tel" inputmode="tel" autocomplete="tel" ${attrs('phone', true)}>`, { required: true })}
            ${field('make', `<input type="text" list="makes" ${attrs('make', true)}><datalist id="makes">${config.supportedBrands.map((b) => `<option value="${esc(b)}">`).join('')}</datalist>`, { required: true })}
            ${field('model', `<input type="text" ${attrs('model', true)}>`, { required: true })}
            ${field('year', `<input type="number" inputmode="numeric" min="1980" max="${nextYear}" ${attrs('year', false)}>`)}
            ${field('service', `<select ${attrs('service', true)}>
                <option value="">${t(F.servicePrompt)}</option>
                ${config.services.map((s) => `<option value="${esc(s.title)}" ${s.id === preselect ? 'selected' : ''}>${t(s.title)}</option>`).join('')}
              </select>`, { required: true })}
            ${field('date', `<input type="date" min="${today}" ${attrs('date', false)}>`)}
            ${field('mods', `<input type="text" ${attrs('mods', false)}>`)}
            ${field('message', `<textarea rows="4" ${attrs('message', false)}></textarea>`, { wide: true })}
          </div>
          <button class="btn btn--wa" type="submit">${icon('whatsapp')} ${t(F.submit)}</button>
          <p class="form__note">${t(F.note)}</p>
        </form>

        <aside class="contact__side">
          <div class="panel reveal">
            <h2 class="panel__title">${t(L.visit)}</h2>
            <ul class="infolist">
              ${show(B.address) ? `<li>${icon('pin')}<div><strong>${t(L.address)}</strong><span>${t(B.address)}${show(B.city) ? `, ${t(B.city)}` : ''}</span></div></li>` : ''}
              ${show(B.hours) ? `<li>${icon('clock')}<div><strong>${t(L.hours)}</strong><span>${t(B.hours)}</span></div></li>` : ''}
              ${show(B.email) ? `<li>${icon('mail')}<div><strong>${t(L.email)}</strong><span>${has(B.email) ? `<a href="mailto:${esc(B.email)}">${esc(B.email)}</a>` : t(B.email)}</span></div></li>` : ''}
              ${igHandle() ? `<li>${icon('instagram')}<div><strong>${t(L.instagram)}</strong><span><a href="${esc(config.socials.instagram)}" target="_blank" rel="noopener">@${esc(igHandle())}</a></span></div></li>` : ''}
            </ul>
          </div>
          <div class="map reveal">
            ${has(B.mapEmbedUrl)
              ? `<iframe src="${esc(B.mapEmbedUrl)}" title="${esc(L.map)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`
              : `<div class="media"><span class="media__ph">MAP${config.devMode ? `<mark class="ph ph--sm">${esc(B.mapEmbedUrl)}</mark>` : ''}</span></div>`}
          </div>
        </aside>
      </div>
    </section>`;

  // ---------- validation + WhatsApp hand-off ----------
  const form = qs('form', main);
  const get = (n) => form.elements[n];
  const setErr = (n, msg) => {
    const el = get(n);
    qs(`#e-${n}`, form).textContent = msg || '';
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    el.closest('.field').classList.toggle('has-err', !!msg);
    return !msg;
  };
  const rules = {
    name: (v) => (v ? '' : F.errors.required),
    phone: (v) => (!v ? F.errors.required : v.replace(/\D/g, '').length >= 7 && /^[+\d][\d\s\-()]*$/.test(v) ? '' : F.errors.phone),
    make: (v) => (v ? '' : F.errors.required),
    model: (v) => (v ? '' : F.errors.required),
    service: (v) => (v ? '' : F.errors.required),
    year: (v) => (!v || (/^\d{4}$/.test(v) && +v >= 1980 && +v <= nextYear) ? '' : F.errors.year),
  };
  const check = (n) => setErr(n, rules[n](get(n).value.trim()));
  Object.keys(rules).forEach((n) => {
    get(n).addEventListener('blur', () => check(n));
    get(n).addEventListener('input', () => { if (get(n).getAttribute('aria-invalid') === 'true') check(n); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = Object.keys(rules).filter((n) => !check(n));
    if (bad.length) { get(bad[0]).focus(); return; }
    const v = (n) => get(n).value.trim();
    const lines = [
      `*${F.messageHeader}*`,
      '',
      `${F.fields.name}: ${v('name')}`,
      `${F.fields.phone}: ${v('phone')}`,
      `Bike: ${[v('year'), v('make'), v('model')].filter(Boolean).join(' ')}`,
      v('mods') ? `${F.fields.mods}: ${v('mods')}` : null,
      `${F.fields.service}: ${v('service')}`,
      v('date') ? `${F.fields.date}: ${v('date')}` : null,
      v('message') ? `${F.fields.message}: ${v('message')}` : null,
    ].filter((l) => l !== null);
    const text = lines.join('\n');
    const url = hasWhatsapp() ? waLink(text) : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener');
  });
  void qsa;
}
