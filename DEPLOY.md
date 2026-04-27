# Deskloop Deployment Guide
**How to get deskloop.work live on the internet**

---

## What you need before starting

- [ ] `deskloop.work` registered on Namecheap ✅ (done)
- [ ] GitHub account at github.com
- [ ] Vercel account at vercel.com
- [ ] GitHub Desktop app at desktop.github.com
- [ ] The `deskloop` project folder on your computer (the files I built)

Estimated time: **30–45 minutes**

---

## Step 1 — Create a GitHub Repository

1. Go to **github.com** and sign in
2. Click the **+** icon in the top right → **New repository**
3. Name it: `deskloop`
4. Set visibility to **Public**
5. Leave everything else as default — do NOT check "Add README"
6. Click **Create repository**

---

## Step 2 — Install GitHub Desktop

1. Go to **desktop.github.com**
2. Download and install GitHub Desktop for Windows
3. Open GitHub Desktop and sign in with your GitHub account
4. Go to **File → Clone Repository**
5. Click the **GitHub.com** tab
6. Select the `deskloop` repository you just created
7. Choose where to save it on your computer (e.g. `E:\projects\deskloop`)
8. Click **Clone**

---

## Step 3 — Add Your Files

Copy all files into the cloned folder. Structure must look exactly like this:

```
deskloop/
├── index.html
├── styles.css
├── robots.txt
├── sitemap.xml
├── DEPLOY.md
└── tools/
    ├── focus-timer.html
    └── meeting-cost.html
```

---

## Step 4 — Push to GitHub

1. Open **GitHub Desktop**
2. You'll see all files listed under "Changes"
3. In the bottom left, type: `Initial launch`
4. Click **Commit to main**
5. Click **Push origin**
6. Confirm files appear at github.com/YOUR-USERNAME/deskloop

---

## Step 5 — Deploy on Vercel

1. Go to **vercel.com** and sign in with GitHub
2. Click **Add New → Project**
3. Find `deskloop` and click **Import**
4. Leave all settings as default
5. Click **Deploy**
6. Wait ~30 seconds — visit the live Vercel URL to confirm

---

## Step 6 — Connect Your Domain

**In Vercel:**
1. Project dashboard → **Settings → Domains**
2. Add `deskloop.work` and `www.deskloop.work`
3. Keep the DNS records Vercel shows you open

**In Namecheap:**
1. Domain List → Manage → **Advanced DNS**
2. Delete existing A Record and CNAME records
3. Add these:

| Type | Host | Value |
|------|------|-------|
| A Record | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

Wait 10 minutes to 48 hours for DNS to propagate.

---

## Step 7 — Confirm Everything Works

- [ ] https://deskloop.work loads the homepage
- [ ] https://www.deskloop.work redirects correctly
- [ ] https://deskloop.work/tools/focus-timer.html loads
- [ ] https://deskloop.work/tools/meeting-cost.html loads
- [ ] Looks correct on mobile

---

## Step 8 — Submit to Google Search Console

1. Go to **search.google.com/search-console**
2. Add Property → URL prefix → `https://deskloop.work`
3. Verify via HTML tag — paste the meta tag into `<head>` of index.html
4. Push the change through GitHub Desktop → Vercel auto-redeploys
5. Click Verify in Search Console
6. Go to **Sitemaps** → enter `sitemap.xml` → Submit

---

## How to Update the Site Later

1. Edit or add a file on your computer
2. Open GitHub Desktop
3. Write a summary (e.g. "Added habit tracker")
4. Commit to main → Push origin
5. Vercel auto-deploys in ~30 seconds

---

## Costs

| Item | Cost |
|------|------|
| deskloop.work domain | ~$5–15/year |
| GitHub | Free |
| Vercel | Free |
| Google Search Console | Free |
| **Monthly total** | **~$1.25/month** |

---

## Troubleshooting

**Site not showing after 2 hours** → Check dnschecker.org for your domain

**Vercel deploy error** → Make sure index.html is at the root, not in a subfolder

**Broken styles on tool pages** → Confirm styles.css is at root, not inside tools/

**Search Console won't verify** → Check Vercel dashboard shows green "Ready" after your push
