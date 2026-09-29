# Yayın öncesi kontrol listesi

Site teknik olarak yayına hazır. Aşağıdaki maddeler **gerçek işletme
bilgisi** gerektirdiği için uydurulmadı; yayından önce doldurulmalı.

## 1. Mutlaka doğrulanacak bilgiler

| Bilgi | Sitede nerede | Durum |
| --- | --- | --- |
| Telefon / WhatsApp: **0545 445 72 68** | İletişim, form, footer, JSON-LD | Instagram biyografisinden alındı. Numaranın doğru olduğunu ve WhatsApp'ta kullanıldığını doğrulayın. |
| Tekne adı **KAPTAN-I DERYA 3** | Fleet bölümü | Videodaki teknenin kıçında yazıyor. Filoya ait olduğunu doğrulayın. |
| Filo kapasitesi **50–500 misafir** | Fleet, meta description | marmara.blue'dan alındı. |

## 2. Eksik olan ve eklenmesi gereken bilgiler

- **Gizlilik Politikası** (`gizlilik-politikasi.html`) ve **KVKK Aydınlatma
  Metni** (`kvkk-aydinlatma-metni.html`): şu an **TASLAK**. Hukuk danışmanının
  hazırladığı gerçek metin eklenince:
  1. `<meta name="robots" content="noindex, follow">` → `index, follow` yapın,
  2. sayfaları `public/sitemap.xml`'e ekleyin,
  3. `.page__draft` kutusunu ve "Eklenecek" maddelerini kaldırın.
- **Şirket unvanı, adres, vergi no, MERSİS, e-posta**: hiçbiri sitede yok
  (doğrulanamadı). Varsa footer'a (`index.html` → `site-footer`) ve
  JSON-LD'deki `Organization` düğümüne (`address`, `email`) eklenebilir.

## 3. Analytics (isteğe bağlı)

Site şu an **hiçbir analitik yüklemez**. GA4 kullanılacaksa:

1. Barındırma ortamında `VITE_GA4_ID=G-XXXXXXXXXX` tanımlayın ve yeniden build alın.
2. Site otomatik olarak bir **çerez onay çubuğu** gösterir; onay olmadan hiçbir şey yüklenmez.
3. İzlenen olaylar: `whatsapp_click`, `phone_click`, `instagram_click`,
   `request_form_open`, `request_form_submit`, `whatsapp_redirect`.
4. CSP, GA4 alan adlarına zaten izin veriyor; ek ayar gerekmez.
5. Gizlilik Politikası'na analitik sağlayıcısını ve saklama sürelerini ekleyin.

## 4. Barındırma

- **Vercel**: repo bağlanınca `vercel.json` build/çıktı/başlıkları ayarlar.
- **Netlify / Cloudflare Pages**: `netlify.toml` + `public/_headers`.
- **GitHub Pages**: Settings → Pages → Source: **GitHub Actions**. Ana dala
  her push'ta `.github/workflows/pages.yml` siteyi derleyip yayınlar
  (`https://<kullanıcı>.github.io/<repo>/`). Kendi alan adı için Settings →
  Pages → Custom domain'e alan adını yazın ve `CUSTOM_DOMAIN` adlı bir
  repository variable ekleyin. GitHub Pages HTTP başlığı gönderemez; CSP
  `<meta>` etiketiyle gelir, HSTS ve diğer başlıklar orada uygulanmaz.
- **Tek dosya**: `npm run build:single` → `dist-single/marmara-blue.html`
  (her şey içinde, ~9 MB; çift tıklayınca açılır).
- Başka bir sunucu (nginx/Apache): `dist/` klasörünü yayınlayın ve
  `public/_headers` içindeki başlıkları sunucu yapılandırmasına taşıyın.
- HSTS'e `includeSubDomains`, tüm marmara.blue alt alan adlarının HTTPS
  sunduğu doğrulandıktan sonra eklenebilir.
- Video/görsel dosyası değiştirilirse dosya adını da değiştirin (30 günlük önbellek).
