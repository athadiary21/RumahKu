import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorks = () => {
  const { t } = useLanguage();
  
  const steps = [
    {
      step: "01",
      titleKey: "howItWorks.step1.title",
      descKey: "howItWorks.step1.desc",
    },
    {
      step: "02",
      titleKey: "howItWorks.step2.title",
      descKey: "howItWorks.step2.desc",
    },
    {
      step: "03",
      titleKey: "howItWorks.step3.title",
      descKey: "howItWorks.step3.desc",
    },
  ];

  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {t("howItWorks.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("howItWorks.subtitle")}
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((item, index) => (
              <div key={index} className="relative text-center">
                {/* Step number */}
                <div className="text-6xl sm:text-7xl font-bold text-muted/50 mb-4">
                  {item.step}
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{t(item.titleKey)}</h3>
                <p className="text-muted-foreground">{t(item.descKey)}</p>
                
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-full border-t border-dashed border-border" />
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
