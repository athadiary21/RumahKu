import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, ChefHat, Wallet, Shield, Users, CheckSquare } from "lucide-react";

const Features = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      titleKey: "features.calendar.title",
      descKey: "features.calendar.desc",
      icon: Calendar,
    },
    {
      titleKey: "features.kitchen.title",
      descKey: "features.kitchen.desc",
      icon: ChefHat,
    },
    {
      titleKey: "features.finance.title",
      descKey: "features.finance.desc",
      icon: Wallet,
    },
    {
      titleKey: "features.vault.title",
      descKey: "features.vault.desc",
      icon: Shield,
    },
    {
      titleKey: "features.family.title",
      descKey: "features.family.desc",
      icon: Users,
    },
    {
      titleKey: "features.tasks.title",
      descKey: "features.tasks.desc",
      icon: CheckSquare,
    },
  ];

  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {t("features.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("features.subtitle")}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group border bg-card hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{t(feature.titleKey)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t(feature.descKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
