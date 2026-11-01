# السيد رضا السيد — Sayed Reda ELSayed

موقع مهني ثابت لمهندس البرمجيات والخدمات الفنية السيد رضا السيد. الواجهة بالعربية من اليمين إلى اليسار، ويمكن التبديل إلى الإنجليزية من رأس الصفحة.

A static professional site for Sayed Reda ELSayed, Software and Service Engineer. Arabic (right to left) is the default; English is available from the header.

## Cloudflare Pages

This is a Cloudflare Pages site, not a Worker. From this folder, with `CLOUDFLARE_ACCOUNT_ID` set and a `CLOUDFLARE_API_TOKEN` that includes Cloudflare Pages edit access:

```bash
npm install
npm run deploy
```

That publishes the production branch to `https://sayed-reda.pages.dev`.

## العرض المحلي

من جذر المستودع:

```bash
python3 -m http.server 8765
```

ثم افتح `http://localhost:8765`.

## الخطوط

Readex Pro وIBM Plex Mono مضمّنان محلياً تحت `fonts/` وبرخصة SIL Open Font License 1.1. نص الرخصة في `fonts/OFL-ReadexPro.txt` و`fonts/OFL-IBMPlexMono.txt`.
