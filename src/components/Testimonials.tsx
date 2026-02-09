import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Loader2 } from "lucide-react";

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const Testimonials = () => {
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials_admin')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 md:py-24 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Dipercaya Ribuan Keluarga Indonesia
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Dengar langsung dari keluarga yang sudah merasakan manfaat RumahKu
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {testimonials.slice(0, 3).map((testimonial) => (
            <Card key={testimonial.id} className="border-none shadow-md hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                
                <p className="text-sm sm:text-base text-muted-foreground italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <Avatar className="h-9 w-9 sm:h-10 sm:w-10 bg-gradient-to-br from-primary to-accent">
                    <AvatarFallback className="bg-transparent text-white font-semibold text-sm">
                      {getInitials(testimonial.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm sm:text-base">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
