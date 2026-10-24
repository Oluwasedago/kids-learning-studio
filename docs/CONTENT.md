# Content sources and licences

Checked 19 Oct 2026. Nothing below is copied into the app except the pictures and fonts; audio and video are
streamed from their source when the child plays them.

| Content | Source | Licence / terms | Status |
|---|---|---|---|
| 3D pictures | Microsoft Fluent Emoji | MIT ([public/emoji/LICENSE.txt](../public/emoji/LICENSE.txt)) | confirmed |
| Fonts | Andika, Fredoka (via @fontsource) | SIL Open Font License | confirmed |
| QR codes (install page) | qrcode-generator | MIT | confirmed |
| Stories | LibriVox recordings on the Internet Archive: *The Tale of Peter Rabbit and others* (Beatrix Potter), *The Velveteen Rabbit* (Margery Williams), *Just So Stories* (Rudyard Kipling, selection) | LibriVox: "all our recordings are public domain (definitely in the USA, and maybe in your country as well)" and "you may do whatever you like with our recordings – you don't need permission" ([librivox.org/pages/public-domain](https://librivox.org/pages/public-domain/)); each item is marked Public Domain on archive.org | confirmed for the USA; to verify per country |
| Story selection | — | Left out: "How the Leopard got his Spots" (contains a racial slur), "The Butterfly that Stamped", "The Tabu Tale", Aesop (18th-century translation with outdated language), long Potter tales | choice |
| Radio (German) | Die Maus (WDR), HTTPS MP3 stream (forwards to a signed link; web players allowed by CORS) | No terms for other players published; public broadcaster, no adverts | **to verify** with WDR before release |
| Radio (English) | Fun Kids (funkidslive.com), HTTPS MP3 stream | No terms for other players published; the streams are public and listed in radio directories; they carry short adverts | **to verify** with the station before release |
| Radio (Spanish) | Babyradio (Spain), HTTPS MP3 stream via StreamTheWorld (checked 24 Oct 2026) | No terms for other players published; adverts not checked | **to verify** with the station before release |
| Radio (French) | Mon Petit France Inter (Radio France, ages 6–12), HTTPS MP3 stream (icecast.radiofrance.fr) | No terms for other players published; the stream is public and listed in radio directories; public service without adverts (the French counterpart of Die Maus) | **to verify** with Radio France before release |
| Video library | About 40 YouTube videos from official channels (Sesame Street, Discovery UK, Science Channel, The LEGO Group, Mystery Science, Owlkids, Insider, SciShow Kids, Peekaboo Kidz, TED-Ed, Die Maus/WDR, C'est pas sorcier) and live cams (Monterey Bay Aquarium, Africam, Namibia Wildlife Resorts, Cornell Lab), list in `src/media/library.ts` | Played with YouTube's own embedded player (youtube-nocookie.com), which the channels allow for their public videos; nothing is copied | checked with `node scripts/check-videos.mjs` on 24 Oct 2026 (39 of 39); run again before each release, live stream ids can change |
| Videos | YouTube, only videos a parent adds | Played in YouTube's own embedded player (youtube-nocookie.com), as YouTube allows for embedding | confirmed (YouTube terms apply to the parent's choice) |
| Lessons, facts | Written for this project | MIT, with the code | facts to verify |

## Left out

- **Kids Public Radio** (USA, ad-free, ages 2–8): streams only over http://, which browsers block inside an
  https:// app. Could be added if the station offers HTTPS.
- **Storynory**: its copyright page says using its stories in an app needs permission and usually an annual fee
  ([storynory.com/copyright](https://www.storynory.com/copyright/)). Could be added with permission.
- **Religious content** (faith module, Bible stories, Christian stations): removed by decision, 19 Oct 2026.
