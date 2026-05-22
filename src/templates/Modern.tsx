import { TemplateProps } from './TemplateRegistry';
import { CertificationsSection, LanguagesSection, VolunteerSection } from './TemplateSections';

export default function Modern({ resume }: TemplateProps) {
  const { data } = resume;
  
  if (!data) return null;
  const { personal, summary, experience, education, skills, projects, certifications, languages, volunteerExperience } = data;

  return (
    <div className="h-full bg-[var(--resume-background)] text-[var(--resume-text)]" style={{ fontFamily: 'var(--resume-font)', padding: 'var(--resume-padding)', lineHeight: 'var(--resume-line-height)' }}>
      {/* Header */}
      <header className="border-b-2 pb-6 mb-6" style={{ borderColor: 'var(--resume-primary)' }}>
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          {personal?.firstName} <span style={{ color: 'var(--resume-primary)' }}>{personal?.lastName}</span>
        </h1>
        
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ opacity: 0.8 }}>
          {personal?.email && <span>{personal.email}</span>}
          {personal?.phone && <span>• {personal.phone}</span>}
          {personal?.location && <span>• {personal.location}</span>}
          {personal?.linkedIn && <span>• {personal.linkedIn}</span>}
          {personal?.portfolio && <span>• {personal.portfolio}</span>}
        </div>
      </header>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
          {/* Summary */}
          {summary && (
            <section>
              <h2 className="text-xl font-bold uppercase tracking-wider mb-3">Professional Summary</h2>
              <p className="leading-relaxed text-sm" style={{ opacity: 0.9 }}>{summary}</p>
            </section>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <section>
              <h2 className="text-xl font-bold uppercase tracking-wider mb-4 border-b pb-1" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>Experience</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
                {experience.map((exp: any) => (
                  <div key={exp._id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold">{exp.jobTitle}</h3>
                      <span className="text-sm font-medium" style={{ color: 'var(--resume-primary)' }}>
                        {exp.startDate} – {exp.isCurrentRole ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="text-sm font-medium mb-2" style={{ opacity: 0.7 }}>
                      {exp.company} {exp.location && `| ${exp.location}`}
                    </div>
                    <ul className="list-disc list-outside ml-4 text-sm" style={{ opacity: 0.9, display: 'flex', flexDirection: 'column', gap: 'var(--resume-bullet-gap)' }}>
                      {exp.bulletPoints.map((bullet: any, i: number) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section>
              <h2 className="text-xl font-bold uppercase tracking-wider mb-4 border-b pb-1" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>Projects</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
                {projects.map((proj: any) => (
                  <div key={proj._id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold">{proj.title}</h3>
                      {proj.link && <span className="text-xs" style={{ color: 'var(--resume-primary)' }}>{proj.link}</span>}
                    </div>
                    <p className="text-sm mb-1" style={{ opacity: 0.9 }}>{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="text-xs" style={{ opacity: 0.6 }}>
                        <span className="font-medium">Technologies:</span> {proj.technologies.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
          {/* Skills */}
          {skills && Array.isArray(skills) && skills.length > 0 && (
            <section>
              <h2 className="text-xl font-bold uppercase tracking-wider mb-4 border-b pb-1" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: any, i: number) => (
                  <span key={i} className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'var(--resume-primary)', color: 'var(--resume-background)', opacity: 0.9 }}>
                    {typeof skill === 'string' ? skill : skill.name || ''}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <section>
              <h2 className="text-xl font-bold uppercase tracking-wider mb-4 border-b pb-1" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>Education</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
                {education.map((edu: any) => (
                  <div key={edu._id}>
                    <h3 className="font-bold text-sm">{edu.degree} in {edu.field}</h3>
                    <div className="text-sm mb-1" style={{ opacity: 0.7 }}>{edu.school}</div>
                    <div className="flex justify-between text-xs" style={{ opacity: 0.6 }}>
                      <span>{edu.graduationDate}</span>
                      {edu.gpa && <span>GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <CertificationsSection certifications={certifications} />
          <LanguagesSection languages={languages} />
          <VolunteerSection volunteerExperience={volunteerExperience} />
        </div>
      </div>
    </div>
  );
}
