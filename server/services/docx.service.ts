import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  UnderlineType,
  BorderStyle,
} from 'docx'

/**
 * DOCX Export Service
 * Generates professional DOCX files from resume data with formatting.
 * Uses the Resume.data shape: personal, summary, experience[].bulletPoints, etc.
 */

export const docxService = {
  /**
   * Generate DOCX from resume data (Resume.data shape)
   */
  generateDOCX: async (resumeData: any): Promise<Buffer> => {
    const sections: Paragraph[] = []

    const data = resumeData ?? {}

    // ── Personal Info Header ──────────────────────────────────────────────────
    const personal = data.personal ?? {}
    const fullName = [personal.firstName, personal.lastName].filter(Boolean).join(' ')
    if (fullName) {
      sections.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: fullName,
              bold: true,
              size: 48, // 24pt
            }),
          ],
          spacing: { after: 80 },
        })
      )
    }

    const contactParts = [
      personal.email,
      personal.phone,
      personal.location,
      personal.linkedIn,
      personal.github,
    ].filter(Boolean)

    if (contactParts.length > 0) {
      sections.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: contactParts.join(' | '),
              size: 20, // 10pt
            }),
          ],
          spacing: { after: 200 },
        })
      )
    }

    // ── Professional Summary ──────────────────────────────────────────────────
    if (data.summary && data.summary.trim()) {
      sections.push(docxService.createSectionHeader('PROFESSIONAL SUMMARY'))
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: data.summary, size: 22 })],
          spacing: { after: 200, line: 240 },
        })
      )
    }

    // ── Work Experience ───────────────────────────────────────────────────────
    if (data.experience && data.experience.length > 0) {
      sections.push(docxService.createSectionHeader('WORK EXPERIENCE'))

      data.experience.forEach((exp: any, idx: number) => {
        // Job title (bold) + company (italic) on separate lines
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: exp.jobTitle || '', bold: true, size: 24 })],
            spacing: { before: idx > 0 ? 200 : 0, after: 40 },
          })
        )

        const dateRange = `${exp.startDate || ''} – ${exp.isCurrentRole ? 'Present' : exp.endDate || 'Present'}`
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: exp.company || '', italics: true, size: 22 }),
              new TextRun({ text: `  ${dateRange}`, size: 22 }),
            ],
            spacing: { after: 80 },
          })
        )

        // Bullet points
        const bullets: string[] = exp.bulletPoints ?? []
        if (bullets.length === 0 && exp.description) {
          // Fall back to description split by newlines
          bullets.push(...exp.description.split('\n').filter(Boolean))
        }
        bullets.forEach((bullet: string) => {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: bullet, size: 22 })],
              bullet: { level: 0 },
              spacing: { after: 60, line: 240 },
            })
          )
        })

        sections.push(new Paragraph({ text: '', spacing: { after: 80 } }))
      })
    }

    // ── Education ─────────────────────────────────────────────────────────────
    if (data.education && data.education.length > 0) {
      sections.push(docxService.createSectionHeader('EDUCATION'))

      data.education.forEach((edu: any, idx: number) => {
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: edu.school || '', bold: true, size: 24 })],
            spacing: { before: idx > 0 ? 160 : 0, after: 40 },
          })
        )

        const degreeInfo = [edu.degree, edu.field ? `in ${edu.field}` : ''].filter(Boolean).join(' ')
        if (degreeInfo) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: degreeInfo, size: 22 })],
              spacing: { after: 40 },
            })
          )
        }

        if (edu.graduationDate) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: `Graduated: ${edu.graduationDate}`, italics: true, size: 20 })],
              spacing: { after: 120 },
            })
          )
        }
      })
    }

    // ── Skills ────────────────────────────────────────────────────────────────
    if (data.skills && data.skills.length > 0) {
      sections.push(docxService.createSectionHeader('SKILLS'))
      data.skills.forEach((skillGroup: any) => {
        const skillLine = [skillGroup.category, (skillGroup.items ?? []).join(', ')].filter(Boolean).join(': ')
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: skillLine, size: 22 })],
            spacing: { after: 120, line: 240 },
          })
        )
      })
    }

    // ── Certifications (omit if empty) ────────────────────────────────────────
    if (data.certifications && data.certifications.length > 0) {
      sections.push(docxService.createSectionHeader('CERTIFICATIONS'))

      data.certifications.forEach((cert: any) => {
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: cert.name || '', bold: true, size: 22 })],
            bullet: { level: 0 },
            spacing: { after: 40 },
          })
        )
        const certMeta = [cert.issuer, cert.issueDate ? `(${cert.issueDate})` : ''].filter(Boolean).join(' ')
        if (certMeta) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: certMeta, italics: true, size: 20 })],
              indent: { left: 360 },
              spacing: { after: 80 },
            })
          )
        }
      })
    }

    // ── Projects (omit if empty) ──────────────────────────────────────────────
    if (data.projects && data.projects.length > 0) {
      sections.push(docxService.createSectionHeader('PROJECTS'))

      data.projects.forEach((project: any, idx: number) => {
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: project.title || '', bold: true, size: 24 })],
            spacing: { before: idx > 0 ? 160 : 0, after: 40 },
          })
        )

        if (project.link) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: project.link,
                  color: '0563C1',
                  underline: { type: UnderlineType.SINGLE },
                  size: 20,
                }),
              ],
              spacing: { after: 60 },
            })
          )
        }

        if (project.description) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: project.description, size: 22 })],
              spacing: { after: 80, line: 240 },
            })
          )
        }

        if (project.technologies && project.technologies.length > 0) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: `Technologies: ${project.technologies.join(', ')}`, italics: true, size: 20 })],
              spacing: { after: 80 },
            })
          )
        }
      })
    }

    // ── Languages (omit if empty) ─────────────────────────────────────────────
    if (data.languages && data.languages.length > 0) {
      sections.push(docxService.createSectionHeader('LANGUAGES'))
      const langText = data.languages
        .map((l: any) => [l.name, l.proficiency].filter(Boolean).join(' – '))
        .join(', ')
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: langText, size: 22 })],
          spacing: { after: 200 },
        })
      )
    }

    // ── Volunteer Experience (omit if empty) ──────────────────────────────────
    const volunteerExp = data.volunteerExperience ?? data.volunteer ?? []
    if (volunteerExp.length > 0) {
      sections.push(docxService.createSectionHeader('VOLUNTEER EXPERIENCE'))

      volunteerExp.forEach((vol: any, idx: number) => {
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: vol.role || '', bold: true, size: 24 })],
            spacing: { before: idx > 0 ? 160 : 0, after: 40 },
          })
        )
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: vol.organization || '', italics: true, size: 22 })],
            spacing: { after: 60 },
          })
        )
        if (vol.description) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: vol.description, size: 22 })],
              spacing: { after: 80, line: 240 },
            })
          )
        }
      })
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,    // 1 inch
                bottom: 1440,
                left: 1440,
                right: 1440,
              },
            },
          },
          children: sections,
        },
      ],
    })

    return await Packer.toBuffer(doc)
  },

  /**
   * Create a formatted section header paragraph
   */
  createSectionHeader: (title: string): Paragraph => {
    return new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 24 })],
      spacing: { before: 240, after: 120 },
      border: {
        bottom: {
          color: '000000',
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
    })
  },

  /**
   * Generate ATS-safe DOCX (minimal formatting, plain text structure)
   * Uses the same Resume.data shape as generateDOCX.
   */
  generateATSSafeDOCX: async (resumeData: any): Promise<Buffer> => {
    const sections: Paragraph[] = []
    const data = resumeData ?? {}
    const personal = data.personal ?? {}

    // Name
    const fullName = [personal.firstName, personal.lastName].filter(Boolean).join(' ')
    if (fullName) {
      sections.push(new Paragraph({ children: [new TextRun({ text: fullName, bold: true })] }))
    }

    // Contact
    const contactParts = [personal.email, personal.phone, personal.location].filter(Boolean)
    if (contactParts.length > 0) {
      sections.push(new Paragraph({ children: [new TextRun(contactParts.join(' | '))] }))
    }
    sections.push(new Paragraph({ text: '' }))

    // Summary
    if (data.summary) {
      sections.push(new Paragraph({ children: [new TextRun({ text: 'PROFESSIONAL SUMMARY', bold: true })] }))
      sections.push(new Paragraph({ children: [new TextRun(data.summary)] }))
      sections.push(new Paragraph({ text: '' }))
    }

    // Experience
    if (data.experience && data.experience.length > 0) {
      sections.push(new Paragraph({ children: [new TextRun({ text: 'WORK EXPERIENCE', bold: true })] }))
      data.experience.forEach((exp: any) => {
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: `${exp.jobTitle || ''} at ${exp.company || ''}`, bold: true })],
          })
        )
        sections.push(
          new Paragraph({
            children: [new TextRun(`${exp.startDate || ''} - ${exp.isCurrentRole ? 'Present' : exp.endDate || 'Present'}`)],
          })
        )
        const bullets: string[] = exp.bulletPoints ?? []
        bullets.forEach((bullet: string) => {
          sections.push(new Paragraph({ children: [new TextRun(`• ${bullet}`)] }))
        })
        sections.push(new Paragraph({ text: '' }))
      })
    }

    // Skills
    if (data.skills && data.skills.length > 0) {
      sections.push(new Paragraph({ children: [new TextRun({ text: 'SKILLS', bold: true })] }))
      data.skills.forEach((skillGroup: any) => {
        const skillLine = [skillGroup.category, (skillGroup.items ?? []).join(', ')].filter(Boolean).join(': ')
        sections.push(new Paragraph({ children: [new TextRun(skillLine)] }))
      })
      sections.push(new Paragraph({ text: '' }))
    }

    // Education
    if (data.education && data.education.length > 0) {
      sections.push(new Paragraph({ children: [new TextRun({ text: 'EDUCATION', bold: true })] }))
      data.education.forEach((edu: any) => {
        const degreeInfo = [edu.degree, edu.field ? `in ${edu.field}` : ''].filter(Boolean).join(' ')
        sections.push(new Paragraph({ children: [new TextRun({ text: degreeInfo, bold: true })] }))
        sections.push(new Paragraph({ children: [new TextRun(`${edu.school || ''} | ${edu.graduationDate || ''}`)] }))
      })
    }

    const doc = new Document({
      sections: [{ children: sections }],
    })

    return await Packer.toBuffer(doc)
  },
}
