import { useResumeStore } from '@stores/resumeStore';

export default function PersonalInfoForm() {
  const { currentResume, updateResumeData } = useResumeStore();
  
  if (!currentResume) return null;

  const personal = currentResume.data?.personal || {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedIn: '',
    portfolio: '',
    github: '',
  };

  const handleChange = (field: keyof typeof personal, value: string) => {
    updateResumeData(currentResume._id, {
      personal: { ...personal, [field]: value },
    });
  };

  const inputClasses = "w-full px-4 py-2.5 bg-input border border-input rounded-xl text-foreground focus:bg-secondary focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-border outline-none transition-all shadow-sm placeholder:text-muted-foreground";
  const labelClasses = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Personal Details</h2>
        <p className="text-sm font-medium text-muted-foreground">Start with your basic contact information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>First Name</label>
          <input
            type="text"
            value={personal.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={inputClasses}
            placeholder="John"
          />
        </div>
        <div>
          <label className={labelClasses}>Last Name</label>
          <input
            type="text"
            value={personal.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={inputClasses}
            placeholder="Doe"
          />
        </div>
        <div>
          <label className={labelClasses}>Email Address</label>
          <input
            type="email"
            value={personal.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={inputClasses}
            placeholder="john.doe@example.com"
          />
        </div>
        <div>
          <label className={labelClasses}>Phone Number</label>
          <input
            type="tel"
            value={personal.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={inputClasses}
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClasses}>Location</label>
          <input
            type="text"
            value={personal.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className={inputClasses}
            placeholder="City, State, Country"
          />
        </div>
        
        <div className="md:col-span-2 pt-6 border-t border-border dark:border-border">
          <h3 className="text-base font-bold text-foreground mb-1 tracking-tight">Professional Links</h3>
          <p className="text-sm text-muted-foreground mb-6">Add links to your portfolio and professional profiles.</p>
        </div>

        <div>
          <label className={labelClasses}>LinkedIn URL</label>
          <input
            type="url"
            value={personal.linkedIn || ''}
            onChange={(e) => handleChange('linkedIn', e.target.value)}
            className={inputClasses}
            placeholder="linkedin.com/in/johndoe"
          />
        </div>
        <div>
          <label className={labelClasses}>GitHub URL</label>
          <input
            type="url"
            value={personal.github || ''}
            onChange={(e) => handleChange('github', e.target.value)}
            className={inputClasses}
            placeholder="github.com/johndoe"
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClasses}>Portfolio / Website URL</label>
          <input
            type="url"
            value={personal.portfolio || ''}
            onChange={(e) => handleChange('portfolio', e.target.value)}
            className={inputClasses}
            placeholder="johndoe.com"
          />
        </div>
      </div>
    </div>
  );
}
