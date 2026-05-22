import { TemplateProps } from './TemplateRegistry';
import { CertificationsSection, LanguagesSection, VolunteerSection } from './TemplateSections';

export default function Corporate({ resume }: TemplateProps) {
  const { data } = resume;
  if (!data) return null;
  const { personal, summary, experience, education, skills, certifications, languages, volunteerExperience } = data;

  return (
    <div className="h-full bg-[var(--resume-background)] text-[var(--resume-text)]" style={{ fontFamily: 'var(--resume-font)', padding: 'var(--resume-padding)', lineHeight: 'var(--resume-line-height)' }}>
      {/* Header Traditional */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-serif font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--resume-primary)' }}>
          {personal?.firstName} {personal?.lastName}
        </h1>
        <div className="border-t-2 border-b-2 py-1.5 flex justify-center flex-wrap gap-x-4 gap-y-1 text-xs uppercase tracking-widest" style={{ borderColor: 'var(--resume-primary)', opacity: 0.8 }}>
          {personal?.location && <span>{personal.location}</span>}
          {personal?.phone && <span>| {personal.phone}</span>}
          {personal?.email && <span>| {personal.email}</span>}
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
        {summary && (
          <section>
            <p className="text-sm leading-relaxed text-justify" style={{ opacity: 0.9 }}>{summary}</p>
          </section>
        )}

        {experience && experience.length > 0 && (
          <section>
            <h2 className="text-lg font-serif font-bold uppercase tracking-widest mb-3 border-b-2" style={{ borderColor: 'var(--resume-primary)', color: 'var(--resume-primary)' }}>Professional Experience</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--resume-gap) * 1.2)' }}>
              {experience.map((exp: any) => (
                <div key={exp._id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-bold text-base uppercase tracking-wide">{exp.company}</h3>
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

        <div className="grid grid-cols-2 gap-8">
          {education && education.length > 0 && (
            <section>
              <h2 className="text-lg font-serif font-bold uppercase tracking-widest mb-3 border-b-2" style={{ borderColor: 'var(--resume-primary)', color: 'var(--resume-primary)' }}>Education</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
                {education.map((edu: any) => (
                  <div key={edu._id}>
                    <h3 className="font-bold text-sm uppercase">{edu.school}</h3>
                    <div className="italic text-sm">{edu.degree}</div>
                    <div className="text-sm opacity-80 mt-0.5">{edu.graduationDate}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {skills && Array.isArray(skills) && skills.length > 0 && (
            <section>
              <h2 className="text-lg font-serif font-bold uppercase tracking-widest mb-3 border-b-2" style={{ borderColor: 'var(--resume-primary)', color: 'var(--resume-primary)' }}>Core Competencies</h2>
              <ul className="list-disc list-outside ml-5 text-sm" style={{ opacity: 0.9 }}>
                {skills.map((skill: any, i: number) => <li key={i}>{typeof skill === 'string' ? skill : skill.name || skill.category || ''}</li>)}
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
