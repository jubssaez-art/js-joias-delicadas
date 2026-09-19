# Como postar uma peça nova

Salve a foto **nesta pasta** com o nome da peça. Faça o push. Pronto — ela aparece na grade do site.

```
anel dourado com pedra preta.png
```

O nome do arquivo é o nome do produto. A primeira palavra define a seção da loja.

## Opcional (tudo no próprio nome do arquivo)

| Quero | Nome do arquivo |
|---|---|
| Definir o preço | `anel dourado com pedra preta - 129,90.png` |
| Preço "de / por" | `anel dourado com pedra preta - 159,90 - 129,90.png` |
| Selo na foto | `anel dourado com pedra preta (novidade).png` |
| Marcar como esgotado | `anel dourado com pedra preta (esgotado).png` |
| Segundo ângulo (hover) | `anel dourado com pedra preta-alt.png` |

Dá para combinar: `colar prata coração - 89,90 (novidade).png`

## Primeiras palavras que a loja reconhece

| Palavra inicial | Vai para |
|---|---|
| anel, aliança | Anéis |
| brinco, argola, argolinha, piercing | Brincos |
| pulseira, bracelete, berloque | Pulseiras |
| colar, gargantilha, corrente, pingente, choker | Colares |
| tornozeleira | Tornozeleiras |
| conjunto, kit | Conjuntos |

Arquivo que **não** começa com uma dessas palavras é ignorado — é assim que prints,
artes e imagens soltas continuam nesta pasta sem virar produto.

## Material e filtros

Se o nome tiver **prata**, **prateado** ou **ródio**, a peça entra como Ródio Branco e no
filtro Prata. Qualquer outro caso entra como Ouro 18k / filtro Ouro. Tendo **pérola** ou
**madrepérola** no nome, entra também no filtro Pérola.

## Se não usar preço no nome

Cada seção tem um preço padrão, que aparece na vitrine com o preço antigo riscado ao lado:

| Seção | De | Por |
|---|---|---|
| Anéis | 109,90 | **92,90** |
| Brincos | 79,90 | **67,90** |
| Pulseiras | 109,90 | **92,90** |
| Colares | 119,90 | **101,90** |
| Tornozeleiras | 89,90 | **75,90** |
| Conjuntos | 149,90 | **127,90** |

Preço escrito no nome do arquivo manda no padrão — e aí só vale o que estiver escrito ali.
Dá para ajustar depois pelo painel de controle (`admin.html`), sem mexer no arquivo.

## Ver antes de publicar

```bash
node tools/gerar-catalogo.mjs
```

Lista as peças encontradas e atualiza `data/catalogo-auto.js`. No deploy isso roda sozinho.

## Anúncios no Facebook e Instagram

Toda peça publicada entra também no feed de dados do Commerce Manager, refeito a
cada deploy:

```
https://jubssaez-art.github.io/js-joias-delicadas/feed.xml
```

No Commerce Manager: **Catálogo → Fontes de dados → Feed de dados → Buscar por URL
agendada**, e deixe a atualização diária. Peça esgotada ou escondida pelo painel
sai do anúncio sozinha na próxima busca.
