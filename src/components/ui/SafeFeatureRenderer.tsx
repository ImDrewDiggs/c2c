import React from 'react';
import { Check } from 'lucide-react';
import { sanitizeInput } from '@/utils/securityManager';

interface SafeFeatureRendererProps {
  features: string[];
  className?: string;
}

/**
 * SafeFeatureRenderer - Secure component to render feature lists
 * 
 * This component replaces dangerouslySetInnerHTML with safe text rendering
 * to prevent XSS vulnerabilities while maintaining functionality.
 */
export function SafeFeatureRenderer({ features, className = "" }: SafeFeatureRendererProps) {
  return (
    <ul className={`list-none space-y-1 ${className}`}>
      {features.map((feature, index) => {
        // Sanitize input to prevent XSS
        const sanitizedFeature = sanitizeInput(feature);
        
        return (
          <li key={index} className="flex items-start gap-2">
            <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm">{sanitizedFeature}</span>
          </li>
        );
      })}
    </ul>
  );
}