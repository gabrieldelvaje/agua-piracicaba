# Águas do Rio Piracicaba

Série documental e projeto de **data storytelling sobre a relação de Piracicaba com a água e com os rios que abastecem, atravessam e ajudam a definir a cidade**.

O projeto combina **história local, dados públicos, documentos, jornais, fotografias, planejamento urbano e pesquisa acadêmica** em uma experiência web dividida em episódios.

**Site:** https://gabrieldelvaje.github.io/agua-piracicaba/

---

## Sobre o projeto

A série começou com uma pergunta atual — por que Piracicaba enfrenta episódios de falta d’água? — e foi se ampliando para uma investigação histórica sobre abastecimento, poluição, Sistema Cantareira, Rio Corumbataí, enchentes, margens e cultura.

A proposta editorial não é apresentar os temas como blocos isolados. Cada episódio parte de uma pergunta e constrói um fio narrativo em que **uma evidência leva à seguinte**:

**história → documento → dado → jornal → consequência atual**.

Os episódios usam fontes públicas e acadêmicas sempre que possível e preservam diferenças de período, escala e metodologia entre os dados.

---

## Episódios

### EP01 — Por que está faltando água em Piracicaba?

Investiga o sistema atual de abastecimento e testa algumas explicações comuns para a falta d’água.

O episódio passa por consumo residencial, crescimento do número de economias atendidas, perdas na distribuição, capacidade das estações de tratamento, expansão da rede e a história da infraestrutura de água da cidade.

**Página:** [episodio-1.html](episodio-1.html)

---

### EP02 — O desvio que mudou o Rio Piracicaba

Reconstrói a crise ambiental das décadas de 1960 e 1970, a industrialização, a poluição do rio, a implantação do Sistema Cantareira e o protesto que culminou no enterro simbólico do Rio Piracicaba em 1978.

O episódio cruza séries hidrológicas, jornais da época, documentos históricos, depoimentos e dados sobre vazão e qualidade da água.

Também mostra como a mobilização ambiental passou a fazer parte da memória urbana de Piracicaba.

**Página:** [episodio-2.html](episodio-2.html)

---

### EP03 — Por que Piracicaba foi buscar água no Corumbataí?

Conta como um segundo rio deixou de ser alternativa e se tornou o principal manancial de abastecimento da cidade.

A narrativa acompanha o Projeto Corumbataí desde os levantamentos dos anos 1970, a entrada em operação da ETA Capim Fino em 1982, a tentativa de concentrar o abastecimento no Corumbataí em 2000, a produção das ETAs, a estiagem de 2024 e a nova ampliação da estação em 2026.

O episódio também discute uma consequência da mudança: **quando a cidade passa a depender de outro rio, proteger a bacia desse manancial passa a ser parte da própria segurança hídrica**.

**Página:** [episodio-3.html](episodio-3.html)

Pesquisa e dados específicos do episódio:

- [docs/episodio-3/](docs/episodio-3/)
- [data/episodio-3/](data/episodio-3/)
- [src/episodio-3/](src/episodio-3/)

---

### EP04 — O que acontece nas margens do Piracicaba?

Parte das enchentes para investigar a relação entre rio, várzea e cidade.

O episódio acompanha a transformação de áreas planejadas para urbanização em espaços públicos, o Projeto Beira-Rio, a recuperação de mata ciliar e iniciativas atuais de restauração.

O fechamento amplia a discussão para a dimensão cultural: Festa do Divino, pesca artesanal, passeio de boia, memória, religião e a presença do rio na identidade de Piracicaba.

**Página:** [episodio-4.html](episodio-4.html)

---

## Como o site é construído

Cada episódio combina diferentes formatos editoriais:

- **hero documental**, com imagem histórica ou jornalística;
- **linhas do tempo interativas**;
- **cards de dados**;
- **gráficos e comparações**;
- **jornais e documentos históricos**;
- **fotografias com lightbox e créditos**;
- **fontes e metodologia dentro da própria página**;
- **seções narrativas com diferentes ritmos visuais**.

A identidade visual da série usa principalmente:

- fundo claro: `#F3F3F1`;
- texto: `#231F20`;
- azul: `#0736FE`;
- tipografia Helvetica / sans-serif.

---

## Estrutura do repositório

~~~text
.
├── index.html
├── episodio-1.html
├── episodio-2.html
├── episodio-3.html
├── episodio-4.html
│
├── assets/
│   ├── site/
│   │   ├── home/
│   │   ├── cards/
│   │   ├── episodes/
│   │   │   ├── episodio-1/
│   │   │   ├── episodio-2/
│   │   │   ├── episodio-3/
│   │   │   └── episodio-4/
│   │   ├── shared/
│   │   ├── css/
│   │   ├── js/
│   │   └── icons/
│   └── carousel/        # material legado da primeira versão
│
├── data/
│   ├── clean/
│   ├── processed/
│   └── episodio-3/
│
├── docs/
│   ├── episodio-3/
│   ├── methodology.md
│   ├── sources.md
│   └── validation.md
│
└── src/
    ├── episodio-3/
    ├── build_metrics.py
    └── validate_data.py
~~~

A convenção de organização das imagens e documentos está descrita em [assets/site/README.md](assets/site/README.md).

---

## Organização da mídia

As imagens do site são organizadas por **episódio e função**:

~~~text
assets/site/episodes/episodio-2/
├── hero/
├── timeline/
├── media/
├── diagrams/
└── documents/
    └── jornais/
~~~

Os nomes seguem `kebab-case`, sem espaços e sem acentos. Quando a data faz parte do contexto documental, ela aparece no início do arquivo.

Exemplos:

~~~text
1950-1960-jk-refinadora-paulista.jpg
1974-sistema-cantareira.jpg
1979-praca-protesto-ecologico.png
2024-rio-corumbatai-estiagem.avif
~~~

---

## Dados

O repositório preserva as bases usadas na investigação sobre abastecimento e infraestrutura.

### `data/clean/`

Contém tabelas limpas extraídas ou consolidadas a partir de fontes como Semae, PMSB, SNIS/SINISA, ESALQ/USP e bases municipais.

Entre elas:

- consumo de água por categoria;
- número de economias atendidas;
- produção e distribuição de água;
- perdas na distribuição;
- capacidade e produção das ETAs;
- extensão da rede;
- precipitação;
- vazão do Rio Piracicaba.

### `data/processed/`

Contém tabelas derivadas usadas nas análises, como consumo residencial por economia, séries consolidadas do sistema, chuva × vazão e indicadores calculados a partir das bases limpas.

### `data/episodio-3/`

Concentra os arquivos específicos usados no episódio do Corumbataí, incluindo produção por ETA, adução, indicadores, observações e manifesto de fontes.

---

## Metodologia e validação

O projeto procura distinguir claramente:

- **valor observado** de **capacidade anunciada**;
- **produção por ETA** de **participação de um manancial no abastecimento**;
- **dado municipal** de **dado regional**;
- **documento histórico** de **interpretação posterior**;
- **manchete de jornal** de **confirmação operacional**;
- **correlação** de **causalidade**.

Inconsistências encontradas nas fontes não são corrigidas silenciosamente. Quando necessário, elas são preservadas e documentadas.

Detalhes adicionais:

- [docs/methodology.md](docs/methodology.md)
- [docs/validation.md](docs/validation.md)
- [docs/sources.md](docs/sources.md)

---

## Reprodução das análises

Os scripts principais permanecem no repositório para permitir a reprodução de parte dos indicadores:

~~~bash
python src/build_metrics.py
python src/validate_data.py
~~~

O episódio 3 também possui uma rotina própria:

~~~bash
python src/episodio-3/reproduzir.py
~~~

---

## Fontes principais

A série utiliza, entre outras:

- **Semae Piracicaba**;
- **Prefeitura de Piracicaba**;
- **IPPLAP / Piracicaba em Dados**;
- **Plano Municipal de Saneamento Básico de Piracicaba**;
- **Comitês e Consórcio PCJ**;
- **ESALQ/USP e Universidade de São Paulo**;
- **IHGP — Instituto Histórico e Geográfico de Piracicaba**;
- **Biblioteca Nacional / Hemeroteca Digital**;
- jornais locais e imprensa histórica;
- artigos, dissertações e teses acadêmicas.

As páginas do acervo pago do **O Estado de S. Paulo** não são reproduzidas no site; quando necessárias à narrativa, são usadas apenas referências factuais, datas e manchetes.

---

## Material legado

A pasta [assets/carousel/](assets/carousel/) preserva o carrossel que deu origem à primeira investigação sobre abastecimento.

Ele **não é mais o produto principal do projeto**. A versão atual é o site documental **Águas do Rio Piracicaba**, desenvolvido e ampliado em episódios.

---

## Autor

**Gabriel Delvaje**

Projeto independente de jornalismo de dados, história local e visualização de informações sobre Piracicaba.