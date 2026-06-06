import React from 'react';
import { UtensilsCrossed, Car, ShoppingBag, Film, Zap, Home, Heart, GraduationCap, Plane, CreditCard, MoreHorizontal } from 'lucide-react';

export const CategoryIcon = ({ slug, size = 24, className = "" }) => {
  const normalizedSlug = slug?.toLowerCase() || 'other';
  switch (normalizedSlug) {
    case 'food':
    case 'food & drinks':
      return <UtensilsCrossed size={size} className={className} />;
    case 'transport':
      return <Car size={size} className={className} />;
    case 'shopping':
      return <ShoppingBag size={size} className={className} />;
    case 'entertainment':
      return <Film size={size} className={className} />;
    case 'bills':
    case 'bills & utilities':
      return <Zap size={size} className={className} />;
    case 'rent':
      return <Home size={size} className={className} />;
    case 'health':
      return <Heart size={size} className={className} />;
    case 'education':
      return <GraduationCap size={size} className={className} />;
    case 'travel':
      return <Plane size={size} className={className} />;
    case 'subscriptions':
      return <CreditCard size={size} className={className} />;
    default:
      return <MoreHorizontal size={size} className={className} />;
  }
};
