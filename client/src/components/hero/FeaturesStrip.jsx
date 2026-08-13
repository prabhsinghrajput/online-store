import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';

const FeaturesStrip = () => {
  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      desc: "On orders above ₹2499"
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      desc: "14 days return policy"
    },
    {
      icon: ShieldCheck,
      title: "Premium Quality",
      desc: "Built to last. Made to move."
    },
    {
      icon: Headphones,
      title: "Customer Support",
      desc: "We're here for you, always."
    }
  ];

  return (
    <div className="hidden md:block border-t border-b border-gray-200 dark:border-neutral-900/60 py-14 my-8 px-12 bg-transparent">
      <div className="grid grid-cols-4 divide-x divide-gray-200 dark:divide-neutral-900/60 max-w-6xl mx-auto">
        {features.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center px-1 sm:px-6 justify-center">
            <item.icon className="w-5 h-5 sm:w-8 sm:h-8 text-gray-900 dark:text-white stroke-[1] mb-2 sm:mb-4" />
            <h4 className="text-[8px] sm:text-xs font-black tracking-[0.1em] sm:tracking-[0.2em] uppercase text-gray-900 dark:text-white mb-1 sm:mb-2">
              {item.title}
            </h4>
            <p className="text-[7px] sm:text-xs text-gray-500 dark:text-neutral-400 font-semibold leading-normal sm:leading-relaxed max-w-[85px] sm:max-w-[160px] mx-auto">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesStrip;
