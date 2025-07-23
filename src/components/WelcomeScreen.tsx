import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "./AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Brain, Sparkles, Zap, Target, MessageSquare, Smile, Code2, SearchCheck, Languages, Edit3, Settings, Rocket, LogIn, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const [showWelcomeBetaBanner, setShowWelcomeBetaBanner] = useState(false);

  // Check if current language is BETA and show banner once per session
  useEffect(() => {
    const betaLanguages = ['ru', 'es', 'de', 'fr', 'zh', 'ar', 'ja', 'he'];
    const isCurrentLanguageBeta = betaLanguages.includes(i18n.language);
    const hasShownWelcomeBanner = sessionStorage.getItem('welcomeBetaBannerShown');
    
    console.log('Welcome banner check:', { isCurrentLanguageBeta, hasShownWelcomeBanner, language: i18n.language });
    
    if (isCurrentLanguageBeta && !hasShownWelcomeBanner) {
      setShowWelcomeBetaBanner(true);
      sessionStorage.setItem('welcomeBetaBannerShown', 'true');
      console.log('Setting welcome banner to true');
    }
  }, [i18n.language]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-primary rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-secondary rounded-full blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-gradient-accent rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Auth Navigation */}
      <div className="absolute top-4 right-4 z-50">
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/auth">
                <LogIn className="w-4 h-4 mr-2" />
                {t('login')}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* BETA Language Banner */}
      {showWelcomeBetaBanner && (
        <div className="relative z-40 border-b border-border bg-amber-50 dark:bg-amber-950/20">
          <div className="container max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200 flex-1">
                {t('beta_version_notice')}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWelcomeBetaBanner(false)}
                className="text-amber-600 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-100 p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="relative container max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-gradient-primary shadow-glow-primary">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PromptSensei
            </h1>
          </div>
          
          <h2 className="text-2xl md:text-3xl text-foreground mb-6 font-semibold">
            {t('welcome')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
            {t('subtitle')}
          </p>

          <Button 
            onClick={onStart}
            size="lg"
            className="bg-gradient-primary hover:shadow-glow-primary text-primary-foreground px-10 py-6 text-xl font-semibold transition-all duration-300 hover:scale-105 rounded-2xl"
          >
            <MessageSquare className="w-6 h-6 mr-3" />
            {t('get_started')}
          </Button>
          <div className="flex flex-col items-center gap-2 mt-4">
            <p className="text-sm text-muted-foreground">
              {t('no_signup_required')}
            </p>
            {!user && (
              <p className="text-xs text-muted-foreground">
                <Link to="/auth" className="text-primary hover:underline">
                  {t('sign_up_pro')}
                </Link>
                • {t('save_prompts')}
              </p>
            )}
          </div>
        </div>

        {/* Feature Clusters */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {/* Cluster 1: Smart Results */}
          <Card className="border-border/50 bg-card/30 backdrop-blur-sm hover:shadow-glow-secondary transition-all duration-300 rounded-2xl p-6">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto p-3 rounded-xl bg-gradient-primary w-fit mb-4">
                <Target className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">{t('smart_results')}</CardTitle>
              <p className="text-muted-foreground">{t('smart_results_desc')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{t('smart_optimization')}</p>
                  <p className="text-muted-foreground text-xs">{t('smart_optimization_desc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{t('instant_results')}</p>
                  <p className="text-muted-foreground text-xs">{t('instant_results_desc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{t('tailored_output')}</p>
                  <p className="text-muted-foreground text-xs">{t('tailored_output_desc')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cluster 2: Personalized for You */}
          <Card className="border-border/50 bg-card/30 backdrop-blur-sm hover:shadow-glow-secondary transition-all duration-300 rounded-2xl p-6">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto p-3 rounded-xl bg-gradient-secondary w-fit mb-4">
                <Smile className="w-8 h-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">{t('personalized_for_you')}</CardTitle>
              <p className="text-muted-foreground">{t('personalized_desc')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Smile className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{t('beginner_friendly')}</p>
                  <p className="text-muted-foreground text-xs">{t('beginner_friendly_desc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Code2 className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{t('code_ready_prompts')}</p>
                  <p className="text-muted-foreground text-xs">{t('code_ready_desc')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cluster 3: Global & Pro */}
          <Card className="border-border/50 bg-card/30 backdrop-blur-sm hover:shadow-glow-secondary transition-all duration-300 rounded-2xl p-6">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto p-3 rounded-xl bg-gradient-accent w-fit mb-4">
                <SearchCheck className="w-8 h-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">{t('global_and_pro')}</CardTitle>
              <p className="text-muted-foreground">{t('global_pro_desc')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <SearchCheck className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{t('deep_insight_mode')}</p>
                  <p className="text-muted-foreground text-xs">{t('deep_insight_desc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Languages className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{t('multilingual_friendly')}</p>
                  <p className="text-muted-foreground text-xs">{t('multilingual_desc')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="text-center mb-20">
          <h3 className="text-3xl font-bold mb-4">{t('how_it_works')}</h3>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t('how_it_works_desc')}
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 shadow-glow-primary">
                <Edit3 className="w-8 h-8 text-primary-foreground" />
              </div>
              <h4 className="text-xl font-semibold mb-3">{t('enter_your_idea')}</h4>
              <p className="text-muted-foreground">
                {t('enter_idea_desc')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-secondary flex items-center justify-center mb-6 shadow-glow-secondary">
                <Settings className="w-8 h-8 text-accent-foreground" />
              </div>
              <h4 className="text-xl font-semibold mb-3">{t('answer_quick_questions')}</h4>
              <p className="text-muted-foreground">
                {t('answer_questions_desc')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center mb-6 shadow-glow-accent">
                <Rocket className="w-8 h-8 text-accent-foreground" />
              </div>
              <h4 className="text-xl font-semibold mb-3">{t('get_optimized_prompt')}</h4>
              <p className="text-muted-foreground">
                {t('get_prompt_desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm border border-border/50 rounded-3xl p-12">
            <h3 className="text-3xl font-bold mb-4">{t('ready_to_master')}</h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('join_thousands')}
            </p>
            <Button 
              onClick={onStart}
              size="lg"
              className="bg-gradient-primary hover:shadow-glow-primary text-primary-foreground px-10 py-6 text-xl font-semibold transition-all duration-300 hover:scale-105 rounded-2xl"
            >
              <MessageSquare className="w-6 h-6 mr-3" />
              {t('start_your_journey')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}