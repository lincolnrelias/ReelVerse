'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, BarChart3, Clock, Zap, Target, Repeat, Play, TrendingUp, ChevronRight } from 'lucide-react';
import { UrlInput } from '@/components/url-input';
import { createAnalysis } from '@/lib/api';
import { motion, Variants } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();

  async function handleSubmit(videoUrl: string, cachedAnalysisId?: string) {
    if (cachedAnalysisId) {
      router.push(`/analysis/${cachedAnalysisId}`);
      return;
    }
    const { id } = await createAnalysis({ videoUrl });
    router.push(`/analysis/${id}`);
  }

  const FADE_UP: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } },
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-60 pointer-events-none" />
      <div className="absolute inset-0 noise" />
      
      {/* Navbar Placeholder */}
      <nav className="relative z-20 border-b border-white/[0.04] bg-background/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-display font-bold text-text-primary">ReelVerse</span>
            <span className="tag tag-primary text-[10px]">{t.common.beta}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-16 px-5 sm:pt-24 sm:pb-24">
        <motion.div 
          initial="hidden" animate="show" 
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } }
          }}
          className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8"
        >
          <motion.div variants={FADE_UP}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-text-secondary mb-2 sm:mb-4 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>{t.home.pill}</span>
            </div>
          </motion.div>
          
          <motion.h1 variants={FADE_UP} className="text-5xl sm:text-7xl font-display font-bold text-text-primary tracking-tight leading-[1.05]">
            {t.home.titleLine1} <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-neon">
              {t.home.titleLine2}
            </span>
          </motion.h1>
          
          <motion.p variants={FADE_UP} className="text-base sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed px-2">
            {t.home.subtitle}
          </motion.p>

          <motion.div variants={FADE_UP} className="max-w-2xl mx-auto mt-8 sm:mt-10 p-2 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-2xl relative">
            {/* Soft glow behind input */}
            <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-2xl -z-10" />
            <UrlInput onSubmit={handleSubmit} />
            <div className="p-2 sm:p-3 flex flex-wrap items-center justify-center gap-2 mt-1">
              <span className="text-[10px] sm:text-xs text-text-secondary/60">
                {t.home.urlInputHint}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Visual Analytics / Bento Grid Section */}
      <section className="relative z-10 py-16 sm:py-24 bg-surface/80 border-t border-white/[0.04]">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-transparent opacity-50" />
        
        <div className="max-w-6xl mx-auto px-5 relative z-10">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-text-primary mb-4">{t.home.bentoTitle}</h2>
            <p className="text-text-secondary max-w-xl mx-auto text-sm sm:text-base">{t.home.bentoSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:auto-rows-[260px]">
            <div className="lg:col-span-2 rounded-3xl bg-white/[0.02] border border-white/[0.06] p-6 sm:p-8 relative overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-auto border border-primary/20">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div className="mt-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">{t.home.bento1Title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed max-w-md">{t.home.bento1Desc}</p>
                </div>
              </div>
            </div>

            {/* Bento Box 2 */}
            <div className="rounded-3xl bg-white/[0.02] border border-white/[0.06] p-6 sm:p-8 relative overflow-hidden group hover:border-neon/30 transition-colors">
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-neon/10 flex items-center justify-center mb-auto border border-neon/20">
                  <Target className="w-6 h-6 text-neon" />
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-text-primary mb-2">{t.home.bento2Title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{t.home.bento2Desc}</p>
                </div>
              </div>
            </div>

            {/* Bento Box 3 */}
            <div className="rounded-3xl bg-white/[0.02] border border-white/[0.06] p-6 sm:p-8 relative overflow-hidden group hover:border-accent/30 transition-colors">
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-auto border border-accent/20">
                  <Repeat className="w-6 h-6 text-accent" />
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-text-primary mb-2">{t.home.bento3Title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{t.home.bento3Desc}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-3xl bg-white/[0.02] border border-white/[0.06] p-6 sm:p-8 relative overflow-hidden group hover:border-warning/30 transition-colors">
              <div className="absolute bottom-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Play className="w-32 h-32 text-warning" />
              </div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex gap-3 mb-auto">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center border border-warning/20">
                    <Zap className="w-5 h-5 text-warning" />
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary-light/10 flex items-center justify-center border border-primary-light/20">
                    <Clock className="w-5 h-5 text-primary-light" />
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">{t.home.bento4Title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed max-w-md">{t.home.bento4Desc}</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-8 sm:py-12 border-t border-white/[0.04] bg-background">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] sm:text-xs text-text-secondary/60">
            {t.common.rightsReserved}
          </p>
          <div className="flex gap-4 text-[10px] sm:text-xs text-text-secondary/60 font-medium tracking-wide">
            <span className="hover:text-primary transition-colors cursor-pointer uppercase">{t.common.terms}</span>
            <span className="hover:text-primary transition-colors cursor-pointer uppercase">{t.common.privacy}</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
