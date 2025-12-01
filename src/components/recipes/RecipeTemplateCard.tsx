import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Eye } from 'lucide-react';
import { RecipeTemplate } from '@/data/recipeTemplates';

interface RecipeTemplateCardProps {
  recipe: RecipeTemplate;
  onPreview: (recipe: RecipeTemplate) => void;
  onAddToCollection: (recipe: RecipeTemplate) => void;
  isAdded?: boolean;
}

export const RecipeTemplateCard = ({
  recipe,
  onPreview,
  onAddToCollection,
  isAdded = false,
}: RecipeTemplateCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-3xl sm:text-4xl flex-shrink-0">{recipe.icon}</span>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg line-clamp-1">{recipe.name}</CardTitle>
              <CardDescription className="text-xs sm:text-sm line-clamp-2 mt-1">
                {recipe.description}
              </CardDescription>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Badge variant="secondary" className="text-xs">
            {recipe.category}
          </Badge>
          <Badge
            variant={recipe.difficulty === 'Mudah' ? 'default' : 'outline'}
            className="text-xs"
          >
            {recipe.difficulty}
          </Badge>
          {isAdded && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              ✓ Sudah Ditambahkan
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{recipe.prep_time + recipe.cook_time} mnt</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{recipe.servings} porsi</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(recipe)}
            className="flex-1 text-xs sm:text-sm"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Lihat Detail
          </Button>
          <Button
            size="sm"
            onClick={() => onAddToCollection(recipe)}
            disabled={isAdded}
            className="flex-1 text-xs sm:text-sm"
          >
            {isAdded ? '✓ Ditambahkan' : 'Tambah'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
