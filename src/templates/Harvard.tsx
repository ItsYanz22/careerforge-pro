import { TemplateProps } from './TemplateRegistry';
import { CertificationsSection, LanguagesSection, VolunteerSection, ProjectsSection } from './TemplateSections';

export default function Harvard({ resume }: TemplateProps) {
  const { data } = resume;
  if (!data) return null;
  const { personal, experience, education, skills, projects, certifications, languages, volunteerExperience } = data;

  return (
    <div className="h-full bg-[var(--resume-background)] text-[var(--resume-text)]" style={{ fontFamily: 'var(--resume-font)', padding: 'var(--resume-padding)', lineHeight: 'var(--resume-line-height)' }}>
      {/* Header Centered */}
      <header className="border-b-4 pb-4 mb-6 text-center" style={{ borderColor: 'var(--resume-primary)' }}>
        <h1 className="text-4xl font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--resume-primary)' }}>
          {personal?.firstName} {personal?.lastName}
        </h1>
        <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 text-sm font-medium" style={{ opacity: 0.9 }}>
          {personal?.location && <span>{personal.location}</span>}
          {personal?.phone && <span>• {personal.phone}</span>}
          {personal?.email && <span>• {personal.email}</span>}
          {personal?.linkedIn && <span>• {personal.linkedIn}</span>}
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
        {/* Education First for Harvard/Ivy style */}
        {education && education.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase tracking-widest mb-3 border-b-2" style={{ borderColor: 'var(--resume-primary)' }}>Education</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--resume-gap) / 2)' }}>
              {education.map((edu: any) => (
                <div key={edu._id} className="flex justify-between items-baseline">
                  <div>
                    <h3 className="font-bold">{edu.school}</h3>
                    <div className="italic text-sm">{edu.degree} in {edu.field}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">{edu.graduationDate}</div>
                    {edu.gpa && <div className="text-sm">GPA: {edu.gpa}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase tracking-widest mb-3 border-b-2" style={{ borderColor: 'var(--resume-primary)' }}>Experience</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
              {experience.map((exp: any) => (
                <div key={exp._id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold">{exp.company}</h3>
                    <span className="text-sm font-medium">{exp.location}</span>
                  </div>
                  <div className="flex justify-between items-baseline mb-2">
                    <div className="italic text-sm">{exp.jobTitle}</div>
                    <span className="text-sm">{exp.startDate} – {exp.isCurrentRole ? 'Present' : exp.endDate}</span>
                  </div>
                  <ul className="list-disc list-outside ml-5 text-sm" style={{ opacity: 0.9, display: 'flex', flexDirection: 'column', gap: 'var(--resume-bullet-gap)' }}>
                    {exp.bulletPoints.map((bullet: any, i: number) => <li key={i}>{bullet}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
        <ProjectsSection projects={projects} primaryColor="var(--resume-primary)" />

        {skills && Array.isArray(skills) && skills.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase tracking-widest mb-3 border-b-2" style={{ borderColor: 'var(--resume-primary)' }}>Skills</h2>
            <p className="text-sm" style={{ opacity: 0.9 }}>
              {skills.map((s: any) => typeof s === 'string' ? s : s.name || s.category || '').join(', ')}
            </p>
          </section>
        )}

        <CertificationsSection certifications={certifications} primaryColor="var(--resume-primary)" />
        <LanguagesSection languages={languages} primaryColor="var(--resume-primary)" />
        <VolunteerSection volunteerExperience={volunteerExperience} primaryColor="var(--resume-primary)" />
      </div>
    </div>
  );
}

