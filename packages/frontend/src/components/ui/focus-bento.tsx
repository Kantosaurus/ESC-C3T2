"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { BentoGrid, BentoGridItem } from "./bento-grid";

type FocusBentoCardType = {
  title: string;
  src: string;
  description?: string;
  className?: string;
};

export const FocusBentoCard = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
  }: {
    card: FocusBentoCardType;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => (
    <BentoGridItem
      className={cn(
        "relative overflow-hidden p-0 border-0 bg-transparent shadow-none",
        card.className
      )}
      header={
        <div
          onMouseEnter={() => setHovered(index)}
          onMouseLeave={() => setHovered(null)}
          className={cn(
            "relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-full w-full transition-all duration-300 ease-out rounded-xl",
            hovered !== null && hovered !== index && "blur-xs scale-[0.98]"
          )}
        >
          <img
            src={card.src}
            alt={card.title}
            className="object-cover absolute inset-0 w-full h-full"
          />
          <div
            className={cn(
              "absolute inset-0 bg-black/50 flex items-end py-8 px-4 transition-opacity duration-300",
              hovered === index ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="text-xl md:text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200">
              {card.title}
            </div>
          </div>
        </div>
      }
    />
  )
);

FocusBentoCard.displayName = "FocusBentoCard";

export function FocusBento({
  cards,
  className,
}: {
  cards: FocusBentoCardType[];
  className?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <BentoGrid className={className}>
      {cards.map((card, index) => (
        <FocusBentoCard
          key={card.title}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </BentoGrid>
  );
}
