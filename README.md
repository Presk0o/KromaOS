# Kroma HQ CRM — v2

CRM local pour piloter les missions Kroma / Mind'Com : pipeline, agenda, revenus, dossiers clients et un agent **Jarvis** qui exécute de vraies automations (pas juste du chat).

Refonte complète : nouvelle architecture serveur, nouveau design (hybride street x minimaliste), et un moteur d'automations qui fonctionne **même sans clé OpenAI**.

## Lancer

Double-clique sur `start-crm.bat`, ou en ligne de commande :

```powershell
npm start
```

Puis ouvre : http://localhost:3000

## Jarvis & automations

Jarvis fonctionne en deux couches :

1. **Moteur local (toujours actif, sans clé API)** — comprend des commandes précises et agit réellement sur tes données :
   - `nouvelle mission <nom> pour <société>` → crée la mission
   - `relance <mission>` → passe la mission en "à relancer" et sort un message prêt à copier
   - `termine <mission>` → clôture la mission (stage "fait")
   - `bloque <mission>` → marque la mission bloquée
   - `snooze <mission> 3 jours` → décale l'échéance
   - `cherche <terme>` → recherche dans les missions
   - `digest` → génère un résumé de semaine (retards, échéances à venir, pipeline) et l'archive dans la base mail
   - `stats` → chiffre d'affaires en pipeline / facturé

   Chaque action est journalisée dans le panneau **Automations récentes** du dashboard et l'onglet **Jarvis**.

2. **Mode ChatGPT (optionnel)** — si le message ne correspond à aucune commande, et qu'une clé OpenAI est configurée, Jarvis répond librement avec le contexte CRM complet (missions, stats, tâches mail importées).

Pour activer le vrai mode ChatGPT :

```powershell
$env:OPENAI_API_KEY="sk-..."
$env:OPENAI_MODEL="gpt-5.5"
npm start
```

Ou double-clique sur `setup-openai-key.bat` (crée un `.env` local, ignoré par Git).

Sans clé, Jarvis reste 100% fonctionnel pour les automations ci-dessus, avec un message d'aide au lieu du chat libre.

## Import mail

```powershell
npm run import-mail -- --payload chemin/vers/payload.json
```

Le script `scripts/viral-mail-importer.js` transforme un export de mails (tâches, tournages, contacts) en missions CRM, en dédupliquant par identifiant de message.

## Fonctionnalités

- **Radar (dashboard)** : métriques clés, priorités du jour, échéances à venir, journal des automations, répartition du pipeline.
- **Missions (pipeline)** : board par étape (à clarifier → à relancer → en cours → bloqué → fait).
- **Agenda** : toutes les missions actives triées par échéance, retards mis en évidence.
- **Dossiers (contacts)** : recherche par nom/société, fiche détaillée.
- **Revenus** : pipeline actif, montant facturé, répartition par étape et par mois.
- **Jarvis** : chat + commandes automatisées + journal d'activité.
- **Profil** : nom, rôle, nom du workspace, tagline, semaine active.
- Stockage local dans `data/*.json` (créé automatiquement au premier lancement, données de démo pré-remplies).

## Structure

```
server.js              serveur HTTP natif (aucune dépendance), API + fichiers statiques
public/                 front (index.html, styles.css, app.js)
scripts/                import de mails
data/                   stockage JSON local (ignoré par Git)
```

## Limite connue

L'app nécessite le serveur Node pour fonctionner (API `/api/*`). Le workflow GitHub Pages fourni déploie le dossier `public`, mais sans serveur Node actif les appels API échoueront en ligne — GitHub Pages n'est donc pas adapté tel quel pour cette version. Utilisation prévue : local, ou hébergement Node (Render, Railway, VPS...).
