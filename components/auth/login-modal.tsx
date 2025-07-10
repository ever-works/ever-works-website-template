"use client";

import {
    Modal,
    ModalContent,
    ModalBody
} from "@heroui/react";
import { CredentialsForm } from "@/app/[locale]/auth/components/credentials-form";
import { SocialLogin } from "@/app/[locale]/auth/components/social-login";
import { Building, Search, Shield } from "lucide-react";
import { useConfig } from "@/app/[locale]/config";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import Image from "next/image";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.4,
      ease: "easeOut"
    }
  })
};

export function LoginModal({
  isOpen,
  onClose,
  message = "Welcome back",
}: LoginModalProps) {
  const config = useConfig();
  const { currentTheme } = useTheme();
  const isDark = currentTheme.background === "#000000" || currentTheme.text === "#ffffff";
  
  const features = [
    {
      icon: Search,
      title: "Smart Search",
      description: "Advanced filters for precise results"
    },
    {
      icon: Building,
      title: "Business Growth",
      description: "Reach your target audience effectively"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade data protection"
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      classNames={{
        backdrop: "bg-black/60 backdrop-blur-md",
        base: cn(
          "bg-gradient-to-br from-white to-gray-50",
          "dark:from-gray-900 dark:to-gray-950",
          "rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50",
          "dark:bg-opacity-95 dark:backdrop-blur-xl",
          "max-w-[900px] mx-auto",
          "overflow-hidden"
        ),
        body: "p-0",
      }}
    >
      <ModalContent>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05] pointer-events-none" />
          
          <ModalBody>
            <div className="flex flex-col md:flex-row">
              {/* Left Side - Features */}
              <div className={cn(
                "w-full md:w-[45%] p-6 flex flex-col justify-center relative",
                "bg-gradient-to-br from-gray-50 to-white",
                "dark:from-gray-900 dark:via-gray-900 dark:to-gray-950"
              )}>
                <div className="relative z-10">
                  <div className="mb-6">
                    {/* Logo */}
                    <div className="flex items-center mb-6 space-x-2">
                      <Image 
                        src={isDark ? "/logo-dark.png" : "/logo-light.png"}
                        alt={config.company_name || "Logo"}
                        width={100}
                        height={100}
                        className="h-7 w-auto"
                      />
                    </div>

                    {/* Title */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <h2 className={cn(
                        "text-2xl font-bold mb-3",
                        "bg-gradient-to-r from-gray-900 to-gray-700",
                        "dark:from-white dark:to-gray-300",
                        "bg-clip-text text-transparent"
                      )}>
                        Discover & Connect
                      </h2>

                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-8">
                        Join our network of professionals and unlock new opportunities.
                      </p>
                    </motion.div>

                    {/* Features List */}
                    <div className="space-y-4">
                      {features.map((feature, index) => (
                        <motion.div
                          key={feature.title}
                          custom={index}
                          initial="hidden"
                          animate="visible"
                          variants={listItemVariants}
                          className="flex items-start group"
                        >
                          <div className={cn(
                            "p-2 rounded-lg mr-3 transition-all duration-300 transform group-hover:scale-110",
                            "bg-gradient-to-br from-primary-50 to-primary-100/50",
                            "dark:from-primary-900/20 dark:to-primary-800/10",
                            "group-hover:from-primary-100 group-hover:to-primary-50",
                            "dark:group-hover:from-primary-800/30 dark:group-hover:to-primary-900/20",
                            "ring-1 ring-primary-100 dark:ring-primary-800/20"
                          )}>
                            <feature.icon className={cn(
                              "h-4 w-4",
                              "text-primary-600 dark:text-primary-400",
                              "group-hover:text-primary-700 dark:group-hover:text-primary-300"
                            )} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {feature.title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Decorative gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-950 to-transparent pointer-events-none" />
              </div>

              {/* Right Side - Auth Form */}
              <div className="w-full md:w-[55%] p-6 flex items-center justify-center relative bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm">
                <div className="w-full max-w-sm">
                  <div className="text-center mb-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {message}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      Enter your credentials to continue
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
                    <CredentialsForm type="login">
                      <div className="space-y-3">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-800" />
                          </div>
                        </div>
                        <SocialLogin />
                      </div>
                    </CredentialsForm>
                  </div>

                  <p className="text-center text-[11px] text-gray-500 dark:text-gray-400 mt-4">
                    By signing in, you agree to our{" "}
                    <a href="#" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 hover:underline">
                      Terms
                    </a>{" "}
                    &{" "}
                    <a href="#" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 hover:underline">
                      Privacy
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </ModalBody>
        </motion.div>
      </ModalContent>
    </Modal>
  );
}
