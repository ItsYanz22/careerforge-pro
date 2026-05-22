/**
 * Reusable resume sections for template consistency.
 * Each section handles empty state and conditional rendering.
 */

interface CertificationsProps {
  certifications: any[] | undefined;
  primaryColor?: string;
}

interface LanguagesProps {
  languages: any[] | undefined;
  primaryColor?: string;
}

interface ProjectsProps {
  projects: any[] | undefined;
  primaryColor?: string;
}

interface VolunteerProps {
  volunteerExperience: any[] | undefined;
  primaryColor?: string;
  bulletGap?: string;
}

export const CertificationsSection = ({ certifications, primaryColor = 'var(--resume-primary)' }: CertificationsProps) => {
  if (!certifications || certifications.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-bold mb-2 uppercase tracking-wider" style={{ color: primaryColor }}>
        Certifications
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-bullet-gap)' }}>
        {certifications.map((cert: any, i: number) => (
          <div key={i}>
            <div className="font-bold text-sm">{cert.name}</div>
            {cert.issuer && <div className="text-xs opacity-70">{cert.issuer}</div>}
            {cert.issueDate && (
              <div className="text-xs opacity-60">
                Issued: {cert.issueDate}
                {cert.expiryDate && ` • Expires: ${cert.expiryDate}`}
              </div>
            )}
            {cert.credentialUrl && (
              <div className="text-xs" style={{ color: primaryColor }}>
                <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                  View Credential
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export const LanguagesSection = ({ languages, primaryColor = 'var(--resume-primary)' }: LanguagesProps) => {
  if (!languages || languages.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-bold mb-2 uppercase tracking-wider" style={{ color: primaryColor }}>
        Languages
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-bullet-gap)' }}>
        {languages.map((lang: any, i: number) => (
          <div key={i} className="flex justify-between items-baseline text-sm">
            <span className="font-medium">{lang.name}</span>
            <span className="text-xs opacity-70">{lang.proficiency}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export const VolunteerSection = ({ volunteerExperience, primaryColor = 'var(--resume-primary)' }: VolunteerProps) => {
  if (!volunteerExperience || volunteerExperience.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: primaryColor }}>
        Volunteer Experience
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
        {volunteerExperience.map((vol: any, i: number) => (
          <div key={i}>
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="font-bold text-sm">{vol.role}</h3>
              <span className="text-xs opacity-60">
                {vol.startDate} – {vol.endDate}
              </span>
            </div>
            {vol.organization && (
              <div className="text-sm opacity-70 mb-1">
                {vol.organization}
                {vol.location && ` | ${vol.location}`}
              </div>
            )}
            {vol.description && (
              <p className="text-sm opacity-85">{vol.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
export const ProjectsSection = ({ projects, primaryColor = 'var(--resume-primary)' }: ProjectsProps) => {
  if (!projects || projects.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: primaryColor }}>
        Projects
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
        {projects.map((proj: any, i: number) => (
          <div key={i}>
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="font-bold text-sm tracking-wide">{proj.title}</h3>
              {proj.link && (
                <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: primaryColor }}>
                  {proj.link.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                </a>
              )}
            </div>
            <p className="text-sm opacity-90 mb-1">{proj.description}</p>
            {proj.technologies && proj.technologies.length > 0 && (
              <div className="text-[10px] opacity-60 italic">
                <span className="font-medium">Stack:</span> {proj.technologies.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
