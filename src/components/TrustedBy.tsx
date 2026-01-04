import { useLanguage } from "@/contexts/LanguageContext";

const TrustedBy = () => {
  const { language } = useLanguage();
  
  const title = language === "id" 
    ? "Dipercaya oleh 10.000+ keluarga di Indonesia" 
    : "Trusted by 10,000+ families in Indonesia";

  const logos = [
    { name: "Kompas", opacity: "opacity-40" },
    { name: "Detik", opacity: "opacity-40" },
    { name: "TechCrunch", opacity: "opacity-40" },
    { name: "Forbes", opacity: "opacity-40" },
    { name: "CNN Indonesia", opacity: "opacity-40" },
  ];

  return (
    <section className="py-12 border-b bg-muted/30">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground mb-8">
          {title}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((logo, index) => (
            <span
              key={index}
              className={`text-xl sm:text-2xl font-semibold text-muted-foreground ${logo.opacity} hover:opacity-60 transition-opacity`}
            >
              {logo.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
