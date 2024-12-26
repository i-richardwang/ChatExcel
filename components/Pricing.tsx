"use client";

import config from "@/config";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Check, HelpCircle } from "lucide-react";
import { useState } from "react";
import { FaStar } from "react-icons/fa";
import ButtonCheckout from "./ButtonCheckout";
import useWindowSize from "@/lib/hooks/use-window-size";

const Pricing = () => {
  const [isMonthly, setIsMonthly] = useState(true);
  const { isDesktop } = useWindowSize();

  const handleToggle = () => {
    setIsMonthly(!isMonthly);
  };

  return (
    <section className="bg-neutral-100 dark:bg-neutral-900 overflow-hidden" id="pricing">
      <div className="py-8 md:py-16 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col text-center w-full mb-12">
          <p className="text-sm font-semibold tracking-wider text-green-500 mb-4">
            PRICING
          </p>
          <h2 className="font-extrabold text-4xl md:text-5xl tracking-tight mb-6">
            Stop wasting time on repetitive Excel work
          </h2>
          <p className="max-w-xl mx-auto text-lg opacity-90 leading-relaxed mb-8">
            Choose your plan and start automating today
          </p>
          <div className="flex justify-center items-center gap-2">
            <span className="text-sm font-semibold">Monthly</span>
            <Label>
              <Switch checked={!isMonthly} onCheckedChange={handleToggle} />
            </Label>
            <span className="text-sm font-semibold">Yearly</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {config.stripe.plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={
                isDesktop
                  ? {
                      y: 0,
                      opacity: 1,
                      x:
                        index === config.stripe.plans.length - 1
                          ? -30
                          : index === 0
                          ? 30
                          : 0,
                      scale:
                        index === 0 || index === config.stripe.plans.length - 1
                          ? 0.94
                          : 1.0,
                    }
                  : { opacity: 1, y: 0 }
              }
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              className={`relative rounded-2xl border-[1px] p-8 bg-background ${
                plan.isFeatured
                  ? "border-green-500 border-2 shadow-lg"
                  : "border-border"
              }`}
            >
              {plan.isFeatured && (
                <div className="absolute top-0 right-0 bg-green-500 py-1 px-3 rounded-bl-xl rounded-tr-xl">
                  <FaStar className="text-white inline-block mr-1" />
                  <span className="text-white text-sm font-semibold">
                    POPULAR
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline">
                  {plan.priceAnchor && (
                    <span className="text-muted-foreground line-through mr-2">
                      ${isMonthly ? plan.priceAnchor : plan.yearlyPriceAnchor}
                    </span>
                  )}
                  <span className="text-4xl font-bold">
                    ${isMonthly ? plan.price : plan.yearlyPrice}
                  </span>
                  {plan.name !== "Lifetime" && (
                    <span className="text-muted-foreground ml-2">
                      /{isMonthly ? "mo" : "yr"}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-muted-foreground">{feature.name}</span>
                    {'tooltip' in feature && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[200px] text-sm">{feature.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </li>
                ))}
              </ul>

              <ButtonCheckout
                priceId={isMonthly ? plan.priceId : (plan.yearlyPriceId || plan.priceId)}
                mode={plan.name === "Lifetime" ? "payment" : "subscription"}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  plan.isFeatured
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-background border-2 border-green-500 text-foreground hover:bg-green-500 hover:text-white"
                }`}
              >
                {plan.name === "Lifetime" ? "Buy Now" : "Subscribe Now"}
              </ButtonCheckout>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
