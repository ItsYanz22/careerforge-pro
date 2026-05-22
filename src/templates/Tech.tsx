import { TemplateProps } from './TemplateRegistry';
import { CertificationsSection, LanguagesSection, VolunteerSection, ProjectsSection } from './TemplateSections';

export default function Tech({ resume }: TemplateProps) {
  const { data } = resume;
  if (!data) return null;
  const { personal, summary, experience, education, skills, projects, certifications, languages, volunteerExperience } = data;

  return (
    <div className="p-8 h-full bg-[var(--resume-background)] text-[var(--resume-text)] font-mono text-[13px]" style={{ fontFamily: 'var(--resume-font)', padding: 'var(--resume-padding)', lineHeight: 'var(--resume-line-height)' }}>
      <header className="mb-8 border-b-2 pb-4" style={{ borderColor: 'var(--resume-primary)' }}>
        <h1 className="text-3xl font-bold mb-2">
          &lt;{personal?.firstName}{personal?.lastName} /&gt;
        </h1>
        <div className="flex flex-wrap gap-4" style={{ opacity: 0.8 }}>
          {personal?.email && <span>email: "{personal.email}"</span>}
          {personal?.phone && <span>tel: "{personal.phone}"</span>}
          {personal?.github && <span style={{ color: 'var(--resume-primary)' }}>github: "{personal.github}"</span>}
          {personal?.portfolio && <span style={{ color: 'var(--resume-primary)' }}>web: "{personal.portfolio}"</span>}
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
        {summary && (
          <section>
            <h2 className="font-bold mb-2" style={{ color: 'var(--resume-primary)' }}>## summary</h2>
            <p className="leading-relaxed pl-4 border-l-2" style={{ borderColor: 'var(--resume-primary)', opacity: 0.9 }}>{summary}</p>
          </section>
        )}

        {skills && Array.isArray(skills) && skills.length > 0 && (
          <section>
            <h2 className="font-bold mb-2" style={{ color: 'var(--resume-primary)' }}>## skills</h2>
            <div className="flex flex-wrap gap-2 pl-4">
              {skills.map((skill: any, i: number) => (
                <span key={i} className="px-2 py-0.5 rounded-sm" style={{ backgroundColor: 'var(--resume-primary)', color: 'var(--resume-background)', opacity: 0.9 }}>
                  {typeof skill === 'string' ? skill : skill.name || skill.category || ''}
                </span>
              ))}
            </div>
          </section>
        )}

        {experience && experience.length > 0 && (
          <section>
            <h2 className="font-bold mb-3" style={{ color: 'var(--resume-primary)' }}>## experience</h2>
            <div className="pl-4 border-l-2" style={{ borderColor: 'var(--resume-primary)', display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
              {experience.map((exp: any) => (
                <div key={exp._id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold">{exp.company}</h3>
                    <span className="text-[12px]" style={{ opacity: 0.7 }}>
                      [{exp.startDate} - {exp.isCurrentRole ? 'Present' : exp.endDate}]
                    </span>
                  </div>
                  <div className="mb-2" style={{ color: 'var(--resume-primary)' }}>role: "{exp.jobTitle}"</div>
                  <ul className="list-square list-inside space-y-1" style={{ opacity: 0.9 }}>
                    {exp.bulletPoints.map((bullet: any, i: number) => (
                      <li key={i} className="flex items-start">
                        <span style={{ color: 'var(--resume-primary)', marginRight: '8px' }}>&gt;_</span>
                        <span className="flex-1">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <ProjectsSection projects={projects} primaryColor="var(--resume-primary)" />
        <CertificationsSection certifications={certifications} primaryColor="var(--resume-primary)" />
        <LanguagesSection languages={languages} primaryColor="var(--resume-primary)" />
        <VolunteerSection volunteerExperience={volunteerExperience} primaryColor="var(--resume-primary)" />

        {education && education.length > 0 && (
          <section>
            <h2 className="font-bold mb-3" style={{ color: 'var(--resume-primary)' }}>## education</h2>
            <div className="pl-4 border-l-2" style={{ borderColor: 'var(--resume-primary)', display: 'flex', flexDirection: 'column', gap: 'calc(var(--resume-gap) * 0.75)' }}>
              {education.map((edu: any) => (
                <div key={edu._id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold">{edu.school}</h3>
                    <span className="text-[12px]" style={{ opacity: 0.7 }}>[{edu.graduationDate}]</span>
                  </div>
                  <div style={{ opacity: 0.9 }}>{edu.degree} in {edu.field}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
