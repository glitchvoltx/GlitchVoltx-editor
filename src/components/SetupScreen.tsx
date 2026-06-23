import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, Wand2, GraduationCap, ArrowRight, Check, Play } from "lucide-react";
import { useTranslation } from "../i18n/TranslationContext";

export function SetupScreen({ onComplete }: { onComplete: () => void }) {
  const { language, setLanguage, t, isRtl } = useTranslation();
  const [step, setStep] = useState(0);
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);

  const steps = [
    { id: "welcome", title: "Welcome to GlitchVoltx" },
    { id: "language", title: "Choose Language" },
    { id: "experience", title: "Your Experience" },
    { id: "tutorial", title: "Tutorial" },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else onComplete();
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 }
    },
    exit: { opacity: 0, scale: 1.05, filter: "blur(10px)", transition: { duration: 0.4 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md px-4" dir={isRtl ? "rtl" : "ltr"}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
        >
          {/* Background decorative elements */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Stepper progress */}
          <div className="flex gap-2 mb-8 relative z-10" dir="ltr">
            {steps.map((s, i) => (
              <div 
                key={s.id} 
                className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-blue-500" : "bg-gray-200 dark:bg-white/10"}`}
              />
            ))}
          </div>

          <div className="relative z-10 min-h-[220px]">
            {step === 0 && (
              <motion.div variants={itemVariants} className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-6">
                  <Wand2 size={32} />
                </div>
                <h1 className="text-3xl font-bold dark:text-white mb-2">{t("welcomeTitle")}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t("welcomeDesc")}</p>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="text-blue-500" size={24} />
                  <h2 className="text-2xl font-bold dark:text-white">{t("chooseLanguage")}</h2>
                </div>
                <div className="grid gap-3">
                  {(["English", "Español", "Français", "日本語", "العربية"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { setLanguage(lang); setTimeout(handleNext, 300); }}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        language === lang 
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 dark:text-white" 
                          : "border-gray-200 dark:border-white/10 dark:text-gray-300 hover:border-blue-300 dark:hover:bg-white/5"
                      }`}
                    >
                      <span className="font-medium">{lang}</span>
                      {language === lang && <Check size={18} className="text-blue-500" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <Wand2 className="text-purple-500" size={24} />
                  <h2 className="text-2xl font-bold dark:text-white">{t("yourExperience")}</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t("firstTimePrompt")}</p>
                <div className="grid gap-3">
                  <button
                    onClick={() => { setIsFirstTime(true); setTimeout(handleNext, 300); }}
                    className={`flex flex-col items-center p-5 rounded-xl border transition-all ${
                      isFirstTime === true
                        ? "border-purple-500 bg-purple-50/50 dark:bg-purple-500/10 dark:text-white" 
                        : "border-gray-200 dark:border-white/10 dark:text-gray-300 hover:border-purple-300 dark:hover:bg-white/5"
                    }`}
                  >
                    <span className="font-bold text-lg mb-1">{t("yesNew")}</span>
                    <span className="text-xs opacity-70">{t("newHint")}</span>
                  </button>
                  <button
                    onClick={() => { setIsFirstTime(false); setTimeout(handleNext, 300); }}
                    className={`flex flex-col items-center p-5 rounded-xl border transition-all ${
                      isFirstTime === false
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 dark:text-white" 
                        : "border-gray-200 dark:border-white/10 dark:text-gray-300 hover:border-blue-300 dark:hover:bg-white/5"
                    }`}
                  >
                    <span className="font-bold text-lg mb-1">{t("noPro")}</span>
                    <span className="text-xs opacity-70">{t("proHint")}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div variants={itemVariants} className="space-y-4 text-center">
                <div className="mx-auto w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <GraduationCap size={32} />
                </div>
                <h2 className="text-2xl font-bold dark:text-white mb-2">{t("readyMaster")}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  {isFirstTime 
                    ? t("newPitch") 
                    : t("proPitch")}
                </p>
                <div className="flex flex-col gap-3 mt-4">
                  <button
                    onClick={onComplete}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    <Play size={18} fill="currentColor" /> {t("letsGo")}
                  </button>
                  <button
                    onClick={onComplete}
                    className="w-full py-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-sm font-medium transition-colors"
                  >
                    {t("watchTutorial")}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {step === 0 && (
            <motion.div variants={itemVariants} className="mt-8">
              <button
                onClick={handleNext}
                className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                {t("getStarted")} <ArrowRight size={18} className={isRtl ? "rotate-180" : ""} />
              </button>
            </motion.div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}

