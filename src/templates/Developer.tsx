import { TemplateProps } from './TemplateRegistry';
import { CertificationsSection, LanguagesSection, VolunteerSection } from './TemplateSections';

export default function Developer({ resume }: TemplateProps) {
  const { data } = resume;
  if (!data) return null;
  const { personal, summary, experience, education, skills, projects, certifications, languages, volunteerExperience } = data;

  return (
    <div className="h-full bg-[var(--resume-background)] text-[var(--resume-text)]" style={{ fontFamily: 'var(--resume-font)', padding: 'var(--resume-padding)', lineHeight: 'var(--resume-line-height)' }}>
      {/* Dev Header - Monospace terminal vibe */}
      <header className="mb-8 border-b-2 pb-4" style={{ borderColor: 'var(--resume-primary)', fontFamily: 'monospace' }}>
        <h1 className="text-3xl font-bold mb-2">
          <span style={{ color: 'var(--resume-primary)' }}>&gt;</span> {personal?.firstName} {personal?.lastName}
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-80">
          {personal?.email && <span>email: "{personal.email}"</span>}
          {personal?.phone && <span>phone: "{personal.phone}"</span>}
          {personal?.location && <span>location: "{personal.location}"</span>}
          {personal?.github && <span>github: "{personal.github}"</span>}
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
        {summary && (
          <section>
            <h2 className="text-sm font-bold mb-2" style={{ fontFamily: 'monospace', color: 'var(--resume-primary)' }}>// Summary</h2>
            <p className="text-sm leading-relaxed opacity-90">{summary}</p>
          </section>
        )}

        {skills && Array.isArray(skills) && skills.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-2" style={{ fontFamily: 'monospace', color: 'var(--resume-primary)' }}>// Tech Stack</h2>
            <div className="flex flex-wrap gap-2 text-xs font-bold" style={{ fontFamily: 'monospace' }}>
              {skills.map((skill: any, i: number) => (
                <span key={i} className="px-1.5 py-0.5 bg-secondary rounded text-foreground">
                  {typeof skill === 'string' ? skill : skill.name || skill.category || ''}
                </span>
              ))}
            </div>
          </section>
        )}

        {experience && experience.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-4 mt-2" style={{ fontFamily: 'monospace', color: 'var(--resume-primary)' }}>// Experience</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
              {experience.map((exp: any) => (
                <div key={exp._id} className="border-l-2 pl-4" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-base">{exp.jobTitle} <span className="opacity-50 font-normal">@ {exp.company}</span></h3>
                    <span className="text-xs font-mono" style={{ color: 'var(--resume-primary)' }}>[{exp.startDate} - {exp.isCurrentRole ? 'Present' : exp.endDate}]</span>
                  </div>
                  <ul className="list-disc list-inside text-sm opacity-90 mt-2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-bullet-gap)' }}>
                    {exp.bulletPoints.map((bullet: any, i: number) => <li key={i}>{bullet}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {projects && projects.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-4 mt-2" style={{ fontFamily: 'monospace', color: 'var(--resume-primary)' }}>// Projects</h2>
            <div className="grid grid-cols-2 gap-4">
              {projects.map((proj: any) => (
                <div key={proj._id} className="p-3 border rounded-lg" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                  <h3 className="font-bold text-sm mb-1">{proj.title}</h3>
                  <p className="text-xs opacity-80 mb-2">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {proj.technologies.map((t: string, i: number) => <span key={i} className="text-[10px] font-mono px-1 bg-secondary dark:bg-card rounded">{t}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {education && education.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-3 mt-2" style={{ fontFamily: 'monospace', color: 'var(--resume-primary)' }}>// Education</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--resume-gap)/2)' }}>
              {education.map((edu: any) => (
                <div key={edu._id} className="flex justify-between text-sm">
                  <span className="font-bold">{edu.degree} <span className="opacity-70 font-normal">| {edu.school}</span></span>
                  <span className="text-xs font-mono opacity-60">{edu.graduationDate}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <CertificationsSection certifications={certifications} primaryColor="var(--resume-primary)" />
        <LanguagesSection languages={languages} primaryColor="var(--resume-primary)" />
        <VolunteerSection volunteerExperience={volunteerExperience} primaryColor="var(--resume-primary)" />
      </div>
    </div>
  );
}
