import { useState } from 'react';
import { User, FileText, Briefcase, GraduationCap, Code, FolderGit2, Award, Globe, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

import PersonalInfoForm from './PersonalInfoForm';
import SummaryForm from './SummaryForm';
import ExperienceForm from './ExperienceForm';
import EducationForm from './EducationForm';
import SkillsForm from './SkillsForm';
import ProjectsForm from './ProjectsForm';
import CertificationsForm from './CertificationsForm';
import LanguagesForm from './LanguagesForm';
import VolunteerForm from './VolunteerForm';

const TABS = [
  { id: 'personal',       label: 'Personal',      icon: User },
  { id: 'summary',        label: 'Summary',        icon: FileText },
  { id: 'experience',     label: 'Experience',     icon: Briefcase },
  { id: 'education',      label: 'Education',      icon: GraduationCap },
  { id: 'skills',         label: 'Skills',         icon: Code },
  { id: 'projects',       label: 'Projects',       icon: FolderGit2 },
  { id: 'certifications', label: 'Certs',          icon: Award },
  { id: 'languages',      label: 'Languages',      icon: Globe },
  { id: 'volunteer',      label: 'Volunteer',      icon: Heart },
];

export default function EditorTabs() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-border custom-scrollbar shrink-0 px-2 pt-2 bg-secondary/20">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))] bg-[hsl(var(--primary)_/_0.05)] dark:bg-[hsl(var(--primary)_/_0.1)] rounded-t-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 dark:hover:bg-secondary rounded-t-lg'
              }`}
            >
              <Icon size={16} className={isActive ? "text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))]" : "text-muted-foreground"} />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'personal'       && <PersonalInfoForm />}
            {activeTab === 'summary'        && <SummaryForm />}
            {activeTab === 'experience'     && <ExperienceForm />}
            {activeTab === 'education'      && <EducationForm />}
            {activeTab === 'skills'         && <SkillsForm />}
            {activeTab === 'projects'       && <ProjectsForm />}
            {activeTab === 'certifications' && <CertificationsForm />}
            {activeTab === 'languages'      && <LanguagesForm />}
            {activeTab === 'volunteer'      && <VolunteerForm />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
