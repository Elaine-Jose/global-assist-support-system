'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FooterInfo } from '@/components/FooterInfo';
import { LanguageSelectionLayer } from '@/components/wizard/LanguageSelectionLayer';
import { CategorySelectionLayer } from '@/components/wizard/CategorySelectionLayer';
import { QuestionListLayer } from '@/components/wizard/QuestionListLayer';
import { AnswerView } from '@/components/wizard/AnswerView';
import { VoiceChatInput } from '@/components/VoiceChatInput';
import { getCategories, getQuestionsByCategory, Category, FAQItem, queryKnowledgeBase, FAQ_DB } from '@/lib/ai/knowledgeBase';
import { translateText, LANGUAGE_MAP } from '@/lib/ai/translation';

type WizardStep = 'language' | 'category' | 'question' | 'answer';

export default function Home() {
  const [step, setStep] = useState<WizardStep>('language');
  const [language, setLanguage] = useState('en');
  const [category, setCategory] = useState<Category | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedQuestionItem, setSelectedQuestionItem] = useState<FAQItem | null>(null);

  // Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<FAQItem[]>([]);
  const [isProcessingGlobalQuery, setIsProcessingGlobalQuery] = useState(false);

  useEffect(() => {
    // Load initial categories
    getCategories().then(setCategories);
  }, []);

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    setStep('category');
  };

  const handleCategorySelect = async (cat: Category) => {
    setCategory(cat);
    const qs = await getQuestionsByCategory(cat);
    setQuestions(qs);
    setStep('question');
  };

  const handleQuestionSelect = async (qId: string) => {
    setSelectedQuestionId(qId);
    const qItem = questions.find(q => q.id === qId);
    if (qItem) {
      setSelectedQuestionItem(qItem);
      setStep('answer');
    }
  };

  const handleBack = () => {
    if (step === 'category') setStep('language');
    if (step === 'question') setStep('category');
    if (step === 'answer') setStep('question');
  };

  const handleHome = () => {
    setStep('language');
    setLanguage('en');
    setCategory(null);
    setSelectedQuestionId(null);
    setSelectedQuestionItem(null);
  };

  const handleGlobalQuery = async (query: string) => {
    if (!query.trim()) return;
    setIsProcessingGlobalQuery(true);

    try {
      const targetLang = LANGUAGE_MAP[language] || 'eng_Latn';

      // 1. Translate query to English
      const englishQuery = await translateText(query, targetLang, 'eng_Latn');

      // 2. Query Knowledge Base
      const qLower = englishQuery.toLowerCase();
      const dbMatch = FAQ_DB.find(item =>
        item.question.toLowerCase().includes(qLower) ||
        qLower.includes(item.question.toLowerCase())
      );

      if (dbMatch) {
        const tQ = await translateText(dbMatch.question, 'eng_Latn', targetLang);
        const tA = await translateText(dbMatch.answer, 'eng_Latn', targetLang);

        setSelectedQuestionItem({
          ...dbMatch,
          question: tQ,
          answer: tA
        });
        setCategory(dbMatch.category);
      } else {
        const englishAnswer = await queryKnowledgeBase(englishQuery);
        const translatedResult = await translateText(englishAnswer, 'eng_Latn', targetLang);

        setSelectedQuestionItem({
          id: 'custom-' + Date.now(),
          category: 'General',
          question: query,
          answer: translatedResult
        });
      }

      setStep('answer');
    } catch (error) {
      console.error("Global query failed:", error);
      // Fallback: stay on current step or show error in UI
    } finally {
      setIsProcessingGlobalQuery(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans">
      <Navbar />

      {/* Show Hero only on Language Step */}
      {step === 'language' && <HeroSection />}

      <div className="flex-grow flex flex-col items-center">
        <div className={`w-full container mx-auto px-4 ${step === 'language' ? 'py-12' : 'py-8'}`}>
          <AnimatePresence mode="wait">
            {step === 'language' && (
              <motion.div
                key="language"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <LanguageSelectionLayer onSelect={handleLanguageSelect} />
              </motion.div>
            )}

            {step === 'category' && (
              <motion.div
                key="category"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <CategorySelectionLayer
                  language={language}
                  categories={categories}
                  onSelect={handleCategorySelect}
                  onBack={handleBack}
                />
              </motion.div>
            )}

            {step === 'question' && category && (
              <motion.div
                key="question"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <QuestionListLayer
                  language={language}
                  category={category}
                  questions={questions}
                  onSelect={handleQuestionSelect}
                  onBack={handleBack}
                />
              </motion.div>
            )}

            {step === 'answer' && selectedQuestionItem && (
              <motion.div
                key="answer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <AnswerView
                  language={language}
                  item={selectedQuestionItem}
                  onBack={handleBack}
                  onHome={handleHome}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Voice/Chat Input - Visible after language selection */}
        {step !== 'language' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full pb-16"
          >
            <VoiceChatInput
              onQuery={handleGlobalQuery}
              isProcessing={isProcessingGlobalQuery}
              language={language}
            />
          </motion.div>
        )}
      </div>

      {/* Always show Footer */}
      <FooterInfo />
    </main>
  );
}
