
import React from "react";

interface HomeHeaderProps {
  title: string;
  description?: string;
}

export function HomeHeader({ title, description }: HomeHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      {description && (
        <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
