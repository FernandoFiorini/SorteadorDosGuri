/* =====================================================
   TUTORIAL DO CAMPEÃO ("📖 Como jogar")

   Depois que o campeão é sorteado, o card ganha um botão que abre
   uma janelinha com um vídeo curto de cada habilidade, combos e
   dicas, e um texto explicando embaixo do vídeo.

   Nome e ícone das habilidades vêm do Data Dragon; os vídeos e os
   textos são nossos (edite à vontade em TUTORIALS).

   Os vídeos só são baixados quando a pessoa abre o tutorial e clica
   na habilidade (um de cada vez), então não pesam para abrir o site.

   Prompt e passo a passo para montar um campeão novo (mesma lógica do
   roteiro do canal): scripts/tutorial/PROMPT.md

   Para adicionar um campeão:
   1. comprima cada vídeo para tutoriais/<campeao>/ (nomes simples, ~1 MB):
      powershell -NoProfile -ExecutionPolicy Bypass -File scripts\video\comprimir-video.ps1 `
          -InPath "D:\Tutoriais LOL\<Campeao>\Q.mp4" -OutPath "<projeto>\tutoriais\<campeao>\q.mp4"
   2. adicione uma entrada em TUTORIALS com o ID do Data Dragon
      (o mesmo do nome da imagem: "Katarina", "MonkeyKing"...).
      Combo difícil pode ganhar velocidade: 0.75 (câmera lenta).
===================================================== */

/* PRÉVIA: true mostra um card fixo da Katarina na área de resultado,
   só para validar o visual. Some ao sortear. */
const TUTORIAL_PREVIEW = false;

const TUTORIALS = {

    Katarina: {
        pasta: "tutoriais/katarina/",
        /* Itens e runas pelo nome em português, igual aparece no jogo
           (o ícone é achado sozinho). Pode ter mais de uma build. */
        builds: [
            {
                titulo: "Padrão (dano mágico)",
                feiticos: ["Flash", "Incendiar"],
                inicial: [
                    {
                        ou: [
                            { item: "Escudo de Doran", quando: "contra poke" },
                            { item: "Lacre Sombrio", quando: "com chance de abate" }
                        ]
                    },
                    "Poção de Vida"
                ],
                core: ["Perdição de Lich", "Sapatos do Feiticeiro", "Chama Sombria", "Capuz da Morte de Rabadon"],
                situacional: ["Ampulheta de Zhonya", "Cajado do Vazio", "Véu da Banshee"],
                runas: {
                    principal: ["Eletrocutar", "Impacto Repentino", "Lembranças Aterrorizantes", "Caça Suprema"],
                    secundaria: ["Triunfo", "Golpe de Misericórdia"]
                },
                skills: ["R", "Q", "E", "W"],
                texto: "Zhonya cedo se o time deles tiver muito assassino ou dano físico. Cajado do Vazio quando eles começarem a comprar resistência mágica."
            }
        ],
        /* Aba "📋 Como jogar" (vem do roteiro do canal) */
        guia: {
            fases: [
                { titulo: "Fase de rotas", texto: "Farme com o Q e evite trocas longas contra campeões de longo alcance. No nível 3, com as três habilidades, procure um all-in quando o inimigo errar uma skill." },
                { titulo: "Nível 6", texto: "A Katarina fica forte: empurre a rota e vá ajudar as outras." },
                { titulo: "Lutas em equipe", texto: "Não entre primeiro. Espere o time inimigo gastar os controles, entre pelo flanco nos alvos frágeis e use os resets para pular de alvo em alvo." }
            ],
            fortes: [
                "Resets que fazem ela ganhar o jogo sozinha",
                "Muita mobilidade"
            ],
            fracos: [
                "Sofre contra composições com muito controle de grupo",
                "Fase de rotas difícil contra a maioria dos campeões antes do nível 3"
            ],
            /* Campeão pelo ID do Data Dragon (o mesmo da imagem) */
            dificeis: [
                { campeao: "Yasuo", motivo: "Bloqueia suas adagas com a parede de vento." },
                { campeao: "Vladimir", motivo: "Escapa do seu R com a poça de sangue." },
                { campeao: "Akali", motivo: "Some na névoa, onde você não consegue mirar nela." }
            ],
            faceis: [
                { campeao: "Taliyah", motivo: "Maga com pouca mobilidade: desviou da skill principal, chegou com o E e ela não foge." },
                { campeao: "Veigar", motivo: "Desvie da jaula e use o E para chegar nele." },
                { campeao: "Xerath", motivo: "Depois que você encosta, ele não tem como fugir." }
            ],
            dicaDeOuro: "Sempre pense no reset, ele é a mecânica mais importante da Katarina, se conseguir matar um, você mata todos!"
        },
        habilidades: {
            P: {
                video: "passiva.mp4",
                texto: "Pegar uma adaga no chão faz a Katarina girar e cortar todo mundo em volta. E se um campeão que ela machucou morrer, o Q, o W e o E voltam quase na hora: é assim que ela pula de um em um na luta."
            },
            Q: {
                video: "q.mp4",
                texto: "Joga a adaga no alvo, ela quica em mais inimigos e cai no chão atrás do primeiro. Repara onde ela cai: é essa adaga que você vai pegar depois para dar o dano da passiva."
            },
            W: {
                video: "w.mp4",
                texto: "Joga uma adaga para cima no lugar onde você está e ganha velocidade. Serve para fugir ou para deixar uma adaga pronta perto do inimigo e voltar nela com o E."
            },
            E: {
                video: "e.mp4",
                texto: "Teleporta até qualquer unidade (inimigo, aliado, tropa) ou até uma adaga. Se cair na adaga, já pega e gira. É o botão que faz a Katarina funcionar: quase todo combo passa por ele."
            },
            R: {
                video: "r.mp4",
                texto: "Fica girando e jogando adagas nos 3 inimigos mais perto. Andar ou usar o E cancela, e atordoamento corta na hora: só usa quando o controle do inimigo já saiu."
            }
        },
        extras: [
            {
                grupo: "Combos básicos",
                titulo: "Básico: Q + E",
                teclas: ["Q", "E"],
                video: "combo-q-e.mp4",
                texto: "Q no inimigo e E na adaga que caiu (ou no inimigo, se a adaga cair perto dele). Você pega a adaga do lado dele e já gira."
            },
            {
                grupo: "Combos básicos",
                titulo: "Básico 2: Q + E no inimigo",
                teclas: ["Q", "E"],
                video: "combo-q-e-no-alvo.mp4",
                texto: "Q e logo E em cima do inimigo. A adaga cai atrás dele, bem onde você aparece, e você pega sem precisar andar."
            },
            {
                grupo: "Combos avançados",
                titulo: "Avançado: E + W + Q + R",
                teclas: ["E", "W", "Q", "R"],
                video: "combo-e-w-q-r.mp4",
                velocidade: 0.75,
                texto: "Entra com o E, solta o W colado nele, Q em outro alvo e R no meio. A adaga do W cai durante o giro e soma dano."
            },
            {
                grupo: "Combos avançados",
                titulo: "Avançado: E + W + Q para seguir",
                teclas: ["E", "W", "Q"],
                video: "combo-e-w-q-seguir.mp4",
                velocidade: 0.75,
                texto: "Para correr atrás de quem está fugindo: E no inimigo, W para ganhar velocidade e Q para deixar uma adaga na frente dele."
            },
            {
                grupo: "Dicas",
                titulo: "Reset do ataque básico com o E",
                teclas: ["AA", "E"],
                video: "dica-reset-aa-e.mp4",
                texto: "Dá um ataque básico e logo em seguida o E: o E corta o fim da animação e já ataca de novo. Sai mais dano no mesmo tempo."
            },
            {
                grupo: "Dicas",
                titulo: "E para passar parede",
                teclas: ["E"],
                video: "dica-e-parede.mp4",
                texto: "O E vai em qualquer unidade ou adaga, mesmo do outro lado da parede. Joga a adaga (Q ou W) perto da parede ou usa uma tropa/monstro do outro lado e atravessa com o E para fugir ou pegar alguém de surpresa."
            },
            {
                grupo: "Na partida",
                titulo: "Jogada de Katarina",
                video: "jogada.mp4",
                texto: "Uma jogada de verdade juntando tudo: adagas no chão, E de um para outro e os resets da passiva."
            }
        ]
    },

    Locke: {
        pasta: "tutoriais/locke/",
        guia: {
            fases: [
                { titulo: "Fase de rotas", texto: "Farme com o Q e use os pregos para trocar: Q no inimigo e ataque básico logo depois para estourar as marcas. Guarde o E para quando ele gastar a habilidade de fuga." },
                { titulo: "Nível 6", texto: "Com o R, todo campeão com pouca vida vira abate: empurre a rota e vá atrás de quem está machucado nas outras rotas." },
                { titulo: "Lutas em equipe", texto: "Não entre primeiro. Espere o controle do time deles sair, entre com o E em quem já está com pouca vida e use o R para selar. Pegou o abate? O E volta: pule para o próximo." }
            ],
            fortes: [
                "Finaliza muito bem: a passiva e o R ficam mais fortes quanto menos vida o inimigo tem",
                "Reset do E no abate: numa luta boa, pula de um em um"
            ],
            fracos: [
                "Corpo a corpo: sofre contra quem ataca de longe na rota",
                "Ficar atrás na rota: caso você perca a fase de rotas, muito difícil voltar para a partida"
            ],
            dificeis: [
                { campeao: "Syndra", motivo: "Consegue te punir muito na fase de rotas, não é impossível ganhar, apenas difícil." },
                { campeao: "Lissandra", motivo: "Muito controle de grupo: te prende assim que você entra." },
                { campeao: "Galio", motivo: "Aguenta muito dano mágico, você vai precisar pegar kills em outras lanes para matar ele." }
            ],
            faceis: [
                { campeao: "Xerath", motivo: "Sem mobilidade: chegou nele com o E, ele não foge." },
                { campeao: "Velkoz", motivo: "Mago parado: desviou da skill principal, o all-in é seu." },
                { campeao: "Ziggs", motivo: "Frágil e sem fuga boa depois que você cola." }
            ],
            dicaDeOuro: "Olhe a vida dos inimigos o tempo todo: o Locke é o assassino que termina o serviço. Qualquer campeão que não tenha mobilidade e que não seja tank, vira alvo fácil."
        },
        builds: [
            {
                titulo: "Padrão (dano mágico)",
                feiticos: ["Flash", "Incendiar"],
                inicial: [
                    {
                        ou: [
                            { item: "Anel de Doran", quando: "padrão" },
                            { item: "Lacre Sombrio", quando: "com chance de abate" }
                        ]
                    },
                    "Poção de Vida"
                ],
                core: ["Perdição de Lich", "Sapatos do Feiticeiro", "Chama Sombria", "Ampulheta de Zhonya", "Capuz da Morte de Rabadon"],
                situacional: ["Cajado do Vazio", "Véu da Banshee"],
                runas: {
                    principal: ["Eletrocutar", "Impacto Repentino", "Lembranças Aterrorizantes", "Caça Suprema"],
                    secundaria: ["Triunfo", "Golpe de Misericórdia"]
                },
                skills: ["R", "Q", "E", "W"],
                texto: "Perdição de Lich sempre primeiro, depois Chama Sombria. Zhonya para entrar no all-in e sobreviver ao revide, e Rabadon para fechar o dano. Cajado do Vazio quando eles começarem a comprar resistência mágica."
            }
        ],
        habilidades: {
            P: {
                video: "passiva.mp4",
                texto: "Os ataques do Locke causam dano mágico extra, e esse dano cresce quanto mais vida o inimigo já perdeu. Ele é feito para finalizar: quanto mais baixo o alvo, mais forte cada ataque."
            },
            Q: {
                video: "q.mp4",
                texto: "Arremessa pregos que causam dano, deixam lento e marcam o inimigo. Depois, o ataque básico estoura as marcas e dá dano extra: quanto mais pregos acertarem o mesmo alvo, maior o estouro."
            },
            W: {
                video: "w.mp4",
                texto: "Ganha velocidade de ataque e de movimento, mas queima a própria vida enquanto está ativo. No final cura de volta parte do que perdeu. Bom para trocar rápido, perseguir ou derrubar torre."
            },
            E: {
                video: "e.mp4",
                tituloPrincipal: "Teleporte e avanço",
                texto: "Teleporta para um ponto (dá dano em quem estiver perto ao chegar) e o próximo ataque avança até o alvo, atravessando os inimigos no caminho. Se pegar um abate, o E volta na hora.",
                /* Mais de um vídeo na mesma skill: vira botões embaixo do título */
                variacoes: [
                    {
                        titulo: "Reset no abate",
                        video: "dica-reset-e.mp4",
                        texto: "Se o Locke participar de um abate, o E volta na hora. Finalizou um? Usa o E de novo para colar no próximo alvo ou para sair da luta."
                    }
                ]
            },
            R: {
                video: "r.mp4",
                texto: "Joga um artefato numa área: dano, lentidão e uma marca. Campeão marcado que ficar com pouca vida é selado (executado). Se selou alguém, o artefato cai no chão: pegue para ficar mais forte para sempre e recuperar parte da recarga."
            }
        },
        extras: [
            {
                grupo: "Combos básicos",
                titulo: "Poke: 3x Q + Eletrocutar",
                teclas: ["Q", "Q", "Q"],
                video: "combo-poke-3q.mp4",
                texto: "Joga os três pregos de longe no mesmo alvo: o terceiro acerto ativa o Eletrocutar. Troca segura na rota, sem precisar entrar."
            },
            {
                grupo: "Combos básicos",
                titulo: "W + 3x Q + E",
                teclas: ["W", "Q", "Q", "Q", "E"],
                video: "combo-w-3q-e.mp4",
                texto: "Liga o W para ganhar velocidade, joga os três pregos e entra com o E: o ataque-avanço estoura as marcas."
            },
            {
                grupo: "Combos avançados",
                titulo: "E + W + 3x Q + E",
                teclas: ["E", "W", "Q", "Q", "Q", "E"],
                video: "combo-e-w-3q-e.mp4",
                velocidade: 0.75,
                texto: "Entra com o E, liga o W, joga os três pregos no mesmo alvo e usa o E de novo para avançar estourando as marcas."
            },
            {
                grupo: "Combos avançados",
                titulo: "E + W + Q + R + E + Incendiar",
                teclas: ["E", "W", "Q", "R", "E", "Incendiar"],
                video: "combo-e-w-q-r-e-ignite.mp4",
                velocidade: 0.75,
                texto: "All-in completo: E para entrar, W, pregos, R para marcar e deixar lento, E para colar de novo e Incendiar para garantir a execução do R."
            },
            {
                grupo: "Dicas",
                titulo: "Farm: 3 Q na wave e E para limpar",
                teclas: ["Q", "Q", "Q", "E"],
                video: "dica-farm-3q-e.mp4",
                texto: "Joga os três pregos na wave de tropas e usa o E no meio delas: o dano ao chegar e o avanço limpam a wave rápido."
            },
            {
                grupo: "Dicas",
                titulo: "W para derrubar torre",
                teclas: ["W"],
                video: "dica-w-torre.mp4",
                texto: "A velocidade de ataque do W também vale contra torre. Com a wave tankando, liga o W e derruba a torre bem mais rápido."
            },
            {
                grupo: "Na partida",
                titulo: "Jogada de Locke",
                video: "jogada.mp4",
                texto: "Uma jogada de verdade juntando tudo: pregos, E para colar, execução com o R e o reset do E no abate."
            }
        ]
    },

    Aphelios: {
        pasta: "tutoriais/aphelios/",
        guia: {
            fases: [
                { titulo: "Fase de rotas", texto: "Farme e cutuque com a arma que tiver mais alcance (Calibrum). Olhe sempre a munição e a fila: gaste nas tropas a arma que você não quer para chegar na que é forte para trocar." },
                { titulo: "Nível 6", texto: "O R muda com a arma da mão. Antes de usar, coloque a arma certa: Infernum ou Crescendum para dano em área, Gravitum para prender, Severum para se curar." },
                { titulo: "Lutas em equipe", texto: "Fique atrás do seu time: ele não tem avanço nenhum. Entre na luta com um par forte (Infernum + Crescendum, Severum + Gravitum) e use o W para trocar para o Q certo na hora." }
            ],
            fortes: [
                "Dano altíssimo no fim do jogo, principalmente em área",
                "Cinco armas: tem resposta para quase toda situação (cura, prender, área, alcance)"
            ],
            fracos: [
                "Nenhum avanço ou fuga: depende do time para ficar vivo",
                "Difícil: escolher a arma errada na hora errada perde a luta"
            ],
            /* Magos de poke no suporte inimigo: sem avanço, o Aphelios só apanha de longe */
            dificeis: [
                { campeao: "Mel", motivo: "Ataca de longe e ainda devolve suas habilidades: fica difícil até farmar." },
                { campeao: "Swain", motivo: "Puxa você com o E e drena vida no R; sem avanço, você não escapa." },
                { campeao: "Syndra", motivo: "Atordoa e ataca de longe com muito dano; um erro e você morre." },
                { campeao: "Hwei", motivo: "Poke e controle de longe o tempo todo; você não consegue chegar perto." }
            ],
            faceis: [
                { campeao: "Jinx", motivo: "Fraca no começo e sem fuga: dá para ganhar a rota cedo." },
                { campeao: "KogMaw", motivo: "Sem mobilidade e fraco antes dos itens." },
                { campeao: "Twitch", motivo: "Frágil e sem avanço: Gravitum prende e você ganha a troca." }
            ],
            dicaDeOuro: "Antes de toda luta, olhe a arma da mão, a secundária e a próxima da fila. Saber qual par você vai ter é o que separa um Aphelios bom de um ruim."
        },
        builds: [
            {
                titulo: "Padrão (crítico)",
                feiticos: [
                    "Flash",
                    { ou: [
                        { item: "Curar" },
                        { item: "Barreira" },
                        { item: "Purificar" },
                        { item: "Exaustão" }
                    ] }
                ],
                inicial: ["Arco de Doran", "Poção de Vida"],
                core: ["A Coletora", "Grevas do Berserker", "Gume do Infinito", "Lembranças do Lorde Dominik", "Furacão de Runaan"],
                situacional: ["Sedenta por Sangue", "Anjo Guardião"],
                runas: {
                    principal: ["Pressione o Ataque", "Triunfo", "Lenda: Linhagem", "Golpe de Misericórdia"],
                    secundaria: ["Reembolso", "Tônico Triplo"]
                },
                texto: "A Coletora primeiro e a bota como segundo item. Depois Gume do Infinito, Lembranças do Lorde Dominik e Furacão de Runaan. No último item, Sedenta por Sangue para mais cura ou Anjo Guardião se estiverem focando você."
            }
        ],
        /* Abre direto no painel das armas (o resto do kit depende delas) */
        abaInicial: "armas",
        /* Aba "🌙 Armas": painel no estilo do HUD do jogo */
        armas: {
            /* Ordem no começo da partida: mão, secundária e fila */
            inicio: ["calibrum", "severum", "gravitum", "infernum", "crescendum"],
            lista: {
                calibrum: {
                    nome: "Calibrum", tipo: "rifle", cor: "verde", hex: "#3fc97f",
                    secundaria: "tiros de longo alcance do rifle",
                    aa: { video: "calibrum-aa.mp4", texto: "Rifle de longo alcance: ataca mais longe que as outras armas. Bom para atacar na rota sem chegar perto." },
                    q: { video: "calibrum-q.mp4", texto: "Tiro longo que marca o inimigo. Com a marca, você ataca ele de bem longe e estoura a marca com dano extra." },
                    r: { video: "calibrum-r.mp4", texto: "O R marca todo mundo que pegar. Depois, ataques de longe estouram as marcas." }
                },
                severum: {
                    nome: "Severum", tipo: "pistola-foice", cor: "vermelha", hex: "#e5484d",
                    secundaria: "tiros que curam você",
                    aa: { video: "severum-aa.mp4", texto: "Pistola-foice: os ataques curam você. Com a vida cheia, a cura sobra como escudo." },
                    q: { video: "severum-q.mp4", texto: "Corre mais rápido atirando sem parar com as duas armas no inimigo mais perto. Bom para trocar dano e se curar." },
                    r: { video: "severum-r.mp4", texto: "O R cura você a mais. Use para virar a luta quando estiver com pouca vida." }
                },
                gravitum: {
                    nome: "Gravitum", tipo: "canhão", cor: "roxa", hex: "#9d6cf0",
                    secundaria: "lentidão do canhão (e aí W + Q do Gravitum enraíza)",
                    aa: { video: "gravitum-aa.mp4", texto: "Canhão: os ataques deixam o inimigo lento." },
                    q: { video: "gravitum-q.mp4", texto: "Enraíza todo mundo que está lento pelo Gravitum. Serve para prender quem foge ou quem vem para cima de você." },
                    r: { video: "gravitum-r.mp4", texto: "O R deixa todo mundo que pegou bem lento. Logo depois, Q do Gravitum enraíza todos de uma vez." }
                },
                infernum: {
                    nome: "Infernum", tipo: "lança-chamas", cor: "azul", hex: "#3d9bff",
                    secundaria: "dano em área (cone) em cada um que for atingido",
                    aa: { video: "infernum-aa.mp4", texto: "Lança-chamas: o ataque espalha dano em cone atrás do alvo. Ótimo para limpar wave." },
                    q: { video: "infernum-q.mp4", texto: "Explosão em cone que ainda dispara a arma secundária em todo mundo que pegou. O efeito extra depende de qual arma está na secundária." },
                    r: { video: "infernum-r.mp4", texto: "O R dá dano extra em área em volta de cada campeão atingido." }
                },
                crescendum: {
                    nome: "Crescendum", tipo: "chakram", cor: "branca", hex: "#e9e6f5",
                    secundaria: "chakrams que acumulam dano",
                    aa: { video: "crescendum-aa.mp4", texto: "Chakram que vai e volta. Cada ataque junta mais chakrams em volta de você e mais dano. Perto do alvo eles voltam mais rápido." },
                    q: { video: "crescendum-q.mp4", texto: "Coloca uma torreta que atira com a arma secundária enquanto você ataca junto." },
                    r: { video: "crescendum-r.mp4", texto: "O R dá vários chakrams de uma vez para cada inimigo atingido. Chegando perto depois, o dano explode." }
                }
            },
            /* Qual Q usa a arma secundária (o par muda o efeito) */
            usaSecundaria: ["severum", "infernum", "crescendum"],
            /* Pares fortes (mão+secundária), com explicação própria */
            pares: {
                "infernum+crescendum": "Um dos pares mais fortes: o Q do Infernum dispara chakrams em todo mundo que pegou, enchendo o Crescendum de uma vez.",
                "infernum+gravitum": "O Q do Infernum deixa todo mundo lento pelo Gravitum. Na sequência, W e Q do Gravitum enraízam o time inteiro.",
                "severum+gravitum": "O Q da Severum cura você e deixa o alvo lento. Troca com W e Q do Gravitum para enraizar no final.",
                "severum+infernum": "O Q da Severum atira com as duas: cura você e espalha dano em área pelo Infernum.",
                "severum+crescendum": "O Q da Severum dispara vários chakrams rápido. Depois é só atacar com o Crescendum cheio.",
                "crescendum+calibrum": "A torreta atira com o rifle de longe enquanto você ataca de longe também.",
                "calibrum+crescendum": "Marque com o Q do Calibrum e solte os chakrams de longe no alvo marcado.",
                "infernum+severum": "Combo simples: o Q do Infernum faz a Severum atirar em todo mundo que pegou, curando você."
            }
        },
        habilidades: {
            P: {
                video: "passiva.mp4",
                tituloPrincipal: "Upar atributos",
                texto: "O Aphelios não escolhe skill ao subir de nível: ele ganha atributos (dano, velocidade de ataque ou letalidade). O que importa de verdade são as 5 armas: veja a aba 🌙 Armas."
            },
            Q: {
                video: "calibrum-q.mp4",
                tituloPrincipal: "🟢 Calibrum",
                texto: "O Q muda conforme a arma da mão. Calibrum: tiro longo que marca o inimigo para atacar de bem longe.",
                variacoes: [
                    { titulo: "🔴 Severum", video: "severum-q.mp4", texto: "Severum: corre atirando com as duas armas e se curando." },
                    { titulo: "🟣 Gravitum", video: "gravitum-q.mp4", texto: "Gravitum: enraíza todo mundo que está lento pelo canhão." },
                    { titulo: "🔵 Infernum", video: "infernum-q.mp4", texto: "Infernum: explosão em cone que dispara a arma secundária em quem pegou." },
                    { titulo: "⚪ Crescendum", video: "crescendum-q.mp4", texto: "Crescendum: torreta que atira com a arma secundária." }
                ]
            },
            W: {
                video: "w.mp4",
                texto: "Só troca a arma da mão pela secundária. Junto mudam o ataque básico e o Q. Não tem recarga de verdade: troque sempre que o outro Q for melhor naquela hora."
            },
            R: {
                video: "calibrum-r.mp4",
                tituloPrincipal: "🟢 Calibrum",
                texto: "Rajada de luar que explode nos campeões e ganha o efeito da arma da mão. Calibrum: marca todo mundo para ataques de longe.",
                variacoes: [
                    { titulo: "🔴 Severum", video: "severum-r.mp4", texto: "Severum: cura você a mais." },
                    { titulo: "🟣 Gravitum", video: "gravitum-r.mp4", texto: "Gravitum: deixa todo mundo bem lento (prepare o Q para enraizar)." },
                    { titulo: "🔵 Infernum", video: "infernum-r.mp4", texto: "Infernum: dano extra em área em volta de cada campeão." },
                    { titulo: "⚪ Crescendum", video: "crescendum-r.mp4", texto: "Crescendum: muitos chakrams de uma vez; chegue perto para o dano explodir." }
                ]
            }
        },
        extras: [
            {
                grupo: "Combos básicos", armas: ["infernum", "severum"],
                titulo: "Simples: Q do Infernum com Severum",
                teclas: ["Q"],
                video: "combo-infernum-severum.mp4",
                texto: "Infernum na mão e Severum na secundária: o Q em cone faz a Severum atirar em todo mundo que pegou, e você se cura."
            },
            {
                grupo: "Combos básicos", armas: ["severum", "infernum"],
                titulo: "Q da Severum com Infernum: cura e área",
                teclas: ["Q"],
                video: "combo-severum-infernum.mp4",
                texto: "Severum na mão e Infernum na secundária: o Q atira com as duas armas, cura você e espalha dano em área."
            },
            {
                grupo: "Combos básicos", armas: ["severum", "crescendum"],
                titulo: "Q da Severum com Crescendum + ataque",
                teclas: ["Q", "AA"],
                video: "combo-severum-crescendum.mp4",
                texto: "O Q da Severum dispara os chakrams do Crescendum várias vezes e acumula muitos. Depois é só atacar."
            },
            {
                grupo: "Combos básicos", armas: ["crescendum", "calibrum"],
                titulo: "Q do Crescendum + ataque de longe com Calibrum",
                teclas: ["Q", "AA"],
                video: "combo-crescendum-calibrum.mp4",
                texto: "Crescendum na mão e Calibrum na secundária: a torreta atira com o rifle e você ataca de longe."
            },
            {
                grupo: "Combos avançados", armas: ["calibrum", "crescendum"],
                titulo: "Q do Calibrum + chakrams de longe",
                teclas: ["Q", "AA"],
                video: "combo-calibrum-crescendum.mp4",
                velocidade: 0.75,
                texto: "Marca com o Q do Calibrum e solta os chakrams do Crescendum de longe no alvo marcado."
            },
            {
                grupo: "Combos avançados", armas: ["severum", "gravitum"],
                titulo: "Severum + Gravitum: cura, lentidão e enraizar",
                teclas: ["Q", "W", "Q"],
                video: "combo-severum-gravitum.mp4",
                velocidade: 0.75,
                texto: "Q da Severum cura você e deixa o alvo lento pelo Gravitum da secundária. No final, W para o Gravitum e Q para enraizar."
            },
            {
                grupo: "Combos avançados", armas: ["calibrum"],
                titulo: "Q + R do Calibrum e 2 ataques de longe",
                teclas: ["Q", "R", "AA", "AA"],
                video: "combo-calibrum-q-r.mp4",
                velocidade: 0.75,
                texto: "Q e R com o Calibrum marcam o inimigo. Dois ataques de longe estouram as marcas com muito dano."
            },
            {
                grupo: "Combos avançados", armas: ["crescendum"],
                titulo: "R do Crescendum + Flash para perto",
                teclas: ["R", "Flash", "AA"],
                video: "combo-crescendum-r-flash.mp4",
                velocidade: 0.75,
                texto: "O R do Crescendum dá chakrams em quem pegou. Flash para perto: de perto os chakrams voltam mais rápido e o dano é bem maior."
            },
            {
                grupo: "Combos avançados", armas: ["infernum"],
                titulo: "R + Flash + Q do Infernum",
                teclas: ["R", "Flash", "Q"],
                video: "combo-infernum-r-flash-q.mp4",
                velocidade: 0.75,
                texto: "R com o Infernum na mão, Flash para dentro e Q do Infernum: muito dano em área no time inteiro."
            },
            {
                grupo: "Dicas", armas: ["crescendum"],
                titulo: "Crescendum para objetivos",
                video: "dica-crescendum-objetivo.mp4",
                texto: "Para dragão e barão, o Crescendum é a melhor arma: acumula chakrams e o dano não para. Se der, chegue no objetivo com ela."
            },
            {
                grupo: "Dicas", armas: ["crescendum"],
                titulo: "Crescendum perto ataca mais rápido",
                video: "dica-crescendum-perto.mp4",
                texto: "Perto do alvo os chakrams voltam mais rápido, então você ataca mais rápido. Com o Crescendum, jogue um pouco mais perto (com cuidado)."
            }
        ]
    },

    KSante: {
        pasta: "tutoriais/ksante/",
        builds: [
            {
                titulo: "Padrão (tanque)",
                feiticos: ["Flash", "Teleporte"],
                inicial: [
                    { ou: [
                        { item: "Elmo de Doran", quando: "padrão" },
                        { item: "Escudo de Doran", quando: "contra poke" }
                    ] },
                    "Poção de Vida"
                ],
                core: [
                    { ou: [
                        { item: "Manopla dos Glacinatas", quando: "contra quem não tem avanço" },
                        { item: "Rookern Lamúrico", quando: "contra muito dano mágico" }
                    ] }
                ],
                runas: {
                    principal: ["Aperto dos Mortos-Vivos", "Golpe de Escudo", "Ventos Revigorantes", "Crescimento Excessivo"],
                    secundaria: ["Triunfo", "Até a Morte"]
                },
                skills: ["R", "Q", "W", "E"],
                texto: "Primeiro item: Manopla dos Glacinatas quando o time deles não tem avanço (a lentidão gruda neles), ou Rookern Lamúrico contra muito dano mágico."
            }
        ],
        guia: {
            fases: [
                { titulo: "Fase de rotas", texto: "Troque curto com o Q e guarde o terceiro Q (atordoa e puxa) para quando o inimigo vier para cima. Não tente matar sozinho cedo: o K'Sante normal é tanque, ganha no desgaste." },
                { titulo: "Nível 6", texto: "O R muda tudo: jogue o inimigo contra a parede para ele atravessar e ficar longe do time dele, e use a Forma Irrestrita para terminar o duelo." },
                { titulo: "Lutas em equipe", texto: "Normal, você é o tanque: entre com W (imbatível), prenda com o terceiro Q e proteja seu time com o E num aliado. Use o R no carry deles quando der para isolar ou matar." }
            ],
            fortes: [
                "Muito controle: terceiro Q atordoa e puxa, W empurra e atordoa",
                "O R isola o carry inimigo do outro lado da parede"
            ],
            fracos: [
                "Na Forma Irrestrita perde vida e defesa: entrou na hora errada, morre",
                "Kit difícil e depende de itens de defesa caros"
            ],
            dificeis: [
                { campeao: "Vayne", motivo: "Dano verdadeiro e te mantém longe com o E e o rolamento." },
                { campeao: "Fiora", motivo: "Dano verdadeiro nos pontos fracos e o W dela devolve seu atordoamento." },
                { campeao: "Gwen", motivo: "Dano verdadeiro e a névoa do W bloqueia suas habilidades." }
            ],
            faceis: [
                { campeao: "Garen", motivo: "Sem alcance e sem controle: você troca curto com o Q e sai." },
                { campeao: "Sion", motivo: "Lento e previsível: o W e o terceiro Q cortam a investida dele." },
                { campeao: "Nasus", motivo: "Fraco no começo: dá para segurar ele longe da wave." }
            ],
            dicaDeOuro: "Guarde o R para terminar a luta, não para começar: na Forma Irrestrita você troca defesa por dano."
        },
        habilidades: {
            P: {
                video: "passiva.mp4",
                texto: "As habilidades marcam o alvo: o próximo ataque básico nele dá dano extra. Depois de cada skill, encaixe um ataque."
            },
            Q: {
                video: "q.mp4",
                tituloPrincipal: "Forma normal",
                texto: "Golpe em linha curta que dá dano e lentidão. Acertou duas vezes, o terceiro Q vira uma onda de choque que atordoa e puxa o inimigo.",
                variacoes: [
                    { titulo: "Forma Irrestrita", video: "q-irrestrita.mp4", texto: "Depois do R, o Q volta bem mais rápido: dá para encadear vários seguidos." }
                ]
            },
            W: {
                video: "w.mp4",
                tituloPrincipal: "Forma normal",
                texto: "Segura para carregar (fica imbatível e toma menos dano) e solta para avançar empurrando e atordoando. Quanto mais carrega, mais longe empurra.",
                variacoes: [
                    { titulo: "Forma Irrestrita", video: "w-irrestrita.mp4", texto: "Depois do R, o W dá dano verdadeiro e não empurra mais. E a recarga volta na hora." }
                ]
            },
            E: {
                video: "e.mp4",
                tituloPrincipal: "Forma normal",
                texto: "Avanço curto que dá escudo. Num aliado, vai bem mais longe e os dois ganham escudo.",
                variacoes: [
                    { titulo: "Forma Irrestrita", video: "e-irrestrita.mp4", texto: "Depois do R, o avanço é mais rápido e a recarga menor." }
                ]
            },
            R: {
                video: "r.mp4",
                tituloPrincipal: "Normal",
                texto: "Empurra um campeão e você vira a Forma Irrestrita: mais velocidade de ataque, penetração e cura, mas menos vida e defesa.",
                variacoes: [
                    { titulo: "Na parede", video: "r-parede.mp4", texto: "Com uma parede atrás, o inimigo atravessa para o outro lado e toma um segundo golpe. Ótimo para separar o carry do time dele." }
                ]
            }
        },
        extras: [
            {
                grupo: "Combos básicos",
                titulo: "Básico: Q + Q + W",
                teclas: ["Q", "Q", "W"],
                video: "combo-q-q-w.mp4",
                texto: "Dois Q para acumular e o W para empurrar e atordoar. O terceiro Q fica pronto para puxar de volta."
            },
            {
                grupo: "Combos básicos",
                titulo: "Básico: começando com W + Q + Q",
                teclas: ["W", "Q", "Q"],
                video: "combo-w-q-q.mp4",
                texto: "Entra com o W e emenda os dois Q enquanto o inimigo está atordoado."
            },
            {
                grupo: "Combos básicos",
                titulo: "Começando com o E: E + Q + Q + W",
                teclas: ["E", "Q", "Q", "W"],
                video: "combo-e-q-q-w.mp4",
                texto: "E para chegar perto com escudo, dois Q e o W para fechar a troca."
            },
            {
                grupo: "Combos avançados",
                titulo: "Avançado: ataque básico entre as skills",
                teclas: ["Q", "AA", "Q", "AA", "W"],
                video: "combo-aa-entre-skills.mp4",
                velocidade: 0.75,
                texto: "Encaixe um ataque básico depois de cada habilidade: a marca da passiva estoura em todos e o dano sobe muito."
            },
            {
                grupo: "Combos avançados",
                titulo: "Ultimate: Q + Q + E + W, R, W + Q + E + Q",
                teclas: ["Q", "Q", "E", "W", "R", "W", "Q", "E", "Q"],
                video: "combo-ultimate.mp4",
                velocidade: 0.75,
                texto: "Combo completo: Q, Q, E e W na forma normal; R para virar Forma Irrestrita (o W volta na hora) e W, Q, E, Q aproveitando as recargas curtas."
            }
        ]
    },

    Evelynn: {
        pasta: "tutoriais/evelynn/",
        builds: [
            {
                titulo: "Padrão (dano mágico)",
                feiticos: [
                    "Flash",
                    { ou: [
                        { item: "Golpear", quando: "na selva" },
                        { item: "Incendiar", quando: "na rota" }
                    ] }
                ],
                inicial: ["Lacre Sombrio"],
                core: [
                    "Perdição de Lich",
                    "Sapatos do Feiticeiro",
                    { ou: [
                        { item: "Chama Sombria", quando: "padrão" },
                        { item: "Capuz da Morte de Rabadon", quando: "se estiver ganhando" }
                    ] },
                    "Cajado do Vazio"
                ],
                situacional: ["Ápice da Tempestade", "Ampulheta de Zhonya"],
                runas: {
                    principal: ["Eletrocutar", "Impacto Repentino", "Lembranças Aterrorizantes", "Caçador de Tesouros"],
                    secundaria: ["Foco Absoluto", "Tempestade Crescente"]
                },
                skills: ["R", "Q", "E", "W"],
                texto: "Perdição de Lich sempre primeiro. No terceiro item, Chama Sombria é o padrão; se estiver ganhando, vá de Rabadon para o dano explodir. Situacional: Ápice da Tempestade para mais dano ou Zhonya contra quem te foca."
            }
        ],
        guia: {
            fases: [
                { titulo: "Antes do nível 6", texto: "A Evelynn ainda é fraca: faça a selva, evite brigar com o caçador inimigo e só ajude rota com o inimigo já machucado." },
                { titulo: "Nível 6", texto: "Agora você fica invisível fora de combate. Chegue nas rotas sem ser vista, W de longe e só entre quando o encanto pegar." },
                { titulo: "Lutas em equipe", texto: "Não entre primeiro: espere a luta começar, chegue invisível no carry deles e use o R para finalizar e sair de perto." }
            ],
            fortes: [
                "Invisível depois do nível 6: aparece do nada em qualquer rota",
                "Dano explosivo: o R finaliza quem está com pouca vida e ainda te tira da luta"
            ],
            fracos: [
                "Muito fraca antes do nível 6",
                "Sentinela de controle e quem revela invisível acabam com a surpresa"
            ],
            dificeis: [
                { campeao: "LeeSin", motivo: "Invade cedo e ganha os duelos antes do seu nível 6." },
                { campeao: "XinZhao", motivo: "Muito forte no começo: te persegue na sua própria selva." },
                { campeao: "Graves", motivo: "Limpa a selva rápido e ganha qualquer briga cedo." }
            ],
            faceis: [
                { campeao: "Karthus", motivo: "Frágil e lento: depois do 6, cai no seu combo inteiro." },
                { campeao: "Shyvana", motivo: "Sem controle de grupo: não consegue te segurar depois que você entra." },
                { campeao: "Amumu", motivo: "Fraco no começo do jogo; sem ganks fortes antes do seu 6." }
            ],
            dicaDeOuro: "A Evelynn de verdade começa no nível 6: antes disso sobreviva e farme. Depois, só entre quando o W encantar."
        },
        habilidades: {
            P: {
                video: "passiva.mp4",
                tituloPrincipal: "Sombra Demoníaca",
                texto: "Fora de combate, a Evelynn entra em Sombra Demoníaca: se estiver com pouca vida, ela vai se curando.",
                variacoes: [
                    { titulo: "Nível 6: invisível", video: "passiva-lv6.mp4", texto: "A partir do nível 6, a Sombra Demoníaca também deixa ela camuflada (invisível) fora de combate. É assim que ela chega nas rotas sem ninguém ver." }
                ]
            },
            Q: {
                video: "q.mp4",
                texto: "Ataca com o chicote o primeiro inimigo atingido e depois dispara espinhos nele algumas vezes. É o principal dano para farmar e trocar."
            },
            W: {
                video: "w.mp4",
                texto: "Amaldiçoa o alvo: o próximo ataque ou habilidade nele encanta (ele anda até você) e reduz a resistência mágica. Quanto mais esperar para acertar, mais forte fica."
            },
            E: {
                video: "e.mp4",
                texto: "Chicotada no alvo e um pouco de velocidade depois. Bom para grudar depois do encanto."
            },
            R: {
                video: "r.mp4",
                texto: "Fica inalvejável por um instante, dá muito dano na área da frente (mais em quem está com pouca vida) e salta para trás, longe da luta."
            }
        },
        extras: [
            {
                grupo: "Combos básicos",
                titulo: "W + Q + E + ataque + R",
                teclas: ["W", "Q", "E", "AA", "R"],
                video: "combo-w-q-e-aa-r.mp4",
                texto: "W de longe e espere o encanto. Q, E e um ataque, e o R para finalizar e sair."
            },
            {
                grupo: "Combos avançados",
                titulo: "One shot: W + Flash + Q + E + R",
                teclas: ["W", "Flash", "Q", "E", "R"],
                video: "combo-oneshot.mp4",
                velocidade: 0.75,
                texto: "W no alvo, Flash para colar e o resto do combo de uma vez. O inimigo não tem tempo de reagir."
            },
            {
                grupo: "Combos avançados",
                titulo: "Fingir posição com o W",
                teclas: ["W", "Q", "E", "R"],
                video: "combo-w-fake.mp4",
                velocidade: 0.75,
                texto: "Use o W de um ângulo que engana onde você está: o inimigo foge para o lado errado e você pega ele quando o encanto ativa."
            },
            {
                grupo: "Dicas",
                titulo: "R atravessa parede para fugir",
                teclas: ["R"],
                video: "dica-r-parede.mp4",
                texto: "O salto do R passa por cima da parede: mire de costas para ela e use para sair de uma luta perdida."
            },
            {
                grupo: "Dicas",
                titulo: "R para pegar quem está fugindo",
                teclas: ["R"],
                video: "dica-r-fugindo.mp4",
                texto: "Situação específica: alvo com pouca vida fugindo, use o R virada para ele. O dano extra em vida baixa finaliza, mesmo você saltando para trás."
            }
        ]
    },

    Draven: {
        pasta: "tutoriais/draven/",
        builds: [
            {
                titulo: "Padrão (crítico)",
                feiticos: [
                    "Flash",
                    { ou: [
                        { item: "Curar" },
                        { item: "Barreira" },
                        { item: "Purificar" },
                        { item: "Exaustão" }
                    ] }
                ],
                inicial: ["Arco de Doran", "Poção de Vida"],
                core: [
                    { ou: [
                        { item: "Sedenta por Sangue", quando: "contra muito poke" },
                        { item: "Húbris", quando: "ganhando muito a rota" }
                    ] },
                    { ou: [
                        { item: "A Coletora", quando: "para stompar" },
                        { item: "Hexótica C44", quando: "mais utilidade" }
                    ] },
                    "Gume do Infinito",
                    "Lembranças do Lorde Dominik"
                ],
                situacional: ["Anjo Guardião", "Arco-escudo Imortal"],
                runas: {
                    principal: ["Ritmo Fatal", "Presença de Espírito", "Lenda: Linhagem", "Golpe de Misericórdia"],
                    secundaria: ["Reembolso", "Tônico Triplo"]
                },
                skills: ["R", "Q", "W", "E"],
                texto: "Primeiro item: Sedenta por Sangue contra muito poke ou Húbris se estiver ganhando muito a rota. Segundo: A Coletora para stompar ou Hexótica C44 para mais utilidade. Depois Gume do Infinito e Lembranças do Lorde Dominik. Último: Anjo Guardião ou Arco-escudo Imortal."
            }
        ],
        guia: {
            fases: [
                { titulo: "Fase de rotas", texto: "Fique sempre com os dois machados girando e troque agressivo: o Draven é o atirador mais forte do começo. No nível 2 e 3, procure o abate junto com o suporte." },
                { titulo: "Nível 6", texto: "O R atravessa o mapa e executa quem está com pouca vida (quanto mais Adoração, mais vida ele executa). Cada abate ainda dá ouro extra pela passiva." },
                { titulo: "Lutas em equipe", texto: "Bata em quem estiver mais perto sem perder machado. Não persiga longe demais: o machado cai onde você não está e o dano some." }
            ],
            fortes: [
                "Dano altíssimo desde o começo: ganha quase toda troca na rota",
                "Passiva dá ouro extra em cada abate: com vantagem, ele dispara na frente"
            ],
            fracos: [
                "Depende de pegar os machados: errou, perdeu metade do dano",
                "Nenhuma fuga de verdade: morrer cedo derruba a Adoração e o ouro extra"
            ],
            dificeis: [
                { campeao: "Caitlyn", motivo: "Mais alcance: cutuca você de longe enquanto você corre atrás do machado." },
                { campeao: "Ezreal", motivo: "Cutuca de longe e foge com o E: difícil de pegar." },
                { campeao: "Ashe", motivo: "Lentidão e alcance: te mantém longe e você não consegue trocar." }
            ],
            faceis: [
                { campeao: "Jinx", motivo: "Fraca no começo e sem fuga: perde as trocas cedo." },
                { campeao: "KogMaw", motivo: "Sem mobilidade e fraco antes dos itens." },
                { campeao: "Aphelios", motivo: "Sem avanço e depende da arma certa: você pune cedo." }
            ],
            dicaDeOuro: "Antes de clicar, olhe onde o machado vai cair. Pegar todos é o que separa um Draven que carrega de um que entrega."
        },
        habilidades: {
            P: {
                video: "passiva.mp4",
                texto: "Pegar machado e abater tropa, monstro ou torre dá Adoração. Ao abater um campeão, o Draven ganha ouro extra conforme a Adoração acumulada."
            },
            Q: {
                video: "q.mp4",
                texto: "O próximo ataque dá dano extra e o machado quica para o ar. Pegue ele onde cair para manter o efeito; dá para ter dois girando ao mesmo tempo."
            },
            W: {
                video: "w.mp4",
                texto: "Velocidade de ataque e de movimento. Pegar um machado zera a recarga do W: use o tempo todo para alcançar o machado."
            },
            E: {
                video: "e.mp4",
                texto: "Arremessa os machados em linha: dano, empurra para os lados e deixa lento. Bom para quem vem para cima ou para segurar quem foge."
            },
            R: {
                video: "r.mp4",
                tituloPrincipal: "Normal",
                texto: "Dois machados gigantes que cruzam o mapa. Executa quem estiver com vida abaixo da sua Adoração.",
                variacoes: [
                    { titulo: "Recolher no caminho", video: "r-volta.mp4", texto: "Aperte o R de novo enquanto os machados voam: eles voltam na hora e acertam de novo no caminho de volta." }
                ]
            }
        },
        extras: [
            {
                grupo: "Combos básicos",
                titulo: "Como jogar: Q + ataque + W (reset) + R",
                teclas: ["Q", "AA", "W", "R"],
                video: "combo-q-aa-w-r.mp4",
                texto: "O ciclo do Draven: Q, ataque, pega o machado (o W volta), W para correr até o próximo e o R para finalizar."
            },
            {
                grupo: "Combos avançados",
                titulo: "R + Flash (truque)",
                teclas: ["R", "Flash"],
                video: "combo-r-flash.mp4",
                velocidade: 0.75,
                texto: "Use o R e o Flash logo depois: o machado sai de onde você estava e o inimigo não espera o ângulo."
            }
        ]
    },

    Thresh: {
        pasta: "tutoriais/thresh/",
        /* Duas builds: mesmos itens, runa principal diferente */
        builds: [
            {
                titulo: "Engage (Pós-choque)",
                feiticos: [
                    "Flash",
                    { ou: [
                        { item: "Incendiar", quando: "padrão" },
                        { item: "Exaustão", quando: "contra muito dano explosivo" }
                    ] }
                ],
                core: [
                    "Medalhão dos Solari de Ferro",
                    "Juramento do Cavaleiro",
                    "Convergência de Zeke",
                    { ou: [
                        { item: "Botas da Rapidez" },
                        { item: "Botas Ionianas da Lucidez" }
                    ] }
                ],
                situacional: ["Bandocanos", "Bênção de Mikael"],
                /* Último item */
                ultimo: ["Coração Congelado"],
                runas: {
                    principal: ["Pós-choque", "Fonte da Vida", "Osso Revestido", "Inabalável"],
                    secundaria: ["Calçados Mágicos", "Perspicácia Cósmica"]
                },
                skills: ["R", "Q", "E", "W"],
                texto: "Pós-choque para quem vai entrar na luta com o Q e aguentar o dano. Quarto item: Bandocanos ou Bênção de Mikael (tira controle de um aliado). Último item: Coração Congelado."
            },
            {
                titulo: "Utilidade (Aprimoramento Glacial)",
                feiticos: [
                    "Flash",
                    { ou: [
                        { item: "Incendiar", quando: "padrão" },
                        { item: "Exaustão", quando: "contra muito dano explosivo" }
                    ] }
                ],
                core: [
                    "Medalhão dos Solari de Ferro",
                    "Juramento do Cavaleiro",
                    "Convergência de Zeke",
                    { ou: [
                        { item: "Botas da Rapidez" },
                        { item: "Botas Ionianas da Lucidez" }
                    ] }
                ],
                situacional: ["Bandocanos", "Bênção de Mikael"],
                /* Último item */
                ultimo: ["Coração Congelado"],
                runas: {
                    principal: ["Aprimoramento Glacial", "Calçados Mágicos", "Entrega de Biscoitos", "Perspicácia Cósmica"],
                    secundaria: ["Fonte da Vida", "Inabalável"]
                },
                skills: ["R", "Q", "E", "W"],
                texto: "Aprimoramento Glacial deixa lento quem você prende: bom para proteger o atirador e segurar quem tenta fugir."
            }
        ],
        guia: {
            fases: [
                { titulo: "Fase de rotas", texto: "Cutuque com o ataque básico (o E passivo dá dano extra) e pegue as almas. Guarde o Q para quando o inimigo errar uma habilidade ou chegar perto das tropas." },
                { titulo: "Nível 6", texto: "O R fecha o caminho com paredes que deixam lento. Ande pelo mapa e use a lanterna para trazer o caçador ou o mid para um gank." },
                { titulo: "Lutas em equipe", texto: "Q no carry fora de posição e lanterna para o seu time chegar junto. Se o seu atirador for atacado, use o E para empurrar quem pulou nele." }
            ],
            fortes: [
                "Muito controle: Q prende, E empurra e o R fecha a passagem",
                "A lanterna salva aliados e leva o time para dentro da luta"
            ],
            fracos: [
                "Depende de acertar o Q: errou, a rota fica sem ameaça por um bom tempo",
                "Pouca vida e defesa no começo para um suporte que precisa entrar"
            ],
            dificeis: [
                { campeao: "Morgana", motivo: "O escudo dela bloqueia o seu Q e o seu E no aliado." },
                { campeao: "Braum", motivo: "O escudo do E dele bloqueia o seu Q." },
                { campeao: "Janna", motivo: "Empurra você para longe e desfaz o seu engage." }
            ],
            faceis: [
                { campeao: "Sona", motivo: "Frágil e sem fuga: um Q que pega é abate." },
                { campeao: "Soraka", motivo: "Sem mobilidade: presa fácil do Q." },
                { campeao: "Seraphine", motivo: "Frágil e lenta: se o Q pega, ela não escapa." }
            ],
            dicaDeOuro: "Pegue sempre as almas, até com a lanterna: elas dão armadura e poder para o jogo inteiro. E não jogue o Q à toa."
        },
        habilidades: {
            P: {
                video: "passiva.mp4",
                tituloPrincipal: "Pegar almas",
                texto: "Inimigos que morrem perto podem soltar almas. Pegue clicando nelas: cada uma dá armadura e poder de habilidade para sempre.",
                variacoes: [
                    { titulo: "Almas com a lanterna", video: "passiva-lanterna.mp4", texto: "Jogue a lanterna (W) em cima da alma: ela é puxada até você sem precisar andar até lá." }
                ]
            },
            Q: {
                video: "q.mp4",
                texto: "Joga o gancho: prende o primeiro inimigo e puxa ele até você. Ative de novo para ir até ele."
            },
            W: {
                video: "w.mp4",
                texto: "Joga a lanterna: dá escudo, e o aliado que clicar nela é puxado até você. Ótima para salvar ou para trazer alguém para a luta."
            },
            E: {
                video: "e.mp4",
                tituloPrincipal: "Uso",
                texto: "Varre com a corrente: empurra os inimigos na direção que você escolher e deixa lento. Para trás puxa, para frente afasta.",
                variacoes: [
                    { titulo: "Ataque sem o passivo", video: "e-sem-passivo.mp4", texto: "Compare: ataque básico normal, sem o passivo do E carregado." },
                    { titulo: "Passivo carregado", video: "e-passivo.mp4", texto: "Fora de combate o passivo do E vai carregando: o próximo ataque dá bem mais dano. Cutuque assim na rota." }
                ]
            },
            R: {
                video: "r.mp4",
                texto: "Cria uma caixa de paredes em volta: quem atravessa a primeira parede toma dano e fica bem lento. Fecha a fuga ou a entrada."
            }
        },
        extras: [
            {
                grupo: "Combos básicos",
                titulo: "Q (puxar e ir) + E",
                teclas: ["Q", "Q", "E"],
                video: "combo-q-e.mp4",
                texto: "Prende com o Q, vai até ele com o segundo Q e usa o E para jogar ele de volta para o seu time."
            },
            {
                grupo: "Combos básicos",
                titulo: "E para trás: puxar para o time",
                teclas: ["E"],
                video: "combo-e-puxar.mp4",
                texto: "Use o E virado para trás: o inimigo é puxado na direção do seu time."
            },
            {
                grupo: "Combos avançados",
                titulo: "Q + lanterna no aliado + E",
                teclas: ["Q", "W", "E"],
                video: "combo-q-w-e.mp4",
                velocidade: 0.75,
                texto: "Prende com o Q, joga a lanterna para o aliado vir junto e usa o E para segurar o inimigo no lugar."
            },
            {
                grupo: "Combos avançados",
                titulo: "Q + R durante a puxada + E",
                teclas: ["Q", "R", "E"],
                video: "combo-q-r-e.mp4",
                velocidade: 0.75,
                texto: "Enquanto o Q puxa, use o R: a caixa fecha em volta e o E termina de prender."
            },
            {
                grupo: "Combos avançados",
                titulo: "Flash + Q + W + Q + E + R",
                teclas: ["Flash", "Q", "W", "Q", "E", "R"],
                video: "combo-flash-q-w-q-e-r.mp4",
                velocidade: 0.75,
                texto: "Engage completo: Flash para o ângulo, Q, lanterna para o time, vai junto com o segundo Q, E e R para ninguém sair."
            },
            {
                grupo: "Dicas",
                titulo: "Flash + lanterna para salvar o aliado",
                teclas: ["Flash", "W"],
                video: "dica-flash-lanterna.mp4",
                texto: "Dê Flash para longe e jogue a lanterna: o aliado em perigo clica e é puxado para fora da luta."
            }
        ]
    },

    Syndra: {
        pasta: "tutoriais/syndra/",
        /* Duas builds: mesmos itens, runa principal diferente */
        builds: [
            {
                titulo: "Cometa Arcano",
                feiticos: [
                    "Flash",
                    { ou: [
                        { item: "Teleporte" },
                        { item: "Fantasma" }
                    ] }
                ],
                core: ["Eco de Luden", "Chama Sombria", "Sapatos do Feiticeiro", "Capuz da Morte de Rabadon", "Cajado do Vazio"],
                situacional: [
                    { ou: [
                        { item: "Ampulheta de Zhonya", quando: "depende da composição deles" }
                    ] },
                    "Ápice da Tempestade"
                ],
                runas: {
                    principal: ["Cometa Arcano", "Faixa de Fluxo de Mana", "Transcendência", "Chamuscar"],
                    secundaria: ["Calçados Mágicos", "Perspicácia Cósmica"]
                },
                skills: ["R", "Q", "W", "E"],
                texto: "Eco de Luden primeiro, depois Chama Sombria e a bota. Zhonya entra quando a composição deles tiver muito assassino ou mergulho. Depois Rabadon e Cajado do Vazio. Ápice da Tempestade também entra como opção de dano."
            },
            {
                titulo: "Primeiro Ataque",
                feiticos: [
                    "Flash",
                    { ou: [
                        { item: "Teleporte" },
                        { item: "Fantasma" }
                    ] }
                ],
                core: ["Eco de Luden", "Chama Sombria", "Sapatos do Feiticeiro", "Capuz da Morte de Rabadon", "Cajado do Vazio"],
                situacional: [
                    { ou: [
                        { item: "Ampulheta de Zhonya", quando: "depende da composição deles" }
                    ] },
                    "Ápice da Tempestade"
                ],
                runas: {
                    principal: ["Primeiro Ataque", "Calçados Mágicos", "Entrega de Biscoitos", "Perspicácia Cósmica"],
                    secundaria: ["Faixa de Fluxo de Mana", "Transcendência"]
                },
                skills: ["R", "Q", "W", "E"],
                texto: "Primeiro Ataque dá ouro e dano extra quando você abre a troca: bom para quem gosta de começar trocando com o combo inteiro."
            }
        ],
        guia: {
            fases: [
                { titulo: "Fase de rotas", texto: "Farme e cutuque com o Q. Guarde o E: Q + E é o seu atordoamento, e ele serve para punir quem chegar perto. Acertar habilidades junta as farpas da passiva." },
                { titulo: "Nível 6", texto: "O R joga todas as esferas que estão no chão no alvo: quanto mais esferas, mais dano. Q, E e W antes do R costumam matar quem já está machucado." },
                { titulo: "Lutas em equipe", texto: "Fique atrás do seu time. Atordoe com Q + E quem pular em você e guarde o R para o carry deles." }
            ],
            fortes: [
                "Muito dano explosivo de longe, e o R executa com a passiva completa",
                "Atordoamento com Q + E: segura quem vem para cima"
            ],
            fracos: [
                "Nenhum avanço ou fuga: sofre com assassinos e ganks",
                "Combo exige precisão: errou o Q + E, fica exposta"
            ],
            dificeis: [
                { campeao: "Fizz", motivo: "Desvia do seu combo com o E dele e chega em você fácil." },
                { campeao: "Yasuo", motivo: "A parede de vento bloqueia as esferas e o atordoamento." },
                { campeao: "Kassadin", motivo: "Aguenta dano mágico e pula em você com o R." }
            ],
            faceis: [
                { campeao: "Veigar", motivo: "Lento: você cutuca de longe e ele não chega." },
                { campeao: "Xerath", motivo: "Frágil e sem fuga: o atordoamento pega fácil." },
                { campeao: "Annie", motivo: "Alcance curto: você cutuca antes de ela chegar perto." }
            ],
            dicaDeOuro: "Q + E é o seu atordoamento: guarde o E para quando o inimigo vier para cima e nunca gaste à toa."
        },
        habilidades: {
            P: {
                video: "passiva.mp4",
                texto: "Acertar habilidades e subir de nível junta Farpas de Ira. Com farpas suficientes, cada habilidade fica aprimorada (os botões \"Upado\" de cada skill mostram como fica)."
            },
            Q: {
                video: "q.mp4",
                tituloPrincipal: "Normal",
                texto: "Cria uma esfera no chão que dá dano. As esferas ficam lá e são usadas pelo W, pelo E e pelo R.",
                variacoes: [
                    { titulo: "Upado", video: "q-upado.mp4", texto: "Com a passiva, a Syndra segura uma carga a mais de Q." }
                ]
            },
            W: {
                video: "w.mp4",
                tituloPrincipal: "Normal",
                texto: "Pega uma esfera ou uma tropa e arremessa: dano e lentidão. Bom para criar mais uma esfera no lugar certo.",
                variacoes: [
                    { titulo: "Upado", video: "w-upado.mp4", texto: "Com a passiva, o W dá dano verdadeiro a mais." }
                ]
            },
            E: {
                video: "e.mp4",
                tituloPrincipal: "Normal",
                texto: "Empurra os inimigos e as esferas na frente. Inimigo atingido por uma esfera empurrada fica atordoado: use junto com o Q para atordoar.",
                variacoes: [
                    { titulo: "Com o Q: atordoar", video: "e-com-q.mp4", texto: "Q e logo o E na mesma direção: a esfera é empurrada e atordoa quem ela acertar. É o principal controle da Syndra." },
                    { titulo: "Upado", video: "e-upado.mp4", texto: "Com a passiva, o E fica mais largo e deixa todo mundo lento." }
                ]
            },
            R: {
                video: "r.mp4",
                tituloPrincipal: "Normal",
                texto: "Joga todas as esferas que estão em volta no campeão escolhido. Quanto mais esferas, mais dano.",
                variacoes: [
                    { titulo: "Com várias esferas", video: "r-varias.mp4", texto: "Deixe várias esferas no chão antes do R: cada uma é mais um golpe no alvo." },
                    { titulo: "Upado: executa", video: "r-execute.mp4", texto: "Com a passiva completa, o R executa quem ficar com pouca vida." }
                ]
            }
        },
        extras: [
            {
                grupo: "Combos básicos",
                titulo: "Q + E + W",
                teclas: ["Q", "E", "W"],
                video: "combo-q-e-w.mp4",
                texto: "Q, E para atordoar e W para arremessar mais uma esfera com lentidão."
            },
            {
                grupo: "Combos avançados",
                titulo: "Flash + Q + E, W na esfera, R e W",
                teclas: ["Flash", "Q", "E", "W", "R", "W"],
                video: "combo-flash-q-e-w-r.mp4",
                velocidade: 0.75,
                texto: "Flash para o ângulo, Q + E para atordoar, puxa uma esfera com o W, R e, enquanto as esferas voam, solta o W para somar ainda mais dano."
            },
            {
                grupo: "Combos avançados",
                titulo: "R para juntar esferas e E",
                teclas: ["R", "E"],
                video: "combo-r-e.mp4",
                velocidade: 0.75,
                texto: "Truque: depois do R, as esferas ficam juntas perto do alvo. Use o E nelas para atordoar com todas de uma vez."
            },
            {
                grupo: "Dicas",
                titulo: "W na parede vai mais longe",
                teclas: ["W"],
                video: "dica-w-parede.mp4",
                texto: "Arremessando a esfera com o W perto da parede, ela vai mais longe do que deveria: dá para pegar quem acha que está seguro."
            },
            {
                grupo: "Dicas",
                titulo: "Q + E na parede vai mais longe",
                teclas: ["Q", "E"],
                video: "dica-qe-parede.mp4",
                texto: "O mesmo vale para o Q + E: perto da parede, a esfera empurrada alcança mais longe."
            }
        ]
    }

};

const TUTORIAL_KEYS = ["P", "Q", "W", "E", "R"];

/* Nome e ícone oficiais das habilidades, buscados uma vez por campeão */
const tutorialDetails = {};

function hasTutorial(championId) {
    return !!TUTORIALS[championId];
}

async function loadTutorialDetails(championId) {

    if (tutorialDetails[championId]) return tutorialDetails[championId];

    const version = (IMAGE_URL.match(/cdn\/([^/]+)\//) || [])[1] || DATA_DRAGON_VERSION;
    const base = "https://ddragon.leagueoflegends.com/cdn/" + version;

    try {

        const json = await (await fetch(base + "/data/pt_BR/champion/" + championId + ".json")).json();
        const c = json.data[championId];

        const details = {
            name: c.name,
            title: c.title,
            P: { name: c.passive.name, icon: base + "/img/passive/" + c.passive.image.full }
        };

        ["Q", "W", "E", "R"].forEach((key, i) => {
            const s = c.spells[i];
            details[key] = { name: s.name, icon: base + "/img/spell/" + s.image.full };
        });

        tutorialDetails[championId] = details;

    } catch (error) {
        /* Sem Data Dragon: segue só com os nossos textos */
        tutorialDetails[championId] = { name: championId, title: "" };
    }

    return tutorialDetails[championId];

}

/* Botão no card do resultado */
function appendTutorialButton(card, championId) {

    if (!hasTutorial(championId)) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "tutorial-btn";
    button.textContent = "📖 Como jogar";
    button.onclick = () => openTutorial(championId);

    card.appendChild(button);

}

/* ---------- Janelinha ---------- */

let tutorialChampion = null;

async function openTutorial(championId, startKey) {

    const tutorial = TUTORIALS[championId];
    const dialog = document.getElementById("tutorialDialog");

    if (!tutorial || !dialog) return;

    tutorialChampion = championId;

    const details = await loadTutorialDetails(championId);

    document.getElementById("tutorialChampIcon").src = IMAGE_URL + championId + ".png";
    document.getElementById("tutorialChampName").textContent = details.name || championId;
    document.getElementById("tutorialChampTitle").textContent = details.title || "";

    renderTutorialNav(tutorial, details);

    if (!dialog.open) dialog.showModal();

    buildIndex = 0;
    weaponState = null;
    selectTutorialItem(startKey || "P");
    setTutorialTab(tutorial.abaInicial || "play");

}

function closeTutorial() {

    const aphVideo = document.getElementById("aphVideo");
    if (aphVideo) aphVideo.pause();

    const dialog = document.getElementById("tutorialDialog");
    const video = document.getElementById("tutorialVideo");

    video.pause();
    video.removeAttribute("src");
    video.load();

    if (dialog.open) dialog.close();

}

function renderTutorialNav(tutorial, details) {

    const skills = document.getElementById("tutorialSkills");
    const extras = document.getElementById("tutorialExtras");

    skills.innerHTML = "";
    extras.innerHTML = "";

    TUTORIAL_KEYS.forEach(key => {

        if (!tutorial.habilidades[key]) return;

        const info = details[key] || {};

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tutorial-skill";
        btn.dataset.item = key;
        btn.title = (info.name ? info.name + " · " : "") + "clique para ver";

        const icon = document.createElement("span");
        icon.className = "tutorial-skill-icon";

        if (info.icon) {
            const img = document.createElement("img");
            img.src = info.icon;
            img.alt = "";
            icon.appendChild(img);
        }

        const keyTag = document.createElement("span");
        keyTag.className = "tutorial-key";
        keyTag.textContent = key === "P" ? "Passiva" : key;

        icon.appendChild(keyTag);
        btn.appendChild(icon);

        const label = document.createElement("span");
        label.className = "tutorial-skill-name";
        label.textContent = info.name || (key === "P" ? "Passiva" : key);
        btn.appendChild(label);

        btn.onclick = () => selectTutorialItem(key);

        skills.appendChild(btn);

    });

    /* Combos, dicas e partida, agrupados */
    const groups = {};
    (tutorial.extras || []).forEach((item, i) => {
        (groups[item.grupo] = groups[item.grupo] || []).push([item, i]);
    });

    Object.keys(groups).forEach(group => {

        const block = document.createElement("div");
        block.className = "tutorial-group";

        const title = document.createElement("span");
        title.className = "tutorial-group-title";
        title.textContent = group;
        block.appendChild(title);

        const row = document.createElement("div");
        row.className = "tutorial-chips";

        groups[group].forEach(([item, i]) => {

            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "tutorial-chip";
            btn.dataset.item = "x" + i;

            if (item.teclas && item.teclas.length) {
                const keys = document.createElement("span");
                keys.className = "tutorial-chip-keys";
                item.teclas.forEach((k, n) => {
                    if (n > 0) keys.appendChild(document.createTextNode("→"));
                    const kbd = document.createElement("kbd");
                    kbd.textContent = k;
                    keys.appendChild(kbd);
                });
                btn.appendChild(keys);
            }

            const label = document.createElement("span");
            label.textContent = item.titulo;
            btn.appendChild(label);

            btn.onclick = () => selectTutorialItem("x" + i);

            row.appendChild(btn);

        });

        block.appendChild(row);
        extras.appendChild(block);

    });

}

function selectTutorialItem(id, variant) {

    const tutorial = TUTORIALS[tutorialChampion];
    const details = tutorialDetails[tutorialChampion] || {};

    let item, heading;

    if (id.startsWith("x")) {
        item = tutorial.extras[Number(id.slice(1))];
        heading = item.titulo;
    } else {
        item = tutorial.habilidades[id];
        const info = details[id] || {};
        heading = (id === "P" ? "Passiva" : id) + (info.name ? " · " + info.name : "");
    }

    if (!item) return;

    /* Skill com mais de um vídeo (ex.: E normal e E resetando):
       o primeiro é o próprio item, os outros vêm de "variacoes" */
    const variants = item.variacoes && item.variacoes.length
        ? [{ titulo: item.tituloPrincipal || "Uso normal", video: item.video, texto: item.texto, velocidade: item.velocidade }].concat(item.variacoes)
        : null;

    if (variants) item = variants[variant || 0] || variants[0];

    const switcher = document.getElementById("tutorialVariants");
    switcher.innerHTML = "";
    switcher.hidden = !variants;

    if (variants) {
        variants.forEach((v, i) => {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "tutorial-chip" + (i === (variant || 0) ? " active" : "");
            b.textContent = "▶ " + v.titulo;
            b.onclick = () => selectTutorialItem(id, i);
            switcher.appendChild(b);
        });
    }

    document.querySelectorAll("#tutorialDialog [data-item]").forEach(b =>
        b.classList.toggle("active", b.dataset.item === id));

    const video = document.getElementById("tutorialVideo");
    /* Velocidade: combos avançados em câmera lenta (campo "velocidade"),
       o resto normal. Dá para mudar no seletor do próprio vídeo. */
    const speed = item.velocidade || 1;
    video.defaultPlaybackRate = speed;
    video.src = tutorial.pasta + item.video;
    video.playbackRate = speed;
    video.onloadedmetadata = () => { video.playbackRate = speed; };
    video.play().catch(() => { });

    const badge = document.getElementById("tutorialSpeed");
    badge.hidden = speed === 1;
    badge.textContent = "🐢 " + String(speed).replace(".", ",") + "x";

    document.getElementById("tutorialHeading").textContent = heading;
    document.getElementById("tutorialText").textContent = item.texto || "";

}

/* ---------- Abas: vídeos / build ---------- */

function setTutorialTab(tab) {

    const tutorial = TUTORIALS[tutorialChampion];

    /* Só aparecem as abas que o campeão tem */
    const available = {
        play: true,
        guia: !!(tutorial && tutorial.guia),
        armas: !!(tutorial && tutorial.armas),
        /* Sempre aparece: sem build cadastrada, mostra só os links do meta */
        build: !!tutorial
    };

    if (!available[tab]) tab = "play";

    document.getElementById("tutorialTabs").hidden = !available.guia && !available.build && !available.armas;
    document.getElementById("tutorialWeaponsPanel").hidden = tab !== "armas";
    document.getElementById("tutorialPlayPanel").hidden = tab !== "play";
    document.getElementById("tutorialGuidePanel").hidden = tab !== "guia";
    document.getElementById("tutorialBuildPanel").hidden = tab !== "build";

    document.querySelectorAll("#tutorialTabs [data-tab]").forEach(b => {
        const on = b.dataset.tab === tab;
        b.hidden = !available[b.dataset.tab];
        b.classList.toggle("active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
    });

    const video = document.getElementById("tutorialVideo");

    if (tab !== "play") video.pause();

    const aphVideo = document.getElementById("aphVideo");
    if (aphVideo && tab !== "armas") aphVideo.pause();
    if (tab === "armas") renderWeaponsPanel(tutorial);
    else if (video.getAttribute("src")) video.play().catch(() => { });

    if (tab === "build") renderTutorialBuild(tutorial);
    if (tab === "guia") renderTutorialGuide(tutorial);

}

/* ---------- Aba "🌙 Armas" (painel de armas, estilo HUD do jogo) ----------

   Usada por campeões com o campo "armas" (hoje só o Aphelios):
   arma na mão, secundária, fila (E), troca com W e "acabou a munição".
   Mostra ataque / Q / R da arma da mão e o que o par faz junto. */

let weaponState = null;
let weaponView = "aa";

function weaponRing(id, size, label) {

    const w = TUTORIALS[tutorialChampion].armas.lista[id];

    const ring = document.createElement("span");
    ring.className = "aph-ring aph-" + size;
    ring.style.setProperty("--wcolor", w.hex);
    ring.title = w.nome + " (" + w.cor + ")";

    /* Ícone da arma igual ao HUD do jogo (tutoriais/<campeao>/icones/<arma>.png);
       se não carregar, fica a inicial */
    const icon = document.createElement("img");
    icon.src = TUTORIALS[tutorialChampion].pasta + "icones/" + id + ".png";
    icon.alt = "";
    icon.onerror = () => {
        const initial = document.createElement("b");
        initial.textContent = w.nome[0];
        icon.replaceWith(initial);
    };
    ring.appendChild(icon);

    if (label) {
        const name = document.createElement("span");
        name.className = "aph-ring-name";
        name.textContent = w.nome;
        ring.appendChild(name);
    }

    return ring;

}

function weaponButton(id, active, onClick, disabled) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "aph-pick" + (active ? " active" : "");
    b.disabled = !!disabled;
    b.appendChild(weaponRing(id, "sm", false));
    b.appendChild(document.createTextNode(TUTORIALS[tutorialChampion].armas.lista[id].nome));
    b.onclick = onClick;
    return b;
}

/* Coloca uma arma na mão ou na secundária, trocando de lugar com quem estava */
function placeWeapon(slot, id) {

    const s = weaponState;
    const other = slot === "main" ? "off" : "main";

    if (s[slot] === id) return;

    if (s[other] === id) {
        s[other] = s[slot];
    } else {
        const i = s.queue.indexOf(id);
        s.queue[i] = s[slot];
    }

    s[slot] = id;

}

function playWeaponVideo(src, speed) {
    const video = document.getElementById("aphVideo");
    if (!video) return;
    speed = speed || 1;
    video.defaultPlaybackRate = speed;
    video.src = TUTORIALS[tutorialChampion].pasta + src;
    video.playbackRate = speed;
    video.onloadedmetadata = () => { video.playbackRate = speed; };
    video.play().catch(() => { });
}

function renderWeaponsPanel(tutorial) {

    const data = tutorial.armas;
    const panel = document.getElementById("tutorialWeaponsPanel");

    if (!weaponState || weaponState.champion !== tutorialChampion) {
        weaponState = {
            champion: tutorialChampion,
            main: data.inicio[0],
            off: data.inicio[1],
            queue: data.inicio.slice(2)
        };
    }

    const s = weaponState;
    const main = data.lista[s.main];
    const off = data.lista[s.off];

    panel.innerHTML = "";

    /* ---- HUD: mão, W, secundária, fila ---- */
    const hud = document.createElement("div");
    hud.className = "aph-hud";

    const slot = (title, id, size) => {
        const box = document.createElement("div");
        box.className = "aph-slot";
        const t = document.createElement("span");
        t.className = "aph-slot-title";
        t.textContent = title;
        box.appendChild(t);
        box.appendChild(weaponRing(id, size, true));
        return box;
    };

    hud.appendChild(slot("NA MÃO", s.main, "lg"));

    const swap = document.createElement("button");
    swap.type = "button";
    swap.className = "aph-btn";
    swap.innerHTML = "<kbd>W</kbd> trocar";
    swap.title = "Fase: a secundária vira a arma da mão";
    swap.onclick = () => { [s.main, s.off] = [s.off, s.main]; renderWeaponsPanel(tutorial); };
    hud.appendChild(swap);

    hud.appendChild(slot("SECUNDÁRIA", s.off, "md"));

    const queue = document.createElement("div");
    queue.className = "aph-slot aph-queue";
    const qt = document.createElement("span");
    qt.className = "aph-slot-title";
    qt.textContent = "FILA (E)";
    queue.appendChild(qt);
    const qrow = document.createElement("div");
    qrow.className = "aph-queue-row";
    s.queue.forEach((id, i) => {
        qrow.appendChild(weaponRing(id, i === 0 ? "md" : "sm", false));
        if (i < s.queue.length - 1) {
            const arrow = document.createElement("span");
            arrow.className = "build-arrow";
            arrow.textContent = "›";
            qrow.appendChild(arrow);
        }
    });
    queue.appendChild(qrow);
    hud.appendChild(queue);

    const ammo = document.createElement("button");
    ammo.type = "button";
    ammo.className = "aph-btn";
    ammo.textContent = "🔫 Acabou a munição";
    ammo.title = "A arma da mão vai para o fim da fila e a próxima entra na mão";
    ammo.onclick = () => { s.queue.push(s.main); s.main = s.queue.shift(); renderWeaponsPanel(tutorial); };
    hud.appendChild(ammo);

    panel.appendChild(hud);

    /* ---- Escolher armas ---- */
    const pickers = document.createElement("div");
    pickers.className = "aph-pickers";

    [["main", "Arma na mão"], ["off", "Na secundária"]].forEach(([which, label]) => {
        const row = document.createElement("div");
        row.className = "aph-pick-row";
        const t = document.createElement("span");
        t.className = "aph-pick-label";
        t.textContent = label;
        row.appendChild(t);
        data.inicio.forEach(id => row.appendChild(weaponButton(id, s[which] === id,
            () => { placeWeapon(which, id); renderWeaponsPanel(tutorial); })));
        pickers.appendChild(row);
    });

    panel.appendChild(pickers);

    /* ---- Arma da mão: ataque / Q / R ---- */
    const stage = document.createElement("div");
    stage.className = "tutorial-stage";

    const video = document.createElement("video");
    video.id = "aphVideo";
    video.className = "tutorial-video";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = true;
    video.preload = "metadata";
    stage.appendChild(video);

    const caption = document.createElement("div");
    caption.className = "tutorial-caption";

    const head = document.createElement("h4");
    head.style.color = main.hex;
    head.textContent = main.nome + " (" + main.tipo + ", arma " + main.cor + ")";
    caption.appendChild(head);

    const views = document.createElement("div");
    views.className = "tutorial-chips tutorial-variants";
    const text = document.createElement("p");

    const showView = view => {
        weaponView = view;
        views.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.view === view));
        const part = main[view];
        text.textContent = part.texto;
        playWeaponVideo(part.video);
    };

    [["aa", "Ataque"], ["q", "Q"], ["r", "R"]].forEach(([view, label]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "tutorial-chip";
        b.dataset.view = view;
        b.textContent = "▶ " + label;
        if (view === "q") {
            const qi = document.createElement("img");
            qi.className = "aph-q-icon";
            qi.src = tutorial.pasta + "icones/q-" + s.main + ".png";
            qi.alt = "";
            qi.onerror = () => qi.remove();
            b.appendChild(qi);
        }
        b.onclick = () => showView(view);
        views.appendChild(b);
    });

    caption.appendChild(views);
    caption.appendChild(text);
    stage.appendChild(caption);
    panel.appendChild(stage);

    /* ---- O par (mão + secundária) ---- */
    const pair = document.createElement("div");
    pair.className = "aph-pair";

    const key = s.main + "+" + s.off;
    const special = data.pares[key];

    const ph = document.createElement("h5");
    ph.appendChild(weaponRing(s.main, "sm", false));
    ph.appendChild(document.createTextNode(" " + main.nome + " na mão + " + off.nome + " na secundária "));
    ph.appendChild(weaponRing(s.off, "sm", false));
    if (special) {
        const star = document.createElement("span");
        star.className = "aph-star";
        star.textContent = "⭐ par forte";
        ph.appendChild(star);
    }
    pair.appendChild(ph);

    const explain = document.createElement("p");
    explain.textContent = special || (data.usaSecundaria.includes(s.main)
        ? "O Q do " + main.nome + " também usa a secundária: sai junto o efeito do " + off.nome + " (" + off.secundaria + ")."
        : "O Q do " + main.nome + " não usa a secundária. Use o W quando o Q do " + off.nome + " for melhor na hora.");
    pair.appendChild(explain);

    /* Combos gravados: primeiro os desse par exato, depois os com essa arma na mão */
    const combos = (tutorial.extras || []).filter(x => x.armas);
    const exact = combos.filter(x => x.armas[0] === s.main && x.armas[1] === s.off);
    const withMain = combos.filter(x => x.armas[0] === s.main && !exact.includes(x));

    const comboRow = (title, list) => {
        if (!list.length) return;
        const t = document.createElement("span");
        t.className = "tutorial-group-title";
        t.textContent = title;
        pair.appendChild(t);
        const row = document.createElement("div");
        row.className = "tutorial-chips";
        list.forEach(c => {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "tutorial-chip";
            b.textContent = "▶ " + c.titulo + (c.velocidade ? " 🐢" : "");
            b.onclick = () => {
                panel.querySelectorAll(".aph-pair .tutorial-chip").forEach(x => x.classList.toggle("active", x === b));
                views.querySelectorAll("button").forEach(x => x.classList.remove("active"));
                text.textContent = c.texto;
                playWeaponVideo(c.video, c.velocidade);
            };
            row.appendChild(b);
        });
        pair.appendChild(row);
    };

    comboRow("Combos com esse par", exact);
    comboRow("Outros com " + main.nome + " na mão", withMain);

    panel.appendChild(pair);

    showView(weaponView);

}

/* ---------- Como jogar ---------- */

function guideList(title, items, kind) {

    const box = document.createElement("div");
    box.className = "guide-box " + kind;

    const h = document.createElement("h5");
    h.textContent = title;
    box.appendChild(h);

    const ul = document.createElement("ul");
    items.forEach(text => {
        const li = document.createElement("li");
        li.textContent = text;
        ul.appendChild(li);
    });
    box.appendChild(ul);

    return box;

}

function guideMatchups(title, list, kind) {

    const box = document.createElement("div");
    box.className = "guide-box " + kind;

    const h = document.createElement("h5");
    h.textContent = title;
    box.appendChild(h);

    list.forEach(m => {

        const row = document.createElement("div");
        row.className = "guide-matchup";

        const img = document.createElement("img");
        img.src = IMAGE_URL + m.campeao + ".png";
        img.alt = "";
        img.loading = "lazy";
        row.appendChild(img);

        const text = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = (typeof championNames !== "undefined" && championNames[m.campeao]) || m.campeao;
        const why = document.createElement("span");
        why.textContent = m.motivo || "";
        text.appendChild(name);
        text.appendChild(why);
        row.appendChild(text);

        box.appendChild(row);

    });

    return box;

}

function renderTutorialGuide(tutorial) {

    const panel = document.getElementById("tutorialGuidePanel");
    const g = tutorial.guia;

    panel.innerHTML = "";

    if (g.fases && g.fases.length) {
        const phases = document.createElement("div");
        phases.className = "guide-phases";
        g.fases.forEach((f, i) => {
            const step = document.createElement("div");
            step.className = "guide-phase";
            const n = document.createElement("span");
            n.className = "guide-phase-n";
            n.textContent = String(i + 1);
            const body = document.createElement("div");
            const h = document.createElement("strong");
            h.textContent = f.titulo;
            const p = document.createElement("p");
            p.textContent = f.texto;
            body.appendChild(h);
            body.appendChild(p);
            step.appendChild(n);
            step.appendChild(body);
            phases.appendChild(step);
        });
        panel.appendChild(phases);
    }

    const grid = document.createElement("div");
    grid.className = "guide-grid";
    if (g.fortes && g.fortes.length) grid.appendChild(guideList("💪 Pontos fortes", g.fortes, "good"));
    if (g.fracos && g.fracos.length) grid.appendChild(guideList("⚠️ Pontos fracos", g.fracos, "bad"));
    if (g.dificeis && g.dificeis.length) grid.appendChild(guideMatchups("🔴 Matchups difíceis", g.dificeis, "bad"));
    if (g.faceis && g.faceis.length) grid.appendChild(guideMatchups("🟢 Matchups fáceis", g.faceis, "good"));
    if (grid.children.length) panel.appendChild(grid);

    if (g.dicaDeOuro) {
        const tip = document.createElement("p");
        tip.className = "build-text guide-tip";
        const b = document.createElement("strong");
        b.textContent = "🏆 Dica de ouro: ";
        tip.appendChild(b);
        tip.appendChild(document.createTextNode(g.dicaDeOuro));
        panel.appendChild(tip);
    }

}

/* ---------- Build ---------- */

/* Itens e runas do jogo (nome -> ícone), buscados uma vez */
let buildCatalog = null;

/* "Exaustão" -> "exaustao" (nome do arquivo do ícone local) */
const spellFileName = name => normalizeName(name).replace(/[^a-z0-9]+/g, "-");

const normalizeName = text => String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

async function loadBuildCatalog() {

    if (buildCatalog) return buildCatalog;

    const version = (IMAGE_URL.match(/cdn\/([^/]+)\//) || [])[1] || DATA_DRAGON_VERSION;
    const base = "https://ddragon.leagueoflegends.com/cdn/";
    const catalog = { items: {}, runes: {}, spells: {} };

    try {

        const [items, runes, spells] = await Promise.all([
            fetch(base + version + "/data/pt_BR/item.json").then(r => r.json()),
            fetch(base + version + "/data/pt_BR/runesReforged.json").then(r => r.json()),
            fetch(base + version + "/data/pt_BR/summoner.json").then(r => r.json())
        ]);

        Object.values(spells.data).forEach(spell => {
            catalog.spells[normalizeName(spell.name)] = {
                name: spell.name,
                /* Ícone redesenhado, se tiver na pasta (ex.: tutoriais/feiticos/flash.png) */
                local: "tutoriais/feiticos/" + spellFileName(spell.name) + ".png",
                icon: base + version + "/img/spell/" + spell.image.full
            };
        });

        Object.keys(items.data).forEach(id => {
            const item = items.data[id];
            const key = normalizeName(item.name);
            /* Mesmo nome em mais de um mapa: fica o de Summoner's Rift */
            if (catalog.items[key] && !(item.maps && item.maps["11"])) return;
            catalog.items[key] = { name: item.name, icon: base + version + "/img/item/" + item.image.full };
        });

        runes.forEach(tree => {
            catalog.runes[normalizeName(tree.name)] = { name: tree.name, icon: base + "img/" + tree.icon, tree: true };
            tree.slots.forEach(slot => slot.runes.forEach(rune => {
                catalog.runes[normalizeName(rune.name)] = { name: rune.name, icon: base + "img/" + rune.icon, path: tree.name };
            }));
        });

    } catch (error) {
        /* Sem Data Dragon: mostra só os nomes */
    }

    buildCatalog = catalog;

    return catalog;

}

function buildIcon(entry, fallbackName, extraClass) {

    const box = document.createElement("span");
    box.className = "build-icon" + (extraClass ? " " + extraClass : "");
    box.title = entry ? entry.name : fallbackName;

    if (entry && entry.icon) {
        const img = document.createElement("img");
        img.alt = entry.name;
        img.loading = "lazy";
        if (entry.local) {
            /* Tenta o ícone local primeiro; se não existir, volta para o oficial */
            img.src = entry.local;
            img.onerror = () => { img.onerror = null; img.src = entry.icon; };
        } else {
            img.src = entry.icon;
        }
        box.appendChild(img);
    } else {
        box.classList.add("missing");
        box.textContent = fallbackName;
    }

    return box;

}

function buildRow(label, names, catalog, arrows, kind) {

    const source = catalog[kind || "items"] || {};

    const row = document.createElement("div");
    row.className = "build-row";

    const title = document.createElement("span");
    title.className = "build-row-label";
    title.textContent = label;
    row.appendChild(title);

    const list = document.createElement("div");
    list.className = "build-items";

    const itemBox = (name, when) => {
        const wrap = document.createElement("span");
        wrap.className = "build-item";
        wrap.appendChild(buildIcon(source[normalizeName(name)], name));
        const caption = document.createElement("span");
        caption.className = "build-item-name";
        caption.textContent = (source[normalizeName(name)] || { name }).name;
        wrap.appendChild(caption);
        if (when) {
            const tip = document.createElement("span");
            tip.className = "build-item-when";
            tip.textContent = when;
            wrap.appendChild(tip);
        }
        return wrap;
    };

    names.forEach((name, i) => {
        if (i > 0 && arrows) {
            const arrow = document.createElement("span");
            arrow.className = "build-arrow";
            arrow.textContent = "›";
            list.appendChild(arrow);
        }
        /* Escolha entre itens: { ou: [{ item, quando }, ...] } */
        if (name && name.ou) {
            const group = document.createElement("span");
            group.className = "build-choice";
            name.ou.forEach((opt, n) => {
                if (n > 0) {
                    const or = document.createElement("span");
                    or.className = "build-or";
                    or.textContent = "ou";
                    group.appendChild(or);
                }
                group.appendChild(itemBox(opt.item, opt.quando));
            });
            list.appendChild(group);
            return;
        }
        list.appendChild(itemBox(name));
    });

    row.appendChild(list);

    return row;

}

function buildRunes(runes, catalog) {

    const row = document.createElement("div");
    row.className = "build-row";

    const title = document.createElement("span");
    title.className = "build-row-label";
    title.textContent = "Runas";
    row.appendChild(title);

    const box = document.createElement("div");
    box.className = "build-runes";

    [["principal", true], ["secundaria", false]].forEach(([part, main]) => {

        const names = runes[part] || [];
        if (!names.length) return;

        const group = document.createElement("div");
        group.className = "build-rune-group" + (main ? " main" : "");

        /* Árvore (Dominação, Precisão...) pelo caminho da primeira runa */
        const first = catalog.runes[normalizeName(names[0])];
        const tree = first && first.path ? catalog.runes[normalizeName(first.path)] : null;

        if (tree) group.appendChild(buildIcon(tree, tree.name, "rune-tree"));

        names.forEach((name, i) => {
            group.appendChild(buildIcon(catalog.runes[normalizeName(name)], name,
                "rune" + (main && i === 0 ? " keystone" : "")));
        });

        const caption = document.createElement("span");
        caption.className = "build-rune-names";
        caption.textContent = names.join(" · ");
        group.appendChild(caption);

        box.appendChild(group);

    });

    row.appendChild(box);

    return row;

}

function buildSkills(order) {

    const row = document.createElement("div");
    row.className = "build-row";

    const title = document.createElement("span");
    title.className = "build-row-label";
    title.textContent = "Upar skills";
    row.appendChild(title);

    const list = document.createElement("div");
    list.className = "build-items";

    const details = tutorialDetails[tutorialChampion] || {};

    order.forEach((key, i) => {
        if (i > 0) {
            const arrow = document.createElement("span");
            arrow.className = "build-arrow";
            arrow.textContent = "›";
            list.appendChild(arrow);
        }
        const info = details[key] || {};
        const skill = document.createElement("span");
        skill.className = "build-skill";
        skill.title = info.name || key;
        if (info.icon) {
            const img = document.createElement("img");
            img.src = info.icon;
            img.alt = "";
            skill.appendChild(img);
        }
        const kbd = document.createElement("kbd");
        kbd.textContent = key;
        skill.appendChild(kbd);
        list.appendChild(skill);
    });

    row.appendChild(list);

    return row;

}

/* Sites com a build do momento (2: link para quem quiser o meta) */
function metaLinks(championId) {

    const slug = championId.toLowerCase();
    const links = document.createElement("div");
    links.className = "build-links";

    const label = document.createElement("span");
    label.textContent = "Build do momento:";
    links.appendChild(label);

    [["OP.GG", "https://www.op.gg/champions/" + slug + "/build"],
    ["U.GG", "https://u.gg/lol/champions/" + slug + "/build"]].forEach(([name, url]) => {
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = name + " ↗";
        links.appendChild(a);
    });

    return links;

}

let buildIndex = 0;

async function renderTutorialBuild(tutorial) {

    const panel = document.getElementById("tutorialBuildPanel");
    const champion = tutorialChampion;

    panel.innerHTML = "<p class=\"build-loading\">Carregando itens...</p>";

    const catalog = await loadBuildCatalog();

    if (champion !== tutorialChampion) return;

    panel.innerHTML = "";

    const builds = tutorial.builds || [];

    if (!builds.length) {
        const empty = document.createElement("p");
        empty.className = "build-loading";
        empty.textContent = "A nossa build desse campeão ainda não foi cadastrada. Enquanto isso, veja a build do momento:";
        panel.appendChild(empty);
        panel.appendChild(metaLinks(champion));
        return;
    }

    if (buildIndex >= builds.length) buildIndex = 0;

    /* Mais de uma build: abinhas */
    if (builds.length > 1) {
        const tabs = document.createElement("div");
        tabs.className = "tutorial-chips build-switch";
        builds.forEach((b, i) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "tutorial-chip" + (i === buildIndex ? " active" : "");
            btn.textContent = b.titulo;
            btn.onclick = () => { buildIndex = i; renderTutorialBuild(tutorial); };
            tabs.appendChild(btn);
        });
        panel.appendChild(tabs);
    }

    const build = builds[buildIndex];

    const head = document.createElement("h4");
    head.className = "build-title";
    head.textContent = build.titulo;
    panel.appendChild(head);

    /* Itens à esquerda; feitiços, runas e ordem das skills à direita
       (cabe na janela sem precisar rolar) */
    const cols = document.createElement("div");
    cols.className = "build-cols";
    const left = document.createElement("div");
    left.className = "build-col";
    const right = document.createElement("div");
    right.className = "build-col";

    if (build.inicial && build.inicial.length) left.appendChild(buildRow("Inicial", build.inicial, catalog, false));
    if (build.core && build.core.length) left.appendChild(buildRow("Principal", build.core, catalog, true));
    if (build.situacional && build.situacional.length) left.appendChild(buildRow("Situacional", build.situacional, catalog, false));
    if (build.ultimo && build.ultimo.length) left.appendChild(buildRow("Último item", build.ultimo, catalog, false));

    if (build.feiticos && build.feiticos.length) right.appendChild(buildRow("Feitiços", build.feiticos, catalog, false, "spells"));
    if (build.runas) right.appendChild(buildRunes(build.runas, catalog));
    if (build.skills && build.skills.length) right.appendChild(buildSkills(build.skills));

    cols.appendChild(left);
    if (right.children.length) cols.appendChild(right);
    panel.appendChild(cols);

    if (build.texto) {
        const text = document.createElement("p");
        text.className = "build-text";
        text.textContent = build.texto;
        panel.appendChild(text);
    }

    panel.appendChild(metaLinks(champion));

}

/* ---------- Seção "📖 Tutoriais" (lista fixa com busca) ---------- */

function renderTutorialSection() {

    const grid = document.getElementById("tutorialGrid");

    if (!grid) return;

    const search = document.getElementById("tutorialSearch");
    const term = normalizeName(search ? search.value : "");

    const nameOf = id => (typeof championNames !== "undefined" && championNames[id]) || id;

    const ids = Object.keys(TUTORIALS)
        .sort((a, b) => nameOf(a).localeCompare(nameOf(b), "pt-BR"));

    const shown = ids.filter(id => !term || normalizeName(nameOf(id)).includes(term) || normalizeName(id).includes(term));

    document.getElementById("tutorialsCount").textContent = "(" + ids.length + ")";

    grid.innerHTML = "";

    shown.forEach(id => {

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tutorial-tile";
        btn.title = "Abrir o guia de " + nameOf(id);
        btn.onclick = () => openTutorial(id);

        const img = document.createElement("img");
        img.src = IMAGE_URL + id + ".png";
        img.alt = "";
        img.loading = "lazy";
        btn.appendChild(img);

        const name = document.createElement("strong");
        name.textContent = nameOf(id);
        btn.appendChild(name);

        grid.appendChild(btn);

    });

    if (!shown.length) {
        const empty = document.createElement("div");
        empty.className = "tutorial-grid-empty";
        empty.textContent = ids.length ? "Nenhum campeão com guia com esse nome." : "Nenhum guia cadastrado ainda.";
        grid.appendChild(empty);
    }

}

/* Card de exemplo na área de resultado (só com TUTORIAL_PREVIEW) */
function showTutorialPreview() {

    if (!TUTORIAL_PREVIEW || IS_VIEWER) return;

    const container = document.getElementById("results");

    if (!container || container.querySelector(".result")) return;

    /* Um card por campeão com tutorial */
    Object.keys(TUTORIALS).forEach(id => {

        const card = document.createElement("div");
        card.className = "result tutorial-preview-card";
        card.innerHTML = `
            <div class="lane-name">Prévia</div>
            <div class="shuffle-container">
                <img src="${IMAGE_URL}${id}.png" alt="">
                <div class="champion">${championNames[id] || id}</div>
            </div>`;

        appendTutorialButton(card, id);

        container.appendChild(card);

    });

}

document.addEventListener("DOMContentLoaded", () => {

    const dialog = document.getElementById("tutorialDialog");

    if (!dialog) return;

    document.getElementById("tutorialClose").addEventListener("click", closeTutorial);

    document.querySelectorAll("#tutorialTabs [data-tab]").forEach(b =>
        b.addEventListener("click", () => setTutorialTab(b.dataset.tab)));

    /* Clicar fora ou apertar Esc fecha (e para o vídeo) */
    dialog.addEventListener("click", event => { if (event.target === dialog) closeTutorial(); });
    dialog.addEventListener("cancel", event => { event.preventDefault(); closeTutorial(); });

    /* Atalhos dentro da janelinha: P Q W E R */
    dialog.addEventListener("keydown", event => {
        const key = event.key.toUpperCase();
        if (document.getElementById("tutorialPlayPanel").hidden) return;
        if (TUTORIAL_KEYS.includes(key) && TUTORIALS[tutorialChampion].habilidades[key]) selectTutorialItem(key);
    });

    /* Seção fixa: desenha já e de novo quando os nomes/ícones atualizarem */
    const search = document.getElementById("tutorialSearch");
    if (search) search.addEventListener("input", renderTutorialSection);
    renderTutorialSection();

    /* Espera a lista de campeões (versão do Data Dragon) antes da prévia */
    setTimeout(() => { showTutorialPreview(); renderTutorialSection(); }, 800);

});
