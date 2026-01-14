# Guide d'Implémentation de l'Auto-Updater pour Orbis Mod Loader

Ce guide vous accompagne étape par étape pour mettre en place l'auto-updater dans le launcher Tauri.

## 📋 Prérequis

- Tauri v2 (déjà installé ✅)
- Une version Rust >= 1.77.2
- GitHub pour héberger les releases

---

## 🔐 Étape 1 : Génération des clés de signature

Les mises à jour doivent être signées pour garantir leur sécurité. Cette étape ne peut pas être désactivée.

### 1.1 Générer la paire de clés

Dans le terminal, depuis le dossier `apps/mod-loader` :

```bash
pnpm tauri signer generate -w ~/.tauri/orbis-mod-loader.key
```

Cette commande génère :
- **Clé privée** : `~/.tauri/orbis-mod-loader.key` (☠️ **NE JAMAIS PARTAGER**)
- **Clé publique** : `~/.tauri/orbis-mod-loader.key.pub`

### 1.2 Sauvegarder les clés

> [!CAUTION]
> Si vous perdez votre clé privée, vous ne pourrez PLUS publier de mises à jour pour les utilisateurs existants !

**Actions à faire immédiatement :**

1. **Sauvegardez la clé privée** dans un gestionnaire de mots de passe sécurisé (1Password, Bitwarden, etc.)
2. **Copiez le contenu de la clé publique** :
   ```bash
   cat ~/.tauri/orbis-mod-loader.key.pub
   ```
3. **Ajoutez la clé privée aux secrets GitHub** :
   - Allez sur GitHub : `Settings` → `Secrets and variables` → `Actions`
   - Créez deux secrets :
     - `TAURI_SIGNING_PRIVATE_KEY` : contenu de `~/.tauri/orbis-mod-loader.key`
     - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` : mot de passe (si vous en avez défini un, sinon laissez vide)

---

## 📦 Étape 2 : Installation du plugin

```bash
cd apps/mod-loader
pnpm tauri add updater
```

---

## ⚙️ Étape 3 : Configuration de Tauri

### 3.1 Modifier `src-tauri/tauri.conf.json`

Ajoutez la configuration suivante :

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "OrbisPlace Mod Loader",
  "version": "0.1.1",
  "identifier": "com.orbisplace.mod-loader",
  "build": {
    "beforeDevCommand": "pnpm dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "pnpm build",
    "frontendDist": "../build"
  },
  "app": {
    "windows": [
      {
        "title": "OrbisPlace Mod Loader",
        "width": 1200,
        "height": 800,
        "minWidth": 1200,
        "minHeight": 800,
        "titleBarStyle": "Overlay",
        "hiddenTitle": true
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "publisher": "Orbis Place",
    "createUpdaterArtifacts": true
  },
  "plugins": {
    "updater": {
      "pubkey": "COLLEZ_ICI_LE_CONTENU_DE_VOTRE_CLE_PUBLIQUE",
      "endpoints": [
        "https://github.com/Orbis-place/Orbis-Website/releases/latest/download/latest.json"
      ],
      "windows": {
        "installMode": "passive"
      }
    }
  }
}
```

> [!IMPORTANT]
> Remplacez `COLLEZ_ICI_LE_CONTENU_DE_VOTRE_CLE_PUBLIQUE` par le contenu de `~/.tauri/orbis-mod-loader.key.pub`

### 3.2 Créer le fichier de permissions

Créez `src-tauri/capabilities/default.json` :

```json
{
  "identifier": "default",
  "description": "Default permissions for the Orbis Mod Loader",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "updater:default",
    "updater:allow-check",
    "updater:allow-download",
    "updater:allow-install",
    "updater:allow-download-and-install"
  ]
}
```

---

## 💻 Étape 4 : Implémentation côté Frontend (Svelte)

### 4.1 Créer le fichier updater

Créez `src/lib/updater.ts` :

```typescript
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export interface UpdateStatus {
  available: boolean;
  version?: string;
  currentVersion?: string;
  notes?: string;
  date?: string;
}

export async function checkForUpdates(): Promise<UpdateStatus> {
  try {
    const update = await check();
    
    if (update?.available) {
      return {
        available: true,
        version: update.version,
        currentVersion: update.currentVersion,
        notes: update.body,
        date: update.date
      };
    }
    
    return { available: false };
  } catch (error) {
    console.error('Erreur lors de la vérification des mises à jour:', error);
    return { available: false };
  }
}

export async function downloadAndInstallUpdate(
  onProgress?: (downloaded: number, total: number) => void
): Promise<boolean> {
  try {
    const update = await check();
    
    if (!update?.available) {
      return false;
    }
    
    let downloaded = 0;
    let contentLength = 0;
    
    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started':
          contentLength = event.data.contentLength;
          console.log(`Téléchargement démarré: ${contentLength} bytes`);
          break;
        case 'Progress':
          downloaded += event.data.chunkLength;
          onProgress?.(downloaded, contentLength);
          console.log(`Téléchargé: ${downloaded}/${contentLength} bytes`);
          break;
        case 'Finished':
          console.log('Téléchargement terminé');
          break;
      }
    });
    
    console.log('Mise à jour installée avec succès');
    
    // Redémarrer l'application
    await relaunch();
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'installation de la mise à jour:', error);
    return false;
  }
}
```

### 4.2 Créer un composant UI pour l'updater

Créez `src/lib/components/UpdateDialog.svelte` :

```svelte
<script lang="ts">
  import { downloadAndInstallUpdate, type UpdateStatus } from '$lib/updater';
  
  export let updateInfo: UpdateStatus;
  export let onClose: () => void;
  
  let isDownloading = false;
  let downloadProgress = 0;
  let downloadTotal = 0;
  
  async function handleUpdate() {
    isDownloading = true;
    
    await downloadAndInstallUpdate((downloaded, total) => {
      downloadProgress = downloaded;
      downloadTotal = total;
    });
    
    // L'app redémarre automatiquement après l'installation
  }
  
  $: progressPercent = downloadTotal > 0 
    ? Math.round((downloadProgress / downloadTotal) * 100) 
    : 0;
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div class="bg-[#06363d] border border-[#109eb1]/30 rounded-2xl p-6 max-w-md w-full mx-4">
    <h2 class="text-2xl font-hebden font-bold text-[#c7f4fa] mb-2">
      Mise à jour disponible
    </h2>
    
    <p class="text-[#c7f4fa]/80 font-nunito mb-4">
      Version {updateInfo.version} est disponible !
    </p>
    
    {#if updateInfo.notes}
      <div class="bg-[#032125] rounded-lg p-4 mb-4">
        <p class="text-sm text-[#c7f4fa]/60 font-nunito whitespace-pre-wrap">
          {updateInfo.notes}
        </p>
      </div>
    {/if}
    
    {#if isDownloading}
      <div class="mb-4">
        <div class="flex justify-between text-sm text-[#c7f4fa]/60 mb-2">
          <span>Téléchargement...</span>
          <span>{progressPercent}%</span>
        </div>
        <div class="w-full bg-[#032125] rounded-full h-2">
          <div 
            class="bg-[#109eb1] h-2 rounded-full transition-all duration-300"
            style="width: {progressPercent}%"
          />
        </div>
      </div>
    {/if}
    
    <div class="flex gap-3">
      <button
        on:click={onClose}
        disabled={isDownloading}
        class="flex-1 px-4 py-2 rounded-lg border border-[#c7f4fa]/20 text-[#c7f4fa] font-hebden hover:bg-[#c7f4fa]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Plus tard
      </button>
      
      <button
        on:click={handleUpdate}
        disabled={isDownloading}
        class="flex-1 px-4 py-2 rounded-lg bg-[#109eb1] text-white font-hebden hover:bg-[#109eb1]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? 'Installation...' : 'Mettre à jour'}
      </button>
    </div>
  </div>
</div>
```

### 4.3 Intégrer dans votre layout principal

Dans `src/routes/+layout.svelte`, ajoutez la vérification au démarrage :

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { checkForUpdates, type UpdateStatus } from '$lib/updater';
  import UpdateDialog from '$lib/components/UpdateDialog.svelte';
  
  let updateAvailable: UpdateStatus | null = null;
  let showUpdateDialog = false;
  
  onMount(async () => {
    // Vérifier les mises à jour au démarrage (après 3 secondes)
    setTimeout(async () => {
      const update = await checkForUpdates();
      if (update.available) {
        updateAvailable = update;
        showUpdateDialog = true;
      }
    }, 3000);
    
    // Vérifier périodiquement (toutes les heures)
    setInterval(async () => {
      const update = await checkForUpdates();
      if (update.available) {
        updateAvailable = update;
        showUpdateDialog = true;
      }
    }, 60 * 60 * 1000);
  });
</script>

{#if showUpdateDialog && updateAvailable}
  <UpdateDialog 
    updateInfo={updateAvailable}
    onClose={() => showUpdateDialog = false}
  />
{/if}

<slot />
```

---

## 🏗️ Étape 5 : Configuration du Build

### 5.1 Variables d'environnement pour le build local

Avant de builder localement, exportez vos clés :

#### macOS/Linux
```bash
export TAURI_SIGNING_PRIVATE_KEY="$(cat ~/.tauri/orbis-mod-loader.key)"
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD=""  # Si vous avez un mot de passe
```

#### Windows (PowerShell)
```powershell
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content ~/.tauri/orbis-mod-loader.key -Raw
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = ""
```

### 5.2 Builder l'application

```bash
cd apps/mod-loader
pnpm tauri build
```

Cela créera les fichiers suivants dans `src-tauri/target/release/bundle/` :

**Windows:**
- `msi/OrbisPlace Mod Loader_0.1.1_x64_en-US.msi`
- `msi/OrbisPlace Mod Loader_0.1.1_x64_en-US.msi.sig`
- `nsis/OrbisPlace Mod Loader_0.1.1_x64-setup.exe`
- `nsis/OrbisPlace Mod Loader_0.1.1_x64-setup.exe.sig`

**macOS:**
- `macos/OrbisPlace Mod Loader.app`
- `macos/OrbisPlace Mod Loader.app.tar.gz`
- `macos/OrbisPlace Mod Loader.app.tar.gz.sig`

**Linux:**
- `appimage/OrbisPlace Mod Loader_0.1.1_amd64.AppImage`
- `appimage/OrbisPlace Mod Loader_0.1.1_amd64.AppImage.sig`

---

## 🚀 Étape 6 : Configuration de GitHub Actions

### 6.1 Créer le workflow GitHub Actions

Créez `.github/workflows/release.yml` :

```yaml
name: Release
on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  release:
    permissions:
      contents: write
    strategy:
      fail-fast: false
      matrix:
        include:
          - platform: 'macos-latest'
            args: '--target aarch64-apple-darwin'
          - platform: 'macos-latest'
            args: '--target x86_64-apple-darwin'
          - platform: 'ubuntu-22.04'
            args: ''
          - platform: 'windows-latest'
            args: ''

    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4

      - name: setup node
        uses: actions/setup-node@v4
        with:
          node-version: lts/*

      - name: install Rust stable
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.platform == 'macos-latest' && 'aarch64-apple-darwin,x86_64-apple-darwin' || '' }}

      - name: install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8

      - name: install dependencies (ubuntu only)
        if: matrix.platform == 'ubuntu-22.04'
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf

      - name: install frontend dependencies
        run: pnpm install

      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
          TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
        with:
          tagName: v__VERSION__
          releaseName: 'Orbis Mod Loader v__VERSION__'
          releaseBody: 'See the assets to download and install this version.'
          releaseDraft: true
          prerelease: false
          args: ${{ matrix.args }}
          projectPath: apps/mod-loader
```

### 6.2 Créer une release

1. Mettez à jour la version dans `apps/mod-loader/src-tauri/tauri.conf.json`
2. Committez et créez un tag :
   ```bash
   git add .
   git commit -m "chore: bump version to 0.2.0"
   git tag v0.2.0
   git push origin main --tags
   ```

3. GitHub Actions va automatiquement :
   - Builder pour Windows, macOS, Linux
   - Signer tous les binaires
   - Créer une release draft avec un fichier `latest.json`

4. Éditez la release draft pour ajouter les notes de version, puis publiez-la

---

## 📄 Étape 7 : Format du fichier latest.json

GitHub Actions (via tauri-action) génère automatiquement ce fichier, mais voici à quoi il ressemble :

```json
{
  "version": "0.2.0",
  "notes": "Notes de version ici",
  "pub_date": "2026-01-14T18:00:00Z",
  "platforms": {
    "darwin-x86_64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUldUTE...",
      "url": "https://github.com/Orbis-place/Orbis-Website/releases/download/v0.2.0/OrbisPlace.Mod.Loader.app.tar.gz"
    },
    "darwin-aarch64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUldUTE...",
      "url": "https://github.com/Orbis-place/Orbis-Website/releases/download/v0.2.0/OrbisPlace.Mod.Loader.app.tar.gz"
    },
    "linux-x86_64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUldUTE...",
      "url": "https://github.com/Orbis-place/Orbis-Website/releases/download/v0.2.0/OrbisPlace.Mod.Loader_0.2.0_amd64.AppImage"
    },
    "windows-x86_64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUldUTE...",
      "url": "https://github.com/Orbis-place/Orbis-Website/releases/download/v0.2.0/OrbisPlace.Mod.Loader_0.2.0_x64-setup.exe"
    }
  }
}
```

---

## ✅ Checklist finale

Avant de publier votre première mise à jour, vérifiez :

- [ ] Clé publique ajoutée dans `tauri.conf.json`
- [ ] Clé privée sauvegardée en lieu sûr
- [ ] Secrets GitHub configurés (`TAURI_SIGNING_PRIVATE_KEY` et `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`)
- [ ] Plugin updater installé (`@tauri-apps/plugin-updater`)
- [ ] Fichier de permissions créé (`src-tauri/capabilities/default.json`)
- [ ] Code de vérification des mises à jour implémenté
- [ ] GitHub Actions workflow configuré
- [ ] Endpoint dans `tauri.conf.json` pointe vers `latest.json`
- [ ] `createUpdaterArtifacts: true` dans la config

---

## 🧪 Test de l'updater

### En développement

L'updater ne fonctionne **QUE** en production. Vous ne pouvez pas le tester en mode `pnpm tauri dev`.

### Test manuel

1. Installez une version (ex: v0.1.0)
2. Créez et publiez une nouvelle release (ex: v0.2.0)
3. Lancez l'app v0.1.0
4. Elle devrait détecter et proposer la mise à jour vers v0.2.0

---

## 🔧 Dépannage

### "Invalid signature"
- Vérifiez que la clé publique dans `tauri.conf.json` correspond à la clé privée utilisée pour signer
- Assurez-vous que les variables d'environnement sont correctement définies

### "No update available"
- Vérifiez que l'endpoint est accessible
- Vérifiez le format du fichier `latest.json`
- Assurez-vous que la version dans `latest.json` est supérieure à la version actuelle

### L'app ne redémarre pas après l'installation
- Sur Windows, c'est normal : l'app se ferme et l'installateur se lance
- Sur macOS/Linux, vérifiez les permissions de `relaunch()`

---

## 📚 Ressources

- [Documentation officielle Tauri Updater](https://v2.tauri.app/plugin/updater/)
- [Tauri GitHub Action](https://github.com/tauri-apps/tauri-action)
- [Guide de signature](https://v2.tauri.app/distribute/sign/)
