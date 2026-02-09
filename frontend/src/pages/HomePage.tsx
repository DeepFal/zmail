import React, { useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import EmailList from '../components/EmailList';
import ScrollReveal from '../components/ScrollReveal';
import { MailboxContext } from '../contexts/MailboxContext';

// 添加结构化数据组件
const StructuredData: React.FC = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ZMAIL-24小时匿名邮箱",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "CNY"
    },
    "description": "创建临时邮箱地址，接收邮件，无需注册，保护您的隐私安全",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1024"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { 
    mailbox, 
    isLoading, 
    emails, 
    selectedEmail, 
    setSelectedEmail, 
    isEmailsLoading
  } = useContext(MailboxContext);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary/80"></div>
          <p className="text-muted-foreground text-sm animate-pulse">Initializing Secure Mailbox...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 pb-20">
      <StructuredData />
      
      {/* Email List Section - Fixed height for app-like feel */}
      <section className="h-[65vh] min-h-[500px]">
        <EmailList 
          emails={emails} 
          selectedEmailId={selectedEmail}
          onSelectEmail={setSelectedEmail}
          isLoading={isEmailsLoading}
        />
      </section>

      {/* Content Sections Divider */}
      <ScrollReveal>
        <div className="relative py-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-50 dark:bg-neutral-950 px-4 text-muted-foreground font-medium tracking-widest">
              Why ZMAIL?
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* Features Grid */}
      <ScrollReveal delay={100}>
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-3">{t('intro.features.title')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the next generation of temporary email services.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-all hover:-translate-y-1 duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <i className="fas fa-shield-alt text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('intro.features.privacy.title')}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t('intro.features.privacy.description')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-all hover:-translate-y-1 duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <i className="fas fa-clock text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('intro.features.temporary.title')}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t('intro.features.temporary.description')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-all hover:-translate-y-1 duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <i className="fas fa-user-secret text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('intro.features.anonymous.title')}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t('intro.features.anonymous.description')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-all hover:-translate-y-1 duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <i className="fas fa-bolt text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('intro.features.instant.title')}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t('intro.features.instant.description')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Use Cases */}
      <ScrollReveal delay={200}>
        <section className="bg-card/50 rounded-3xl p-8 border border-border/40">
          <h2 className="text-2xl font-bold mb-8 text-center">{t('intro.useCases.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
               <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-check-circle text-2xl text-primary"></i>
               </div>
               <h3 className="font-semibold mb-2">{t('intro.useCases.verification.title')}</h3>
               <p className="text-sm text-muted-foreground px-4">{t('intro.useCases.verification.description')}</p>
             </div>
            <div className="text-center group">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-download text-2xl text-primary"></i>
              </div>
              <h3 className="font-semibold mb-2">{t('intro.useCases.downloads.title')}</h3>
              <p className="text-sm text-muted-foreground px-4">{t('intro.useCases.downloads.description')}</p>
            </div>
            <div className="text-center group">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-vial text-2xl text-primary"></i>
              </div>
              <h3 className="font-semibold mb-2">{t('intro.useCases.testing.title')}</h3>
              <p className="text-sm text-muted-foreground px-4">{t('intro.useCases.testing.description')}</p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Security Warning */}
      <ScrollReveal delay={100}>
        <section>
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-6 transition-transform hover:scale-[1.01] duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-amber-800 dark:text-amber-500">
               <i className="fas fa-shield-virus"></i>
               {t('intro.security.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-100/50 dark:bg-amber-900/10">
                <i className="fas fa-exclamation-triangle text-amber-600 mt-0.5"></i>
                <p className="text-sm text-amber-900/80 dark:text-amber-200/80">{t('intro.security.warning1')}</p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-100/50 dark:bg-amber-900/10">
                <i className="fas fa-info-circle text-amber-600 mt-0.5"></i>
                <p className="text-sm text-amber-900/80 dark:text-amber-200/80">{t('intro.security.warning2')}</p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-100/50 dark:bg-amber-900/10">
                <i className="fas fa-trash-alt text-amber-600 mt-0.5"></i>
                <p className="text-sm text-amber-900/80 dark:text-amber-200/80">{t('intro.security.warning3')}</p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* FAQ */}
      <ScrollReveal delay={200}>
        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/40 bg-muted/20">
            <h2 className="text-xl font-bold">{t('intro.faq.title')}</h2>
          </div>
          <div className="divide-y divide-border/40">
            <div className="p-6 hover:bg-muted/30 transition-colors">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">Q</span>
                {t('intro.faq.q1.question')}
              </h3>
              <p className="text-sm text-muted-foreground ml-8">{t('intro.faq.q1.answer')}</p>
            </div>
            <div className="p-6 hover:bg-muted/30 transition-colors">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                 <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">Q</span>
                 {t('intro.faq.q2.question')}
              </h3>
              <p className="text-sm text-muted-foreground ml-8">{t('intro.faq.q2.answer')}</p>
            </div>
            <div className="p-6 hover:bg-muted/30 transition-colors">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                 <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">Q</span>
                 {t('intro.faq.q3.question')}
              </h3>
              <p className="text-sm text-muted-foreground ml-8">{t('intro.faq.q3.answer')}</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
};

export default HomePage;