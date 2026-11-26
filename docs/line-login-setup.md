# LINE Login — configuration de production

Le client K-App utilise le fournisseur Supabase `custom:line`, le même flux
OAuth PKCE et le même retour mobile que Google et Microsoft. Aucun Channel
Secret ne doit être placé dans le dépôt, dans EAS ou dans une variable
`EXPO_PUBLIC_*`.

Les trois images `assets/images/line-login-*.png` proviennent des variantes
Android `xxdpi` (base, press, disabled) du
[kit officiel LINE Login](https://developers.line.biz/en/docs/line-login/login-button/).
Le bouton reprend les couleurs exactes de ces images : `#4CC764` au repos et
`#358B46` à l’appui.

## 1. LINE Developers Console

1. Dans [LINE Developers Console](https://developers.line.biz/console/),
   choisir ou créer un provider, puis créer un canal **LINE Login**. Choisir
   **Web app** comme type d’application : le navigateur est envoyé à LINE par
   Supabase, même si K-App est installée sur Android. Renseigner le nom,
   l’icône, la description, les liens de confidentialité et de conditions.
2. Dans **Basic settings**, relever le **Channel ID** et le **Channel Secret**.
   Les saisir uniquement dans la configuration serveur du fournisseur
   Supabase. Le secret ne doit jamais être copié dans l’application.
3. Dans **LINE Login > Callback URL**, saisir exactement :

   `https://cyinmwpuwycobxctqokl.supabase.co/auth/v1/callback`

   Vérifier que cette valeur est identique à la **Callback URL** affichée par
   Supabase lors de la création du fournisseur personnalisé. Le schéma
   `kapp://` ne doit pas être saisi comme callback LINE : LINE revient d’abord
   à Supabase.
4. Pour des essais quand le canal est en état **Developing**, ajouter les
   comptes de test comme membres du canal et utiliser un compte LINE lié à un
   compte développeur autorisé. Après validation, publier le canal depuis son
   état **Developing** pour ouvrir la connexion aux utilisateurs.

## 2. Supabase Auth

1. Dans **Authentication > Providers > New Provider**, créer un fournisseur
   personnalisé **Manual configuration (OAuth2)** nommé `LINE`, avec
   l’identifiant exact `custom:line`.
2. Renseigner le Channel ID comme **Client ID** et le Channel Secret comme
   **Client Secret**, puis les endpoints :

   - Authorization URL : `https://access.line.me/oauth2/v2.1/authorize`
   - Token URL : `https://api.line.me/oauth2/v2.1/token`
   - UserInfo URL : `https://api.line.me/oauth2/v2.1/userinfo`
   - Scopes : `openid profile` (ou les deux valeurs séparées si l’interface
     demande une liste).

3. Activer **email_optional = true** dans les options du fournisseur. Si ce
   réglage n’est pas visible dans le formulaire, créer ou modifier le
   fournisseur depuis un environnement serveur sécurisé avec
   `supabase.auth.admin.customProviders.createProvider` ou
   `updateProvider`. Ne jamais appeler l’API d’administration depuis
   l’application. Exemple de valeurs à saisir :

   ```js
   {
     provider_type: "oauth2",
     identifier: "custom:line",
     name: "LINE",
     client_id: "<Channel ID>",
     client_secret: "<Channel Secret>",
     authorization_url: "https://access.line.me/oauth2/v2.1/authorize",
     token_url: "https://api.line.me/oauth2/v2.1/token",
     userinfo_url: "https://api.line.me/oauth2/v2.1/userinfo",
     scopes: ["openid", "profile"],
     email_optional: true
   }
   ```

4. Dans **Authentication > URL Configuration > Redirect URLs**, autoriser
   exactement `kapp://account?action=oauth-login-line`. Conserver les
   redirections Google et Microsoft. Le navigateur OAuth retourne d’abord à
   Supabase puis Supabase redirige vers ce deep link dans l’APK.
5. Activer le fournisseur et contrôler que les paramètres enregistrés gardent
   l’identifiant `custom:line` et `email_optional = true`.

Avant cette activation, K-App vérifie la réponse de Supabase et affiche un
message de configuration dans l’écran Compte, sans ouvrir la page d’erreur
brute du navigateur.

### Adresse e-mail

Dans **LINE Login > Basic settings > OpenID Connect > Email address
permission**, faire une demande d’accès si une évolution du produit doit
utiliser l’e-mail. LINE demande notamment une capture expliquant la collecte et
son usage. Après acceptation, le scope `email` peut être demandé.

Le flux OAuth2 personnalisé actuel lit l’endpoint `userinfo` de LINE. Cet
endpoint fournit `sub` (identifiant LINE), `name` et `picture` avec les
scopes ci-dessus, mais ne fournit pas l’e-mail. L’autorisation e-mail seule ne
le rend donc pas disponible dans K-App. LINE le place dans le jeton ID ; le
parcours web signe ce jeton en HS256, tandis que le mode OIDC personnalisé de
Supabase décrit une vérification par JWKS. Ne pas basculer ce fournisseur en
mode OIDC sans validation de cette compatibilité dans Supabase. Une prise en
charge future de l’e-mail demanderait une validation serveur du jeton ID ou un
support OIDC compatible confirmé. Aucun e-mail fictif n’est créé.

La table `public.profiles` de K-App n’exige que l’UUID Supabase. Le nom et
l’avatar, lorsqu’ils sont transmis, sont lus dans les métadonnées de
`auth.getUser()` et affichés sur l’écran Compte ; la ligne e-mail est masquée
si elle manque. La progression reste liée à l’UUID Supabase.

## 3. Validation sur APK Android

Une fois le canal et Supabase configurés, installer une **build APK réelle**
sur un téléphone. Depuis une session invitée, vérifier :

1. Première connexion LINE, retour automatique à K-App, apparition d’une
   session permanente, du nom et de l’avatar si disponibles, et synchronisation
   de la progression.
2. Fermeture forcée puis relance : reconnexion automatique sans nouveau login.
   Déconnexion : retour à une session invitée, puis connexion au même compte
   LINE : récupération de la progression.
3. Annulation du navigateur ou refus LINE, absence de réseau, fournisseur
   désactivé, callback invalide et appuis répétés.
4. Connexions Google et Microsoft ainsi que le retour depuis Premium.

Les tests automatisés locaux simulent le callback Supabase ; ils ne prouvent
pas le fonctionnement du canal LINE, de Supabase hébergé ou de l’APK.

Sources : [Supabase Custom OAuth/OIDC Providers](https://supabase.com/docs/guides/auth/custom-oauth-providers),
[LINE Login API](https://developers.line.biz/en/reference/line-login/),
[LINE Login et e-mail](https://developers.line.biz/en/docs/line-login/integrate-line-login/),
[LINE ID tokens](https://developers.line.biz/en/docs/line-login/verify-id-token/).
