import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorks = () => {
  const { t } = useLanguage();
  
  const steps = [
    {
      step: "1",
      titleKey: "howItWorks.step1.title",
      descKey: "howItWorks.step1.desc",
    },
    {
      step: "2",
      titleKey: "howItWorks.step2.title",
      descKey: "howItWorks.step2.desc",
    },
    {
      step: "3",
      titleKey: "howItWorks.step3.title",
      descKey: "howItWorks.step3.desc",
    },
  ];

  return (
    <section className="py-16 lg:py-32">
      <div className="container mx-auto px-3">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">
            {t("howItWorks.title")}
          </h2>
          <p className="text-base text-muted-foreground">
            {t("howItWorks.subtitle")}
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-8 relative">
            {steps.map((item, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-20 blur-xl rounded-full"></div>
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                      {item.step}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold">{t(item.titleKey)}</h3>
                  <p className="text-base text-muted-foreground">{t(item.descKey)}</p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-primary/30">
                    <ArrowRight className="absolute right-0 -top-3 h-6 w-6 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
