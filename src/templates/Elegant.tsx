import { TemplateProps } from './TemplateRegistry';
import { CertificationsSection, LanguagesSection, VolunteerSection, ProjectsSection } from './TemplateSections';

export default function Elegant({ resume }: TemplateProps) {
  const { data } = resume;
  if (!data) return null;
  const { personal, summary, experience, education, skills, projects, certifications, languages, volunteerExperience } = data;

  return (
    <div className="h-full bg-[var(--resume-background)] text-[var(--resume-text)]" style={{ fontFamily: 'var(--resume-font)', padding: 'var(--resume-padding)', lineHeight: 'var(--resume-line-height)' }}>
      {/* Elegant Header with colored background block */}
      <header className="mb-8 p-8 rounded-2xl text-center" style={{ backgroundColor: 'var(--resume-primary)' }}>
        <h1 className="text-4xl font-serif font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--resume-background)' }}>
          {personal?.firstName} {personal?.lastName}
        </h1>
        <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 text-sm tracking-widest" style={{ color: 'var(--resume-background)', opacity: 0.9 }}>
          {personal?.location && <span>{personal.location}</span>}
          {personal?.phone && <span>• {personal.phone}</span>}
          {personal?.email && <span>• {personal.email}</span>}
        </div>
      </header>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
          {summary && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-3 opacity-50">Profile</h2>
              <p className="text-sm leading-relaxed" style={{ opacity: 0.9 }}>{summary}</p>
            </section>
          )}

          {experience && experience.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-50">Experience</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--resume-gap) * 1.5)' }}>
                {experience.map((exp: any) => (
                  <div key={exp._id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-base">{exp.jobTitle}</h3>
                      <span className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--resume-primary)' }}>{exp.startDate} – {exp.isCurrentRole ? 'Present' : exp.endDate}</span>
                    </div>
                    <div className="italic text-sm mb-2" style={{ opacity: 0.8 }}>{exp.company} {exp.location && `| ${exp.location}`}</div>
                    <ul className="list-none text-sm" style={{ opacity: 0.9, display: 'flex', flexDirection: 'column', gap: 'var(--resume-bullet-gap)' }}>
                      {exp.bulletPoints.map((bullet: any, i: number) => (
                        <li key={i} className="pl-3 border-l-2" style={{ borderColor: 'var(--resume-primary)' }}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
          <ProjectsSection projects={projects} primaryColor="var(--resume-primary)" />

          {education && education.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-50">Education</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
                {education.map((edu: any) => (
                  <div key={edu._id} className="text-center p-3 border rounded-xl" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                    <h3 className="font-bold text-sm">{edu.degree}</h3>
                    <div className="text-xs mt-1" style={{ color: 'var(--resume-primary)' }}>{edu.school}</div>
                    <div className="text-[10px] uppercase tracking-widest opacity-50 mt-2">{edu.graduationDate}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
          {skills && Array.isArray(skills) && skills.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-50">Expertise</h2>
              <ul className="list-none space-y-1 text-sm font-medium">
                {skills.map((skill: any, i: number) => (
                  <li key={i} className="bg-background dark:bg-card/50 p-1.5 rounded-lg text-center">
                    {typeof skill === 'string' ? skill : skill.name || skill.category || ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <CertificationsSection certifications={certifications} primaryColor="var(--resume-primary)" />
          <LanguagesSection languages={languages} primaryColor="var(--resume-primary)" />
          <VolunteerSection volunteerExperience={volunteerExperience} primaryColor="var(--resume-primary)" />
        </div>
      </div>
    </div>
  );
}
