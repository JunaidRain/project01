// 8 Professional Resume Templates Renderer

export function renderResumeHTML(data, templateName = 'modern') {
  const accent = data.accentColor || '#6366f1';
  const info = data.personalInfo || {};
  const expList = data.experience || [];
  const eduList = data.education || [];
  const skillsList = data.skills || [];
  const projList = data.projects || [];

  switch (templateName) {
    case 'classic':
      return renderClassic(info, expList, eduList, skillsList, projList, accent);
    case 'tech':
      return renderTech(info, expList, eduList, skillsList, projList, accent);
    case 'creative':
      return renderCreative(info, expList, eduList, skillsList, projList, accent);
    case 'swiss':
      return renderSwiss(info, expList, eduList, skillsList, projList, accent);
    case 'navy':
      return renderNavy(info, expList, eduList, skillsList, projList, accent);
    case 'emerald':
      return renderEmerald(info, expList, eduList, skillsList, projList, accent);
    case 'compact':
      return renderCompact(info, expList, eduList, skillsList, projList, accent);
    case 'modern':
    default:
      return renderModern(info, expList, eduList, skillsList, projList, accent);
  }
}

/* -------------------------------------------------------------
   TEMPLATE 1: MODERN EXECUTIVE (Sidebar + Clean Grid)
------------------------------------------------------------- */
function renderModern(info, exp, edu, skills, proj, accent) {
  return `
    <div class="resume-paper template-modern" style="--accent: ${accent}">
      <div class="modern-sidebar">
        ${info.photoUrl ? `<img src="${info.photoUrl}" alt="Photo" class="resume-photo" data-field="photoUrl" />` : ''}
        <h1 class="editable" data-field="fullName">${info.fullName || 'Your Name'}</h1>
        <p class="subtitle editable" data-field="jobTitle">${info.jobTitle || 'Job Title'}</p>
        
        <div class="sidebar-section">
          <h3>Contact</h3>
          ${info.email ? `<p><strong>Email:</strong> <span class="editable" data-field="email">${info.email}</span></p>` : ''}
          ${info.phone ? `<p><strong>Phone:</strong> <span class="editable" data-field="phone">${info.phone}</span></p>` : ''}
          ${info.location ? `<p><strong>Location:</strong> <span class="editable" data-field="location">${info.location}</span></p>` : ''}
          ${info.age ? `<p><strong>Age:</strong> <span class="editable" data-field="age">${info.age}</span></p>` : ''}
          ${info.linkedin ? `<p><strong>LinkedIn:</strong> <span class="editable" data-field="linkedin">${info.linkedin}</span></p>` : ''}
          ${info.github ? `<p><strong>GitHub:</strong> <span class="editable" data-field="github">${info.github}</span></p>` : ''}
          ${info.website ? `<p><strong>Website:</strong> <span class="editable" data-field="website">${info.website}</span></p>` : ''}
        </div>

        <div class="sidebar-section">
          <h3>Skills</h3>
          <div class="skills-tags">
            ${skills.map((s, idx) => `<span class="skill-tag editable" data-field="skills[${idx}]">${s}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="modern-main">
        ${info.summary ? `
          <div class="resume-section">
            <h2 class="section-title">Professional Summary</h2>
            <p class="editable" data-field="summary">${info.summary}</p>
          </div>
        ` : ''}

        <div class="resume-section">
          <h2 class="section-title">Experience</h2>
          ${exp.map((item, idx) => `
            <div class="timeline-item">
              <div class="item-header">
                <span class="item-title editable" data-field="exp[${idx}].title">${item.title}</span>
                <span class="item-date editable" data-field="exp[${idx}].duration">${item.duration}</span>
              </div>
              <div class="item-company editable" data-field="exp[${idx}].company">${item.company} ${item.location ? `&bull; ${item.location}` : ''}</div>
              <p class="item-desc editable" data-field="exp[${idx}].description">${item.description}</p>
            </div>
          `).join('')}
        </div>

        <div class="resume-section">
          <h2 class="section-title">Education & Qualifications</h2>
          ${edu.map((item, idx) => `
            <div class="timeline-item">
              <div class="item-header">
                <span class="item-title editable" data-field="edu[${idx}].degree">${item.degree}</span>
                <span class="item-date editable" data-field="edu[${idx}].year">${item.year}</span>
              </div>
              <div class="item-company editable" data-field="edu[${idx}].institution">${item.institution} ${item.grade ? `(${item.grade})` : ''}</div>
            </div>
          `).join('')}
        </div>

        ${proj.length ? `
          <div class="resume-section">
            <h2 class="section-title">Key Projects</h2>
            ${proj.map((item, idx) => `
              <div class="timeline-item">
                <div class="item-header">
                  <span class="item-title editable" data-field="proj[${idx}].name">${item.name}</span>
                  <span class="item-date editable" data-field="proj[${idx}].technologies">${item.technologies}</span>
                </div>
                <p class="item-desc editable" data-field="proj[${idx}].description">${item.description}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------
   TEMPLATE 2: CLASSIC / PLAIN (Traditional Corporate Format)
------------------------------------------------------------- */
function renderClassic(info, exp, edu, skills, proj, accent) {
  return `
    <div class="resume-paper template-classic" style="--accent: ${accent}">
      <header class="classic-header">
        <h1 class="editable" data-field="fullName">${info.fullName}</h1>
        <p class="classic-title editable" data-field="jobTitle">${info.jobTitle}</p>
        <div class="classic-contact">
          ${info.email ? `<span class="editable" data-field="email">${info.email}</span> &bull; ` : ''}
          ${info.phone ? `<span class="editable" data-field="phone">${info.phone}</span> &bull; ` : ''}
          ${info.location ? `<span class="editable" data-field="location">${info.location}</span>` : ''}
          ${info.linkedin ? ` &bull; <span class="editable" data-field="linkedin">${info.linkedin}</span>` : ''}
        </div>
      </header>
      <hr class="divider"/>

      ${info.summary ? `
        <section class="classic-section">
          <h2>SUMMARY</h2>
          <p class="editable" data-field="summary">${info.summary}</p>
        </section>
      ` : ''}

      <section class="classic-section">
        <h2>EXPERIENCE</h2>
        ${exp.map((item, idx) => `
          <div class="classic-entry">
            <div class="entry-row">
              <strong class="editable" data-field="exp[${idx}].title">${item.title}</strong> — <span class="editable" data-field="exp[${idx}].company">${item.company}</span>
              <span class="right-align editable" data-field="exp[${idx}].duration">${item.duration}</span>
            </div>
            <p class="editable" data-field="exp[${idx}].description">${item.description}</p>
          </div>
        `).join('')}
      </section>

      <section class="classic-section">
        <h2>EDUCATION</h2>
        ${edu.map((item, idx) => `
          <div class="classic-entry">
            <div class="entry-row">
              <strong class="editable" data-field="edu[${idx}].degree">${item.degree}</strong>, <span class="editable" data-field="edu[${idx}].institution">${item.institution}</span>
              <span class="right-align editable" data-field="edu[${idx}].year">${item.year}</span>
            </div>
          </div>
        `).join('')}
      </section>

      <section class="classic-section">
        <h2>SKILLS & COMPETENCIES</h2>
        <p>${skills.map((s, idx) => `<span class="editable" data-field="skills[${idx}]">${s}</span>`).join(', ')}</p>
      </section>
    </div>
  `;
}

/* -------------------------------------------------------------
   TEMPLATE 3: TECH & DEVELOPER (Badge & Code Accent)
------------------------------------------------------------- */
function renderTech(info, exp, edu, skills, proj, accent) {
  return `
    <div class="resume-paper template-tech" style="--accent: ${accent}">
      <header class="tech-header">
        <div class="tech-title-block">
          <h1 class="editable" data-field="fullName">${info.fullName}</h1>
          <div class="tech-tag editable" data-field="jobTitle">&lt; ${info.jobTitle} /&gt;</div>
        </div>
        ${info.photoUrl ? `<img src="${info.photoUrl}" alt="Avatar" class="tech-avatar" />` : ''}
      </header>

      <div class="tech-meta-bar">
        <span>📧 <span class="editable" data-field="email">${info.email}</span></span>
        <span>📱 <span class="editable" data-field="phone">${info.phone}</span></span>
        <span>📍 <span class="editable" data-field="location">${info.location}</span></span>
        ${info.github ? `<span>💻 <span class="editable" data-field="github">${info.github}</span></span>` : ''}
      </div>

      <div class="tech-section">
        <h2 class="tech-heading">// SKILLS & STACK</h2>
        <div class="tech-badges">
          ${skills.map((s, idx) => `<span class="tech-badge editable" data-field="skills[${idx}]">${s}</span>`).join('')}
        </div>
      </div>

      <div class="tech-section">
        <h2 class="tech-heading">// WORK EXPERIENCE</h2>
        ${exp.map((item, idx) => `
          <div class="tech-card">
            <div class="tech-card-header">
              <span class="title editable" data-field="exp[${idx}].title">${item.title}</span>
              <span class="company editable" data-field="exp[${idx}].company">@ ${item.company}</span>
              <span class="date editable" data-field="exp[${idx}].duration">${item.duration}</span>
            </div>
            <p class="editable" data-field="exp[${idx}].description">${item.description}</p>
          </div>
        `).join('')}
      </div>

      <div class="tech-section">
        <h2 class="tech-heading">// EDUCATION</h2>
        ${edu.map((item, idx) => `
          <div class="tech-card">
            <span class="title editable" data-field="edu[${idx}].degree">${item.degree}</span> — 
            <span class="editable" data-field="edu[${idx}].institution">${item.institution}</span> 
            (${item.year})
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------
   TEMPLATE 4: CREATIVE TEAL (Gradient Header + Modern Split)
------------------------------------------------------------- */
function renderCreative(info, exp, edu, skills, proj, accent) {
  return `
    <div class="resume-paper template-creative" style="--accent: ${accent}">
      <header class="creative-banner">
        <div>
          <h1 class="editable" data-field="fullName">${info.fullName}</h1>
          <p class="editable" data-field="jobTitle">${info.jobTitle}</p>
        </div>
        <div class="creative-contact-info">
          <div><span class="editable" data-field="email">${info.email}</span></div>
          <div><span class="editable" data-field="phone">${info.phone}</span></div>
          <div><span class="editable" data-field="location">${info.location}</span></div>
        </div>
      </header>

      <div class="creative-body">
        <div class="creative-column">
          <h3>EXPERIENCE</h3>
          ${exp.map((item, idx) => `
            <div class="creative-box">
              <h4 class="editable" data-field="exp[${idx}].title">${item.title}</h4>
              <div class="creative-sub editable" data-field="exp[${idx}].company">${item.company} | ${item.duration}</div>
              <p class="editable" data-field="exp[${idx}].description">${item.description}</p>
            </div>
          `).join('')}
        </div>

        <div class="creative-column">
          <h3>EDUCATION</h3>
          ${edu.map((item, idx) => `
            <div class="creative-box">
              <h4 class="editable" data-field="edu[${idx}].degree">${item.degree}</h4>
              <div class="creative-sub editable" data-field="edu[${idx}].institution">${item.institution}</div>
            </div>
          `).join('')}

          <h3>SKILLS & TALENTS</h3>
          <div class="skills-pills">
            ${skills.map((s, idx) => `<span class="pill editable" data-field="skills[${idx}]">${s}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------
   TEMPLATE 5: MINIMALIST SWISS (High Typography Grid)
------------------------------------------------------------- */
function renderSwiss(info, exp, edu, skills, proj, accent) {
  return `
    <div class="resume-paper template-swiss" style="--accent: ${accent}">
      <header class="swiss-head">
        <h1 class="editable" data-field="fullName">${info.fullName}</h1>
        <div class="swiss-sub">
          <span class="editable" data-field="jobTitle">${info.jobTitle}</span> &bull; 
          <span class="editable" data-field="email">${info.email}</span> &bull; 
          <span class="editable" data-field="phone">${info.phone}</span>
        </div>
      </header>

      <main class="swiss-grid">
        <div class="swiss-label">SUMMARY</div>
        <div class="swiss-content editable" data-field="summary">${info.summary || 'Summary unavailable.'}</div>

        <div class="swiss-label">EXPERIENCE</div>
        <div class="swiss-content">
          ${exp.map((item, idx) => `
            <div class="swiss-item">
              <div class="swiss-title-row">
                <span class="editable" data-field="exp[${idx}].title"><strong>${item.title}</strong></span>, 
                <span class="editable" data-field="exp[${idx}].company">${item.company}</span>
                <span class="swiss-date editable" data-field="exp[${idx}].duration">${item.duration}</span>
              </div>
              <p class="editable" data-field="exp[${idx}].description">${item.description}</p>
            </div>
          `).join('')}
        </div>

        <div class="swiss-label">EDUCATION</div>
        <div class="swiss-content">
          ${edu.map((item, idx) => `
            <div class="swiss-item">
              <span class="editable" data-field="edu[${idx}].degree"><strong>${item.degree}</strong></span> — 
              <span class="editable" data-field="edu[${idx}].institution">${item.institution}</span> (${item.year})
            </div>
          `).join('')}
        </div>

        <div class="swiss-label">SKILLS</div>
        <div class="swiss-content">
          ${skills.map((s, idx) => `<span class="swiss-skill editable" data-field="skills[${idx}]">${s}</span>`).join(' / ')}
        </div>
      </main>
    </div>
  `;
}

/* -------------------------------------------------------------
   TEMPLATE 6: CORPORATE NAVY (Professional Structured)
------------------------------------------------------------- */
function renderNavy(info, exp, edu, skills, proj, accent) {
  return `
    <div class="resume-paper template-navy" style="--accent: ${accent}">
      <header class="navy-top">
        <h1 class="editable" data-field="fullName">${info.fullName}</h1>
        <p class="editable" data-field="jobTitle">${info.jobTitle}</p>
        <div class="navy-meta">
          <span>${info.email}</span> | <span>${info.phone}</span> | <span>${info.location}</span>
        </div>
      </header>
      
      <div class="navy-body">
        <section class="navy-section">
          <h3>PROFESSIONAL EXPERIENCE</h3>
          ${exp.map((item, idx) => `
            <div class="navy-block">
              <div class="navy-header-row">
                <strong>${item.title}</strong> — <span>${item.company}</span>
                <span class="navy-duration">${item.duration}</span>
              </div>
              <p>${item.description}</p>
            </div>
          `).join('')}
        </section>

        <section class="navy-section">
          <h3>EDUCATION & QUALIFICATIONS</h3>
          ${edu.map((item, idx) => `
            <div class="navy-block">
              <strong>${item.degree}</strong> &bull; <span>${item.institution}</span> (${item.year})
            </div>
          `).join('')}
        </section>

        <section class="navy-section">
          <h3>CORE COMPETENCIES</h3>
          <div class="navy-skills">
            ${skills.map(s => `<span class="navy-badge">${s}</span>`).join('')}
          </div>
        </section>
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------
   TEMPLATE 7: EMERALD ELEGANT (Centered Header with Photo)
------------------------------------------------------------- */
function renderEmerald(info, exp, edu, skills, proj, accent) {
  return `
    <div class="resume-paper template-emerald" style="--accent: ${accent}">
      <header class="emerald-header">
        ${info.photoUrl ? `<img src="${info.photoUrl}" alt="Photo" class="emerald-photo" />` : ''}
        <h1 class="editable" data-field="fullName">${info.fullName}</h1>
        <p class="emerald-title editable" data-field="jobTitle">${info.jobTitle}</p>
        <div class="emerald-contacts">
          <span>${info.email}</span> &bull; <span>${info.phone}</span> &bull; <span>${info.location}</span>
        </div>
      </header>

      <section class="emerald-sec">
        <h2>Career Summary</h2>
        <p class="editable" data-field="summary">${info.summary}</p>
      </section>

      <section class="emerald-sec">
        <h2>Experience</h2>
        ${exp.map((item, idx) => `
          <div class="emerald-item">
            <div class="emerald-row">
              <strong>${item.title}</strong> at <span>${item.company}</span>
              <span class="emerald-date">${item.duration}</span>
            </div>
            <p>${item.description}</p>
          </div>
        `).join('')}
      </section>

      <section class="emerald-sec">
        <h2>Education</h2>
        ${edu.map((item, idx) => `
          <div class="emerald-item">
            <strong>${item.degree}</strong>, <span>${item.institution}</span> (${item.year})
          </div>
        `).join('')}
      </section>

      <section class="emerald-sec">
        <h2>Skills</h2>
        <p>${skills.join(' • ')}</p>
      </section>
    </div>
  `;
}

/* -------------------------------------------------------------
   TEMPLATE 8: COMPACT ONE-PAGE (High Density)
------------------------------------------------------------- */
function renderCompact(info, exp, edu, skills, proj, accent) {
  return `
    <div class="resume-paper template-compact" style="--accent: ${accent}">
      <header class="compact-head">
        <h1 class="editable" data-field="fullName">${info.fullName}</h1>
        <div class="compact-sub">
          <span>${info.jobTitle}</span> | <span>${info.email}</span> | <span>${info.phone}</span> | <span>${info.location}</span>
        </div>
      </header>

      <div class="compact-body">
        <div class="compact-sec">
          <h3>EXPERIENCE</h3>
          ${exp.map((item, idx) => `
            <div class="compact-row">
              <span class="role"><strong>${item.title}</strong>, ${item.company}</span>
              <span class="time">${item.duration}</span>
            </div>
            <p class="desc">${item.description}</p>
          `).join('')}
        </div>

        <div class="compact-sec">
          <h3>EDUCATION</h3>
          ${edu.map((item, idx) => `
            <div class="compact-row">
              <span><strong>${item.degree}</strong>, ${item.institution}</span>
              <span class="time">${item.year}</span>
            </div>
          `).join('')}
        </div>

        <div class="compact-sec">
          <h3>SKILLS</h3>
          <p class="compact-skills">${skills.join(' • ')}</p>
        </div>
      </div>
    </div>
  `;
}
