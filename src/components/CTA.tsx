import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-primary rounded-2xl p-8 sm:p-12 md:p-16 text-center text-primary-foreground">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            {t("cta.title")}
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            {t("cta.description")}
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="h-12 px-8 text-base"
            onClick={() => navigate('/auth')}
          >
            {t("cta.button1")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <div className="mt-10 pt-8 border-t border-primary-foreground/20 grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl sm:text-3xl font-bold">10k+</div>
              <div className="text-sm opacity-80">{t("cta.stat1")}</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">4.9★</div>
              <div className="text-sm opacity-80">{t("cta.stat2")}</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">99%</div>
              <div className="text-sm opacity-80">{t("cta.stat3")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
