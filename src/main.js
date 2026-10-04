import { supabase } from './supabaseClient.js';
import { 
  DEFAULT_RESUME_DATA, 
  loadLocalDraft, 
  saveLocalDraft, 
  saveResumeToSupabase, 
  fetchUserResumesFromSupabase,
  uploadAssetToSupabase
} from './services/resumeService.js';
import { renderResumeHTML } from './templateRenderers.js';
import html2pdf from 'html2pdf.js';

// Application State
let resumeData = loadLocalDraft();
let currentUser = null;
let pendingActionAfterAuth = null;

// DOM Elements
const renderContainer = document.getElementById('resume-render-container');
const templateSelect = document.getElementById('template-select');
const colorPickers = document.querySelectorAll('.color-picker-btn');
const downloadPdfBtn = document.getElementById('download-pdf-btn');
const toastBanner = document.getElementById('toast-banner');

// Header & Auth Elements
const authModalBtn = document.getElementById('auth-modal-btn');
const myResumesBtn = document.getElementById('my-resumes-btn');
const userStatusText = document.getElementById('user-status-text');

// Modals
const authModal = document.getElementById('auth-modal');
const closeAuthModal = document.getElementById('close-auth-modal');
const authModalForm = document.getElementById('auth-modal-form');
const modalEmail = document.getElementById('modal-email');
const modalPassword = document.getElementById('modal-password');
const modalSigninBtn = document.getElementById('modal-signin-btn');
const modalSignupBtn = document.getElementById('modal-signup-btn');
const modalAuthMsg = document.getElementById('modal-auth-msg');

const savedModal = document.getElementById('saved-modal');
const closeSavedModal = document.getElementById('close-saved-modal');
const savedResumesList = document.getElementById('saved-resumes-list');
const createNewResumeBtn = document.getElementById('create-new-resume-btn');

// Form Field Elements
const inputFullName = document.getElementById('input-fullName');
const inputJobTitle = document.getElementById('input-jobTitle');
const inputAge = document.getElementById('input-age');
const inputPhone = document.getElementById('input-phone');
const inputEmail = document.getElementById('input-email');
const inputLocation = document.getElementById('input-location');
const inputPhotoFile = document.getElementById('input-photoFile');
const photoUploadStatus = document.getElementById('photo-upload-status');
const inputPhotoUrl = document.getElementById('input-photoUrl');
const inputSummary = document.getElementById('input-summary');
const inputSkills = document.getElementById('input-skills');

const expRepeaterContainer = document.getElementById('exp-repeater-container');
const eduRepeaterContainer = document.getElementById('edu-repeater-container');
const projRepeaterContainer = document.getElementById('proj-repeater-container');

const addExpBtn = document.getElementById('add-exp-btn');
const addEduBtn = document.getElementById('add-edu-btn');
const addProjBtn = document.getElementById('add-proj-btn');

/* =============================================================
   1. INITIALIZATION & STATE BINDING
============================================================= */

function initApp() {
  populateFormFields();
  renderPreview();
  setupEventListeners();
  checkSession();
}

function showToast(message, duration = 4000) {
  if (!toastBanner) return;
  toastBanner.textContent = message;
  toastBanner.style.display = 'block';
  setTimeout(() => {
    toastBanner.style.display = 'none';
  }, duration);
}

function populateFormFields() {
  const p = resumeData.personalInfo || {};
  inputFullName.value = p.fullName || '';
  inputJobTitle.value = p.jobTitle || '';
  inputAge.value = p.age || '';
  inputPhone.value = p.phone || '';
  inputEmail.value = p.email || '';
  inputLocation.value = p.location || '';
  inputPhotoUrl.value = p.photoUrl || '';
  inputSummary.value = p.summary || '';
  
  if (resumeData.skills) {
    inputSkills.value = resumeData.skills.join(', ');
  }

  if (templateSelect) {
    templateSelect.value = resumeData.template || 'modern';
  }

  renderExpRepeaters();
  renderEduRepeaters();
  renderProjRepeaters();
}

/* =============================================================
   2. RENDERING PREVIEW & BIDIRECTIONAL EDITING
============================================================= */

function renderPreview() {
  if (!renderContainer) return;
  
  // Render Template HTML
  renderContainer.innerHTML = renderResumeHTML(resumeData, resumeData.template || 'modern');
  
  // Enable Contenteditable & Bidirectional Sync
  const editableElements = renderContainer.querySelectorAll('.editable');
  editableElements.forEach(el => {
    el.setAttribute('contenteditable', 'true');
    el.addEventListener('blur', () => {
      const fieldPath = el.dataset.field;
      const newValue = el.innerText.trim();
      if (fieldPath) {
        updateFieldByPath(fieldPath, newValue);
        saveLocalDraft(resumeData);
        populateFormFields();
      }
    });
  });
}

function updateFieldByPath(path, value) {
  if (path.startsWith('skills[')) {
    const idx = parseInt(path.match(/\d+/)[0], 10);
    if (!isNaN(idx) && resumeData.skills) {
      resumeData.skills[idx] = value;
    }
  } else if (path.startsWith('exp[')) {
    const match = path.match(/exp\[(\d+)\]\.(.*)/);
    if (match) {
      const idx = parseInt(match[1], 10);
      const key = match[2];
      if (resumeData.experience[idx]) {
        resumeData.experience[idx][key] = value;
      }
    }
  } else if (path.startsWith('edu[')) {
    const match = path.match(/edu\[(\d+)\]\.(.*)/);
    if (match) {
      const idx = parseInt(match[1], 10);
      const key = match[2];
      if (resumeData.education[idx]) {
        resumeData.education[idx][key] = value;
      }
    }
  } else if (path.startsWith('proj[')) {
    const match = path.match(/proj\[(\d+)\]\.(.*)/);
    if (match) {
      const idx = parseInt(match[1], 10);
      const key = match[2];
      if (resumeData.projects[idx]) {
        resumeData.projects[idx][key] = value;
      }
    }
  } else {
    // Personal info
    if (!resumeData.personalInfo) resumeData.personalInfo = {};
    resumeData.personalInfo[path] = value;
  }
}

/* =============================================================
   3. REPEATERS & ASSET UPLOADER
============================================================= */

function renderExpRepeaters() {
  if (!expRepeaterContainer) return;
  expRepeaterContainer.innerHTML = '';
  
  (resumeData.experience || []).forEach((exp, idx) => {
    const div = document.createElement('div');
    div.className = 'repeater-item';
    div.innerHTML = `
      <button class="btn-remove-item" data-type="exp" data-index="${idx}">&times;</button>
      <div class="form-group">
        <label>Job Title</label>
        <input type="text" class="form-control exp-input" data-index="${idx}" data-field="title" value="${exp.title || ''}" />
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <div class="form-group">
          <label>Company</label>
          <input type="text" class="form-control exp-input" data-index="${idx}" data-field="company" value="${exp.company || ''}" />
        </div>
        <div class="form-group">
          <label>Duration</label>
          <input type="text" class="form-control exp-input" data-index="${idx}" data-field="duration" value="${exp.duration || ''}" />
        </div>
      </div>
      <div class="form-group" style="margin-bottom:0;">
        <label>Description</label>
        <textarea class="form-control exp-input" data-index="${idx}" data-field="description">${exp.description || ''}</textarea>
      </div>
    `;
    expRepeaterContainer.appendChild(div);
  });
}

function renderEduRepeaters() {
  if (!eduRepeaterContainer) return;
  eduRepeaterContainer.innerHTML = '';

  (resumeData.education || []).forEach((edu, idx) => {
    const div = document.createElement('div');
    div.className = 'repeater-item';
    div.innerHTML = `
      <button class="btn-remove-item" data-type="edu" data-index="${idx}">&times;</button>
      <div class="form-group">
        <label>Degree / Qualification</label>
        <input type="text" class="form-control edu-input" data-index="${idx}" data-field="degree" value="${edu.degree || ''}" />
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <div class="form-group">
          <label>Institution</label>
          <input type="text" class="form-control edu-input" data-index="${idx}" data-field="institution" value="${edu.institution || ''}" />
        </div>
        <div class="form-group">
          <label>Year / Grade</label>
          <input type="text" class="form-control edu-input" data-index="${idx}" data-field="year" value="${edu.year || ''}" />
        </div>
      </div>
    `;
    eduRepeaterContainer.appendChild(div);
  });
}

function renderProjRepeaters() {
  if (!projRepeaterContainer) return;
  projRepeaterContainer.innerHTML = '';

  (resumeData.projects || []).forEach((proj, idx) => {
    const div = document.createElement('div');
    div.className = 'repeater-item';
    div.innerHTML = `
      <button class="btn-remove-item" data-type="proj" data-index="${idx}">&times;</button>
      <div class="form-group">
        <label>Project Title</label>
        <input type="text" class="form-control proj-input" data-index="${idx}" data-field="name" value="${proj.name || ''}" />
      </div>
      <div class="form-group">
        <label>Technologies Used</label>
        <input type="text" class="form-control proj-input" data-index="${idx}" data-field="technologies" value="${proj.technologies || ''}" />
      </div>
      <div class="form-group" style="margin-bottom:0;">
        <label>Description</label>
        <textarea class="form-control proj-input" data-index="${idx}" data-field="description">${proj.description || ''}</textarea>
      </div>
    `;
    projRepeaterContainer.appendChild(div);
  });
}

/* =============================================================
   4. EVENT LISTENERS & INPUT HANDLING
============================================================= */

function setupEventListeners() {
  // Personal Info Form Updates
  [inputFullName, inputJobTitle, inputAge, inputPhone, inputEmail, inputLocation, inputPhotoUrl, inputSummary].forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => {
      const field = input.id.replace('input-', '');
      if (!resumeData.personalInfo) resumeData.personalInfo = {};
      resumeData.personalInfo[field] = input.value;
      saveLocalDraft(resumeData);
      renderPreview();
    });
  });

  // Photo File Upload Event
  if (inputPhotoFile) {
    inputPhotoFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      photoUploadStatus.textContent = '⏳ Processing image...';
      const result = await uploadAssetToSupabase(currentUser, file, 'avatars');

      if (result.url) {
        photoUploadStatus.textContent = '✅ Profile picture loaded!';
        if (!resumeData.personalInfo) resumeData.personalInfo = {};
        resumeData.personalInfo.photoUrl = result.url;
        inputPhotoUrl.value = result.url;
        saveLocalDraft(resumeData);
        renderPreview();
      } else {
        photoUploadStatus.textContent = '❌ Upload failed.';
      }
    });
  }

  // Skills Input
  if (inputSkills) {
    inputSkills.addEventListener('input', () => {
      resumeData.skills = inputSkills.value.split(',').map(s => s.trim()).filter(Boolean);
      saveLocalDraft(resumeData);
      renderPreview();
    });
  }

  // Repeater Inputs Event Delegation
  document.addEventListener('input', (e) => {
    if (e.target.classList.contains('exp-input')) {
      const idx = parseInt(e.target.dataset.index, 10);
      const field = e.target.dataset.field;
      if (resumeData.experience[idx]) {
        resumeData.experience[idx][field] = e.target.value;
        saveLocalDraft(resumeData);
        renderPreview();
      }
    } else if (e.target.classList.contains('edu-input')) {
      const idx = parseInt(e.target.dataset.index, 10);
      const field = e.target.dataset.field;
      if (resumeData.education[idx]) {
        resumeData.education[idx][field] = e.target.value;
        saveLocalDraft(resumeData);
        renderPreview();
      }
    } else if (e.target.classList.contains('proj-input')) {
      const idx = parseInt(e.target.dataset.index, 10);
      const field = e.target.dataset.field;
      if (resumeData.projects[idx]) {
        resumeData.projects[idx][field] = e.target.value;
        saveLocalDraft(resumeData);
        renderPreview();
      }
    }
  });

  // Repeater Add Buttons
  if (addExpBtn) {
    addExpBtn.addEventListener('click', () => {
      if (!resumeData.experience) resumeData.experience = [];
      resumeData.experience.push({ title: 'New Role', company: 'Company Name', duration: '2023 - Present', description: 'Key accomplishments and responsibilities...' });
      saveLocalDraft(resumeData);
      renderExpRepeaters();
      renderPreview();
    });
  }

  if (addEduBtn) {
    addEduBtn.addEventListener('click', () => {
      if (!resumeData.education) resumeData.education = [];
      resumeData.education.push({ degree: 'Degree / Certificate', institution: 'University / Academy', year: '2020 - 2024' });
      saveLocalDraft(resumeData);
      renderEduRepeaters();
      renderPreview();
    });
  }

  if (addProjBtn) {
    addProjBtn.addEventListener('click', () => {
      if (!resumeData.projects) resumeData.projects = [];
      resumeData.projects.push({ name: 'Project Name', technologies: 'Tech Stack', description: 'Project overview and impact...' });
      saveLocalDraft(resumeData);
      renderProjRepeaters();
      renderPreview();
    });
  }

  // Repeater Item Deletion
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-remove-item')) {
      const type = e.target.dataset.type;
      const idx = parseInt(e.target.dataset.index, 10);
      if (type === 'exp' && resumeData.experience) {
        resumeData.experience.splice(idx, 1);
        renderExpRepeaters();
      } else if (type === 'edu' && resumeData.education) {
        resumeData.education.splice(idx, 1);
        renderEduRepeaters();
      } else if (type === 'proj' && resumeData.projects) {
        resumeData.projects.splice(idx, 1);
        renderProjRepeaters();
      }
      saveLocalDraft(resumeData);
      renderPreview();
    }
  });

  // Template Dropdown Switcher
  if (templateSelect) {
    templateSelect.addEventListener('change', (e) => {
      resumeData.template = e.target.value;
      saveLocalDraft(resumeData);
      renderPreview();
    });
  }

  // Color Accent Picker
  colorPickers.forEach(btn => {
    btn.addEventListener('click', () => {
      colorPickers.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      resumeData.accentColor = btn.dataset.color;
      saveLocalDraft(resumeData);
      renderPreview();
    });
  });

  // Download PDF Trigger
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', handleDownloadPDF);
  }

  // Auth & Modal Listeners
  if (authModalBtn) {
    authModalBtn.addEventListener('click', () => {
      if (currentUser) {
        supabase.auth.signOut();
        currentUser = null;
        updateUserUI();
        showToast('Signed out of account.');
      } else {
        openAuthModal('Sign In / Create Account');
      }
    });
  }

  if (closeAuthModal) {
    closeAuthModal.addEventListener('click', () => authModal.classList.remove('active'));
  }

  if (authModalForm) {
    authModalForm.addEventListener('submit', handleAuthSubmit);
  }

  if (modalSignupBtn) {
    modalSignupBtn.addEventListener('click', handleSignupClick);
  }

  if (myResumesBtn) {
    myResumesBtn.addEventListener('click', openSavedResumesModal);
  }

  if (closeSavedModal) {
    closeSavedModal.addEventListener('click', () => savedModal.classList.remove('active'));
  }

  if (createNewResumeBtn) {
    createNewResumeBtn.addEventListener('click', () => {
      resumeData = { ...DEFAULT_RESUME_DATA, id: `resume-${Date.now()}` };
      saveLocalDraft(resumeData);
      populateFormFields();
      renderPreview();
      savedModal.classList.remove('active');
    });
  }
}

/* =============================================================
   5. AUTH & CROSS-DEVICE PERSISTENCE ON RELOGIN
============================================================= */

async function checkSession() {
  if (!supabase) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      currentUser = session.user;
      updateUserUI();
      await loadUserResumesOnLogin(currentUser);
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      const prevUser = currentUser;
      currentUser = session ? session.user : null;
      updateUserUI();

      if (currentUser && currentUser.id !== (prevUser ? prevUser.id : null)) {
        await loadUserResumesOnLogin(currentUser);
      }
    });
  } catch (err) {
    console.warn('Auth session notice:', err);
  }
}

async function loadUserResumesOnLogin(user) {
  if (!user) return;
  const userResumes = await fetchUserResumesFromSupabase(user);

  if (userResumes && userResumes.length > 0) {
    resumeData = userResumes[0];
    saveLocalDraft(resumeData);
    populateFormFields();
    renderPreview();
    showToast(`✨ Welcome back, ${user.email}! Loaded your saved resume from Supabase.`);
  }
}

function updateUserUI() {
  if (currentUser) {
    userStatusText.textContent = `Pro Tier (${currentUser.email})`;
    authModalBtn.textContent = 'Sign Out';
    myResumesBtn.style.display = 'inline-flex';
  } else {
    userStatusText.textContent = 'Free Guest Tier (1 Resume)';
    authModalBtn.textContent = 'Sign In / Sign Up';
    myResumesBtn.style.display = 'none';
  }
}

function openAuthModal(title = 'Sign In to Download PDF') {
  document.getElementById('auth-modal-title').textContent = title;
  modalAuthMsg.textContent = '';
  authModal.classList.add('active');
}

/* =============================================================
   6. PDF GENERATION & STORAGE BUCKET SYNC
============================================================= */

async function handleDownloadPDF() {
  if (!currentUser) {
    pendingActionAfterAuth = 'download_pdf';
    openAuthModal('Sign In or Register to Download PDF');
    return;
  }

  executePDFDownload();
}

async function executePDFDownload() {
  const paperElement = document.querySelector('.resume-paper');
  if (!paperElement) return;

  downloadPdfBtn.disabled = true;
  downloadPdfBtn.innerHTML = 'Generating PDF & Syncing...';

  const filename = `${(resumeData.personalInfo?.fullName || 'Resume').replace(/\s+/g, '_')}_CV.pdf`;

  const opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  try {
    // Generate PDF Blob
    const pdfBlob = await html2pdf().set(opt).from(paperElement).output('blob');

    // Trigger local download to user's machine
    const downloadUrl = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Save resume content AND PDF blob to Supabase Storage & Database
    if (currentUser) {
      const syncResult = await saveResumeToSupabase(currentUser, resumeData, pdfBlob);
      showToast('✅ Resume PDF downloaded & saved to your Supabase account!');
    }
  } catch (err) {
    console.warn('PDF export fallback:', err);
    window.print();
  } finally {
    downloadPdfBtn.disabled = false;
    downloadPdfBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
      Download PDF
    `;
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  modalAuthMsg.style.color = '#38bdf8';
  modalAuthMsg.textContent = 'Authenticating...';

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: modalEmail.value,
      password: modalPassword.value
    });

    if (error) {
      modalAuthMsg.style.color = '#f87171';
      modalAuthMsg.textContent = error.message;
    } else {
      currentUser = data.user;
      updateUserUI();
      authModal.classList.remove('active');
      await loadUserResumesOnLogin(currentUser);

      if (pendingActionAfterAuth === 'download_pdf') {
        pendingActionAfterAuth = null;
        executePDFDownload();
      }
    }
  } catch (err) {
    modalAuthMsg.style.color = '#f87171';
    modalAuthMsg.textContent = err.message;
  }
}

async function handleSignupClick() {
  if (!modalEmail.value || !modalPassword.value) {
    modalAuthMsg.style.color = '#fbbf24';
    modalAuthMsg.textContent = 'Please enter an email & password.';
    return;
  }

  modalAuthMsg.style.color = '#38bdf8';
  modalAuthMsg.textContent = 'Creating account...';

  try {
    const { data, error } = await supabase.auth.signUp({
      email: modalEmail.value,
      password: modalPassword.value
    });

    if (error) {
      modalAuthMsg.style.color = '#f87171';
      modalAuthMsg.textContent = error.message;
    } else {
      modalAuthMsg.style.color = '#34d399';
      modalAuthMsg.textContent = 'Account created!';
      currentUser = data.user;
      updateUserUI();
      authModal.classList.remove('active');

      if (pendingActionAfterAuth === 'download_pdf') {
        pendingActionAfterAuth = null;
        executePDFDownload();
      }
    }
  } catch (err) {
    modalAuthMsg.style.color = '#f87171';
    modalAuthMsg.textContent = err.message;
  }
}

/* =============================================================
   7. SAVED RESUMES MODAL FOR AUTHENTICATED USERS
============================================================= */

async function openSavedResumesModal() {
  if (!currentUser) return;

  savedResumesList.innerHTML = '<p style="color: #94a3b8; font-size: 0.875rem;">Loading saved resumes from Supabase...</p>';
  savedModal.classList.add('active');

  const resumes = await fetchUserResumesFromSupabase(currentUser);

  if (!resumes || resumes.length === 0) {
    savedResumesList.innerHTML = '<p style="color: #94a3b8; font-size: 0.875rem;">No saved resumes found yet. Save your current draft by downloading PDF!</p>';
    return;
  }

  savedResumesList.innerHTML = resumes.map((r, idx) => `
    <div style="background: rgba(2, 6, 23, 0.5); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong style="color: #f8fafc; font-size: 0.9375rem;">${r.personalInfo?.fullName || 'Untitled'} - ${r.personalInfo?.jobTitle || 'Resume'}</strong>
        <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.2rem;">Template: ${r.template || 'Modern'}</div>
        ${r.pdfUrl ? `<a href="${r.pdfUrl}" target="_blank" style="font-size: 0.75rem; color: #34d399; margin-top: 0.25rem; display: inline-block;">📄 View Saved PDF</a>` : ''}
      </div>
      <button class="btn btn-secondary load-resume-btn" data-index="${idx}" style="padding: 0.4rem 0.85rem; font-size: 0.75rem;">Load & Edit</button>
    </div>
  `).join('');

  document.querySelectorAll('.load-resume-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      if (resumes[idx]) {
        resumeData = resumes[idx];
        saveLocalDraft(resumeData);
        populateFormFields();
        renderPreview();
        savedModal.classList.remove('active');
        showToast(`Loaded resume for ${resumeData.personalInfo?.fullName || 'User'}`);
      }
    });
  });
}

// Start App
document.addEventListener('DOMContentLoaded', initApp);
