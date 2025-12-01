import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Users, ChefHat } from 'lucide-react';
import { RecipeTemplate } from '@/data/recipeTemplates';

interface RecipeTemplatePreviewProps {
  recipe: RecipeTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCollection: (recipe: RecipeTemplate) => void;
  isAdded?: boolean;
}

export const RecipeTemplatePreview = ({
  recipe,
  open,
  onOpenChange,
  onAddToCollection,
  isAdded = false,
}: RecipeTemplatePreviewProps) => {
  if (!recipe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="text-4xl sm:text-5xl">{recipe.icon}</span>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl sm:text-2xl">{recipe.name}</DialogTitle>
              <DialogDescription className="text-sm sm:text-base mt-1">
                {recipe.description}
              </DialogDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary">{recipe.category}</Badge>
            <Badge variant={recipe.difficulty === 'Mudah' ? 'default' : 'outline'}>
              {recipe.difficulty}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4 sm:space-y-6">
            {/* Info waktu & porsi */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div className="p-2 sm:p-3 rounded-lg bg-muted">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-primary" />
                <p className="text-xs sm:text-sm font-medium">{recipe.prep_time} mnt</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Persiapan</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-muted">
                <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-primary" />
                <p className="text-xs sm:text-sm font-medium">{recipe.cook_time} mnt</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Memasak</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-muted">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-primary" />
                <p className="text-xs sm:text-sm font-medium">{recipe.servings}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Porsi</p>
              </div>
            </div>

            <Separator />

            {/* Bahan-bahan */}
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Bahan-Bahan</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm sm:text-base">
                    <span className="text-primary mt-1">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Cara Membuat */}
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Cara Membuat</h3>
              <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed">
                {recipe.instructions}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Tutup
          </Button>
          <Button
            onClick={() => {
              onAddToCollection(recipe);
              onOpenChange(false);
            }}
            disabled={isAdded}
            className="flex-1"
          >
            {isAdded ? '✓ Sudah Ditambahkan' : 'Tambah ke Koleksi Saya'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
