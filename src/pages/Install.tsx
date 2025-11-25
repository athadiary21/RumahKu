import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Apple, Monitor, Chrome, ArrowLeft, Download, CheckCircle2 } from "lucide-react";

const Install = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("android");

  // Detect platform and auto-select appropriate tab
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setActiveTab("ios");
    } else if (/android/.test(userAgent)) {
      setActiveTab("android");
    } else {
      setActiveTab("desktop");
    }
  }, []);

  const platforms = [
    { id: "android", icon: Smartphone, label: t("install.android"), recommended: true },
    { id: "ios", icon: Apple, label: t("install.ios") },
    { id: "desktop", icon: Monitor, label: t("install.desktop") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2 text-xs sm:text-sm"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t("install.backHome")}</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <img 
                src="https://res.cloudinary.com/dfjvcvbsn/image/upload/v1764055341/Desain_tanpa_judul_q2tjf9.png" 
                alt="RumahKu Logo" 
                className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
                loading="lazy"
              />
              <span className="text-base sm:text-lg font-bold">RumahKu</span>
            </div>
            <div className="w-16 sm:w-20" />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
        {/* Hero Section */}
        <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-3 sm:mb-4">
            <Download className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t("install.title")}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
            {t("install.subtitle")}
          </p>
        </div>

        {/* Platform Tabs */}
        <div className="mx-auto max-w-4xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <TabsTrigger
                    key={platform.id}
                    value={platform.id}
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{platform.label}</span>
                    {platform.recommended && (
                      <Badge variant="secondary" className="ml-1 hidden md:inline-flex text-xs">
                        {t("install.recommended")}
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Android Instructions */}
            <TabsContent value="android" className="space-y-4 sm:space-y-6">
              <Card className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  {t("install.androidTitle")}
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className="flex gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                        {step}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm sm:text-base text-foreground font-medium">
                          {t(`install.androidStep${step}`)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t("install.androidNote")}
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* iOS Instructions */}
            <TabsContent value="ios" className="space-y-4 sm:space-y-6">
              <Card className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                  <Apple className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  {t("install.iosTitle")}
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((step) => (
                    <div key={step} className="flex gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                        {step}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm sm:text-base text-foreground font-medium">
                          {t(`install.iosStep${step}`)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Apple className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <p className="font-semibold text-accent-foreground mb-1">
                        {t("install.iosImportant")}
                      </p>
                      <p className="text-muted-foreground">
                        {t("install.iosNote")}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Desktop Instructions */}
            <TabsContent value="desktop" className="space-y-4 sm:space-y-6">
              <Card className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                  <Monitor className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  {t("install.desktopTitle")}
                </h2>
                
                {/* Chrome/Edge */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                    <Chrome className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Chrome / Edge
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div key={step} className="flex gap-3 sm:gap-4">
                        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                          {step}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm sm:text-base text-foreground font-medium">
                            {t(`install.desktopStep${step}`)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Firefox Note */}
                <div className="p-3 sm:p-4 bg-muted rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Firefox</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t("install.firefoxNote")}
                  </p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Benefits Section */}
          <Card className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{t("install.benefitsTitle")}</h3>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {[1, 2, 3, 4].map((benefit) => (
                <div key={benefit} className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-foreground">
                    {t(`install.benefit${benefit}`)}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* CTA */}
          <div className="mt-6 sm:mt-8 text-center space-y-3 sm:space-y-4">
            <Button size="lg" onClick={() => navigate("/auth")} className="gap-2 w-full sm:w-auto">
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              {t("install.getStarted")}
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("install.needHelp")}{" "}
              <a 
                href="https://wa.me/6282241590417" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {t("install.contactSupport")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Install;
