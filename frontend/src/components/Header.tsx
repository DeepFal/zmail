import React, { useState, useEffect, useRef } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
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

  // 点击外部关闭移动端菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2">
          {/* Logo Section */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/20 flex-shrink-0">
                <i className="fas fa-paper-plane text-primary-foreground text-xs sm:text-sm"></i>
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 hidden xs:inline-block">
                {t('app.title')}
              </span>
              <span className="text-lg font-bold tracking-tight text-foreground xs:hidden">
                ZMAIL
              </span>
            </Link>
          </div>
          
          {/* Actions Section */}
          {mailbox && (
            <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1 min-w-0">
              {/* Mailbox Controller - Takes available space */}
              <div className="flex-1 min-w-0 max-w-2xl flex justify-end sm:justify-center">
                 <HeaderMailbox 
                  mailbox={mailbox} 
                  onMailboxChange={onMailboxChange}
                  domain={defaultDomain}
                  domains={emailDomains}
                  isLoading={isLoading}
                />
              </div>

              {/* Desktop Toolbar */}
              <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
                <div className="h-6 w-px bg-border/60 mx-1"></div>
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

              {/* Mobile Menu Toggle */}
              <div className="md:hidden relative" ref={mobileMenuRef}>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-xl border border-border/50 bg-popover p-2 shadow-lg shadow-black/5 ring-1 ring-black/5 focus:outline-none animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid gap-1">
                      <div className="flex items-center justify-between px-2 py-1.5 text-sm font-medium text-muted-foreground">
                        <span>{t('settings.title') || '设置'}</span>
                      </div>
                      <div className="h-px bg-border/50 my-1"></div>
                      
                      <div className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-accent">
                        <span className="text-sm">{t('settings.toggleTheme')}</span>
                        <ThemeSwitcher />
                      </div>
                      
                      <div className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-accent">
                        <span className="text-sm">{t('settings.language')}</span>
                        <LanguageSwitcher />
                      </div>
                      
                      <div className="h-px bg-border/50 my-1"></div>
                      
                      <a
                        href="https://github.com/DeepFal/zmail"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <i className="fab fa-github"></i>
                        <span>GitHub</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
