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
        export function Text({ style, accessibilityLanguage, children }) {
          return React.createElement('span', {
            'data-style': JSON.stringify(flatten(style)), lang: accessibilityLanguage,
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

const { AppText, AppTextInput, AppMixedText, AppTextProvider } = await import('../components/app-text.tsx');
const { AppTypography, resolveAppFontFamily } = await import('../constants/theme.ts');

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
