import React from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import "./DescriptionHover.css"

interface DescriptionHoverProps {
  description: string;
  children?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  openDelay?: number;
  closeDelay?: number;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  showDefaultIcon?: boolean;
  iconSize?: "sm" | "md" | "lg";
}

export default function DescriptionHover({
  description,
  children,
  side = "top",
  align = "start",
  openDelay = 200,
  closeDelay = 100,
  className = "",
  triggerClassName = "",
  contentClassName = "",
  showDefaultIcon = true,
  iconSize = "md"
}: DescriptionHoverProps) {

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  const iconContainerSizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const defaultTrigger = showDefaultIcon ? (
    <button
      className={`text-gray-400 hover:text-indigo-600 p-1 rounded transition-colors ${triggerClassName}`}
    >
      <Info className={iconSizeClasses[iconSize]} />
    </button>
  ) : null;

  return (
    <div className={className}>
      <HoverCard openDelay={openDelay} closeDelay={closeDelay}>
        <HoverCardTrigger asChild>
          {children || defaultTrigger}
        </HoverCardTrigger>
        <HoverCardContent
          className={`
            hover-card-content ${contentClassName}
          `}
          side={side}
          align={align}
        >
          <div className="space-y-2">
            <div className="flex min-w-0 items-start gap-2">
              {/* Icon: stays fixed size */}
              <div className={`${iconContainerSizeClasses[iconSize]} bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                <Info className={`${iconSizeClasses[iconSize]} text-indigo-600`} />
              </div>

              {/* Text container: flex-1 allows wrapping without forcing single column */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Description</h4>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                  {description || "No description available"}
                </div>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}

