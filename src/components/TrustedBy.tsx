import { Shield, Zap, Users, Lock } from "lucide-react";

const trustIndicators = [
  {
    icon: Shield,
    label: "Data Terenkripsi",
  },
  {
    icon: Lock,
    label: "ISO 27001 Certified",
  },
  {
    icon: Users,
    label: "10.000+ Pengguna",
  },
  {
    icon: Zap,
    label: "99.9% Uptime",
  },
];

const TrustedBy = () => {
  return (
    <section className="py-8 sm:py-10 md:py-12 border-y bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6 sm:gap-8">
          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-semibold text-center">
            Dipercaya oleh keluarga modern Indonesia
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 w-full max-w-4xl">
            {trustIndicators.map((item, index) => (
              <div 
                key={index}
                className="flex flex-col items-center gap-2 text-center"
              >
                <div className="p-2 sm:p-3 rounded-full bg-primary/10">
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <span className="text-xs sm:text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
