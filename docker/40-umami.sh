#!/bin/sh
# Zet bezoekersstatistieken (Umami) aan als UMAMI_HOST en UMAMI_WEBSITE_ID gezet zijn.
# Zonder die variabelen verandert er niets: geen script in de pagina en geen externe bronnen in de CSP.
# Optioneel: UMAMI_DOMAINS (bijvoorbeeld clickfarm.nl) om alleen op die domeinen te tellen.
set -eu

snippet=/etc/nginx/conf.d/umami.snippet
rm -f "$snippet"

host="${UMAMI_HOST:-}"
id="${UMAMI_WEBSITE_ID:-}"
domains="${UMAMI_DOMAINS:-}"

if [ -z "$host" ] && [ -z "$id" ]; then
  exit 0
fi

# Alleen veilige waarden: ze komen letterlijk in de HTML en de CSP terecht
host="${host%/}"
if ! printf '%s' "$host" | grep -Eq '^https://[A-Za-z0-9.-]+(:[0-9]+)?$'; then
  echo "40-umami.sh: UMAMI_HOST ongeldig (verwacht https://host), statistieken staan uit" >&2
  exit 0
fi
if ! printf '%s' "$id" | grep -Eq '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'; then
  echo "40-umami.sh: UMAMI_WEBSITE_ID ongeldig (verwacht een UUID), statistieken staan uit" >&2
  exit 0
fi
if [ -n "$domains" ] && ! printf '%s' "$domains" | grep -Eq '^[A-Za-z0-9.-]+(,[A-Za-z0-9.-]+)*$'; then
  echo "40-umami.sh: UMAMI_DOMAINS ongeldig (verwacht domein,domein), statistieken staan uit" >&2
  exit 0
fi

attrs="data-website-id=\"$id\" data-do-not-track=\"true\""
[ -n "$domains" ] && attrs="$attrs data-domains=\"$domains\""

cat > "$snippet" <<CONF
set \$umami_src "$host";
sub_filter_once on;
sub_filter '</head>' '<script defer src="$host/script.js" $attrs></script></head>';
CONF
echo "40-umami.sh: statistieken via $host staan aan"
