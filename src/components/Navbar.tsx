import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="https://res.cloudinary.com/dfjvcvbsn/image/upload/v1764055341/Desain_tanpa_judul_q2tjf9.png" 
              alt="RumahKu Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
              loading="lazy"
            />
            <span className="text-lg sm:text-xl font-bold">RumahKu</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
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
          
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate('/auth')}>
              {t("nav.login")}
            </Button>
            <Button variant="hero" size="sm" className="hidden sm:inline-flex" onClick={() => navigate('/auth')}>
              {t("nav.getStarted")}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <button onClick={() => handleNavClick('features')} className="text-sm font-medium hover:text-primary transition-colors text-left">
                {t("nav.features")}
              </button>
              <button onClick={() => handleNavClick('how-it-works')} className="text-sm font-medium hover:text-primary transition-colors text-left">
                {t("nav.howItWorks")}
              </button>
              <button onClick={() => handleNavClick('pricing')} className="text-sm font-medium hover:text-primary transition-colors text-left">
                {t("nav.pricing")}
              </button>
              <button 
                onClick={() => {
                  navigate('/install');
                  setMobileMenuOpen(false);
                }} 
                className="text-sm font-medium hover:text-primary transition-colors text-left"
              >
                {t("nav.install")}
              </button>
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="outline" size="sm" className="w-full" onClick={() => {
                  navigate('/auth');
                  setMobileMenuOpen(false);
                }}>
                  {t("nav.login")}
                </Button>
                <Button variant="hero" size="sm" className="w-full" onClick={() => {
                  navigate('/auth');
                  setMobileMenuOpen(false);
                }}>
                  {t("nav.getStarted")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
