import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { VocabularyTextContext } from '../lib/i18n/VocabularyTextContext.ts';

const nativeMockUrl = new URL('./i18n-native.mock.mjs', import.meta.url).href;
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'react-native') return { url: nativeMockUrl, shortCircuit: true };
    if (specifier === '@/constants/theme') {
      return nextResolve(new URL('../constants/theme.ts', import.meta.url).href, context);
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url === nativeMockUrl) {
      return { format: 'module', shortCircuit: true, source: `
        import React from 'react';
        function flatten(style) {
          if (Array.isArray(style)) return Object.assign({}, ...style.map(flatten));
          return style || {};
        }
        export const StyleSheet = { flatten };
        export const Platform = { select: (values) => values.ios ?? values.default };
        export function Text({ style, accessibilityLanguage, children, numberOfLines, adjustsFontSizeToFit }) {
          return React.createElement('span', {
            'data-style': JSON.stringify(flatten(style)), lang: accessibilityLanguage,
             'data-lines': numberOfLines, 'data-shrink': adjustsFontSizeToFit,
          }, children);
        }
        export const TextInput = Text;
        export const Animated = { createAnimatedComponent: (component) => component };
      ` };
    }
    if (url.endsWith('/components/app-text.tsx')) {
      return {
        format: 'module', shortCircuit: true,
        source: ts.transpileModule(readFileSync(new URL(url), 'utf8'), {
          compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext },
          fileName: 'app-text.tsx',
        }).outputText,
      };
    }
    return nextLoad(url, context);
  },
});

const { AppText, AppTextInput, AppMixedText, AppTextProvider, useJapaneseHeroTypography } = await import('../components/app-text.tsx');
const { AppTypography, resolveAppFontFamily, getJapaneseLineHeight } = await import('../constants/theme.ts');

function render(Component, props, { frenchFonts = true, japaneseFonts = true } = {}) {
  return renderToStaticMarkup(React.createElement(AppTextProvider, {
    customFontsAvailable: frenchFonts, japaneseFontsAvailable: japaneseFonts,
  }, React.createElement(Component, props)));
}

function renderWithVocabularyCopy(Component, props, translator) {
  return renderToStaticMarkup(React.createElement(AppTextProvider, {
    customFontsAvailable: true, japaneseFontsAvailable: true,
  }, React.createElement(VocabularyTextContext.Provider, { value: translator },
    React.createElement(Component, props),
  )));
}
const decodedStyles = (html) => [...html.matchAll(/data-style="([^"]+)"/gu)]
  .map((match) => JSON.parse(match[1].replaceAll('&quot;', '"')));

test('French typography keeps every existing token and ignores Japanese font availability', () => {
  for (const [variant, token] of Object.entries(AppTypography)) {
    const before = render(AppText, { variant, children: 'Texte français' }, { japaneseFonts: false });
    const after = render(AppText, { variant, children: 'Texte français' });
    assert.equal(before, after);
    const [style] = decodedStyles(after);
    assert.equal(style.fontFamily, resolveAppFontFamily(token.script, token.fontRole, true));
    assert.equal(style.fontSize, token.fontSize);
    assert.equal(style.lineHeight, token.lineHeight);
    assert.equal(style.letterSpacing, token.letterSpacing);
    assert.equal(style.textTransform, token.textTransform);
  }
});

test('Japanese role uses Japanese glyphs while exact Hangul runs retain Noto Sans KR', () => {
  const html = render(AppText, { script: 'japanese', children: '日本語 한국어' });
  const styles = decodedStyles(html);
  assert.equal(styles[0].fontFamily, 'NotoSansJP_400Regular');
  assert.equal(styles[0].letterSpacing, 0);
  assert.equal(styles[0].textTransform, 'none');
  assert.equal(styles[1].fontFamily, 'NotoSansKR_400Regular');
  assert.ok(html.includes('lang="ja-JP"'));
  assert.ok(html.includes('lang="ko-KR"'));
  assert.ok(html.includes('한국어'));
});

test('Japanese font failure does not change French/Korean fonts and uses a Japanese fallback', () => {
  const french = render(AppText, { children: 'Français 한국어' }, { japaneseFonts: false });
  assert.equal(decodedStyles(french)[0].fontFamily, 'Outfit_400Regular');
  assert.equal(decodedStyles(french)[1].fontFamily, 'NotoSansKR_400Regular');
  const japanese = render(AppText, { script: 'japanese', children: '日本語' }, { japaneseFonts: false });
  assert.equal(decodedStyles(japanese)[0].fontFamily, 'Hiragino Sans');
});

test('Japanese inputs and explicit mixed segments use the same centralized font contract', () => {
  const input = render(AppTextInput, { script: 'japanese' });
  assert.equal(decodedStyles(input)[0].fontFamily, 'NotoSansJP_400Regular');
  assert.ok(input.includes('lang="ja-JP"'));
  const mixed = render(AppMixedText, { segments: [
    { script: 'latin', text: 'FR' }, { script: 'japanese', text: '日本語' }, { script: 'korean', text: '한국어' },
  ] });
  assert.deepEqual(decodedStyles(mixed).map((style) => style.fontFamily), [
    'Outfit_400Regular', 'Outfit_400Regular', 'NotoSansJP_400Regular', 'NotoSansKR_400Regular',
  ]);
  const japaneseMixed = render(AppMixedText, { script: 'japanese', variant: 'sectionLabel', segments: [
    { script: 'japanese', text: '日本語' }, { script: 'korean', text: '한국어' },
  ] });
  const [parentStyle] = decodedStyles(japaneseMixed);
  assert.equal(parentStyle.letterSpacing, 0);
  assert.equal(parentStyle.textTransform, 'none');
  assert.ok(parentStyle.fontFamily.startsWith('NotoSansJP_'));
});


test('Japanese glyph runs are detected automatically inside default French typography', () => {
  const html = render(AppText, { children: '日本語 한국어' });
  const styles = decodedStyles(html);
  assert.equal(styles[0].fontFamily, 'Outfit_400Regular');
  assert.equal(styles[1].fontFamily, 'NotoSansJP_400Regular');
  assert.equal(styles[2].fontFamily, 'NotoSansKR_400Regular');
  assert.ok(html.includes('lang="ja-JP"'));
  assert.ok(html.includes('lang="ko-KR"'));
});

test('vocabulary display copy is translated at render time and uses Japanese glyphs', () => {
  const translate = (value) => value === 'Famille' ? '家族' : value;
  const html = renderWithVocabularyCopy(AppText, { children: 'Famille' }, translate);
  assert.ok(html.includes('家族'));
  assert.equal(decodedStyles(html)[0].fontFamily, 'Outfit_400Regular');
  assert.equal(decodedStyles(html)[1].fontFamily, 'NotoSansJP_400Regular');
  assert.ok(html.includes('lang="ja-JP"'));

  const mixed = renderWithVocabularyCopy(AppMixedText, {
    segments: [{ script: 'latin', text: 'Nuance culturelle' }],
  }, (value) => value === 'Nuance culturelle' ? '文化のポイント' : value);
  assert.ok(mixed.includes('文化のポイント'));
  assert.equal(decodedStyles(mixed)[2].fontFamily, 'NotoSansJP_400Regular');
  assert.ok(mixed.includes('lang="ja-JP"'));
});

test('Japanese metrics apply after translation and preserve compact Latin and Hangul tokens', () => {
  for (const [variant, token] of Object.entries(AppTypography)) {
    if (token.script === 'korean') continue;
    const html = renderWithVocabularyCopy(AppText, { variant, children: 'Famille' }, () => '家族と一緒に練習');
    const [style] = decodedStyles(html);
    assert.equal(style.fontSize, token.fontSize);
    assert.equal(style.lineHeight, Math.max(token.lineHeight, Math.ceil(token.fontSize * 1.4)));
    assert.equal(style.letterSpacing, 0);
    assert.equal(style.textTransform, 'none');
    assert.equal(style.includeFontPadding, false);
  }
  const korean = decodedStyles(render(AppText, { variant: 'koreanSecondary', children: '한국어' }))[0];
  assert.equal(korean.lineHeight, AppTypography.koreanSecondary.lineHeight);
  const input = decodedStyles(render(AppTextInput, { script: 'japanese', variant: 'sectionLabel' }))[0];
  assert.equal(input.lineHeight, getJapaneseLineHeight(AppTypography.sectionLabel.fontSize, AppTypography.sectionLabel.lineHeight));
});

test('localized labels wrap Japanese without shrinking; French and explicit compact labels keep their contracts', () => {
  const props = { variant: 'label', lineContract: 'localizedLabel', children: 'Famille', adjustsFontSizeToFit: true };
  const french = render(AppText, props);
  assert.match(french, /data-lines="1"/u);
  const japanese = renderWithVocabularyCopy(AppText, props, () => '家族と一緒に練習する');
  assert.doesNotMatch(japanese, /data-lines=/u);
  assert.match(japanese, /data-shrink="false"/u);
  assert.equal(decodedStyles(japanese)[0].flexShrink, 1);
  assert.match(render(AppText, { ...props, lineContract: 'singleLine', children: '日本語' }), /data-lines="1"/u);
});

test('Japanese gradient hero uses the registered bold font and a system fallback', () => {
  function HeroProbe() {
    return React.createElement('span', { 'data-style': JSON.stringify(useJapaneseHeroTypography()) });
  }
  const [loaded] = decodedStyles(render(HeroProbe, {}));
  const [fallback] = decodedStyles(render(HeroProbe, {}, { japaneseFonts: false }));
  assert.equal(loaded.fontFamily, 'NotoSansJP_700Bold');
  assert.equal(loaded.fontWeight, 'normal');
  assert.equal(fallback.fontFamily, 'Hiragino Sans');
  assert.equal(loaded.lineHeight, getJapaneseLineHeight(42, 44));
  assert.equal(loaded.letterSpacing, 0);
  const home = readFileSync(new URL('../app/(tabs)/index.tsx', import.meta.url), 'utf8');
  assert.equal([...home.matchAll(/styles\.heroTitle, heroTypography/g)].length, 3);
});

test('native permissions have matching French defaults and Japanese iOS localizations', () => {
  const config = JSON.parse(readFileSync(new URL('../app.json', import.meta.url), 'utf8')).expo;
  assert.equal(config.ios.infoPlist.CFBundleAllowMixedLocalizations, true);
  for (const locale of ['fr', 'ja']) {
    const copy = JSON.parse(readFileSync(new URL('../' + config.locales[locale], import.meta.url), 'utf8')).ios;
    for (const key of ['NSMicrophoneUsageDescription', 'NSSpeechRecognitionUsageDescription']) {
      assert.ok(copy[key].length > 10);
      if (locale === 'fr') assert.equal(copy[key], config.ios.infoPlist[key]);
      else assert.match(copy[key], /[\u3040-\u30ff\u4e00-\u9fff]/u);
    }
  }
  const speech = config.plugins.find(plugin => Array.isArray(plugin) && plugin[0] === 'expo-speech-recognition')[1];
  const audio = config.plugins.find(plugin => Array.isArray(plugin) && plugin[0] === 'expo-audio')[1];
  assert.equal(speech.microphonePermission, config.ios.infoPlist.NSMicrophoneUsageDescription);
  assert.equal(audio.microphonePermission, config.ios.infoPlist.NSMicrophoneUsageDescription);
  assert.equal(speech.speechRecognitionPermission, config.ios.infoPlist.NSSpeechRecognitionUsageDescription);
});
