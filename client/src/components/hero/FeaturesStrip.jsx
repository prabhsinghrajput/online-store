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
      desc: "Built to last. Always."
    },
    {
      icon: Headphones,
      title: "Customer Support",
      desc: "We're here for you."
    }
  ];

  return (
    <div className="border-t border-b border-gray-150 dark:border-neutral-900 py-14 md:py-16 my-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-150 dark:divide-neutral-900">
        {features.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 px-4 md:px-6 justify-center md:first:pl-0 md:last:pr-0 pt-6 md:pt-0 first:pt-0">
            <item.icon className="w-9 h-9 sm:w-10 sm:h-10 text-gray-700 dark:text-gray-300 stroke-[1.15]" />
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-black tracking-wider uppercase text-gray-900 dark:text-white">
                {item.title}
              </h4>
              <p className="text-[11px] sm:text-xs text-gray-400 font-semibold leading-tight">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesStrip;
