# Viral CRM

Mini CRM local adapte au recap Viral Media de Mathis pour la semaine du 29 juin au 5 juillet 2026.
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

## Fonctionnalites

- Suivis issus du PDF : Scott, Vibes, studio Ronnie/Jordan, montages, fiche de poste, date 01/07, Moussa.
- Pipeline : a clarifier, a relancer, en cours, bloque, fait.
- Recherche et filtres par relances ou suivis faits.
- Indicateurs : enjeu suivi, relances semaine, avancement, sujets actifs.
- Ajout, modification et suppression de suivis.
- Messages de relance prets a copier.
- Notes horodatees par suivi.
- Donnees persistantes dans `data/crm.json`.

## GitHub Pages

Le projet est pret pour GitHub Pages avec le workflow `.github/workflows/pages.yml`.
Le site public sert le dossier `public`.

Important : GitHub Pages ne lance pas le serveur Node. En ligne, le CRM passe donc en mode demo/localStorage :

- donnees publiques de demo dans `public/data/contacts.json` ;
- ajouts/modifications sauvegardes dans le navigateur du visiteur ;
- vraies donnees locales conservees dans `data/crm.json`, non exposees par Pages.
