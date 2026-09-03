# Scraping avec Flaresolverr + n8n + docker

Scraper n'importe quelle site web pour extraire les informations que vous voulez. **Flaresolverr** est un proxy qui permet de bypass les protections cloudflare(capcha, etc...)

Pour avoir plus de detail sur Flaresolver va sur ce lien : https://github.com/Mendrika-Randriamora/FlareSolverr

# Fonctionnement 
n8n -> flaresolver -> Internet(site web)
- n8n donne a flaresolver l'url du site a scraper 
- flaresolver fait le reste et renvoie le html complet de l'url

# Instalation et lancement 
```bash
docker compose up
```
# A savoir
- Si vous etes sur windows, verifiez le fichier yml et changer le chemin du volume 
- n8n va utiliser l'emplacement de base (par default), si vous voulez specifier une volume changez le fichier docker-compose.yml
