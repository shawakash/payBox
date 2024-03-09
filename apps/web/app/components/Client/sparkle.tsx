"use client";
import { SparklesCore } from "@/components/ui/sparklecore";
import React from "react";

interface SparklesProps {
  classname: string;
  background: string;
  minSize: number;
  maxSize: number;
  body: string;
  particleColor?: string | "#FFFFFF";
}

const Sparkles = ({
  classname,
  background,
  minSize,
  maxSize,
  particleColor,
  body,
}: SparklesProps) => {
  return (
    <div className="h-[40rem] w-full flex flex-col items-center justify-center overflow-hidden rounded-md">
      <h1 className="md:text-7xl text-3xl lg:text-9xl font-bold text-center text-white relative z-20">
        {body}
      </h1>
      <div className="w-[40rem] h-40 relative">
        {/* Gradients */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />
 
        {/* Core component */}
        <SparklesCore
          background={background}
          minSize={minSize}
          maxSize={maxSize}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
 
        <div className="absolute inset-0 w-full h-full bg-[04080F] [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
      </div>
    </div>
  );
};

export default Sparkles;
