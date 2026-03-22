
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  featuredSize?: 'normal' | 'large';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, featuredSize = 'normal' }) => {
  const { 
    id, 
    name, 
    hourlyRate, 
    image, 
    category, 
    skills = [], 
    rating, 
    availability,
    featured,
    online,
    lastActive,
    location
  } = product;

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get displayed skills (limit to 3)
  const displayedSkills = skills.slice(0, 3);
  const hasMoreSkills = skills.length > 3;

  return (
    <Card className={`overflow-hidden transition-shadow hover:shadow-md ${featured ? 'border-primary/50 bg-primary/5' : ''}`}>
      <Link to={`/developer-profiles/${id}`} className="block">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className={`border-2 border-background ${featuredSize === 'large' ? 'h-16 w-16' : 'h-12 w-12'}`}>
              <AvatarImage src={image} alt={name} />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-lg leading-none line-clamp-1">{name}</h3>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-sm">{rating}</span>
                </div>
              </div>
              
              <p className="text-muted-foreground">{category}</p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {displayedSkills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="px-1.5 py-0 text-xs">{skill}</Badge>
                ))}
                {hasMoreSkills && <Badge variant="outline" className="px-1.5 py-0 text-xs">+{skills.length - 3}</Badge>}
              </div>
            </div>
          </div>
        </div>
        
        <CardFooter className="flex justify-between bg-muted/50 px-6 py-3">
          <div className="flex items-center text-sm">
            <MapPin className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
            <span>{location || 'Global'}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {online && (
              <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-500 border-green-500/20 text-xs">
                Online
              </Badge>
            )}
            <div className="text-lg font-medium">${hourlyRate}/hr</div>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default ProductCard;
