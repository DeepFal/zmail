import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import HeaderMailbox from './HeaderMailbox';
import { getEmailDomains, getDefaultEmailDomain, EMAIL_DOMAINS, DEFAULT_EMAIL_DOMAIN } from '../config';
import ThemeSwitcher from './ThemeSwitcher';

interface HeaderProps {
  mailbox: Mailbox | null;
  onMailboxChange?: (mailbox: Mailbox) => void;
  isLoading?: boolean;
  onShowInfo?: (type: 'privacy' | 'terms' | 'about') => void;
}

const Header: React.FC<HeaderProps> = ({ 
  mailbox = null, 
  onMailboxChange = () => {}, 
  isLoading = false,
  onShowInfo = () => {}
}) => {
  const { t } = useTranslation();
  const [emailDomains, setEmailDomains] = useState<string[]>(EMAIL_DOMAINS);
  const [defaultDomain, setDefaultDomain] = useState<string>(DEFAULT_EMAIL_DOMAIN);
  
  // 异步获取邮箱域名配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const domains = await getEmailDomains();
        const defaultDom = await getDefaultEmailDomain();
        setEmailDomains(domains);
        setDefaultDomain(defaultDom);
      } catch (error) {
        console.error('加载邮箱域名配置失败:', error);
      }
    };
    
    loadConfig();
  }, []);
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/20">
                <i className="fas fa-paper-plane text-primary-foreground text-sm"></i>
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                {t('app.title')}
              </span>
            </Link>
          </div>
          
          {/* Actions Section */}
          {mailbox && (
            <div className="flex items-center gap-3 md:gap-4">
              {/* Mailbox Controller */}
              <div className="hidden md:block">
                 <HeaderMailbox 
                  mailbox={mailbox} 
                  onMailboxChange={onMailboxChange}
                  domain={defaultDomain}
                  domains={emailDomains}
                  isLoading={isLoading}
                />
              </div>

              {/* Mobile Mailbox Placeholder (simplified) */}
              <div className="md:hidden">
                 {/* Mobile version logic can be handled inside HeaderMailbox or here, for now keeping it hidden on very small screens or relying on HeaderMailbox responsiveness */}
                 <HeaderMailbox 
                  mailbox={mailbox} 
                  onMailboxChange={onMailboxChange}
                  domain={defaultDomain}
                  domains={emailDomains}
                  isLoading={isLoading}
                />
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block"></div>

              {/* Toolbar */}
              <div className="flex items-center gap-1.5">
                <ThemeSwitcher />
                <LanguageSwitcher />
                <a
                  href="https://github.com/DeepFal/zmail"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                  aria-label="GitHub"
                  title="GitHub"
                >
                  <i className="fab fa-github text-lg"></i>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
