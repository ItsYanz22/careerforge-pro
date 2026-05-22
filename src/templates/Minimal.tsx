import { TemplateProps } from './TemplateRegistry';
import { CertificationsSection, LanguagesSection, VolunteerSection, ProjectsSection } from './TemplateSections';

export default function Minimal({ resume }: TemplateProps) {
  const { data } = resume;
  if (!data) return null;
  const { personal, summary, experience, education, skills, projects, certifications, languages, volunteerExperience } = data;

  return (
    <div className="h-full bg-[var(--resume-background)] text-[var(--resume-text)] tracking-wide" style={{ fontFamily: 'var(--resume-font)', padding: 'var(--resume-padding)', lineHeight: 'var(--resume-line-height)' }}>
      <header className="mb-10">
        <h1 className="text-3xl font-light mb-4 lowercase" style={{ color: 'var(--resume-primary)' }}>
          {personal?.firstName} {personal?.lastName}
        </h1>
        
        <div className="flex flex-col gap-1 text-[13px] font-medium" style={{ opacity: 0.7 }}>
          {personal?.email && <span>{personal.email}</span>}
          {personal?.phone && <span>{personal.phone}</span>}
          {personal?.location && <span>{personal.location}</span>}
          {personal?.linkedIn && <span>{personal.linkedIn}</span>}
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--resume-gap) * 1.5)' }}>
        {summary && (
          <section className="flex gap-8">
            <h2 className="w-1/4 text-[11px] font-bold uppercase tracking-widest pt-1" style={{ color: 'var(--resume-primary)', opacity: 0.8 }}>About</h2>
            <p className="w-3/4 text-[14px] leading-relaxed font-light">{summary}</p>
          </section>
        )}

        {experience && experience.length > 0 && (
          <section className="flex gap-8">
            <h2 className="w-1/4 text-[11px] font-bold uppercase tracking-widest pt-1" style={{ color: 'var(--resume-primary)', opacity: 0.8 }}>Experience</h2>
            <div className="w-3/4" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
              {experience.map((exp: any) => (
                <div key={exp._id}>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-semibold">{exp.jobTitle}</h3>
                    <span className="text-[12px]" style={{ opacity: 0.6 }}>
                      {exp.startDate} — {exp.isCurrentRole ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[13px] mb-3" style={{ color: 'var(--resume-primary)' }}>{exp.company}</div>
                  <ul className="text-[14px] font-light" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-bullet-gap)' }}>
                    {exp.bulletPoints.map((bullet: any, i: number) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <ProjectsSection projects={projects} primaryColor="var(--resume-primary)" />

        {education && education.length > 0 && (
          <section className="flex gap-8">
            <h2 className="w-1/4 text-[11px] font-bold uppercase tracking-widest pt-1" style={{ color: 'var(--resume-primary)', opacity: 0.8 }}>Education</h2>
            <div className="w-3/4" style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--resume-gap) * 0.75)' }}>
              {education.map((edu: any) => (
                <div key={edu._id} className="flex justify-between items-baseline">
                  <div>
                    <h3 className="font-semibold">{edu.school}</h3>
                    <div className="text-[13px]" style={{ opacity: 0.8 }}>{edu.degree} in {edu.field}</div>
                  </div>
                  <div className="text-[12px]" style={{ opacity: 0.6 }}>
                    {edu.graduationDate}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {skills && Array.isArray(skills) && skills.length > 0 && (
          <section className="flex gap-8">
            <h2 className="w-1/4 text-[11px] font-bold uppercase tracking-widest pt-1" style={{ color: 'var(--resume-primary)', opacity: 0.8 }}>Skills</h2>
            <div className="w-3/4 text-[14px] font-light leading-relaxed">
              {skills.map((s: any) => typeof s === 'string' ? s : s.name || s.category || '').join(' • ')}
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
