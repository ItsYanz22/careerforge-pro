import { TemplateProps } from './TemplateRegistry';
import { CertificationsSection, LanguagesSection, VolunteerSection } from './TemplateSections';

export default function ATSClassic({ resume }: TemplateProps) {
  const { data } = resume;
  if (!data) return null;
  const { personal, summary, experience, education, skills, projects, certifications, languages, volunteerExperience } = data;

  return (
    <div className="h-full bg-[var(--resume-background)] text-[var(--resume-text)]" style={{ fontFamily: 'var(--resume-font)', padding: 'var(--resume-padding)', lineHeight: 'var(--resume-line-height)' }}>
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase mb-2" style={{ color: 'var(--resume-primary)' }}>
          {personal?.firstName} {personal?.lastName}
        </h1>
        <div className="text-[11pt] space-x-2" style={{ opacity: 0.9 }}>
          {personal?.location && <span>{personal.location}</span>}
          {personal?.phone && <span>| {personal.phone}</span>}
          {personal?.email && <span>| {personal.email}</span>}
          {personal?.linkedIn && <span>| {personal.linkedIn}</span>}
        </div>
      </header>

      <div className="text-[11pt]" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
        {summary && (
          <section>
            <h2 className="text-sm font-bold uppercase border-b mb-2" style={{ borderColor: 'var(--resume-primary)', color: 'var(--resume-primary)' }}>Summary</h2>
            <p className="mb-0">{summary}</p>
          </section>
        )}

        {experience && experience.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase border-b mb-2" style={{ borderColor: 'var(--resume-primary)', color: 'var(--resume-primary)' }}>Experience</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
              {experience.map((exp: any) => (
                <div key={exp._id}>
                  <div className="flex justify-between font-bold">
                    <span>{exp.jobTitle}</span>
                    <span style={{ color: 'var(--resume-primary)' }}>{exp.startDate} - {exp.isCurrentRole ? 'Present' : exp.endDate}</span>
                  </div>
                  <div className="flex justify-between italic mb-1" style={{ opacity: 0.9 }}>
                    <span>{exp.company}</span>
                    <span>{exp.location}</span>
                  </div>
                  <ul className="list-disc list-outside ml-5" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-bullet-gap)' }}>
                    {exp.bulletPoints.map((bullet: any, i: number) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {projects && projects.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase border-b mb-2" style={{ borderColor: 'var(--resume-primary)', color: 'var(--resume-primary)' }}>Projects</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
              {projects.map((proj: any) => (
                <div key={proj._id}>
                  <div className="flex justify-between font-bold">
                    <span>{proj.title}</span>
                    <span style={{ color: 'var(--resume-primary)' }}>{proj.startDate} - {proj.endDate || 'Present'}</span>
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="italic mb-1" style={{ opacity: 0.9 }}>Technologies: {proj.technologies.join(', ')}</div>
                  )}
                  <p className="mb-0">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {education && education.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase border-b mb-2" style={{ borderColor: 'var(--resume-primary)', color: 'var(--resume-primary)' }}>Education</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--resume-gap) * 0.75)' }}>
              {education.map((edu: any) => (
                <div key={edu._id}>
                  <div className="flex justify-between font-bold">
                    <span>{edu.school}</span>
                    <span style={{ color: 'var(--resume-primary)' }}>{edu.graduationDate}</span>
                  </div>
                  <div className="flex justify-between" style={{ opacity: 0.9 }}>
                    <span>{edu.degree} in {edu.field}</span>
                    {edu.gpa && <span>GPA: {edu.gpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {skills && skills.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase border-b mb-2" style={{ borderColor: 'var(--resume-primary)', color: 'var(--resume-primary)' }}>Skills</h2>
            <p className="mb-0">{Array.isArray(skills) ? skills.join(', ') : ''}</p>
          </section>
        )}

        <CertificationsSection certifications={certifications} />
        <LanguagesSection languages={languages} />
        <VolunteerSection volunteerExperience={volunteerExperience} />
      </div>
    </div>
  );
}
