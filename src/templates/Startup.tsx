import { TemplateProps } from './TemplateRegistry';
import { CertificationsSection, LanguagesSection, VolunteerSection, ProjectsSection } from './TemplateSections';

export default function Startup({ resume }: TemplateProps) {
  const { data } = resume;
  if (!data) return null;
  const { personal, summary, experience, education, skills, projects, certifications, languages, volunteerExperience } = data;

  return (
    <div className="h-full bg-[var(--resume-background)] text-[var(--resume-text)]" style={{ fontFamily: 'var(--resume-font)', padding: 'var(--resume-padding)', lineHeight: 'var(--resume-line-height)' }}>
      {/* Header Left-aligned with big bold name */}
      <header className="mb-8 border-l-8 pl-4" style={{ borderColor: 'var(--resume-primary)' }}>
        <h1 className="text-5xl font-black tracking-tighter mb-2">
          {personal?.firstName} <span style={{ color: 'var(--resume-primary)' }}>{personal?.lastName}</span>
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold opacity-70">
          {personal?.location && <span>{personal.location}</span>}
          {personal?.phone && <span>{personal.phone}</span>}
          {personal?.email && <span>{personal.email}</span>}
          {personal?.linkedIn && <span>{personal.linkedIn}</span>}
          {personal?.portfolio && <span>{personal.portfolio}</span>}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--resume-gap) * 1.5)' }}>
          {summary && (
            <section>
              <p className="text-lg leading-relaxed font-medium" style={{ color: 'var(--resume-primary)' }}>{summary}</p>
            </section>
          )}

          {experience && experience.length > 0 && (
            <section>
              <h2 className="text-2xl font-black mb-4">Experience</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
                {experience.map((exp: any) => (
                  <div key={exp._id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-lg font-bold">{exp.jobTitle}</h3>
                      <span className="text-sm font-bold opacity-50">{exp.startDate} – {exp.isCurrentRole ? 'Present' : exp.endDate}</span>
                    </div>
                    <div className="text-sm font-bold mb-3" style={{ color: 'var(--resume-primary)' }}>{exp.company}</div>
                    <ul className="list-none space-y-1 text-sm opacity-80" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-bullet-gap)' }}>
                      {exp.bulletPoints.map((bullet: any, i: number) => (
                        <li key={i} className="flex gap-2">
                          <span style={{ color: 'var(--resume-primary)' }}>→</span> {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--resume-gap) * 1.5)' }}>
          {skills && Array.isArray(skills) && skills.length > 0 && (
            <section>
              <h2 className="text-xl font-black mb-4 border-b-2 pb-2" style={{ borderColor: 'var(--resume-primary)' }}>Skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill: any, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-black border-2" style={{ borderColor: 'var(--resume-primary)', color: 'var(--resume-primary)' }}>
                    {typeof skill === 'string' ? skill : skill.name || skill.category || ''}
                  </span>
                ))}
              </div>
            </section>
          )}

          <ProjectsSection projects={projects} primaryColor="var(--resume-primary)" />

          {education && education.length > 0 && (
            <section>
              <h2 className="text-xl font-black mb-4 border-b-2 pb-2" style={{ borderColor: 'var(--resume-primary)' }}>Education</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
                {education.map((edu: any) => (
                  <div key={edu._id}>
                    <h3 className="font-bold text-sm">{edu.degree}</h3>
                    <div className="text-sm font-medium" style={{ color: 'var(--resume-primary)' }}>{edu.school}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--resume-primary)' }}>{edu.school}</div>
                    <div className="text-[10px] uppercase tracking-widest opacity-50 mt-2">{edu.graduationDate}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <ProjectsSection projects={projects} primaryColor="var(--resume-primary)" />
          <CertificationsSection certifications={certifications} primaryColor="var(--resume-primary)" />
          <LanguagesSection languages={languages} primaryColor="var(--resume-primary)" />
          <VolunteerSection volunteerExperience={volunteerExperience} primaryColor="var(--resume-primary)" />
        </div>
      </div>
    </div>
  );
}
