import { TemplateProps } from './TemplateRegistry';
import { CertificationsSection, LanguagesSection, VolunteerSection, ProjectsSection } from './TemplateSections';

export default function Creative({ resume }: TemplateProps) {
  const { data } = resume;
  if (!data) return null;
  const { personal, summary, experience, education, skills, projects, certifications, languages, volunteerExperience } = data;

  return (
    <div className="flex h-full text-[var(--resume-text)] bg-[var(--resume-background)] overflow-hidden" style={{ fontFamily: 'var(--resume-font)', lineHeight: 'var(--resume-line-height)' }}>
      {/* Left Sidebar */}
      <div className="w-[35%] p-8 h-full" style={{ backgroundColor: 'var(--resume-text)', color: 'var(--resume-background)', padding: 'var(--resume-padding)' }}>
        <header className="mb-10">
          <div className="w-24 h-24 rounded-full mb-6 flex items-center justify-center text-3xl font-bold" style={{ backgroundColor: 'var(--resume-primary)', color: 'var(--resume-background)' }}>
            {personal?.firstName?.[0]}{personal?.lastName?.[0]}
          </div>
          <h1 className="text-3xl font-black tracking-tighter leading-none mb-2">
            {personal?.firstName}<br/>
            <span style={{ color: 'var(--resume-primary)' }}>{personal?.lastName}</span>
          </h1>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ opacity: 0.6 }}>Contact</h2>
            <div className="space-y-2 text-[13px]" style={{ opacity: 0.8 }}>
              {personal?.email && <div>{personal.email}</div>}
              {personal?.phone && <div>{personal.phone}</div>}
              {personal?.location && <div>{personal.location}</div>}
              {personal?.portfolio && <div style={{ color: 'var(--resume-primary)', opacity: 1 }}>{personal.portfolio}</div>}
            </div>
          </section>

          {skills && Array.isArray(skills) && skills.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ opacity: 0.6 }}>Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: any, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-md text-[12px]" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    {typeof skill === 'string' ? skill : skill.name || skill.category || ''}
                  </span>
                ))}
              </div>
            </section>
          )}

          {education && education.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ opacity: 0.6 }}>Education</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--resume-gap) * 0.75)' }}>
                {education.map((edu: any) => (
                  <div key={edu._id}>
                    <h3 className="font-bold text-[14px]" style={{ color: 'var(--resume-primary)' }}>{edu.degree}</h3>
                    <div className="text-[13px] leading-tight" style={{ opacity: 0.8 }}>{edu.school}</div>
                    <div className="text-[12px] mt-1" style={{ opacity: 0.6 }}>{edu.graduationDate}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Right Content */}
      <div className="w-[65%] p-10" style={{ backgroundColor: 'var(--resume-background)', padding: 'var(--resume-padding)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
          {summary && (
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-4" style={{ color: 'var(--resume-primary)' }}>
                Profile <span className="h-[2px] flex-1" style={{ backgroundColor: 'var(--resume-primary)', opacity: 0.3 }}></span>
              </h2>
              <p className="text-[14px] leading-relaxed font-medium" style={{ opacity: 0.9 }}>{summary}</p>
            </section>
          )}

          {experience && experience.length > 0 && (
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-4" style={{ color: 'var(--resume-primary)' }}>
                Experience <span className="h-[2px] flex-1" style={{ backgroundColor: 'var(--resume-primary)', opacity: 0.3 }}></span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-gap)' }}>
                {experience.map((exp: any) => (
                  <div key={exp._id} className="relative">
                    <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full border-4" style={{ backgroundColor: 'var(--resume-primary)', borderColor: 'var(--resume-background)' }}></div>
                    <div className="border-l-2 pl-6 ml-[-21px]" style={{ borderColor: 'var(--resume-primary)', opacity: 0.9 }}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-[16px]">{exp.jobTitle}</h3>
                        <span className="text-[12px] font-bold px-2 py-0.5 rounded" style={{ color: 'var(--resume-primary)', backgroundColor: 'var(--resume-primary)', opacity: 0.9 }}>
                          <span style={{ color: 'var(--resume-background)' }}>{exp.startDate} - {exp.isCurrentRole ? 'Present' : exp.endDate}</span>
                        </span>
                      </div>
                      <div className="text-[14px] font-medium mb-3" style={{ opacity: 0.7 }}>{exp.company}</div>
                      <ul className="text-[14px]" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--resume-bullet-gap)' }}>
                        {exp.bulletPoints.map((bullet: any, i: number) => (
                          <li key={i} className="relative pl-4">
                            <div className="absolute left-0 top-[8px] w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--resume-primary)', opacity: 0.5 }}></div>
                            {bullet}
                          </li>
                        ))}
                      </ul>
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
    </div>
  );
}
