import { Home, Mail, Phone, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Error',
        description: 'Masukkan email Anda',
        variant: 'destructive',
      });
      return;
    }
    // TODO: Implement newsletter subscription API
    toast({
      title: 'Berhasil!',
      description: 'Terima kasih telah berlangganan newsletter kami',
    });
    setEmail('');
  };
  
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">RumahKu</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("footer.description")}
            </p>
            <div className="space-y-2">
              <a href={`mailto:${t("footer.contactEmail")}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                {t("footer.contactEmail")}
              </a>
              <a href={`https://wa.me/${t("footer.contactWA").replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                {t("footer.contactWA")}
              </a>
            </div>
            <div>
              <p className="text-sm font-semibold mb-3">{t("footer.followUs")}</p>
              <div className="flex gap-3">
                <a href="https://web.facebook.com/AthaDiary21?locale=id_ID" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-white transition-colors" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="https://www.instagram.com/athadiary21/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-white transition-colors" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-white transition-colors" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="https://www.linkedin.com/in/atha-rasyid-b1b5a0390/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-white transition-colors" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{t("footer.product")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer.features")}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer.pricing")}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer.faq")}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer.roadmap")}</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{t("footer.company")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer.about")}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer.blog")}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer.careers")}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer.contact")}</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{t("footer.legal")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer.privacy")}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer.terms")}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer.cookies")}</a></li>
            </ul>
          </div>
          
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="font-semibold mb-4">{t("footer.newsletter")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("footer.newsletterDesc")}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
              <Input 
                type="email" 
                placeholder={t("footer.email")}
                className="flex-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" variant="default" className="sm:w-auto w-full">
                {t("footer.subscribe")}
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 {t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
