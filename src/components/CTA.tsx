import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <section className="py-16 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10"></div>
      <div className="container mx-auto px-3 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl lg:text-5xl font-bold">
            {t("cta.title")}
          </h2>
          <p className="text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("cta.description")}
          </p>
          <div className="flex justify-center">
            <Button variant="hero" size="lg" className="group" onClick={() => navigate('/auth')}>
              {t("cta.button1")}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
          <div className="pt-8 flex items-center justify-center gap-12 text-sm text-muted-foreground">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-primary">10k+</div>
              <div className="text-center">{t("cta.stat1")}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-primary">4.9★</div>
              <div className="text-center">{t("cta.stat2")}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-primary">99%</div>
              <div className="text-center">{t("cta.stat3")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
