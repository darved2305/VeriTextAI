'use client';

import { ClerkLoaded, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import clsx from 'clsx';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { MdClose, MdMenu } from 'react-icons/md';

import ButtonLink from '@/components/veritext/ButtonLink';
import WordMark from '@/components/veritext/WordMark';
import { getI18nPath } from '@/utils/Helpers';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('VeriTextNavBar');
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  // Prevent hydration mismatch by only rendering auth-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { label: t('features'), link: getI18nPath('/#features', locale), cta_button: false },
    { label: t('integrations'), link: getI18nPath('/#integrations', locale), cta_button: false },
    { label: t('pricing'), link: getI18nPath('/#pricing', locale), cta_button: false },
  ];

  return (
    <nav className="p-4 md:p-6" aria-label="Main">
      <div className="mx-auto flex max-w-6xl flex-col justify-between py-2 font-medium text-slate-900 md:flex-row md:items-center">
        <div className="flex items-center justify-between">
          <Link href={getI18nPath('/', locale)} className="z-50" onClick={() => setOpen(false)}>
            <WordMark />
            <span className="sr-only">{t('home_page')}</span>
          </Link>
          <button
            type="button"
            className="block p-2 text-3xl text-slate-900 md:hidden"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <MdMenu />
            <span className="sr-only">Open menu</span>
          </button>
        </div>

        {/* Mobile Nav */}
        <div
          className={clsx(
            'fixed inset-0 z-40 flex flex-col items-end gap-4 bg-white pr-4 pt-14 transition-transform duration-300 ease-in-out motion-reduce:transition-none md:hidden',
            open ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <button
            type="button"
            className="fixed right-4 top-4 mb-4 block p-2 text-3xl text-slate-900 md:hidden"
            aria-expanded={open}
            onClick={() => setOpen(false)}
          >
            <MdClose />
            <span className="sr-only">Close menu</span>
          </button>

          <div className="grid justify-items-end gap-8">
            {navigation.map(item => (
              <Link
                key={item.label}
                className="block px-3 text-3xl first:mt-8"
                href={item.link}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {mounted && (
              <ClerkLoaded>
                <SignedOut>
                  <Link
                    className="block px-3 text-3xl"
                    href={getI18nPath('/sign-in', locale)}
                    onClick={() => setOpen(false)}
                  >
                    {t('sign_in')}
                  </Link>
                  <ButtonLink
                    field={getI18nPath('/sign-up', locale)}
                    onClick={() => setOpen(false)}
                  >
                    {t('sign_up')}
                  </ButtonLink>
                </SignedOut>

                <SignedIn>
                  <Link
                    className="block px-3 text-3xl"
                    href={getI18nPath('/dashboard', locale)}
                    onClick={() => setOpen(false)}
                  >
                    {t('dashboard')}
                  </Link>
                  <div className="px-3">
                    <UserButton />
                  </div>
                </SignedIn>
              </ClerkLoaded>
            )}
          </div>
        </div>

        {/* Desktop Nav */}
        <ul className="hidden gap-6 md:flex md:items-center">
          {navigation.map(item => (
            <li key={item.label}>
              <Link
                className="inline-flex min-h-11 items-center text-slate-900"
                href={item.link}
              >
                {item.label}
              </Link>
            </li>
          ))}

          {mounted && (
            <ClerkLoaded>
              <SignedOut>
                <li>
                  <Link
                    className="inline-flex min-h-11 items-center text-slate-900"
                    href={getI18nPath('/sign-in', locale)}
                  >
                    {t('sign_in')}
                  </Link>
                </li>
                <li>
                  <ButtonLink field={getI18nPath('/sign-up', locale)}>
                    {t('sign_up')}
                  </ButtonLink>
                </li>
              </SignedOut>

              <SignedIn>
                <li>
                  <Link
                    className="inline-flex min-h-11 items-center text-slate-900"
                    href={getI18nPath('/dashboard', locale)}
                  >
                    {t('dashboard')}
                  </Link>
                </li>
                <li>
                  <UserButton />
                </li>
              </SignedIn>
            </ClerkLoaded>
          )}
        </ul>
      </div>
    </nav>
  );
}
