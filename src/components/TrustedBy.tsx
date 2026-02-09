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
    <section className="py-10 border-y bg-muted/20">
      <div className="container mx-auto px-3">
        <div className="flex flex-col items-center gap-8">
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold text-center">
            Dipercaya oleh keluarga modern Indonesia
          </p>
          
          <div className="grid grid-cols-4 gap-8 w-full max-w-4xl">
            {trustIndicators.map((item, index) => (
              <div 
                key={index}
                className="flex flex-col items-center gap-2 text-center"
              >
                <div className="p-3 rounded-full bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
