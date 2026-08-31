export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalContent {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const privacyContent: LegalContent = {
  title: "Politique de confidentialité",
  lastUpdated: "10 août 2026",
  sections: [
    {
      heading: "Contexte",
      body: "Ce service est développé dans le cadre d'un projet étudiant (école 42) et n'a pas de vocation commerciale. Les données décrites ci-dessous ne sont traitées que pour permettre le fonctionnement de l'application.",
    },
    {
      heading: "Données collectées",
      body: "Lors de l'inscription et de l'utilisation du service, nous collectons : votre adresse email, votre pseudo, votre mot de passe (haché, jamais stocké en clair), votre nom affiché, votre avatar, votre bio, votre statut en ligne, votre liste d'amis, ainsi que les messages et fichiers que vous échangez dans les discussions et les groupes.",
    },
    {
      heading: "Authentification et sécurité",
      body: "Votre mot de passe est haché avec Argon2 après application d'un pepper géré par un coffre-fort de secrets (Vault) ; il n'est jamais stocké ni transmis en clair. La connexion repose sur des cookies sécurisés (httpOnly) : un jeton de courte durée (15 minutes) et un jeton de renouvellement (7 jours). Aucune donnée d'authentification n'est stockée dans le stockage local du navigateur. Une authentification à deux facteurs (2FA) est disponible pour renforcer la sécurité de votre compte.",
    },
    {
      heading: "Cookies",
      body: "Seuls des cookies techniques strictement nécessaires à la connexion sont utilisés. Aucun cookie de mesure d'audience, de publicité ou de tracking n'est déposé.",
    },
    {
      heading: "Journaux techniques",
      body: "Notre infrastructure enregistre des métriques agrégées (nombre de requêtes, erreurs, temps de réponse) et l'adresse IP à des fins de supervision et de sécurité. Ces journaux ne sont pas utilisés pour établir un profil individuel de votre activité.",
    },
    {
      heading: "Partage des données",
      body: "Vos données ne sont partagées avec aucun service tiers. Elles restent hébergées et traitées au sein de l'infrastructure du projet.",
    },
    {
      heading: "Durée de conservation",
      body: "Vos données sont conservées tant que votre compte existe. Vous pouvez demander leur suppression à tout moment via le contact ci-dessous.",
    },
    {
      heading: "Vos droits",
      body: "Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour l'exercer, contactez-nous à l'adresse indiquée ci-dessous.",
    },
    {
      heading: "Contact",
      body: "Pour toute question relative à cette politique ou à vos données personnelles : contact@ft-transcendence.local",
    },
  ],
};

export const termsContent: LegalContent = {
  title: "Conditions d'utilisation",
  lastUpdated: "10 août 2026",
  sections: [
    {
      heading: "Objet",
      body: "Ce service est une plateforme sociale de messagerie, développée dans un cadre pédagogique, permettant à ses utilisateurs d'échanger des messages privés et au sein de groupes de discussion.",
    },
    {
      heading: "Acceptation des conditions",
      body: "En créant un compte, vous acceptez sans réserve les présentes conditions d'utilisation.",
    },
    {
      heading: "Compte utilisateur",
      body: "Vous vous engagez à fournir des informations exactes lors de votre inscription et à ne créer qu'un seul compte par personne. Vous êtes responsable de la confidentialité de votre mot de passe et, si vous l'activez, de votre authentification à deux facteurs.",
    },
    {
      heading: "Règles de conduite",
      body: "Vous vous engagez à respecter les autres utilisateurs dans vos échanges. Tout propos injurieux, harcelant, discriminatoire ou plus largement illicite est interdit et peut faire l'objet d'une modération.",
    },
    {
      heading: "Contenus publiés",
      body: "Vous restez seul responsable des messages, de votre bio et de tout contenu que vous publiez sur le service.",
    },
    {
      heading: "Modération et suspension",
      body: "Un compte ne respectant pas ces règles peut être supprimé par un administrateur du service.",
    },
    {
      heading: "Disponibilité du service",
      body: "Ce service est fourni « en l'état », dans le cadre d'un projet étudiant, sans garantie de continuité ou de disponibilité.",
    },
    {
      heading: "Modification des conditions",
      body: "Ces conditions peuvent évoluer. La date de dernière mise à jour est indiquée en haut de cette page.",
    },
    {
      heading: "Contact",
      body: "Pour toute question relative à ces conditions : contact@ft-transcendence.local",
    },
  ],
};
