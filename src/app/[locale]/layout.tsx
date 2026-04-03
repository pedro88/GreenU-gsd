import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { StoreProvider } from '@/lib/store-provider';
import { routing } from '@/routing';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Locale-specific layout with all providers.
 * Uses DashboardLayout for authenticated users (via dashboard page).
 * Wraps every page with NextIntlClientProvider for translations.
 */
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });

  return {
    title: `greenU 🌿 — ${t('tagline')}`,
    description: t('tagline'),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as 'en' | 'fr' | 'es')) {
    notFound();
  }

  // Get messages for the locale
  const messages = await getMessages();

  return (
    <SessionProvider>
      <StoreProvider>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </StoreProvider>
    </SessionProvider>
  );
}
