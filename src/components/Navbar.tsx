import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleNavClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="https://res.cloudinary.com/dfjvcvbsn/image/upload/v1764055341/Desain_tanpa_judul_q2tjf9.png" 
              alt="RumahKu Logo" 
              className="h-8 w-8 object-contain"
              loading="lazy"
            />
            <span className="text-lg font-bold">RumahKu</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={() => handleNavClick('features')} className="text-sm font-medium hover:text-primary transition-colors">
              {t("nav.features")}
            </button>
            <button onClick={() => handleNavClick('how-it-works')} className="text-sm font-medium hover:text-primary transition-colors">
              {t("nav.howItWorks")}
            </button>
            <button onClick={() => handleNavClick('pricing')} className="text-sm font-medium hover:text-primary transition-colors">
              {t("nav.pricing")}
            </button>
            <button 
              onClick={() => navigate('/install')} 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {t("nav.install")}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
              {t("nav.login")}
            </Button>
            <Button variant="hero" size="sm" onClick={() => navigate('/auth')}>
              {t("nav.getStarted")}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
