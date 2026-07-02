# KromaOS CRM

Mini CRM local pour piloter les missions Kroma, les relances, les deadlines et les imports mail.
Il tourne avec un serveur Node, une interface web et un stockage dans `data/crm.json`.

## Lancer

Double-cliquer sur :

```text
start-crm.bat
```

Ou lancer en ligne de commande :

```powershell
npm start
```

Puis ouvrir :

```text
http://localhost:3000
```

## Jarvis ChatGPT local

Le CRM expose un endpoint local `/api/jarvis/chat` base sur l'API OpenAI Responses.
Pour activer le vrai mode ChatGPT, lancer le serveur avec une cle :

```powershell
$env:OPENAI_API_KEY="sk-..."
$env:OPENAI_MODEL="gpt-5.5"
npm start
```

Ou double-cliquer sur `setup-openai-key.bat` : le script cree un fichier `.env` local ignore par Git, enregistre la cle pour Windows et redemarre le serveur.

Sans `OPENAI_API_KEY`, Jarvis reste en mode CRM local et explique quoi configurer.
Le site ne reutilise pas les cookies ou la session Google du navigateur : Gmail/Agenda live devront passer par une connexion OAuth Google explicite.

## Fonctionnalites

- Suivis clients, tournages, montages, deadlines et relances.
- Pipeline : a clarifier, a relancer, en cours, bloque, fait.
- Recherche et filtres par relances ou suivis faits.
- Indicateurs : enjeu suivi, relances semaine, avancement, sujets actifs.
- Ajout, modification et suppression de suivis.
- Messages de relance prets a copier.
- Notes horodatees par suivi.
- Donnees persistantes en local dans `data/crm.json`.
- Base mail optionnelle via `data/viral-mail-db.json`.
- Profil utilisateur personnalisable via `data/user-session.json`.
- Idea Studio : generation d'angles creatifs relies aux missions, brief Canva pret a copier et ouverture du bon format Canva.
- Spotify focus : collage d'un lien Spotify pour afficher un lecteur embarque, plus recherches de mood rapides.
- Jarvis ChatGPT-ready via le serveur local, avec contexte CRM, profil Kroma et base mail importee.

## GitHub Pages

Le projet est pret pour GitHub Pages avec le workflow `.github/workflows/pages.yml`.
Le site public sert le dossier `public`.

Important : GitHub Pages ne lance pas le serveur Node. En ligne, le CRM passe donc en mode demo/localStorage :

- donnees publiques de demo dans `public/data/contacts.json` ;
- ajouts/modifications sauvegardes dans le navigateur du visiteur ;
- vraies donnees locales conservees dans `data/*.json`, non exposees par Pages.
