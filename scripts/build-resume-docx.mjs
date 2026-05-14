import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun
} from 'docx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const resumePath = path.join(root, 'src', '_data', 'resume.json');
const outputPath = path.join(root, 'assets', 'Caitlin_Britten_Resume.docx');

const text = (value, options = {}) => new TextRun({
  text: value,
  font: 'Aptos',
  size: options.size ?? 18,
  bold: options.bold ?? false
});

const paragraph = (children, options = {}) => new Paragraph({
  children: Array.isArray(children) ? children : [text(children)],
  spacing: { before: options.before ?? 0, after: options.after ?? 80 },
  alignment: options.alignment
});

const sectionHeading = (label) => new Paragraph({
  text: label.toUpperCase(),
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 180, after: 50 }
});

const bullet = (value) => new Paragraph({
  children: [text(value)],
  bullet: { level: 0 },
  spacing: { after: 35 }
});

const resume = JSON.parse(await readFile(resumePath, 'utf8'));

const document = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Aptos',
          size: 18
        }
      }
    },
    paragraphStyles: [
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: {
          bold: true,
          size: 20,
          font: 'Aptos'
        }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: 'resume-bullets',
        levels: [
          {
            level: 0,
            format: 'bullet',
            text: '•',
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 360, hanging: 180 }
              }
            }
          }
        ]
      }
    ]
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 650,
            bottom: 650,
            left: 790,
            right: 790
          }
        }
      },
      children: [
        new Paragraph({
          children: [text(resume.name, { bold: true, size: 36 })],
          spacing: { after: 20 }
        }),
        paragraph('Peabody, MA | (978) 979-6500 | cbrittenb@gmail.com | Remote-ready home office'),
        paragraph(resume.headline, { after: 60 }),
        paragraph(resume.summary, { after: 100 }),
        sectionHeading('Hiring Snapshot'),
        ...resume.snapshot.map((item) => bullet(`${item.value}: ${item.label}`)),
        sectionHeading('Core Competencies'),
        paragraph(resume.competencies.join(' | ')),
        sectionHeading('Software'),
        paragraph(resume.tools.join(' | ')),
        sectionHeading('Professional Experience'),
        ...resume.experience.flatMap((job) => [
          paragraph([
            text(job.role, { bold: true }),
            text(` | ${job.company} | ${job.location} | ${job.date}`)
          ], { before: 60, after: 35 }),
          ...job.bullets.map((item) => bullet(item))
        ]),
        sectionHeading('Education'),
        paragraph(`${resume.education.school} - ${resume.education.degree}`),
        sectionHeading('Certifications'),
        ...resume.certifications.map((item) => bullet(item))
      ]
    }
  ]
});

const buffer = await Packer.toBuffer(document);
await writeFile(outputPath, buffer);
console.log(`Wrote ${outputPath}`);
