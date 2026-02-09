import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import calendarIcon from "@/assets/icon-calendar.jpg";
import kitchenIcon from "@/assets/icon-kitchen.jpg";
import financeIcon from "@/assets/icon-finance.jpg";
import vaultIcon from "@/assets/icon-vault.jpg";
import { Calendar, ChefHat, Wallet, Shield, Users, CheckSquare } from "lucide-react";

const Features = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      titleKey: "features.calendar.title",
      descKey: "features.calendar.desc",
      icon: calendarIcon,
      lucideIcon: Calendar,
      color: "from-primary to-primary-light",
    },
    {
      titleKey: "features.kitchen.title",
      descKey: "features.kitchen.desc",
      icon: kitchenIcon,
      lucideIcon: ChefHat,
      color: "from-accent to-accent-light",
    },
    {
      titleKey: "features.finance.title",
      descKey: "features.finance.desc",
      icon: financeIcon,
      lucideIcon: Wallet,
      color: "from-primary to-accent",
    },
    {
      titleKey: "features.vault.title",
      descKey: "features.vault.desc",
      icon: vaultIcon,
      lucideIcon: Shield,
      color: "from-accent to-primary",
    },
    {
      titleKey: "features.family.title",
      descKey: "features.family.desc",
      icon: calendarIcon,
      lucideIcon: Users,
      color: "from-pink-500 to-rose-400",
    },
    {
      titleKey: "features.tasks.title",
      descKey: "features.tasks.desc",
      icon: kitchenIcon,
      lucideIcon: CheckSquare,
      color: "from-cyan-500 to-teal-400",
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            {t("features.title")}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            {t("features.subtitle")}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-none bg-card"
            >
              <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="relative h-40 sm:h-48 rounded-lg overflow-hidden mb-3 sm:mb-4">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-10`}></div>
                  <img 
                    src={feature.icon} 
                    alt={t(feature.titleKey)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color}`}>
                    <feature.lucideIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold">{t(feature.titleKey)}</h3>
                </div>
                
                <p className="text-sm sm:text-base text-muted-foreground">{t(feature.descKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
