import { HANGUL_MODULES } from "./curriculum";

type SceneCopy = {
  description?: string;
  instruction?: string;
};

const SCENE_COPY: Record<string, SceneCopy> = {
  "hangul_vowels_basic:blocks": {
    description:
      "En coréen, les lettres ne se suivent pas simplement sur une ligne : elles se regroupent dans un petit bloc carré. Pour commencer, retiens qu’une syllabe contient au minimum une consonne initiale et une voyelle.",
    instruction:
      "Garde la romanisation comme une béquille temporaire. Ce qui compte ici, c’est de regarder la direction de la voyelle pour comprendre comment le bloc se construit.",
  },
  "hangul_vowels_basic:core-vowels": {
    description:
      "Ces six voyelles sont tes grands repères. Une fois leurs formes et leurs sons bien installés, le reste du système vocalique devient beaucoup plus facile à lire.",
    instruction:
      "Écoute-les plusieurs fois et résiste au réflexe de lire eo, eu ou u comme en français. Fais confiance au son coréen plutôt qu’aux lettres latines.",
  },
  "hangul_vowels_basic:y-vowels": {
    description:
      "Le principe est très régulier : quand un second petit trait apparaît, la voyelle prend un départ en y. Tu peux donc apprendre ces quatre formes par comparaison plutôt que séparément.",
    instruction:
      "Mets les paires côte à côte : ㅏ/ㅑ, ㅓ/ㅕ, ㅗ/ㅛ et ㅜ/ㅠ. C’est le moyen le plus simple de voir et d’entendre ce que le deuxième trait change.",
  },
  "hangul_consonants_basic:simple-a": {
    description:
      "Voici cinq consonnes que tu vas retrouver partout. L’objectif n’est pas de leur coller une lettre française parfaite, mais de reconnaître leur geste et leur son de base.",
    instruction:
      "Regarde la forme, puis écoute le bloc modèle avec ㅏ. Essaie surtout de mémoriser la sensation du son, pas seulement la romanisation.",
  },
  "hangul_consonants_basic:simple-b": {
    description:
      "Avec cette deuxième série, tu complètes les dix consonnes simples. Certaines demandent un peu plus d’attention parce qu’elles ne se superposent pas parfaitement à un son français.",
    instruction:
      "Sois particulièrement attentif à ㄹ et rappelle-toi que ㅇ n’a pas le même rôle au début et à la fin d’un bloc.",
  },
  "hangul_consonants_basic:aspirated": {
    description:
      "Ces quatre consonnes reprennent les séries ㄱ, ㄷ, ㅂ et ㅈ, mais avec un souffle nettement plus présent. C’est ce souffle qui doit devenir ton repère.",
    instruction:
      "Place une main devant ta bouche pendant l’écoute : tu dois sentir plus d’air. Cette sensation aide souvent davantage que la romanisation.",
  },
  "hangul_consonants_basic:cv-reading": {
    description:
      "Tu as maintenant assez de consonnes et de voyelles pour lire de vrais blocs CV. Ici, on assemble ce que tu connais déjà au lieu d’ajouter une nouvelle règle.",
    instruction:
      "Essaie d’abord de lire seul. Lance ensuite l’audio pour vérifier ton décodage, pas pour deviner la réponse à ta place.",
  },
  "hangul_consonants_tense:tense-letters": {
    description:
      "Quand la consonne est doublée, l’attaque devient plus serrée. Ce n’est pas simplement une consonne prononcée plus fort : c’est une autre manière de démarrer le son.",
    instruction:
      "Écoute surtout le début de la syllabe. Le bon repère est cette attaque courte et sèche, sans souffle marqué.",
  },
  "hangul_consonants_tense:three-way": {
    description:
      "C’est l’un des contrastes importants du coréen : une même famille peut avoir une attaque simple, tendue ou aspirée. Tu vas les comparer directement pour que l’oreille apprenne la différence.",
    instruction:
      "Tous les exemples utilisent ㅏ : 가/까/카, 다/따/타, 바/빠/파 et 자/짜/차. Ne cherche pas seulement une lettre latine : écoute la qualité de l’attaque et la présence ou non de souffle.",
  },
  "hangul_consonants_tense:tense-reading": {
    description:
      "Ces mots sont construits uniquement avec des caractères que tu as déjà vus. Le défi consiste maintenant à repérer la consonne tendue au milieu d’une vraie lecture.",
    instruction:
      "Lis d’abord sans romanisation, puis écoute. Si tu hésites, reviens à la première syllabe et concentre-toi sur son attaque.",
  },
  "hangul_vowels_compound:e-vowels": {
    description:
      "Pour ㅐ/ㅔ et ㅒ/ㅖ, l’orthographe est souvent un meilleur repère que l’oreille en coréen moderne. Ici, tu apprends donc surtout à reconnaître leur forme dans les mots.",
    instruction:
      "Écoute pour te familiariser avec leur son, mais ne te force pas à distinguer ㅐ de ㅔ uniquement à l’oreille. Observe la forme et mémorise l’orthographe du mot.",
  },
  "hangul_vowels_compound:w-vowels": {
    description:
      "Ces voyelles combinent deux mouvements. Certaines, notamment ㅙ, ㅚ et ㅞ, peuvent être très proches à l’oral moderne : leur forme écrite reste donc ton repère le plus fiable.",
    instruction:
      "Décompose visuellement chaque voyelle avant de la lire. L’écoute sert à ancrer le mot, pas à départager à tout prix ㅙ, ㅚ et ㅞ.",
  },
  "hangul_vowels_compound:compound-reading": {
    description:
      "Tu vas maintenant relire des mots avec l’alphabet que tu connais déjà, y compris les voyelles composées. Aucune nouvelle finale n’est ajoutée ici.",
    instruction:
      "Commence directement par le hangul, sans aide latine. Si un bloc te ralentit, isole sa voyelle composée puis relis le mot d’un seul mouvement.",
  },
  "hangul_batchim:cvc-structure": {
    description:
      "Le batchim est la consonne qui vient fermer le bloc en se plaçant sous la partie consonne + voyelle. Visuellement, le bloc reste carré, mais il gagne un étage en bas.",
    instruction:
      "Construis d’abord 가, puis ajoute la consonne finale sous le bloc. Pense vraiment en deux temps : le bloc CV, puis sa fermeture.",
  },
  "hangul_batchim:simple-final-spellings": {
    description:
      "En finale, plusieurs consonnes écrites différemment se regroupent autour de seulement sept réalisations essentielles. C’est pour cela qu’il faut distinguer l’orthographe du son réellement entendu.",
    instruction:
      "Écoute les graphies avec ㅏ pour bien les identifier, puis retiens leur famille finale. Pour ㅇ, l’exemple 앙 te fait entendre clairement le son ng en fin de bloc.",
  },
  "hangul_batchim:batchim-reading": {
    description:
      "Avant de chercher le sens d’un mot fermé, prends l’habitude de repérer ce qui se trouve tout en bas du dernier bloc. Le batchim te dit comment la syllabe se termine.",
    instruction:
      "Décodage d’abord, traduction ensuite. Lis la syllabe jusqu’à sa finale avant de laisser le sens du mot prendre le dessus.",
  },
  "hangul_batchim:liaison": {
    description:
      "Quand la syllabe suivante commence par ㅇ, qui est muet en position initiale, le son final précédent peut se rattacher à la voyelle suivante. À l’oreille, les deux blocs s’enchaînent alors beaucoup plus naturellement.",
    instruction:
      "Reste ici sur cette première liaison devant ㅇ initial. Les batchim doubles et les règles plus avancées viendront plus tard : inutile de tout mélanger dès maintenant.",
  },
};

const CARD_EXPLANATIONS: Record<string, string> = {
  "hangul_vowels_basic:blocks:block-a":
    "Avec une voyelle verticale comme ㅏ, ㅇ vient naturellement à sa gauche. Lis le bloc comme une seule syllabe : 아.",
  "hangul_vowels_basic:blocks:block-o":
    "Avec une voyelle horizontale comme ㅗ, ㅇ se place au-dessus. Les deux éléments forment alors le bloc 오.",
  "hangul_vowels_basic:blocks:guardian":
    "Au début d’un bloc, ㅇ sert simplement à donner une place à la voyelle : il ne produit aucun son. C’est pour cela que 아 commence directement par le son de ㅏ.",
  "hangul_vowels_basic:core-vowels:a":
    "C’est un a bien ouvert, très proche du a de « ami ». Tu peux partir de ce repère français sans trop déformer le son.",
  "hangul_vowels_basic:core-vowels:eo":
    "Il n’existe pas d’équivalent français exact. Garde la mâchoire détendue et la langue un peu en arrière, puis laisse l’audio devenir ton vrai repère.",
  "hangul_vowels_basic:core-vowels:o":
    "Arrondis les lèvres pour produire ce o. Visuellement, le petit trait placé au-dessus te permet aussi de le distinguer rapidement.",
  "hangul_vowels_basic:core-vowels:u":
    "Attention à la romanisation : ici, u se lit comme « ou », jamais comme le u français. L’audio de 우 est le repère à garder en tête.",
  "hangul_vowels_basic:core-vowels:eu":
    "Le son se fait avec les lèvres non arrondies et la langue reculée. Ne cherche pas un « eu » français parfait : écoute surtout la position plus neutre de la bouche.",
  "hangul_vowels_basic:core-vowels:i":
    "C’est le repère le plus simple : un i clair, comme dans « idée ». Associe directement cette forme verticale au son i.",
  "hangul_vowels_basic:y-vowels:ya":
    "Pars de ㅏ et remarque le deuxième petit trait : il ajoute un départ en y. ㅑ se lit donc ya.",
  "hangul_vowels_basic:y-vowels:yeo":
    "C’est la version en y de ㅓ. Si ㅓ est déjà familier, pense simplement à lui ajouter cette petite attaque en y : ㅕ.",
  "hangul_vowels_basic:y-vowels:yo":
    "Même logique avec ㅗ : le deuxième trait ajoute le départ en y. ㅛ se lit donc yo.",
  "hangul_vowels_basic:y-vowels:yu":
    "C’est ㅜ avec un départ en y. La romanisation yu se rapproche ici de « you » et l’audio de 유 te donne le bon repère.",
  "hangul_vowels_basic:y-vowels:ai":
    "Lis le mot bloc par bloc : 아 puis 이. En les enchaînant naturellement, tu obtiens 아이.",
  "hangul_vowels_basic:y-vowels:oi":
    "Le mot se décode très simplement en deux blocs déjà connus : 오 + 이. Enchaîne-les sans ajouter de son entre les deux.",
  "hangul_vowels_basic:y-vowels:uyu":
    "우유 se lit en deux temps : 우 puis 유. Le deuxième bloc te permet justement de retrouver la voyelle en y ㅠ.",
  "hangul_vowels_basic:y-vowels:yeou":
    "Décompose d’abord 여 + 우. Une fois les deux blocs reconnus, relis-les d’un seul mouvement : 여우.",

  "hangul_consonants_basic:simple-a:g":
    "Pour ㄱ, le dos de la langue vient toucher le palais. Le résultat reste plus doux que le k fortement aspiré que tu verras avec ㅋ.",
  "hangul_consonants_basic:simple-a:n":
    "Pour ㄴ, la pointe de la langue vient au contact des dents du haut. Le geste est simple et te donne un n très stable à reconnaître.",
  "hangul_consonants_basic:simple-a:d":
    "La langue ferme brièvement le passage de l’air, puis le relâche. C’est ce geste court qui donne à ㄷ sa couleur entre d et t selon le contexte.",
  "hangul_consonants_basic:simple-a:m":
    "Ici, le repère est très concret : les lèvres se ferment complètement. C’est cette fermeture qui produit le son m de ㅁ.",
  "hangul_consonants_basic:simple-a:b":
    "Les lèvres se ferment puis s’ouvrent sans forte aspiration. Garde surtout cette absence de gros souffle pour reconnaître ㅂ.",
  "hangul_consonants_basic:simple-b:r":
    "ㄹ change légèrement de couleur selon sa place : entre deux voyelles, il se rapproche d’un r bref et battu ; en finale, il sonne plutôt comme l.",
  "hangul_consonants_basic:simple-b:s":
    "ㅅ donne un s, mais devant ㅣ et les voyelles en y il se rapproche naturellement d’un son « ch ». Écoute bien ce changement plutôt que de forcer un s français partout.",
  "hangul_consonants_basic:simple-b:j":
    "ㅈ commence par une petite fermeture puis un relâchement doux, avec peu de souffle. C’est cette attaque affriquée mais souple qu’il faut reconnaître.",
  "hangul_consonants_basic:simple-b:h":
    "Pour ㅎ, le son repose surtout sur un souffle produit dans la gorge. Laisse passer l’air au lieu d’essayer de fabriquer une consonne trop dure.",
  "hangul_consonants_basic:aspirated:k":
    "ㅋ appartient à la même famille que ㄱ, mais avec un souffle nettement plus marqué. C’est cette bouffée d’air qui doit te faire reconnaître le k aspiré.",
  "hangul_consonants_basic:aspirated:t":
    "ㅌ reprend la famille de ㄷ avec davantage d’aspiration. Écoute le souffle au moment où la syllabe démarre : c’est le meilleur indice.",
  "hangul_consonants_basic:aspirated:p":
    "ㅍ est la version aspirée de la famille de ㅂ. Les lèvres s’ouvrent avec un souffle bien plus net que pour ㅂ.",
  "hangul_consonants_basic:aspirated:ch":
    "ㅊ reprend l’attaque de la famille de ㅈ, mais avec une aspiration franche. Compare 자 et 차 pour sentir immédiatement la différence de souffle.",
  "hangul_consonants_basic:cv-reading:nabi":
    "Découpe d’abord 나 + 비. Une fois les deux blocs reconnus, lis-les ensemble : 나비.",
  "hangul_consonants_basic:cv-reading:moja":
    "모자 se lit bloc par bloc : 모 puis 자. Tu n’as besoin d’aucune nouvelle règle, seulement des sons déjà étudiés.",
  "hangul_consonants_basic:cv-reading:gicha":
    "Lis 기 puis 차. Le deuxième bloc est aussi une bonne occasion de retrouver le souffle de ㅊ dans un vrai mot.",
  "hangul_consonants_basic:cv-reading:bada":
    "Le mot se construit avec 바 + 다. Lis chaque bloc clairement, puis rapproche-les pour obtenir 바다.",
  "hangul_consonants_basic:cv-reading:haru":
    "하루 se décompose en 하 + 루. La deuxième syllabe te fait aussi revoir ㄹ entre deux voyelles.",

  "hangul_consonants_tense:tense-letters:kk":
    "ㄲ démarre avec une attaque serrée et sans souffle marqué. Ne cherche pas à prononcer simplement ㄱ plus fort : écoute surtout la tension au départ.",
  "hangul_consonants_tense:tense-letters:tt":
    "ㄸ reprend la famille de ㄷ, mais avec une attaque plus tendue et compacte. Le son part d’un coup, sans le souffle de ㅌ.",
  "hangul_consonants_tense:tense-letters:pp":
    "ㅃ reprend la famille de ㅂ avec une attaque beaucoup plus serrée. Les lèvres libèrent le son sans l’aspiration nette de ㅍ.",
  "hangul_consonants_tense:tense-letters:ss":
    "Avec ㅆ, la friction est plus serrée que pour ㅅ. Concentre-toi sur cette tension du son plutôt que sur la simple idée d’un s « plus fort ».",
  "hangul_consonants_tense:tense-letters:jj":
    "ㅉ est la version tendue de la famille de ㅈ. L’attaque est plus compacte, avec beaucoup moins de souffle que ㅊ.",
  "hangul_consonants_tense:three-way:kg":
    "Écoute la même famille dans l’ordre simple, tendu, aspiré : 가 · 까 · 카. Ce sont surtout l’attaque et le souffle qui permettent de les séparer.",
  "hangul_consonants_tense:three-way:td":
    "다 · 따 · 타 présentent la même opposition : simple, tendue, aspirée. Compare-les à la suite plutôt que d’essayer de les mémoriser isolément.",
  "hangul_consonants_tense:three-way:pb":
    "Avec 바 · 빠 · 파, observe comment la même famille change selon que l’attaque est simple, serrée ou nettement aspirée.",
  "hangul_consonants_tense:three-way:jch":
    "자 · 짜 · 차 forment une série très utile à comparer : attaque simple, attaque tendue, puis attaque aspirée.",
  "hangul_consonants_tense:tense-reading:kkori":
    "꼬리 commence par 꼬 : repère bien ㄲ avant de poursuivre vers 리. Le mot te fait entendre la tension dans une lecture réelle.",
  "hangul_consonants_tense:tense-reading:ttada":
    "따다 se lit 따 + 다. Le contraste entre ㄸ au début et ㄷ ensuite est justement ce qu’il faut écouter.",
  "hangul_consonants_tense:tense-reading:appa":
    "아빠 se découpe en 아 + 빠. La consonne tendue ㅃ apparaît au début du deuxième bloc.",
  "hangul_consonants_tense:tense-reading:ssada":
    "싸다 commence par 싸 : identifie d’abord ㅆ, puis poursuis avec 다. La première attaque est le point clé.",
  "hangul_consonants_tense:tense-reading:jjada":
    "짜다 se lit 짜 + 다. Le premier bloc contient ㅉ : c’est lui qui donne l’attaque tendue du mot.",

  "hangul_vowels_compound:e-vowels:ae":
    "ㅐ s’écrit comme la combinaison de ㅏ et ㅣ. En coréen moderne, sa prononciation est très souvent la même que ㅔ : retiens donc surtout sa forme et l’orthographe des mots.",
  "hangul_vowels_compound:e-vowels:e":
    "ㅔ s’écrit comme ㅓ + ㅣ. À l’oral moderne, la différence avec ㅐ est souvent absente, donc ne compte pas uniquement sur ton oreille pour les distinguer.",
  "hangul_vowels_compound:e-vowels:yae":
    "ㅒ reprend la forme de ㅑ avec ㅣ. Dans l’usage courant, il est souvent prononcé comme ㅖ : l’écriture du mot est donc un repère important.",
  "hangul_vowels_compound:e-vowels:ye":
    "ㅖ s’écrit comme ㅕ + ㅣ. Retiens surtout sa silhouette et les mots qui l’emploient, car l’oreille ne suffit pas toujours à le distinguer de ㅒ.",
  "hangul_vowels_compound:e-vowels:oe":
    "ㅚ est aujourd’hui très souvent prononcé comme « we ». Ne te laisse donc pas piéger par la romanisation oe : reconnais d’abord la voyelle écrite.",
  "hangul_vowels_compound:w-vowels:wa":
    "ㅘ combine ㅗ et ㅏ. En la regardant comme ces deux éléments réunis, sa forme devient beaucoup plus facile à mémoriser.",
  "hangul_vowels_compound:w-vowels:wae":
    "ㅙ combine ㅗ et ㅐ. Garde cette construction visuelle en tête, surtout parce que plusieurs sons en « we » peuvent se rapprocher à l’oral.",
  "hangul_vowels_compound:w-vowels:wo":
    "ㅝ combine ㅜ et ㅓ. Repérer d’abord ㅜ puis le mouvement vers ㅓ aide à lire la voyelle sans passer par la romanisation.",
  "hangul_vowels_compound:w-vowels:we":
    "ㅞ combine ㅜ et ㅔ. Sa forme écrite est un repère précieux lorsque le son se rapproche de ㅙ ou ㅚ.",
  "hangul_vowels_compound:w-vowels:wi":
    "ㅟ combine ㅜ et ㅣ et se rapproche de « oui ». Commence par reconnaître sa construction, puis laisse l’audio fixer le son.",
  "hangul_vowels_compound:w-vowels:ui":
    "ㅢ change selon sa position et son rôle : à l’initiale, ㅡ glisse vers ㅣ ; après une consonne, il se réduit souvent vers i ; la particule 의 se prononce souvent é. Ici, retiens surtout qu’il n’a pas une seule réalisation figée.",
  "hangul_vowels_compound:compound-reading:sagwa":
    "사과 se découpe en 사 + 과. Le deuxième bloc 과 te permet de reconnaître ㅘ dans un vrai mot.",
  "hangul_vowels_compound:compound-reading:uisa":
    "의사 commence par 의, qui contient ㅢ, puis se poursuit avec 사. Lis d’abord les deux blocs séparément avant de les enchaîner.",
  "hangul_vowels_compound:compound-reading:segye":
    "세계 se lit 세 + 계, avec ㅖ dans 계. En prononciation soignée on peut entendre segye ; à l’oral moderne, 계 sonne souvent très proche de 게, donc sege.",
  "hangul_vowels_compound:compound-reading:word-wae":
    "왜 tient dans un seul bloc et contient ㅙ. C’est justement l’orthographe qui te permet de le distinguer des autres voyelles au son proche.",
  "hangul_vowels_compound:compound-reading:oegyo":
    "외교 se décompose en 외 + 교. Le premier bloc contient ㅚ : reconnais d’abord sa forme avant de t’appuyer sur le son.",
  "hangul_vowels_compound:compound-reading:word-wi":
    "위 est un seul bloc construit avec ㅟ. Repère cette voyelle composée avant de lancer l’audio.",

  "hangul_batchim:cvc-structure:k":
    "Dans 각, ㄱ ferme la syllabe avec un son de type k coupé : le son s’arrête sans relâchement audible. Ne rajoute pas une petite voyelle après.",
  "hangul_batchim:cvc-structure:n":
    "Dans 간, ㄴ ferme directement la syllabe. La langue reste en position pour terminer le son n sans ajouter quoi que ce soit derrière.",
  "hangul_batchim:cvc-structure:t":
    "Dans 갇, ㄷ donne un t final coupé et non relâché. La syllabe s’arrête net au lieu de produire un t français bien détaché.",
  "hangul_batchim:cvc-structure:l":
    "Dans 갈, ㄹ ferme la syllabe avec une valeur proche de l. La langue reste en contact au moment où le bloc se termine.",
  "hangul_batchim:cvc-structure:m":
    "Dans 감, ㅁ ferme la syllabe en refermant les lèvres. Le m final fait vraiment partie du même bloc.",
  "hangul_batchim:cvc-structure:p":
    "Dans 갑, ㅂ ferme le son comme un p coupé. Les lèvres se ferment, mais sans relâcher une nouvelle syllabe derrière.",
  "hangul_batchim:cvc-structure:ng":
    "Dans 강, ㅇ n’est plus muet : en finale, il donne le son ng. Le son résonne au fond de la bouche et ferme le bloc.",
  "hangul_batchim:simple-final-spellings:fg-k":
    "En finale, ㄱ, ㄲ et ㅋ se rejoignent dans la même famille de son ㄱ, avec une fermeture de type k coupé. L’écriture change, mais la réalisation finale se regroupe.",
  "hangul_batchim:simple-final-spellings:fg-n":
    "ㄴ conserve en finale une réalisation de type n. Ici, l’écriture et la famille de son restent donc très faciles à relier.",
  "hangul_batchim:simple-final-spellings:fg-t":
    "En finale, ㄷ, ㅅ, ㅆ, ㅈ, ㅊ, ㅌ et ㅎ rejoignent tous la famille ㄷ. Sept graphies différentes peuvent donc aboutir au même t final coupé.",
  "hangul_batchim:simple-final-spellings:fg-l":
    "ㄹ garde en finale une réalisation de type l. Retrouve le même geste de langue que dans les exemples précédents.",
  "hangul_batchim:simple-final-spellings:fg-m":
    "ㅁ se réalise comme m en finale. La fermeture des lèvres te donne un repère très clair à l’écoute.",
  "hangul_batchim:simple-final-spellings:fg-p":
    "ㅂ et ㅍ rejoignent la même famille ㅂ en finale. Dans les deux cas, la syllabe se ferme sur un p coupé.",
  "hangul_batchim:simple-final-spellings:fg-ng":
    "ㅇ donne le son ng lorsqu’il se trouve en finale. C’est l’autre grand rôle de cette consonne, très différent du ㅇ muet en début de bloc.",
  "hangul_batchim:batchim-reading:bap":
    "Dans 밥, le ㅂ placé en bas du bloc ferme la syllabe avec une réalisation de type p. Repère d’abord cette finale avant de lire le mot entier.",
  "hangul_batchim:batchim-reading:jip":
    "집 se termine par ㅂ. Le dernier élément du bloc 집 est donc bien le batchim à identifier avant la lecture complète.",
  "hangul_batchim:batchim-reading:mul":
    "물 se ferme avec ㄹ. Lis d’abord 무, puis laisse ㄹ terminer le même bloc sans créer une syllabe supplémentaire.",
  "hangul_batchim:batchim-reading:bam":
    "밤 se termine par ㅁ : les lèvres se ferment sur le m final. Ce détail permet notamment de le distinguer de 밥.",
  "hangul_batchim:batchim-reading:mun":
    "문 se ferme avec ㄴ. Le n appartient au même bloc que 무 et termine directement la syllabe.",
  "hangul_batchim:batchim-reading:gang":
    "강 se termine par ㅇ, qui se prononce ng en finale. Ici, ㅇ n’est donc plus le gardien muet rencontré au début des syllabes.",
  "hangul_batchim:batchim-reading:ot":
    "옷 s’écrit avec ㅅ en bas du bloc, mais ce ㅅ rejoint la famille de son ㄷ en finale. Distingue bien la graphie écrite du son final réalisé.",
  "hangul_batchim:liaison:meogeo":
    "Dans 먹어, le ㄱ final de 먹 se rattache à la voyelle suivante parce que 어 commence par ㅇ muet. La lecture liée devient naturellement 머거.",
  "hangul_batchim:liaison:jibe":
    "Dans 집에, le ㅂ final passe vers la voyelle de 에. En lecture liée, l’enchaînement devient 지베.",
  "hangul_batchim:liaison:osi":
    "Dans 옷이, le ㅅ écrit en finale se rattache à 이. C’est cette liaison qui donne la lecture 오시.",
  "hangul_batchim:liaison:hangugeo":
    "Dans 한국어, le ㄱ de 국 se rattache à 어, dont le ㅇ initial est muet. À l’oral lié, 한국어 se lit ainsi 한구거.",
};

const QUESTION_EXPLANATIONS: Record<string, string> = {
  "hangul_vowels_basic:blocks:block-vertical":
    "Avec une voyelle verticale, la consonne initiale prend la place de gauche et la voyelle vient à droite. C’est exactement le schéma de 아.",
  "hangul_vowels_basic:blocks:block-horizontal":
    "Avec une voyelle horizontale, la consonne initiale passe au-dessus et la voyelle se place dessous. Pense au bloc 오.",
  "hangul_vowels_basic:blocks:guardian-role":
    "Au début de 아, ㅇ ne se prononce pas : il sert seulement à permettre à ㅏ d’occuper sa place dans le bloc.",
  "hangul_vowels_basic:y-vowels:read-uyu":
    "우유 se lit 우 + 유. Le deuxième bloc contient ㅠ, la voyelle en y que tu viens de travailler.",
  "hangul_vowels_basic:y-vowels:read-yeou":
    "여 + 우 s’enchaînent directement pour former 여우. Lis d’abord les deux blocs, puis rapproche-les.",

  "hangul_consonants_basic:cv-reading:cv-ga":
    "ㅏ est verticale : ㄱ se place à sa gauche, et les deux éléments forment le bloc 가.",
  "hangul_consonants_basic:cv-reading:cv-no":
    "ㅗ est horizontale : ㄴ se place au-dessus, ce qui construit naturellement 노.",
  "hangul_consonants_basic:cv-reading:cv-cha":
    "ㅊ + ㅏ donnent 차. Comme ㅏ est verticale, ㅊ reste à gauche du bloc.",
  "hangul_consonants_basic:cv-reading:cv-nabi":
    "Tu as entendu 나비. Le mot se découpe proprement en 나 + 비, deux blocs que tu sais déjà lire.",
  "hangul_consonants_basic:cv-reading:cv-gicha":
    "기 + 차 forment 기차. Le bon réflexe est de reconnaître chaque bloc avant de les enchaîner.",
  "hangul_consonants_basic:cv-reading:cv-layout":
    "ㅜ est une voyelle horizontale, donc elle se place sous la consonne initiale. Dans 누, elle vient bien sous ㄴ.",
  "hangul_consonants_basic:cv-reading:cv-haru":
    "하루 se lit 하 + 루. Les deux syllabes utilisent uniquement les consonnes et voyelles déjà étudiées.",

  "hangul_consonants_tense:three-way:three-kka":
    "Tu as entendu 까 : l’attaque serrée correspond à ㄲ, la consonne tendue de cette série.",
  "hangul_consonants_tense:three-way:three-ka":
    "Tu as entendu 카 : le souffle nettement marqué te conduit vers ㅋ, la consonne aspirée.",
  "hangul_consonants_tense:three-way:three-da":
    "Tu as entendu 다 : c’est la consonne simple ㄷ, sans la tension de ㄸ ni le souffle de ㅌ.",
  "hangul_consonants_tense:three-way:three-ppa":
    "Tu as entendu 빠 : l’attaque compacte correspond à ㅃ, la consonne tendue de la série.",
  "hangul_consonants_tense:three-way:three-cha":
    "Tu as entendu 차 : le souffle de l’attaque indique ㅊ, la consonne aspirée de la série.",
  "hangul_consonants_tense:three-way:three-ssa":
    "Tu as entendu 싸 : la friction plus serrée correspond à ㅆ, et non au ㅅ simple.",
  "hangul_consonants_tense:tense-reading:tr-appa":
    "아빠 contient ㅃ au début du deuxième bloc 빠. C’est cette attaque tendue qu’il fallait repérer.",
  "hangul_consonants_tense:tense-reading:tr-kkori":
    "꼬리 commence par 꼬, donc par ㄲ. Regarde d’abord le premier bloc avant de lire le mot entier.",
  "hangul_consonants_tense:tense-reading:tr-jja":
    "ㅉ + ㅏ forment 짜. La consonne tendue reste à gauche de la voyelle verticale ㅏ.",
  "hangul_consonants_tense:tense-reading:tr-ssada":
    "싸다 commence par 싸 : le premier bloc contient bien la consonne tendue ㅆ.",
  "hangul_consonants_tense:tense-reading:tr-ttada":
    "따 + 다 s’enchaînent pour former 따다. Le premier bloc contient ㄸ, puis le second revient à ㄷ.",
  "hangul_consonants_tense:tense-reading:tr-jjada":
    "La première syllabe de 짜다 est 짜. C’est là que tu entends l’attaque tendue de ㅉ.",

  "hangul_vowels_compound:e-vowels:e-ae-shape":
    "ㅐ reprend la forme de ㅏ en y ajoutant ㅣ. Ici, on vérifie surtout que tu reconnais cette construction écrite.",
  "hangul_vowels_compound:e-vowels:e-e-shape":
    "ㅔ reprend la forme de ㅓ avec ㅣ. La forme écrite est importante, car ㅐ et ㅔ sont souvent très proches à l’oral.",
  "hangul_vowels_compound:e-vowels:e-yae-shape":
    "ㅒ correspond à ㅑ + ㅣ. Tu peux aussi le voir comme la version en y de ㅐ.",
  "hangul_vowels_compound:e-vowels:e-ye-shape":
    "ㅖ correspond à ㅕ + ㅣ. Visuellement, c’est la version en y de ㅔ.",
  "hangul_vowels_compound:w-vowels:w-wa-shape":
    "ㅘ réunit ㅗ et ㅏ. Retrouver ses deux éléments est plus fiable que d’essayer de mémoriser la forme d’un seul bloc.",
  "hangul_vowels_compound:w-vowels:w-wae-shape":
    "ㅙ réunit ㅗ et ㅐ. Garde surtout cette construction écrite en tête lorsque plusieurs sons te paraissent proches.",
  "hangul_vowels_compound:w-vowels:w-wo-shape":
    "ㅝ réunit ㅜ et ㅓ. En la décomposant ainsi, sa forme devient beaucoup plus facile à reconnaître.",
  "hangul_vowels_compound:w-vowels:w-we-shape":
    "ㅞ réunit ㅜ et ㅔ. Ici encore, l’orthographe est le repère le plus sûr.",
  "hangul_vowels_compound:w-vowels:w-wi-shape":
    "ㅟ réunit ㅜ et ㅣ. Observe cette construction avant de t’appuyer sur le son.",
  "hangul_vowels_compound:w-vowels:w-ui-rule":
    "ㅢ n’a pas une prononciation unique dans tous les contextes. Sa réalisation change selon sa position et son rôle dans le mot.",
  "hangul_vowels_compound:compound-reading:cr-sagwa":
    "사과 contient ㅘ dans le bloc 과. Décompose le mot en 사 + 과 pour retrouver la voyelle composée.",
  "hangul_vowels_compound:compound-reading:cr-uisa":
    "의사 commence par 의, qui contient ㅢ. Le premier bloc suffit donc à identifier la réponse.",
  "hangul_vowels_compound:compound-reading:cr-oe":
    "외 s’écrit avec ㅚ. Même si plusieurs voyelles peuvent sonner proches, c’est bien cette forme qui apparaît dans le bloc.",
  "hangul_vowels_compound:compound-reading:cr-gwa":
    "ㄱ + ㅘ forment 과. La voyelle composée reste un seul élément à l’intérieur du bloc.",
  "hangul_vowels_compound:compound-reading:cr-segye":
    "세 + 계 s’enchaînent pour former 세계. Le deuxième bloc contient bien ㅖ.",
  "hangul_vowels_compound:compound-reading:cr-wae":
    "왜 s’écrit avec ㅙ. C’est précisément l’orthographe qu’il faut reconnaître ici, plutôt que de se fier uniquement au son.",
  "hangul_vowels_compound:compound-reading:cr-ui":
    "ㅢ se réalise différemment selon sa position et son rôle. Retenir cette souplesse est plus utile que de lui imposer une seule lecture.",

  "hangul_batchim:cvc-structure:cvc-gak":
    "Construis d’abord 가, puis place le dernier ㄱ sous le bloc : il devient le batchim et tu obtiens 각.",
  "hangul_batchim:cvc-structure:cvc-gan":
    "Construis 가, puis ajoute ㄴ en bas. Ce ㄴ devient la finale du même bloc et forme 간.",
  "hangul_batchim:cvc-structure:cvc-layout":
    "Le batchim occupe toujours la partie basse du bloc. Il vient fermer la syllabe sous la consonne et la voyelle déjà assemblées.",
  "hangul_batchim:cvc-structure:cvc-t":
    "Dans 갇, ㄷ est placé en finale et ferme la syllabe avec la réalisation attendue de cette famille.",
  "hangul_batchim:cvc-structure:cvc-ng":
    "강 se termine par ㅇ. En finale, ce ㅇ n’est plus muet : il donne le son ng.",
  "hangul_batchim:cvc-structure:cvc-p":
    "갑 se ferme avec ㅂ. Les lèvres terminent la syllabe sans ajouter une nouvelle voyelle après le p final.",
  "hangul_batchim:cvc-structure:cvc-l":
    "갈 se termine par ㄹ, qui ferme le bloc avec une valeur proche de l.",
  "hangul_batchim:simple-final-spellings:fs-book":
    "Dans 책, le ㄱ écrit en finale appartient directement à la famille de son ㄱ. L’orthographe et la classe finale coïncident ici.",
  "hangul_batchim:simple-final-spellings:fs-clothes":
    "Dans 옷, le ㅅ écrit en finale ne garde pas un s : il rejoint la famille de son ㄷ.",
  "hangul_batchim:simple-final-spellings:fs-flower":
    "Dans 꽃, le ㅊ final rejoint lui aussi la famille ㄷ. C’est un bon exemple de graphie différente pour une même réalisation finale.",
  "hangul_batchim:simple-final-spellings:fs-outside":
    "Dans 밖, le ㄲ final rejoint la famille ㄱ. L’écriture reste ㄲ, mais le son final se regroupe avec ㄱ.",
  "hangul_batchim:simple-final-spellings:fs-front":
    "Dans 앞, ㅍ rejoint la famille ㅂ en finale. Les deux graphies se ferment donc sur la même réalisation essentielle.",
  "hangul_batchim:simple-final-spellings:fs-end":
    "Dans 끝, ㅌ rejoint la famille ㄷ en finale. Le t écrit n’est donc pas relâché comme en français.",
  "hangul_batchim:simple-final-spellings:fs-seven":
    "C’est la logique à retenir : seize graphies simples se ramènent à sept sons finaux essentiels. Tu simplifies ainsi beaucoup la lecture des batchim.",
  "hangul_batchim:batchim-reading:br-bap":
    "밥 se termine par ㅂ. À l’oreille, concentre-toi sur la fermeture finale plutôt que sur le début du mot.",
  "hangul_batchim:batchim-reading:br-mul":
    "물 se termine par ㄹ. Le dernier élément placé au bas du bloc est bien la finale à repérer.",
  "hangul_batchim:batchim-reading:br-bam":
    "밤 se ferme sur m avec ㅁ, alors que 밥 se ferme sur p avec ㅂ. C’est la finale qui permet de les distinguer ici.",
  "hangul_batchim:batchim-reading:br-jip":
    "Dans 집, le dernier élément du bloc est ㅂ. C’est donc le batchim écrit, même avant de réfléchir à sa réalisation sonore.",
  "hangul_batchim:batchim-reading:br-ot":
    "옷 s’écrit avec ㅅ en finale, mais ce ㅅ se réalise dans la famille ㄷ. L’exercice te demande bien le son final, pas la graphie.",
  "hangul_batchim:batchim-reading:br-mun":
    "문 se termine par ㄴ, donc par un son n. Le batchim est le dernier élément du bloc 문.",
  "hangul_batchim:batchim-reading:br-gang":
    "강 se ferme avec ㅇ, qui donne ng en finale. C’est le rôle sonore de ㅇ lorsqu’il se trouve sous le bloc.",
  "hangul_batchim:liaison:link-rule":
    "Comme ㅇ est muet au début de la syllabe suivante, le son final précédent peut se rattacher directement à sa voyelle. C’est ce qui rend l’enchaînement plus fluide.",
  "hangul_batchim:liaison:link-jibe":
    "Dans 집에, le ㅂ final se rattache à 에. L’enchaînement se lit alors 지베.",
  "hangul_batchim:liaison:link-meogeo":
    "Dans 먹어, le ㄱ final se rattache à 어. La lecture liée devient 머거.",
  "hangul_batchim:liaison:link-osi":
    "Dans 옷이, le ㅅ final se rattache à 이. Cette liaison produit la lecture 오시.",
  "hangul_batchim:liaison:link-hangugeo":
    "Dans 한국어, le ㄱ de 국 se rattache à 어. C’est ce qui donne la lecture liée 한구거.",
  "hangul_batchim:liaison:link-final-k":
    "Le son qui passe vers 어 vient du ㄱ final de 국. En liaison, 한국 + 어 s’enchaîne donc en 한구거.",
};

let applied = false;

export function applyHangulEditorialOverrides() {
  if (applied) return;
  applied = true;

  for (const module of HANGUL_MODULES) {
    for (const scene of module.scenes) {
      const sceneKey = `${module.id}:${scene.id}`;
      const copy = SCENE_COPY[sceneKey];
      if (copy?.description) scene.description = copy.description;
      if (copy?.instruction) scene.instruction = copy.instruction;

      for (const card of scene.cards) {
        const cardKey = `${sceneKey}:${card.id}`;
        const explanation = CARD_EXPLANATIONS[cardKey];
        if (explanation) card.explanation = explanation;
      }

      for (const question of scene.questions) {
        const questionKey = `${sceneKey}:${question.id}`;
        const explicitExplanation = QUESTION_EXPLANATIONS[questionKey];
        if (explicitExplanation) {
          question.explanation = explicitExplanation;
          continue;
        }

        if (question.id.endsWith("-visual") || question.id.endsWith("-audio")) {
          const card = scene.cards.find((item) => item.glyph === question.answer);
          if (!card) continue;
          question.explanation = question.id.endsWith("-audio")
            ? `Tu as entendu ${card.glyph}. ${card.explanation}`
            : `${card.glyph} : ${card.explanation}`;
        }
      }
    }
  }
}
