import { TemplateProps } from './TemplateRegistry';
import { CertificationsSection, LanguagesSection, VolunteerSection, ProjectsSection } from './TemplateSections';

export default function Executive({ resume }: TemplateProps) {
  const { data } = resume;
  if (!data) return null;
  const { personal, summary, experience, education, skills, projects, certifications, languages, volunteerExperience } = data;

  return (
    <div className="h-full bg-[var(--resume-background)] text-[var(--resume-text)]" style={{ fontFamily: 'var(--resume-font)', padding: 'var(--resume-padding)', lineHeight: 'var(--resume-line-height)' }}>
      <header className="text-center border-b-2 pb-8 mb-8" style={{ borderColor: 'var(--resume-primary)' }}>
        <h1 className="text-4xl font-normal tracking-widest uppercase mb-3" style={{ color: 'var(--resume-primary)' }}>
          {personal?.firstName} {personal?.lastName}
        </h1>
        
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm uppercase tracking-wider" style={{ color: 'var(--resume-text)', opacity: 0.8 }}>
          {personal?.email && <span>{personal.email}</span>}
          {personal?.phone && <span>| {personal.phone}</span>}
          {personal?.location && <span>| {personal.location}</span>}
          {personal?.linkedIn && <span>| {personal.linkedIn}</span>}
        </div>
      </header>

      <div className="max-w-4xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
        {summary && (
          <section>
            <h2 className="text-lg font-bold uppercase tracking-widest border-b pb-2 mb-4" style={{ borderColor: 'var(--resume-primary)', color: 'var(--resume-text)' }}>Executive Summary</h2>
            <p className="leading-relaxed text-[15px] text-justify" style={{ color: 'var(--resume-text)' }}>{summary}</p>
          </section>
        )}

        {experience && experience.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase tracking-widest border-b pb-2 mb-4" style={{ borderColor: 'var(--resume-primary)', color: 'var(--resume-text)' }}>Professional Experience</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
              {experience.map((exp: any) => (
                <div key={exp._id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-[15px]">{exp.company}</h3>
                    <span className="text-sm font-medium" style={{ color: 'var(--resume-primary)' }}>
                      {exp.startDate} – {exp.isCurrentRole ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[15px] italic mb-3" style={{ opacity: 0.9 }}>
                    {exp.jobTitle} {exp.location && `| ${exp.location}`}
                  </div>
                  <ul className="list-disc list-outside ml-4 text-[14.5px] leading-relaxed" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-bullet-gap)' }}>
                    {exp.bulletPoints.map((bullet: any, i: number) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {skills && Array.isArray(skills) && skills.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase tracking-widest border-b pb-2 mb-4" style={{ borderColor: 'var(--resume-primary)', color: 'var(--resume-text)' }}>Core Competencies</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[14.5px]">
              {skills.map((skill: any, i: number) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--resume-primary)' }}></span>
                  {typeof skill === 'string' ? skill : skill.name || skill.category || ''}
                </span>
              ))}
            </div>
          </section>
        )}

        {education && education.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase tracking-widest border-b pb-2 mb-4" style={{ borderColor: 'var(--resume-primary)', color: 'var(--resume-text)' }}>Education</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
              {education.map((edu: any) => (
                <div key={edu._id} className="flex justify-between items-baseline mb-4 last:mb-0">
                  <div>
                    <h3 className="font-bold text-[15px]">{edu.school}</h3>
                    <div className="text-[14.5px]" style={{ opacity: 0.9 }}>{edu.degree} in {edu.field}</div>
                  </div>
                  <div className="text-sm font-medium" style={{ color: 'var(--resume-primary)' }}>
                    {edu.graduationDate}
                  </div>
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
  );
}
