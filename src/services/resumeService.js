import { supabase } from '../supabaseClient.js';

const LOCAL_STORAGE_KEY = 'free_resume_draft';
export const STORAGE_BUCKET = 'resume-assets';

export const DEFAULT_RESUME_DATA = {
  id: 'draft-1',
  template: 'modern',
  accentColor: '#6366f1',
  personalInfo: {
    fullName: 'Alex Morgan',
    jobTitle: 'Senior Full-Stack Software Engineer',
    age: '28',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    summary: 'Passionate Senior Engineer with 6+ years of experience in building scalable cloud web applications, microservices, and reactive user interfaces. Skilled in React, Node.js, Python, and Supabase database architecture.',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan',
    website: 'alexmorgan.dev'
  },
  experience: [
    {
      id: 'exp-1',
      title: 'Senior Software Engineer',
      company: 'TechCorp Solutions',
      location: 'San Francisco, CA',
      duration: '2022 - Present',
      description: 'Led development of high-throughput cloud API services serving 2M+ daily active users. Reduced database query latency by 45% through optimization and indexing.'
    },
    {
      id: 'exp-2',
      title: 'Full Stack Developer',
      company: 'Innovate Labs',
      location: 'Austin, TX',
      duration: '2020 - 2022',
      description: 'Architected interactive dashboards using React and Node.js. Integrated payment gateways and automated CI/CD deployment pipelines.'
    }
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.S. in Computer Science',
      institution: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      year: '2016 - 2020',
      grade: '3.9 GPA'
    }
  ],
  skills: [
    'JavaScript (ES6+)', 'TypeScript', 'React.js', 'Node.js', 'Python',
    'Supabase & PostgreSQL', 'Tailwind CSS', 'Docker & Kubernetes', 'REST APIs', 'Git & CI/CD'
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Realtime Analytics Platform',
      technologies: 'React, Node.js, WebSockets, Supabase',
      link: 'https://github.com/alexmorgan/analytics',
      description: 'Engineered an open-source real-time event analytics engine handling 50k events/sec.'
    }
  ]
};

// Local storage helpers
export function saveLocalDraft(data) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
}

export function loadLocalDraft() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.warn('LocalStorage load error:', err);
  }
  return DEFAULT_RESUME_DATA;
}

// Upload file to Supabase Storage Bucket
export async function uploadAssetToSupabase(user, file, folder = 'avatars') {
  if (!file) return { error: 'No file provided' };

  // If user not logged in, return base64 string
  if (!user || !supabase) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result });
      reader.onerror = () => resolve({ error: 'Failed to read image file' });
      reader.readAsDataURL(file);
    });
  }

  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.warn('Storage upload notice (falling back to local Base64):', error.message);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ url: reader.result });
        reader.readAsDataURL(file);
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl };
  } catch (err) {
    console.warn('Asset upload exception:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result });
      reader.readAsDataURL(file);
    });
  }
}

// Save Resume & PDF link to Supabase Database
export async function saveResumeToSupabase(user, resumeData, pdfBlob = null) {
  if (!user || !supabase) {
    saveLocalDraft(resumeData);
    return { success: true, localOnly: true };
  }

  let pdfUrl = resumeData.pdfUrl || null;

  // Upload PDF Blob to Supabase Storage if provided
  if (pdfBlob) {
    try {
      const pdfPath = `${user.id}/pdfs/resume_${Date.now()}.pdf`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(pdfPath, pdfBlob, { contentType: 'application/pdf', upsert: true });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(pdfPath);
        pdfUrl = publicUrlData.publicUrl;
        resumeData.pdfUrl = pdfUrl;
      }
    } catch (err) {
      console.warn('PDF upload exception:', err);
    }
  }

  try {
    const payload = {
      user_id: user.id,
      title: resumeData.personalInfo?.fullName ? `${resumeData.personalInfo.fullName}'s Resume` : 'Untitled Resume',
      template: resumeData.template || 'modern',
      accent_color: resumeData.accentColor || '#6366f1',
      content: resumeData,
      pdf_url: pdfUrl,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('resumes')
      .upsert([payload], { onConflict: 'user_id' });

    if (error) {
      console.warn('Supabase DB Notice (saved locally):', error.message);
      localStorage.setItem(`user_resume_${user.id}`, JSON.stringify(resumeData));
    } else {
      localStorage.setItem(`user_resume_${user.id}`, JSON.stringify(resumeData));
    }

    return { success: true, pdfUrl };
  } catch (err) {
    console.error('Save exception:', err);
    localStorage.setItem(`user_resume_${user.id}`, JSON.stringify(resumeData));
    return { success: true, localOnly: true };
  }
}

// Fetch user's saved resumes from Supabase on Relogin
export async function fetchUserResumesFromSupabase(user) {
  if (!user || !supabase) {
    const cached = localStorage.getItem('free_resume_draft');
    return cached ? [JSON.parse(cached)] : [DEFAULT_RESUME_DATA];
  }

  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map(item => ({
        ...item.content,
        id: item.id || item.content.id,
        pdfUrl: item.pdf_url || item.content.pdfUrl
      }));
    }

    // Check cached fallback for user
    const cached = localStorage.getItem(`user_resume_${user.id}`) || localStorage.getItem('free_resume_draft');
    return cached ? [JSON.parse(cached)] : [DEFAULT_RESUME_DATA];
  } catch (err) {
    console.warn('Fetch resumes exception:', err);
    const cached = localStorage.getItem(`user_resume_${user.id}`) || localStorage.getItem('free_resume_draft');
    return cached ? [JSON.parse(cached)] : [DEFAULT_RESUME_DATA];
  }
}
