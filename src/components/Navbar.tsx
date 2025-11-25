import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="https://res.cloudinary.com/dfjvcvbsn/image/upload/v1764055341/Desain_tanpa_judul_q2tjf9.png" 
              alt="RumahKu Logo" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold">RumahKu</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              {t("nav.features")}
            </a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              {t("nav.howItWorks")}
            </a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              {t("nav.pricing")}
            </a>
          </div>
          
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => navigate('/auth')}>
              {t("nav.login")}
            </Button>
            <Button variant="hero" onClick={() => navigate('/auth')}>
              {t("nav.getStarted")}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
