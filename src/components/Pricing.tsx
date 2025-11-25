import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

const Pricing = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const formatPrice = (amount: number) => {
    if (language === "id") {
      return `Rp ${amount.toLocaleString("id-ID")}`;
    }
    return `$${amount}`;
  };
  
  const plans = [
    {
      tier: "free",
      nameKey: "pricing.starter.name",
      price: language === "id" ? 0 : "Free",
      descKey: "pricing.starter.desc",
      featureKeys: [
        "pricing.starter.feature1",
        "pricing.starter.feature2",
        "pricing.starter.feature3",
        "pricing.starter.feature4",
        "pricing.starter.feature5",
      ],
      ctaKey: "pricing.starter.cta",
      highlighted: false,
    },
    {
      tier: "family",
      nameKey: "pricing.family.name",
      price: language === "id" ? formatPrice(20000) : "$5",
      descKey: "pricing.family.desc",
      featureKeys: [
        "pricing.family.feature1",
        "pricing.family.feature2",
        "pricing.family.feature3",
        "pricing.family.feature4",
        "pricing.family.feature5",
        "pricing.family.feature6",
      ],
      ctaKey: "pricing.family.cta",
      highlighted: true,
    },
    {
      tier: "premium",
      nameKey: "pricing.premium.name",
      price: language === "id" ? formatPrice(100000) : "$25",
      descKey: "pricing.premium.desc",
      featureKeys: [
        "pricing.premium.feature1",
        "pricing.premium.feature2",
        "pricing.premium.feature3",
        "pricing.premium.feature4",
        "pricing.premium.feature5",
        "pricing.premium.feature6",
        "pricing.premium.feature7",
      ],
      ctaKey: "pricing.premium.cta",
      highlighted: false,
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            {t("pricing.title")}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-3 sm:mb-4">
            {t("pricing.subtitle")}
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-accent/10 text-accent text-xs sm:text-sm font-medium">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
            {t("pricing.annualDiscount")}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative ${
                plan.highlighted 
                  ? "border-primary shadow-xl sm:scale-105 md:scale-110" 
                  : ""
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 px-3 py-1 sm:px-4 sm:py-1 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold tracking-wider rounded-full shadow-lg">
                  {t("pricing.mostPopular")}
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">{t(plan.nameKey)}</CardTitle>
                <CardDescription className="text-sm">{t(plan.descKey)}</CardDescription>
                <div className="mt-3 sm:mt-4">
                  <span className="text-3xl sm:text-4xl font-bold">
                    {typeof plan.price === "number" ? formatPrice(plan.price) : plan.price}
                  </span>
                  {typeof plan.price !== "string" || plan.price !== "Free" ? (
                    <span className="text-sm text-muted-foreground">{t("pricing.perMonth")}</span>
                  ) : null}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 sm:space-y-4">
                <ul className="space-y-2 sm:space-y-3">
                  {plan.featureKeys.map((featureKey, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm">{t(featureKey)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  variant={plan.highlighted ? "hero" : "outline"}
                  className="w-full"
                  size="lg"
                  onClick={() => navigate(`/auth?plan=${plan.tier}`)}
                >
                  {t(plan.ctaKey)}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
